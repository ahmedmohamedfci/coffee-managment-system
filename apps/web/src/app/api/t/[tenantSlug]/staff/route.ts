import { jsonOk, requireAdmin, withApi } from "@/lib/api-helpers";
import { listStaff } from "@/modules/staff";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const { tenant } = await requireAdmin(tenantSlug);
    return jsonOk({ staff: await listStaff(tenant.id) });
  });
}
