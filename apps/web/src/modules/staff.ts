import { and, eq } from "drizzle-orm";
import { activityItems, staff } from "@saasfood/db";
import { getDb } from "@/lib/db";
import { ApiError, uid } from "@/lib/api-helpers";

function publicStaff(row: typeof staff.$inferSelect) {
  return {
    id: row.id,
    staffCode: row.staffCode,
    name: row.name,
    role: row.role,
    active: row.active,
    isDefaultPin: row.isDefaultPin,
  };
}

export async function listStaff(tenantId: string) {
  const db = getDb();
  const rows = await db.select().from(staff).where(eq(staff.tenantId, tenantId));
  return rows.map(publicStaff);
}

export async function resetPin(tenantId: string, staffId: string, actorName: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(staff)
    .where(and(eq(staff.tenantId, tenantId), eq(staff.id, staffId)))
    .limit(1);

  if (!row) throw new ApiError(404, "Staff not found", "STAFF_NOT_FOUND");

  const [updated] = await db
    .update(staff)
    .set({ pin: "0000", isDefaultPin: true })
    .where(and(eq(staff.tenantId, tenantId), eq(staff.id, staffId)))
    .returning();

  await db.insert(activityItems).values({
    id: uid("act"),
    tenantId,
    titleKey: "activity.pinReset",
    title: "PIN reset to default",
    actor: actorName,
    tone: "warning",
  });

  return publicStaff(updated);
}
