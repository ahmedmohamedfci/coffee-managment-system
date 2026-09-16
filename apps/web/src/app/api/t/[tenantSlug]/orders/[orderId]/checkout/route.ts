import { jsonOk, parseJsonOptional, requireSession, withApi } from "@/lib/api-helpers";
import { beginCheckout } from "@/modules/orders";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string; orderId: string }> },
) {
  return withApi(async () => {
    const { tenantSlug, orderId } = await ctx.params;
    const { tenant } = await requireSession(tenantSlug);
    const body = await parseJsonOptional<{ expectedVersion?: number }>(req);
    return jsonOk(await beginCheckout(tenant.id, orderId, body.expectedVersion));
  });
}
