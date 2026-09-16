import { computeOrderTotals, lineTotal, roundMoney, type DemoState, type FloorTable, type Order, type OrderLine, type PaymentMethod, type TicketStatus } from "./types";
import { createSeedState } from "./seed";

type Listener = () => void;

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function delay(ms = 50) {
  return new Promise((r) => setTimeout(r, ms));
}

class MockApi {
  private state: DemoState = createSeedState();
  private listeners = new Set<Listener>();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = () => this.state;

  private emit() {
    this.listeners.forEach((l) => l());
  }

  private set(patch: Partial<DemoState> | ((prev: DemoState) => DemoState)) {
    this.state = typeof patch === "function" ? patch(this.state) : { ...this.state, ...patch };
    this.emit();
  }

  resetDemo = async () => {
    await delay(150);
    this.state = createSeedState();
    this.emit();
    return this.state;
  };

  adminLogin = async (email: string, password: string) => {
    await delay();
    if (!email || password.length < 4) throw new Error("Invalid credentials");
    return { kind: "admin" as const, name: "John Doe", email };
  };

  staffLogin = async (staffCode: string, pin: string) => {
    await delay();
    const staff = this.state.staff.find((s) => s.staffCode === staffCode && s.active);
    if (!staff || staff.pin !== pin) throw new Error("Invalid staff ID or PIN");
    return {
      kind: "staff" as const,
      staffId: staff.id,
      name: staff.name,
      role: staff.role,
      isDefaultPin: staff.isDefaultPin,
    };
  };

  changePin = async (staffId: string, newPin: string) => {
    await delay();
    if (!/^\d{4}$/.test(newPin) || newPin === "0000") throw new Error("PIN must be 4 digits and not 0000");
    this.set((s) => ({
      ...s,
      staff: s.staff.map((st) =>
        st.id === staffId ? { ...st, pin: newPin, isDefaultPin: false } : st,
      ),
    }));
    return true;
  };

  resetPin = async (staffId: string) => {
    await delay();
    this.set((s) => ({
      ...s,
      staff: s.staff.map((st) =>
        st.id === staffId ? { ...st, pin: "0000", isDefaultPin: true } : st,
      ),
      activity: [
        {
          id: uid("act"),
          titleKey: "activity.pinReset",
          title: "PIN reset to default",
          actor: "Admin",
          at: new Date().toISOString(),
          tone: "warning" as const,
        },
        ...s.activity,
      ],
    }));
  };

  saveFloorLayout = async (tables: FloorTable[], fixtures?: import("./types").FloorFixture[]) => {
    await delay();
    this.set((s) => ({
      ...s,
      tables,
      fixtures: fixtures ?? s.fixtures,
    }));
    return { tables, fixtures: fixtures ?? this.state.fixtures };
  };

  saveModifierGroups = async (groups: import("./types").ModifierGroup[]) => {
    await delay();
    this.set({ modifierGroups: groups });
    return groups;
  };

  setTableStatus = async (tableId: string, status: FloorTable["status"]) => {
    await delay(120);
    this.set((s) => ({
      ...s,
      tables: s.tables.map((t) => (t.id === tableId ? { ...t, status } : t)),
    }));
  };

  openOrder = async (tableId: string, waiterId: string) => {
    await delay();
    const table = this.state.tables.find((t) => t.id === tableId);
    const waiter = this.state.staff.find((s) => s.id === waiterId);
    if (!table || !waiter) throw new Error("Table or waiter missing");

    const existing = this.state.orders.find(
      (o) => o.tableId === tableId && (o.status === "open" || o.status === "submitted" || o.status === "awaiting_payment"),
    );
    if (existing) return existing;

    const order: Order = {
      id: uid("ord"),
      number: this.state.nextOrderNumber,
      tableId,
      tableLabel: table.label,
      waiterId,
      waiterName: waiter.name,
      status: "open",
      lines: [],
      subtotal: 0,
      taxRate: this.state.taxRate,
      tax: 0,
      total: 0,
      createdAt: new Date().toISOString(),
    };

    this.set((s) => ({
      ...s,
      nextOrderNumber: s.nextOrderNumber + 1,
      orders: [order, ...s.orders],
      tables: s.tables.map((t) => (t.id === tableId ? { ...t, status: "occupied" as const } : t)),
      activity: [
        {
          id: uid("act"),
          titleKey: "activity.tableOccupied",
          title: `${table.label} occupied`,
          actor: waiter.name,
          at: new Date().toISOString(),
          tone: "danger" as const,
        },
        ...s.activity,
      ],
    }));
    return order;
  };

