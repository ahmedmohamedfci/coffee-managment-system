import { ApiError, jsonOk, parseJson, requireSession, withApi } from "@/lib/api-helpers";
import type { PaymentMethod } from "@saasfood/shared";
import { pay } from "@/modules/orders";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string; orderId: string }> },
) {
  return withApi(async () => {
    const { tenantSlug, orderId } = await ctx.params;
    const { tenant } = await requireSession(tenantSlug);
    const body = await parseJson<{ method?: PaymentMethod; expectedVersion?: number }>(req);
    if (!body.method) throw new ApiError(400, "method is required", "MISSING_FIELDS");
    return jsonOk(await pay(tenant.id, orderId, body.method, body.expectedVersion));
  });
}
