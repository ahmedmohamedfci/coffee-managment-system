import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { ApiError } from "./errors";
import { apiError, localizedErrorMessage, type ErrorCode } from "./error-catalog";
import { DEFAULT_LANG, isLang, LOCALE_COOKIE, type AppLocale } from "./locale";
import { UID_HEX_LEN } from "./constants";
import { readSession, type SessionStaff } from "./session";
import { requireTenant, type Tenant } from "./tenant";

export { ApiError };
export { apiError };
export type { ErrorCode };

export function jsonOk<T>(data: T, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200 });
}

export async function resolveRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLang(fromCookie)) return fromCookie;

  const accept = (await headers()).get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().split("-")[0]?.toLowerCase();
  if (isLang(first)) return first;
  return DEFAULT_LANG;
}

export async function jsonError(err: unknown) {
  const locale = await resolveRequestLocale();
  if (err instanceof ApiError) {
    const message = localizedErrorMessage(err.code, locale);
    return NextResponse.json(
      { error: { code: err.code ?? "INTERNAL", message }, code: err.code ?? undefined },
      { status: err.status },
    );
  }
  console.error(err);
  const message = localizedErrorMessage("INTERNAL", locale);
  return NextResponse.json(
    { error: { code: "INTERNAL", message }, code: "INTERNAL" },
    { status: 500 },
  );
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
  if (!session) throw apiError("UNAUTHORIZED");
  if (session.tenantId !== tenant.id) {
    throw apiError("TENANT_MISMATCH");
  }
  return { tenant, session };
}

export async function requireAdmin(tenantSlug: string) {
  const ctx = await requireSession(tenantSlug);
  if (ctx.session.role !== "admin") {
    throw apiError("ADMIN_REQUIRED");
  }
  return ctx;
}

export async function parseJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw apiError("INVALID_JSON");
  }
}

export async function parseJsonOptional<T>(req: Request): Promise<Partial<T>> {
  const text = await req.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as Partial<T>;
  } catch {
    throw apiError("INVALID_JSON");
  }
}

export function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, UID_HEX_LEN)}`;
}
