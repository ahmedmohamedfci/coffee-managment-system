import { eq } from "drizzle-orm";
import { tenants } from "@saasfood/db";
import { getDb } from "./db";
import { apiError } from "./error-catalog";

export type Tenant = typeof tenants.$inferSelect;

export async function resolveTenantBySlug(slug: string): Promise<Tenant | null> {
  const db = getDb();
  const [row] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  return row ?? null;
}

export async function requireTenant(slug: string): Promise<Tenant> {
  const tenant = await resolveTenantBySlug(slug);
  if (!tenant) throw apiError("TENANT_NOT_FOUND");
  return tenant;
}
