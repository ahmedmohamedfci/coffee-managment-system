import { and, eq, inArray, ne } from "drizzle-orm";
import {
  activityItems,
  floorTables,
  kitchenTickets,
  menuItemModifierGroups,
  menuItems,
  modifierOptions,
  orderLines,
  orders,
  payments,
  staff,
  tenants,
} from "@saasfood/db";
import {
  computeOrderTotals,
  lineTotal,
  roundMoney,
  type PaymentMethod,
} from "@saasfood/shared";
import { getDb } from "@/lib/db";
import { ApiError, uid } from "@/lib/api-helpers";

type Db = ReturnType<typeof getDb>;

async function loadOrderBundle(db: Db, tenantId: string, orderId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.tenantId, tenantId), eq(orders.id, orderId)))
    .limit(1);
  if (!order) throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");

  const lines = await db
    .select()
    .from(orderLines)
    .where(and(eq(orderLines.tenantId, tenantId), eq(orderLines.orderId, orderId)));

  return { order, lines };
}

function serializeOrder(
  order: typeof orders.$inferSelect,
  lines: (typeof orderLines.$inferSelect)[],
) {
  return {
    id: order.id,
    number: order.number,
    tableId: order.tableId,
    tableLabel: order.tableLabel,
    waiterId: order.waiterId,
    waiterName: order.waiterName,
    status: order.status,
    subtotal: order.subtotal,
    taxRate: order.taxRate,
    tax: order.tax,
    total: order.total,
    version: order.version,
    createdAt: order.createdAt.toISOString(),
    submittedAt: order.submittedAt?.toISOString(),
    lines: lines.map((l) => ({
      id: l.id,
      menuItemId: l.menuItemId,
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      modifierLabels: l.modifierLabels ?? [],
      kitchenNote: l.kitchenNote ?? undefined,
      allergyNote: l.allergyNote,
      lineTotal: l.lineTotal,
    })),
  };
}

async function assertVersion(
  order: typeof orders.$inferSelect,
  expectedVersion?: number,
) {
  if (expectedVersion !== undefined && order.version !== expectedVersion) {
    throw new ApiError(409, "Order version conflict", "VERSION_CONFLICT");
  }
}

export async function openOrder(tenantId: string, tableId: string, waiterId: string) {
  const db = getDb();

  const [table] = await db
    .select()
    .from(floorTables)
    .where(and(eq(floorTables.tenantId, tenantId), eq(floorTables.id, tableId)))
    .limit(1);
  const [waiter] = await db
    .select()
    .from(staff)
    .where(and(eq(staff.tenantId, tenantId), eq(staff.id, waiterId), eq(staff.active, true)))
    .limit(1);

  if (!table || !waiter) {
    throw new ApiError(400, "Table or waiter missing", "OPEN_ORDER_INVALID");
  }

  const [existing] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.tableId, tableId),
        inArray(orders.status, ["open", "submitted", "awaiting_payment"]),
      ),
    )
    .limit(1);

  if (existing) {
    const lines = await db
      .select()
      .from(orderLines)
      .where(and(eq(orderLines.tenantId, tenantId), eq(orderLines.orderId, existing.id)));
    return serializeOrder(existing, lines);
  }

  const result = await db.transaction(async (tx) => {
    const [tenant] = await tx
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    if (!tenant) throw new ApiError(404, "Tenant not found", "TENANT_NOT_FOUND");

    const orderNumber = tenant.nextOrderNumber;
    await tx
      .update(tenants)
      .set({ nextOrderNumber: orderNumber + 1 })
      .where(eq(tenants.id, tenantId));

    const orderId = uid("ord");
    const [order] = await tx
      .insert(orders)
      .values({
        id: orderId,
        tenantId,
        number: orderNumber,
        tableId,
        tableLabel: table.label,
        waiterId,
        waiterName: waiter.name,
        status: "open",
        subtotal: 0,
        taxRate: tenant.taxRate,
        tax: 0,
        total: 0,
        version: 1,
      })
      .returning();

    await tx
      .update(floorTables)
      .set({ status: "occupied" })
      .where(and(eq(floorTables.tenantId, tenantId), eq(floorTables.id, tableId)));

    await tx.insert(activityItems).values({
      id: uid("act"),
      tenantId,
      titleKey: "activity.tableOccupied",
      title: `${table.label} occupied`,
      actor: waiter.name,
      tone: "danger",
    });

    return order;
  });

  return serializeOrder(result, []);
}

