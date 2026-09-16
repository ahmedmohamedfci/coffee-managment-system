"use client";

import Link from "next/link";
import { Button } from "@saasfood/ui";

type TenantLinks = {
  name: string;
  slug: string;
};

const TENANTS: TenantLinks[] = [
  { name: "AL BARON PYRAMID IV", slug: "al-baron-pyramid-iv" },
  { name: "Test restaurant N.1", slug: "test-restaurant-n1" },
];

function TenantCard({ name, slug }: TenantLinks) {
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
        Real tenant · <code style={{ color: "#cbd5e1" }}>{base}/…</code>
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href={`${base}/pos/login`}>
          <Button variant="strong">POS login</Button>
        </Link>
        <Link href={`${base}/admin/login`}>
          <Button>Admin login</Button>
        </Link>
        <Link href={`${base}/kitchen-display`}>
          <Button variant="dark">Kitchen display</Button>
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "40px 24px 64px", color: "#e2e8f0" }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>SaaSFood</h1>
      <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.55, marginTop: 10, maxWidth: 560 }}>
        Multi-tenant restaurant hub. Use a seeded tenant for the real Postgres-backed app, or open the
        mocked walkthrough under <code style={{ color: "#cbd5e1" }}>/demo</code>.
      </p>

      <h2 style={{ marginTop: 36, marginBottom: 12, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
        Real tenants
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#94a3b8", lineHeight: 1.5 }}>
        Seed logins: admin <strong style={{ color: "#e2e8f0" }}>101 / 1234</strong>, waiter{" "}
        <strong style={{ color: "#e2e8f0" }}>104 / 2222</strong>. Admin soft-nav lives under{" "}
        <code style={{ color: "#cbd5e1" }}>/t/&lt;slug&gt;/admin/…</code>.
      </p>
      <div style={{ display: "grid", gap: 14 }}>
        {TENANTS.map((t) => (
          <TenantCard key={t.slug} {...t} />
        ))}
      </div>

      <h2 style={{ marginTop: 40, marginBottom: 12, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
        Mock demo
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#94a3b8", lineHeight: 1.5 }}>
        Client-side mocked APIs — no database required. Same PIN walkthrough as before.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/demo/pos/login">
          <Button variant="strong">Demo POS</Button>
        </Link>
        <Link href="/demo/admin/login">
          <Button>Demo admin</Button>
        </Link>
        <Link href="/demo/kitchen-display">
          <Button variant="dark">Demo kitchen</Button>
        </Link>
      </div>
    </main>
  );
}
