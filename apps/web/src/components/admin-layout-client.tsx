"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminShell, NavItem } from "@saasfood/ui";
import { useT } from "@/lib/use-t";
import { useDemoStore } from "@/lib/demo-store";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const t = useT();
  const pathname = usePathname();
  const session = useDemoStore((s) => s.session);

  return (
    <AdminShell
      brand={t("app.name")}
      nav={
        <>
          <NavItem href="/admin" active={pathname === "/admin"}>{t("nav.dashboard")}</NavItem>
          <NavItem href="/admin/staff" active={pathname.startsWith("/admin/staff")}>{t("nav.staff")}</NavItem>
          <NavItem href="/admin/floor" active={pathname.startsWith("/admin/floor")}>{t("nav.floorEdit")}</NavItem>
          <NavItem href="/admin/settings" active={pathname.startsWith("/admin/settings")}>{t("nav.settings")}</NavItem>
        </>
      }
      user={
        <div style={{ padding: 10, borderRadius: 12, background: "color-mix(in srgb, white 10%, transparent)" }}>
          <div style={{ fontWeight: 700 }}>{session?.kind === "admin" ? session.name : "Admin"}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            <Link href="/admin/login">login</Link>
          </div>
        </div>
      }
    >
      {children}
    </AdminShell>
  );
}
