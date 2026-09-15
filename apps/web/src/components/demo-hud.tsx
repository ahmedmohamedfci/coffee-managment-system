"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { mockApi, type Lang } from "@saasfood/shared";
import { Button } from "@saasfood/ui";
import { useDemoStore } from "@/lib/demo-store";
import { useT } from "@/lib/use-t";
import { useEffect } from "react";

const jumps = [
  { href: "/", key: "nav.home" as const },
  { href: "/admin/login", key: "nav.adminLogin" as const },
  { href: "/admin", key: "nav.dashboard" as const },
  { href: "/admin/staff", key: "nav.staff" as const },
  { href: "/admin/floor", key: "nav.floorEdit" as const },
  { href: "/admin/settings", key: "nav.settings" as const },
  { href: "/pos/login", key: "nav.pin" as const },
  { href: "/pos/floor", key: "nav.floor" as const },
  { href: "/pos/prices", key: "nav.prices" as const },
  { href: "/kitchen-display", key: "nav.kds" as const },
];

export function DemoHud() {
  const t = useT();
  const lang = useDemoStore((s) => s.lang);
  const setLang = useDemoStore((s) => s.setLang);
  const setSession = useDemoStore((s) => s.setSession);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 80,
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        background: "color-mix(in srgb, #0b1220 92%, var(--brand-2))",
        borderBottom: "1px solid color-mix(in srgb, white 10%, transparent)",
        color: "#e2e8f0",
        fontSize: 12,
      }}
    >
      <strong style={{ fontSize: 13 }}>{t("demo.title")}</strong>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {jumps.map((j) => (
          <Link
            key={j.href}
            href={j.href}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: pathname === j.href ? "var(--brand-1)" : "color-mix(in srgb, white 8%, transparent)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {t(j.key)}
          </Link>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {(["en", "cs", "ar"] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "6px 10px",
              fontWeight: 700,
              cursor: "pointer",
              background: lang === l ? "var(--brand-1)" : "transparent",
              color: "#fff",
            }}
          >
            {t(`lang.${l}`)}
          </button>
        ))}
        <Button
          variant="dark"
          onClick={async () => {
            setSession({ kind: "admin", name: "John Doe", email: "admin@brewexpress.com" });
            router.push("/admin");
          }}
        >
          {t("persona.admin")}
        </Button>
        <Button
          variant="dark"
          onClick={async () => {
            const s = await mockApi.staffLogin("104", "2222");
            setSession({ kind: "staff", staffId: s.staffId, name: s.name, role: s.role });
            router.push("/pos/floor");
          }}
        >
          {t("persona.waiter")}
        </Button>
        <Button variant="dark" onClick={() => router.push("/kitchen-display")}>
          {t("persona.kitchen")}
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            await mockApi.resetDemo();
            useDemoStore.getState().clearSession();
            router.push("/");
          }}
        >
          {t("demo.reset")}
        </Button>
      </div>
    </div>
  );
}
