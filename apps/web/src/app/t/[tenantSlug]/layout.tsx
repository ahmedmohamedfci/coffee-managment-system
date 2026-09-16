import { TenantChrome } from "@/components/tenant-chrome";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  return (
    <>
      <TenantChrome slug={tenantSlug} />
      <div style={{ minHeight: "calc(100vh - 40px)" }}>{children}</div>
    </>
  );
}