export async function getOrder(tenantId: string, orderId: string) {
  const db = getDb();
  const { order, lines } = await loadOrderBundle(db, tenantId, orderId);
  return serializeOrder(order, lines);
}

export async function addLine(
  tenantId: string,
  orderId: string,
  input: {
    menuItemId: string;
    quantity: number;
    modifierOptionIds?: string[];
    kitchenNote?: string;
    allergyNote?: boolean;
    expectedVersion?: number;
  },
) {
  if (!input.quantity || input.quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1", "INVALID_QTY");
  }

  const db = getDb();
  const { order, lines } = await loadOrderBundle(db, tenantId, orderId);
  await assertVersion(order, input.expectedVersion);

  if (order.status !== "open") {
    throw new ApiError(400, "Order is not open for edits", "ORDER_NOT_OPEN");
  }

  const [item] = await db
    .select()
    .from(menuItems)
    .where(
      and(
        eq(menuItems.tenantId, tenantId),
        eq(menuItems.id, input.menuItemId),
        eq(menuItems.active, true),
      ),
    )
    .limit(1);
  if (!item) throw new ApiError(404, "Item not found", "ITEM_NOT_FOUND");

  const links = await db
    .select()
    .from(menuItemModifierGroups)
    .where(
      and(
        eq(menuItemModifierGroups.tenantId, tenantId),
        eq(menuItemModifierGroups.menuItemId, item.id),
      ),
    );
  const groupIds = links.map((l) => l.modifierGroupId);

  const optionIds = input.modifierOptionIds ?? [];
  let selected: (typeof modifierOptions.$inferSelect)[] = [];
  if (optionIds.length > 0 && groupIds.length > 0) {
    selected = await db
      .select()
      .from(modifierOptions)
      .where(
        and(
          eq(modifierOptions.tenantId, tenantId),
          inArray(modifierOptions.id, optionIds),
          inArray(modifierOptions.groupId, groupIds),
        ),
      );
  }

  const deltas = selected.map((o) => o.priceDelta);
  const unitPrice = roundMoney(item.basePrice + deltas.reduce((a, b) => a + b, 0));
  const modifierLabels = selected.map((o) => {
    const surcharge = o.priceDelta > 0 ? ` (+$${o.priceDelta.toFixed(2)})` : "";
    return `${o.name}${surcharge}`;
  });

  const line = {
    id: uid("line"),
    tenantId,
    orderId,
    menuItemId: item.id,
    name: item.name,
    quantity: input.quantity,
    unitPrice,
    modifierLabels,
    kitchenNote: input.kitchenNote ?? null,
    allergyNote: input.allergyNote ?? false,
    lineTotal: lineTotal(item.basePrice, deltas, input.quantity),
  };

  const nextLines = [...lines, line as typeof orderLines.$inferSelect];
  const totals = computeOrderTotals(
    nextLines.map((l) => ({
      id: l.id,
      menuItemId: l.menuItemId,
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      modifierLabels: l.modifierLabels ?? [],
      kitchenNote: l.kitchenNote ?? undefined,
      allergyNote: l.allergyNote,
      lineTotal: l.lineTotal,
    })),
    order.taxRate,
  );

  await db.transaction(async (tx) => {
    await tx.insert(orderLines).values(line);
    const updated = await tx
      .update(orders)
      .set({
        ...totals,
        version: order.version + 1,
      })
      .where(
        and(
          eq(orders.tenantId, tenantId),
          eq(orders.id, orderId),
          eq(orders.version, order.version),
        ),
      )
      .returning();
    if (updated.length === 0) {
      throw new ApiError(409, "Order version conflict", "VERSION_CONFLICT");
    }
  });

  return getOrder(tenantId, orderId);
}

