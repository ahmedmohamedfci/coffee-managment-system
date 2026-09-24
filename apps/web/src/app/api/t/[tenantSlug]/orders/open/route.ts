import { apiError, jsonOk, parseJson, requireSession, withApi } from "@/lib/api-helpers";
import { openOrder } from "@/modules/orders";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const { tenant, session } = await requireSession(tenantSlug);
    const body = await parseJson<{ tableId?: string; waiterId?: string }>(req);
    if (!body.tableId) throw apiError("MISSING_FIELDS");
    const waiterId = body.waiterId ?? session.staffId;
    return jsonOk(await openOrder(tenant.id, body.tableId, waiterId), { status: 201 });
  });
}
