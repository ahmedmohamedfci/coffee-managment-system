import { ApiError, jsonOk, parseJson, requireSession, withApi } from "@/lib/api-helpers";
import { updateLineQty } from "@/modules/orders";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string; orderId: string; lineId: string }> },
) {
  return withApi(async () => {
    const { tenantSlug, orderId, lineId } = await ctx.params;
    const { tenant } = await requireSession(tenantSlug);
    const body = await parseJson<{ quantity?: number; expectedVersion?: number }>(req);
    if (body.quantity === undefined) {
      throw new ApiError(400, "quantity is required", "MISSING_FIELDS");
    }
    return jsonOk(
      await updateLineQty(tenant.id, orderId, lineId, body.quantity, body.expectedVersion),
    );
  });
}
