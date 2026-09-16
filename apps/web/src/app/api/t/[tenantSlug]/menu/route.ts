import { jsonOk, requireSession, withApi } from "@/lib/api-helpers";
import { listMenu } from "@/modules/menu";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const { tenant } = await requireSession(tenantSlug);
    return jsonOk(await listMenu(tenant.id));
  });
}
