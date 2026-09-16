import { jsonOk, requireAdmin, withApi } from "@/lib/api-helpers";
import { resetPin } from "@/modules/staff";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ tenantSlug: string; staffId: string }> },
) {
  return withApi(async () => {
    const { tenantSlug, staffId } = await ctx.params;
    const { tenant, session } = await requireAdmin(tenantSlug);
    return jsonOk(await resetPin(tenant.id, staffId, session.name));
  });
}
