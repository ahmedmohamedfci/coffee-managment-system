"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminShell } from "@saasfood/ui";
import { useT, useLocalePath } from "@/lib/use-t";
import { useDemoStore } from "@/lib/demo-store";
import { stripLocalePrefix } from "@/lib/locale";

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
  const lp = useLocalePath();
  const pathname = usePathname() || "/";
  const path = stripLocalePrefix(pathname);
  const session = useDemoStore((s) => s.session);

  return (
    <AdminShell
      brand={t("app.name")}
      nav={
        <>
          <SoftNavItem href={lp("/demo/admin")} active={path === "/demo/admin"}>
            {t("nav.dashboard")}
          </SoftNavItem>
          <SoftNavItem href={lp("/demo/admin/staff")} active={path.startsWith("/demo/admin/staff")}>
            {t("nav.staff")}
          </SoftNavItem>
          <SoftNavItem href={lp("/demo/admin/floor")} active={path.startsWith("/demo/admin/floor")}>
            {t("nav.floorEdit")}
          </SoftNavItem>
          <SoftNavItem href={lp("/demo/admin/settings")} active={path.startsWith("/demo/admin/settings")}>
            {t("nav.settings")}
          </SoftNavItem>
        </>
      }
      user={
        <div style={{ padding: 10, borderRadius: 12, background: "color-mix(in srgb, white 10%, transparent)" }}>
          <div style={{ fontWeight: 700 }}>
            {session?.kind === "admin" ? session.name : t("user.admin")}
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            <Link href={lp("/demo/admin/login")}>{t("nav.loginLink")}</Link>
          </div>
        </div>
      }
    >
      {children}
    </AdminShell>
  );
}
