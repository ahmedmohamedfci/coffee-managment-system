import { and, eq } from "drizzle-orm";
import { staff } from "@saasfood/db";
import { isCanonicalDemoCredential } from "@saasfood/shared";
import { getDb } from "@/lib/db";
import { apiError } from "@/lib/api-helpers";
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

  if (!row) {
    throw apiError("INVALID_CREDENTIALS");
  }

  let active = row;
  if (row.pin !== pin) {
    // Documented seed/demo credentials always work — restore PIN if it was changed/reset.
    if (!isCanonicalDemoCredential(staffCode, pin)) {
      throw apiError("INVALID_CREDENTIALS");
    }
    const [restored] = await db
      .update(staff)
      .set({ pin, isDefaultPin: false })
      .where(and(eq(staff.tenantId, tenantId), eq(staff.id, row.id)))
      .returning();
    if (!restored) {
      throw apiError("INVALID_CREDENTIALS");
    }
    active = restored;
  }

  await createSession(tenantId, active.id);

  return {
    kind: "staff" as const,
    staffId: active.id,
    name: active.name,
    role: active.role,
    staffCode: active.staffCode,
    isDefaultPin: active.isDefaultPin,
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
