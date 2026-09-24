import { apiError, jsonOk, parseJson, requireSession, withApi } from "@/lib/api-helpers";
import { addLine } from "@/modules/orders";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string; orderId: string }> },
) {
  return withApi(async () => {
    const { tenantSlug, orderId } = await ctx.params;
    const { tenant } = await requireSession(tenantSlug);
    const body = await parseJson<{
      menuItemId?: string;
      quantity?: number;
      modifierOptionIds?: string[];
      kitchenNote?: string;
      allergyNote?: boolean;
      expectedVersion?: number;
    }>(req);
    if (!body.menuItemId || body.quantity === undefined) {
      throw apiError("MISSING_FIELDS");
    }
    return jsonOk(
      await addLine(tenant.id, orderId, {
        menuItemId: body.menuItemId,
        quantity: body.quantity,
        modifierOptionIds: body.modifierOptionIds,
        kitchenNote: body.kitchenNote,
        allergyNote: body.allergyNote,
        expectedVersion: body.expectedVersion,
      }),
    );
  });
}
