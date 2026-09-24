"use client";

import Link from "next/link";
import { Button } from "@saasfood/ui";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useLocalePath, useT } from "@/lib/use-t";
import { HUB_TENANTS, SEED_ADMIN_LOGIN, SEED_WAITER_LOGIN } from "@/lib/constants";

type TenantLinks = {
  name: string;
  slug: string;
};

function TenantCard({ name, slug }: TenantLinks) {
  const t = useT();
  const lp = useLocalePath();
  const base = `/t/${slug}`;
  return (
    <section
      style={{
        padding: "20px 22px",
        borderRadius: 16,
        background: "color-mix(in srgb, white 6%, transparent)",
        border: "1px solid color-mix(in srgb, white 12%, transparent)",
      }}
    >
      <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>{name}</h3>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "#94a3b8" }}>
        {t("hub.realTenantHint", { path: base })}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href={lp(`${base}/pos/login`)}>
          <Button variant="strong">{t("hub.posLogin")}</Button>
        </Link>
        <Link href={lp(`${base}/admin/login`)}>
          <Button>{t("hub.adminLogin")}</Button>
        </Link>
        <Link href={lp(`${base}/kitchen-display`)}>
          <Button variant="dark">{t("hub.kitchen")}</Button>
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  const t = useT();
  const lp = useLocalePath();

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "40px 24px 64px", color: "#e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>{t("app.name")}</h1>
        <LocaleSwitcher />
      </div>
      <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.55, marginTop: 10, maxWidth: 560 }}>
        {t("hub.lead", { demo: "/demo" })}
      </p>

      <h2 style={{ marginTop: 36, marginBottom: 12, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
        {t("hub.realTenants")}
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#94a3b8", lineHeight: 1.5 }}>
        {t("hub.seedLogins", {
          admin: SEED_ADMIN_LOGIN,
          waiter: SEED_WAITER_LOGIN,
          adminPath: "/t/<slug>/admin/…",
        })}
      </p>
      <div style={{ display: "grid", gap: 14 }}>
        {HUB_TENANTS.map((tenant) => (
          <TenantCard key={tenant.slug} {...tenant} />
        ))}
      </div>

      <h2 style={{ marginTop: 40, marginBottom: 12, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
        {t("hub.mockDemo")}
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#94a3b8", lineHeight: 1.5 }}>
        {t("hub.mockLead")}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href={lp("/demo/pos/login")}>
          <Button variant="strong">{t("hub.demoPos")}</Button>
        </Link>
        <Link href={lp("/demo/admin/login")}>
          <Button>{t("hub.demoAdmin")}</Button>
        </Link>
        <Link href={lp("/demo/kitchen-display")}>
          <Button variant="dark">{t("hub.demoKitchen")}</Button>
        </Link>
      </div>
    </main>
  );
}
