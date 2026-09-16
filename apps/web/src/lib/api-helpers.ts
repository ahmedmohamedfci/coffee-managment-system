import { NextResponse } from "next/server";
import { ApiError } from "./errors";
import { readSession, type SessionStaff } from "./session";
import { requireTenant, type Tenant } from "./tenant";

export { ApiError };

export function jsonOk<T>(data: T, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200 });
}

export function jsonError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: err.message, code: err.code ?? undefined },
      { status: err.status },
    );
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function withApi(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    return jsonError(err);
  }
}

export async function requireSession(tenantSlug: string): Promise<{
  tenant: Tenant;
  session: SessionStaff;
}> {
  const tenant = await requireTenant(tenantSlug);
  const session = await readSession();
  if (!session) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  if (session.tenantId !== tenant.id) {
    throw new ApiError(403, "Session does not match tenant", "TENANT_MISMATCH");
  }
  return { tenant, session };
}

export async function requireAdmin(tenantSlug: string) {
  const ctx = await requireSession(tenantSlug);
  if (ctx.session.role !== "admin") {
    throw new ApiError(403, "Admin role required", "ADMIN_REQUIRED");
  }
  return ctx;
}

export async function parseJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ApiError(400, "Invalid JSON body", "INVALID_JSON");
  }
}

export async function parseJsonOptional<T>(req: Request): Promise<Partial<T>> {
  const text = await req.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as Partial<T>;
  } catch {
    throw new ApiError(400, "Invalid JSON body", "INVALID_JSON");
  }
}

export function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}
