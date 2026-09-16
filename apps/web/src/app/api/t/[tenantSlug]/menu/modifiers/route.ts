import { ApiError, jsonOk, parseJson, requireAdmin, withApi } from "@/lib/api-helpers";
import type { ModifierGroup } from "@saasfood/shared";
import { saveModifierGroups } from "@/modules/menu";

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const { tenant } = await requireAdmin(tenantSlug);
    const body = await parseJson<{ groups?: ModifierGroup[] } | ModifierGroup[]>(req);
    const groups = Array.isArray(body) ? body : body.groups;
    if (!groups) throw new ApiError(400, "groups array is required", "MISSING_FIELDS");
    return jsonOk({ modifierGroups: await saveModifierGroups(tenant.id, groups) });
  });
}
