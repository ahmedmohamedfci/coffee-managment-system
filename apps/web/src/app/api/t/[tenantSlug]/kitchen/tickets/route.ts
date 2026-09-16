import { jsonOk, requireSession, withApi } from "@/lib/api-helpers";
import { listTickets } from "@/modules/kitchen";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    const { tenant } = await requireSession(tenantSlug);
    const includeDismissed =
      new URL(req.url).searchParams.get("includeDismissed") === "1";
    return jsonOk({ tickets: await listTickets(tenant.id, includeDismissed) });
  });
}
