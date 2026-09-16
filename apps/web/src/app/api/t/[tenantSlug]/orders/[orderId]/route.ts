import { jsonOk, requireSession, withApi } from "@/lib/api-helpers";
import { getOrder } from "@/modules/orders";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ tenantSlug: string; orderId: string }> },
) {
  return withApi(async () => {
    const { tenantSlug, orderId } = await ctx.params;
    const { tenant } = await requireSession(tenantSlug);
    return jsonOk(await getOrder(tenant.id, orderId));
  });
}
