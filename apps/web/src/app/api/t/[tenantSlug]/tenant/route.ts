import { jsonOk, withApi } from "@/lib/api-helpers";
import { requireTenant } from "@/lib/tenant";

/** Public-ish tenant bootstrap for UI (name, currency, tax). */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const tenant = await requireTenant(tenantSlug);
    return jsonOk({
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      currency: tenant.currency,
      taxRate: tenant.taxRate,
    });
  });
}
