"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { AdminShell, Button } from "@saasfood/ui";
import { createTenantApi, type StaffSession } from "@/lib/api-client";
import { useT, useLocalePath } from "@/lib/use-t";
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

export function TenantAdminLayoutClient({ children }: { children: React.ReactNode }) {
  const t = useT();
  const lp = useLocalePath();
  const params = useParams<{ tenantSlug: string }>();
  const slug = params.tenantSlug;
  const base = `/t/${slug}/admin`;
  const pathname = usePathname() || "/";
  const path = stripLocalePrefix(pathname);
  const router = useRouter();
  const api = createTenantApi(slug);
  const [session, setSession] = useState<StaffSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((s) => {
        if (cancelled) return;
        if (s.role !== "admin") {
          router.replace(lp(`/t/${slug}/pos/login`));
          return;
        }
        setSession(s);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace(lp(`/t/${slug}/admin/login`));
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!ready) {
    return (
      <div style={{ padding: 32, color: "var(--muted)" }}>
        {t("hub.loading")}
      </div>
    );
  }

  return (
    <AdminShell
      brand={t("app.name")}
      nav={
        <>
          <SoftNavItem href={lp(base)} active={path === base}>
            {t("nav.dashboard")}
          </SoftNavItem>
          <SoftNavItem href={lp(`${base}/staff`)} active={path.startsWith(`${base}/staff`)}>
            {t("nav.staff")}
          </SoftNavItem>
          <SoftNavItem href={lp(`${base}/floor`)} active={path.startsWith(`${base}/floor`)}>
            {t("nav.floorEdit")}
          </SoftNavItem>
          <SoftNavItem href={lp(`${base}/settings`)} active={path.startsWith(`${base}/settings`)}>
            {t("nav.settings")}
          </SoftNavItem>
        </>
      }
      user={
        <div style={{ padding: 10, borderRadius: 12, background: "color-mix(in srgb, white 10%, transparent)" }}>
          <div style={{ fontWeight: 700 }}>{session?.name ?? t("user.admin")}</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6, display: "flex", gap: 8 }}>
            <Link href={lp(`/t/${slug}/pos/floor`)}>{t("nav.pos")}</Link>
            <Button
              variant="ghost"
              style={{ padding: 0, fontSize: 11, color: "inherit" }}
              onClick={async () => {
                await api.logout().catch(() => undefined);
                router.push(lp(`/t/${slug}/admin/login`));
              }}
            >
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </AdminShell>
  );
}
