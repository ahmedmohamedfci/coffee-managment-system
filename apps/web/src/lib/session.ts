import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { sessions, staff } from "@saasfood/db";
import { randomUUID } from "crypto";
import { getDb } from "./db";

export const SESSION_COOKIE = "sf_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export type SessionStaff = {
  sessionId: string;
  tenantId: string;
  staffId: string;
  name: string;
  role: string;
  staffCode: string;
  isDefaultPin: boolean;
};

export async function createSession(tenantId: string, staffId: string): Promise<string> {
  const db = getDb();
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    id,
    tenantId,
    staffId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return id;
}

export async function readSession(): Promise<SessionStaff | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const db = getDb();
  const [row] = await db
    .select({
      sessionId: sessions.id,
      tenantId: sessions.tenantId,
      staffId: sessions.staffId,
      expiresAt: sessions.expiresAt,
      name: staff.name,
      role: staff.role,
      staffCode: staff.staffCode,
      isDefaultPin: staff.isDefaultPin,
      active: staff.active,
    })
    .from(sessions)
    .innerJoin(staff, eq(sessions.staffId, staff.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row || !row.active || row.expiresAt.getTime() < Date.now()) {
    await destroySession();
    return null;
  }

  return {
    sessionId: row.sessionId,
    tenantId: row.tenantId,
    staffId: row.staffId,
    name: row.name,
    role: row.role,
    staffCode: row.staffCode,
    isDefaultPin: row.isDefaultPin,
  };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    const db = getDb();
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
