import { and, desc, eq, ne } from "drizzle-orm";
import { kitchenTickets } from "@saasfood/db";
import type { TicketStatus } from "@saasfood/shared";
import { getDb } from "@/lib/db";
import { ApiError } from "@/lib/errors";

const VALID: TicketStatus[] = ["pending", "preparing", "ready", "dismissed"];

function serialize(t: typeof kitchenTickets.$inferSelect) {
  return {
    id: t.id,
    orderId: t.orderId,
    tableLabel: t.tableLabel,
    waiterName: t.waiterName,
    status: t.status,
    lines: t.lines,
    createdAt: t.createdAt.toISOString(),
    startedAt: t.startedAt?.toISOString(),
  };
}

export async function listTickets(tenantId: string, includeDismissed = false) {
  const db = getDb();
  const rows = includeDismissed
    ? await db
        .select()
        .from(kitchenTickets)
        .where(eq(kitchenTickets.tenantId, tenantId))
        .orderBy(desc(kitchenTickets.createdAt))
    : await db
        .select()
        .from(kitchenTickets)
        .where(
          and(eq(kitchenTickets.tenantId, tenantId), ne(kitchenTickets.status, "dismissed")),
        )
        .orderBy(desc(kitchenTickets.createdAt));

  return rows.map(serialize);
}

export async function updateTicketStatus(
  tenantId: string,
  ticketId: string,
  status: TicketStatus,
) {
  if (!VALID.includes(status)) {
    throw new ApiError(400, "Invalid ticket status", "INVALID_STATUS");
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(kitchenTickets)
    .where(and(eq(kitchenTickets.tenantId, tenantId), eq(kitchenTickets.id, ticketId)))
    .limit(1);

  if (!existing) throw new ApiError(404, "Ticket not found", "TICKET_NOT_FOUND");

  const patch: Partial<typeof kitchenTickets.$inferInsert> = { status };
  if (status === "preparing" && !existing.startedAt) {
    patch.startedAt = new Date();
  }

  const [updated] = await db
    .update(kitchenTickets)
    .set(patch)
    .where(and(eq(kitchenTickets.tenantId, tenantId), eq(kitchenTickets.id, ticketId)))
    .returning();

  return serialize(updated);
}
