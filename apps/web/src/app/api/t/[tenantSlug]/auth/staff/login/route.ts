import { ApiError, jsonOk, parseJson, withApi } from "@/lib/api-helpers";
import { requireTenant } from "@/lib/tenant";
import { staffLogin } from "@/modules/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const tenant = await requireTenant(tenantSlug);
    const body = await parseJson<{ staffCode?: string; pin?: string }>(req);
    if (!body.staffCode || !body.pin) {
      throw new ApiError(400, "staffCode and pin are required", "MISSING_FIELDS");
    }
    const result = await staffLogin(tenant.id, body.staffCode, body.pin);
    return jsonOk(result);
  });
}
