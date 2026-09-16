import { jsonOk, withApi } from "@/lib/api-helpers";
import { requireTenant } from "@/lib/tenant";
import { me } from "@/modules/auth";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const tenant = await requireTenant(tenantSlug);
    return jsonOk(await me(tenant.id));
  });
}
