import { jsonOk, parseJson, requireAdmin, withApi } from "@/lib/api-helpers";
import type { Allergen } from "@saasfood/shared";
import { deleteMenuItem, updateMenuItem } from "@/modules/menu";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string; itemId: string }> },
) {
  return withApi(async () => {
    const { tenantSlug, itemId } = await ctx.params;
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
    return jsonOk(await updateMenuItem(tenant.id, itemId, body));
  });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ tenantSlug: string; itemId: string }> },
) {
  return withApi(async () => {
    const { tenantSlug, itemId } = await ctx.params;
    const { tenant } = await requireAdmin(tenantSlug);
    return jsonOk(await deleteMenuItem(tenant.id, itemId));
  });
}
