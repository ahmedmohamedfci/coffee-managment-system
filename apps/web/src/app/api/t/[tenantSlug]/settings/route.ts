import { jsonOk, parseJson, requireAdmin, withApi } from "@/lib/api-helpers";
import { updateTenantSettings } from "@/modules/menu";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const { tenant } = await requireAdmin(tenantSlug);
    const body = await parseJson<{ name?: string; taxRate?: number }>(req);
    return jsonOk(await updateTenantSettings(tenant.id, body));
  });
}