  addLine = async (
    orderId: string,
    input: {
      menuItemId: string;
      quantity: number;
      modifierOptionIds: string[];
      kitchenNote?: string;
      allergyNote?: boolean;
    },
  ) => {
    await delay(150);
    const item = this.state.menuItems.find((m) => m.id === input.menuItemId);
    if (!item) throw new Error("Item not found");

    const groups = this.state.modifierGroups.filter((g) => item.modifierGroupIds.includes(g.id));
    const selected = groups.flatMap((g) => g.options.filter((o) => input.modifierOptionIds.includes(o.id)));
    const deltas = selected.map((o) => o.priceDelta);
    const unitPrice = roundMoney(item.basePrice + deltas.reduce((a, b) => a + b, 0));
    const line: OrderLine = {
      id: uid("line"),
      menuItemId: item.id,
      name: item.name,
      quantity: input.quantity,
      unitPrice,
      modifierLabels: selected.filter((o) => o.priceDelta > 0 || o.id.startsWith("m-")).map((o) => o.id),
      kitchenNote: input.kitchenNote,
      allergyNote: input.allergyNote,
      lineTotal: lineTotal(item.basePrice, deltas, input.quantity),
    };

    // Human-readable labels for cart/KDS
    line.modifierLabels = selected.map((o) => {
      const surcharge = o.priceDelta > 0 ? ` (+$${o.priceDelta.toFixed(2)})` : "";
      return `${o.name}${surcharge}`;
    }).filter(Boolean);

    this.set((s) => {
      const orders = s.orders.map((o) => {
        if (o.id !== orderId) return o;
        const lines = [...o.lines, line];
        const totals = computeOrderTotals(lines, o.taxRate);
        return { ...o, lines, ...totals };
      });
      return { ...s, orders };
    });

    return this.state.orders.find((o) => o.id === orderId)!;
  };

  updateLineQty = async (orderId: string, lineId: string, quantity: number) => {
    await delay(100);
    this.set((s) => {
      const orders = s.orders.map((o) => {
        if (o.id !== orderId) return o;
        const lines = o.lines
          .map((l) => {
            if (l.id !== lineId) return l;
            if (quantity <= 0) return null;
            const unitBase = l.lineTotal / l.quantity;
            return { ...l, quantity, lineTotal: roundMoney(unitBase * quantity) };
          })
          .filter(Boolean) as OrderLine[];
        const totals = computeOrderTotals(lines, o.taxRate);
        return { ...o, lines, ...totals };
      });
      return { ...s, orders };
    });
    return this.state.orders.find((o) => o.id === orderId)!;
  };

  /** Waiter presses Submit — kitchen board updates immediately. */
  submitOrder = async (orderId: string) => {
    await delay();
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    if (order.lines.length === 0) throw new Error("Add items before submitting");
    if (order.status === "submitted" || order.status === "awaiting_payment" || order.status === "paid") {
      return order;
    }

    const ticket = {
      id: uid("tkt"),
      orderId: order.id,
      tableLabel: order.tableLabel,
      waiterName: order.waiterName,
      status: "pending" as TicketStatus,
      lines: order.lines.map((l) => ({
        qty: l.quantity,
        name: l.name,
        note: l.kitchenNote,
        allergy: l.allergyNote,
      })),
      createdAt: new Date().toISOString(),
    };

    this.set((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: "submitted" as const, submittedAt: new Date().toISOString() }
          : o,
      ),
      tickets: [ticket, ...s.tickets.filter((t) => t.orderId !== orderId || t.status === "dismissed")],
      activity: [
        {
          id: uid("act"),
          titleKey: "activity.orderSubmitted",
          title: `Order #${order.number} submitted to kitchen`,
          actor: order.waiterName,
          at: new Date().toISOString(),
          tone: "info" as const,
        },
        ...s.activity,
      ],
    }));

    return this.state.orders.find((o) => o.id === orderId)!;
  };

  beginCheckout = async (orderId: string) => {
    await delay(120);
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    if (order.status === "open") {
      await this.submitOrder(orderId);
    }
    this.set((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, status: "awaiting_payment" as const } : o,
      ),
    }));
    return this.state.orders.find((o) => o.id === orderId)!;
  };

  pay = async (orderId: string, method: PaymentMethod) => {
    await delay();
    if (method === "tap") throw new Error("Tap to Pay is stubbed in this demo");
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const payment = {
      id: uid("pay"),
      orderId,
      method,
      amount: order.total,
      txnId: `#TXN-${Math.floor(9000000 + Math.random() * 999999)}`,
      createdAt: new Date().toISOString(),
    };

    this.set((s) => ({
      ...s,
      payments: [payment, ...s.payments],
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: "paid" as const } : o)),
      tables: s.tables.map((t) =>
        t.id === order.tableId ? { ...t, status: "empty" as const } : t,
      ),
      activity: [
        {
          id: uid("act"),
          titleKey: "activity.paid",
          title: `Order #${order.number} paid`,
          actor: order.waiterName,
          at: new Date().toISOString(),
          tone: "success" as const,
        },
        ...s.activity,
      ],
    }));

    return payment;
  };

  advanceTicket = async (ticketId: string) => {
    await delay(150);
    const flow: TicketStatus[] = ["pending", "preparing", "ready", "dismissed"];
    this.set((s) => ({
      ...s,
      tickets: s.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        const idx = flow.indexOf(t.status);
        const next = flow[Math.min(idx + 1, flow.length - 1)];
        return {
          ...t,
          status: next,
          startedAt: next === "preparing" ? new Date().toISOString() : t.startedAt,
        };
      }),
    }));
    return this.state.tickets.find((t) => t.id === ticketId)!;
  };

  dismissTicket = async (ticketId: string) => {
    await delay(120);
    this.set((s) => ({
      ...s,
      tickets: s.tickets.map((t) =>
        t.id === ticketId ? { ...t, status: "dismissed" as const } : t,
      ),
    }));
  };
}

export const mockApi = new MockApi();
