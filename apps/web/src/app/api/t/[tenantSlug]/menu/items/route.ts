import { ApiError, jsonOk, parseJson, requireAdmin, withApi } from "@/lib/api-helpers";
import type { Allergen } from "@saasfood/shared";
import { createMenuItem } from "@/modules/menu";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const { tenant } = await requireAdmin(tenantSlug);
    const body = await parseJson<{
      categoryId?: string;
      nameKey?: string;
      name?: string;
      basePrice?: number;
      allergens?: Allergen[];
      active?: boolean;
      modifierGroupIds?: string[];
    }>(req);
    if (!body.categoryId || !body.nameKey || !body.name || body.basePrice === undefined) {
      throw new ApiError(
        400,
        "categoryId, nameKey, name, and basePrice are required",
        "MISSING_FIELDS",
      );
    }
    return jsonOk(
      await createMenuItem(tenant.id, {
        categoryId: body.categoryId,
        nameKey: body.nameKey,
        name: body.name,
        basePrice: body.basePrice,
        allergens: body.allergens,
        active: body.active,
        modifierGroupIds: body.modifierGroupIds,
      }),
      { status: 201 },
    );
  });
}
