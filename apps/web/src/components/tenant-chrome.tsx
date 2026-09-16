"use client";

import { useEffect, useState } from "react";
import { createTenantApi, type TenantInfo } from "@/lib/api-client";

export function TenantChrome({ slug }: { slug: string }) {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    createTenantApi(slug)
      .getTenant()
      .then((t) => {
        if (!cancelled) setTenant(t);
      })
      .catch(() => {
        if (!cancelled) setTenant(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 16px",
        background: "color-mix(in srgb, var(--primary-strong, #0f172a) 92%, black)",
        color: "#e2e8f0",
        borderBottom: "1px solid color-mix(in srgb, white 12%, transparent)",
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 700, letterSpacing: "0.02em" }}>
        {tenant?.name ?? slug}
      </div>
      <div style={{ opacity: 0.65, fontFamily: "ui-monospace, monospace" }}>/t/{slug}</div>
    </div>
  );
}
