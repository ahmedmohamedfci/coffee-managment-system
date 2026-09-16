"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminShell } from "@saasfood/ui";
import { useT } from "@/lib/use-t";
import { useDemoStore } from "@/lib/demo-store";

function SoftNavItem({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`sf-nav-item ${active ? "active" : ""}`}>
      {children}
    </Link>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const t = useT();
  const pathname = usePathname();
  const session = useDemoStore((s) => s.session);

  return (
    <AdminShell
      brand={t("app.name")}
      nav={
        <>
          <SoftNavItem href="/demo/admin" active={pathname === "/demo/admin"}>
            {t("nav.dashboard")}
          </SoftNavItem>
          <SoftNavItem href="/demo/admin/staff" active={pathname.startsWith("/demo/admin/staff")}>
            {t("nav.staff")}
          </SoftNavItem>
          <SoftNavItem href="/demo/admin/floor" active={pathname.startsWith("/demo/admin/floor")}>
            {t("nav.floorEdit")}
          </SoftNavItem>
          <SoftNavItem href="/demo/admin/settings" active={pathname.startsWith("/demo/admin/settings")}>
            {t("nav.settings")}
          </SoftNavItem>
        </>
      }
      user={
        <div style={{ padding: 10, borderRadius: 12, background: "color-mix(in srgb, white 10%, transparent)" }}>
          <div style={{ fontWeight: 700 }}>{session?.kind === "admin" ? session.name : "Admin"}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            <Link href="/demo/admin/login">login</Link>
          </div>
        </div>
      }
    >
      {children}
    </AdminShell>
  );
}
