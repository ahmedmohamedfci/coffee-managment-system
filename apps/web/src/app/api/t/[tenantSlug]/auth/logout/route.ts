import { jsonOk, requireSession, withApi } from "@/lib/api-helpers";
import { logout } from "@/modules/auth";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ tenantSlug: string }> },
) {
  return withApi(async () => {
    const { tenantSlug } = await ctx.params;
    await requireSession(tenantSlug);
    return jsonOk(await logout());
  });
}
