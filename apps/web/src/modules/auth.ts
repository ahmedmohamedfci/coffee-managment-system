import { and, eq } from "drizzle-orm";
import { staff } from "@saasfood/db";
import { getDb } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { createSession, destroySession, readSession, type SessionStaff } from "@/lib/session";

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

export async function staffLogin(tenantId: string, staffCode: string, pin: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(staff)
    .where(
      and(eq(staff.tenantId, tenantId), eq(staff.staffCode, staffCode), eq(staff.active, true)),
    )
    .limit(1);

  if (!row || row.pin !== pin) {
    throw new ApiError(401, "Invalid staff ID or PIN", "INVALID_CREDENTIALS");
  }

  await createSession(tenantId, row.id);

  return {
    kind: "staff" as const,
    staffId: row.id,
    name: row.name,
    role: row.role,
    staffCode: row.staffCode,
    isDefaultPin: row.isDefaultPin,
  };
}

export async function logout() {
  await destroySession();
  return { ok: true };
}

export async function me(tenantId: string): Promise<{
  staff: ReturnType<typeof publicStaff> | null;
  session: SessionStaff | null;
}> {
  const session = await readSession();
  if (!session || session.tenantId !== tenantId) {
    return { staff: null, session: null };
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(staff)
    .where(and(eq(staff.tenantId, tenantId), eq(staff.id, session.staffId)))
    .limit(1);

  if (!row || !row.active) {
    await destroySession();
    return { staff: null, session: null };
  }

  return { staff: publicStaff(row), session };
}