export async function updateLineQty(
  tenantId: string,
  orderId: string,
  lineId: string,
  quantity: number,
  expectedVersion?: number,
) {
  const db = getDb();
  const { order, lines } = await loadOrderBundle(db, tenantId, orderId);
  await assertVersion(order, expectedVersion);

  if (order.status !== "open") {
    throw new ApiError(400, "Order is not open for edits", "ORDER_NOT_OPEN");
  }

  const target = lines.find((l) => l.id === lineId);
  if (!target) throw new ApiError(404, "Line not found", "LINE_NOT_FOUND");

  const nextLines =
    quantity <= 0
      ? lines.filter((l) => l.id !== lineId)
      : lines.map((l) => {
          if (l.id !== lineId) return l;
          const unitBase = l.lineTotal / l.quantity;
          return {
            ...l,
            quantity,
            lineTotal: roundMoney(unitBase * quantity),
          };
        });

  const totals = computeOrderTotals(
    nextLines.map((l) => ({
      id: l.id,
      menuItemId: l.menuItemId,
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      modifierLabels: l.modifierLabels ?? [],
      kitchenNote: l.kitchenNote ?? undefined,
      allergyNote: l.allergyNote,
      lineTotal: l.lineTotal,
    })),
    order.taxRate,
  );

  await db.transaction(async (tx) => {
    if (quantity <= 0) {
      await tx
        .delete(orderLines)
        .where(
          and(
            eq(orderLines.tenantId, tenantId),
            eq(orderLines.orderId, orderId),
            eq(orderLines.id, lineId),
          ),
        );
    } else {
      const unitBase = target.lineTotal / target.quantity;
      await tx
        .update(orderLines)
        .set({ quantity, lineTotal: roundMoney(unitBase * quantity) })
        .where(
          and(
            eq(orderLines.tenantId, tenantId),
            eq(orderLines.orderId, orderId),
            eq(orderLines.id, lineId),
          ),
        );
    }

    const updated = await tx
      .update(orders)
      .set({
        ...totals,
        version: order.version + 1,
      })
      .where(
        and(
          eq(orders.tenantId, tenantId),
          eq(orders.id, orderId),
          eq(orders.version, order.version),
        ),
      )
      .returning();
    if (updated.length === 0) {
      throw new ApiError(409, "Order version conflict", "VERSION_CONFLICT");
    }
  });

  return getOrder(tenantId, orderId);
}

export async function submitOrder(
  tenantId: string,
  orderId: string,
  expectedVersion?: number,
) {
  const db = getDb();
  const { order, lines } = await loadOrderBundle(db, tenantId, orderId);
  await assertVersion(order, expectedVersion);

  if (lines.length === 0) {
    throw new ApiError(400, "Add items before submitting", "EMPTY_ORDER");
  }

  if (
    order.status === "submitted" ||
    order.status === "awaiting_payment" ||
    order.status === "paid"
  ) {
    return serializeOrder(order, lines);
  }

  if (order.status !== "open") {
    throw new ApiError(400, "Cannot submit order in current status", "INVALID_STATUS");
  }

  const now = new Date();
  const ticketId = uid("tkt");

  await db.transaction(async (tx) => {
    const updated = await tx
      .update(orders)
      .set({
        status: "submitted",
        submittedAt: now,
        version: order.version + 1,
      })
      .where(
        and(
          eq(orders.tenantId, tenantId),
          eq(orders.id, orderId),
          eq(orders.version, order.version),
        ),
      )
      .returning();
    if (updated.length === 0) {
      throw new ApiError(409, "Order version conflict", "VERSION_CONFLICT");
    }

    await tx
      .update(kitchenTickets)
      .set({ status: "dismissed" })
      .where(
        and(
          eq(kitchenTickets.tenantId, tenantId),
          eq(kitchenTickets.orderId, orderId),
          ne(kitchenTickets.status, "dismissed"),
        ),
      );

    await tx.insert(kitchenTickets).values({
      id: ticketId,
      tenantId,
      orderId: order.id,
      tableLabel: order.tableLabel,
      waiterName: order.waiterName,
      status: "pending",
      lines: lines.map((l) => ({
        qty: l.quantity,
        name: l.name,
        note: l.kitchenNote ?? undefined,
        allergy: l.allergyNote,
      })),
      createdAt: now,
    });

    await tx.insert(activityItems).values({
      id: uid("act"),
      tenantId,
      titleKey: "activity.orderSubmitted",
      title: `Order #${order.number} submitted to kitchen`,
      actor: order.waiterName,
      tone: "info",
    });
  });

  return getOrder(tenantId, orderId);
}

