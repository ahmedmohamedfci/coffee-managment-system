"use client";

import Link from "next/link";
import { Button } from "@saasfood/ui";
import { useT } from "@/lib/use-t";

export default function HomePage() {
  const t = useT();
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: 40, color: "#e2e8f0" }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em" }}>{t("app.name")}</h1>
      <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.5 }}>{t("demo.title")}</p>
      <ol style={{ marginTop: 28, display: "grid", gap: 12, color: "#cbd5e1", lineHeight: 1.5 }}>
        <li>Admin: login → dashboard → staff → floor editor</li>
        <li>Waiter: PIN 104 / 2222 → floor → POS → <strong>Submit to kitchen</strong> → pay</li>
        <li>Open Kitchen Display System — tickets appear when the waiter submits an order</li>
      </ol>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
        <Link href="/admin/login"><Button>{t("nav.adminLogin")}</Button></Link>
        <Link href="/pos/login"><Button variant="strong">{t("nav.pin")}</Button></Link>
        <Link href="/kitchen-display"><Button variant="dark">{t("nav.kds")}</Button></Link>
      </div>
    </main>
  );
}
