import { ApiError, jsonOk, parseJson, requireSession, withApi } from "@/lib/api-helpers";
import type { TicketStatus } from "@saasfood/shared";
import { updateTicketStatus } from "@/modules/kitchen";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string; ticketId: string }> },
) {
  return withApi(async () => {
    const { tenantSlug, ticketId } = await ctx.params;
    const { tenant } = await requireSession(tenantSlug);
    const body = await parseJson<{ status?: TicketStatus }>(req);
    if (!body.status) throw new ApiError(400, "status is required", "MISSING_FIELDS");
    return jsonOk(await updateTicketStatus(tenant.id, ticketId, body.status));
  });
}