export async function beginCheckout(
  tenantId: string,
  orderId: string,
  expectedVersion?: number,
) {
  const db = getDb();
  let { order, lines } = await loadOrderBundle(db, tenantId, orderId);
  await assertVersion(order, expectedVersion);

  if (order.status === "open") {
    await submitOrder(tenantId, orderId, order.version);
    ({ order, lines } = await loadOrderBundle(db, tenantId, orderId));
  }

  if (order.status === "awaiting_payment" || order.status === "paid") {
    return serializeOrder(order, lines);
  }

  if (order.status !== "submitted") {
    throw new ApiError(400, "Cannot checkout order in current status", "INVALID_STATUS");
  }

  const updated = await db
    .update(orders)
    .set({
      status: "awaiting_payment",
      version: order.version + 1,
    })
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.id, orderId),
        eq(orders.version, order.version),
      ),
    )
    .returning();
  if (updated.length === 0) {
    throw new ApiError(409, "Order version conflict", "VERSION_CONFLICT");
  }

  return getOrder(tenantId, orderId);
}

export async function pay(
  tenantId: string,
  orderId: string,
  method: PaymentMethod,
  expectedVersion?: number,
) {
  if (method === "tap") {
    throw new ApiError(400, "Tap to Pay is not available yet", "TAP_STUBBED");
  }
  if (method !== "cash" && method !== "manual_card") {
    throw new ApiError(400, "Invalid payment method", "INVALID_METHOD");
  }

  const db = getDb();
  const { order, lines } = await loadOrderBundle(db, tenantId, orderId);
  await assertVersion(order, expectedVersion);

  if (order.status === "paid") {
    throw new ApiError(400, "Order already paid", "ALREADY_PAID");
  }
  if (order.status === "open") {
    throw new ApiError(400, "Submit/checkout before paying", "NOT_READY");
  }

  const paymentId = uid("pay");
  const txnId = `#TXN-${Math.floor(9000000 + Math.random() * 999999)}`;
  const now = new Date();

  const payment = await db.transaction(async (tx) => {
    const updated = await tx
      .update(orders)
      .set({
        status: "paid",
        version: order.version + 1,
      })
      .where(
        and(
          eq(orders.tenantId, tenantId),
          eq(orders.id, orderId),
          eq(orders.version, order.version),
        ),
      )
      .returning();
    if (updated.length === 0) {
      throw new ApiError(409, "Order version conflict", "VERSION_CONFLICT");
    }

    const [row] = await tx
      .insert(payments)
      .values({
        id: paymentId,
        tenantId,
        orderId,
        method,
        amount: order.total,
        txnId,
        createdAt: now,
      })
      .returning();

    await tx
      .update(floorTables)
      .set({ status: "empty" })
      .where(and(eq(floorTables.tenantId, tenantId), eq(floorTables.id, order.tableId)));

    await tx.insert(activityItems).values({
      id: uid("act"),
      tenantId,
      titleKey: "activity.paid",
      title: `Order #${order.number} paid`,
      actor: order.waiterName,
      tone: "success",
    });

    return row;
  });

  return {
    id: payment.id,
    orderId: payment.orderId,
    method: payment.method,
    amount: payment.amount,
    txnId: payment.txnId,
    createdAt: payment.createdAt.toISOString(),
    order: serializeOrder({ ...order, status: "paid", version: order.version + 1 }, lines),
  };
}
