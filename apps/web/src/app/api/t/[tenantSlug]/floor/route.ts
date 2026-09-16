import { jsonOk, requireSession, withApi } from "@/lib/api-helpers";
import { listFloor } from "@/modules/floor";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const { tenant } = await requireSession(tenantSlug);
    return jsonOk(await listFloor(tenant.id));
  });
}
