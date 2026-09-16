"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, TerminalFrame } from "@saasfood/ui";
import {
  createTenantApi,
  money,
  type MenuPayload,
  type TenantInfo,
} from "@/lib/api-client";
import { useT } from "@/lib/use-t";

export default function PriceListPage() {
  const t = useT();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const router = useRouter();
  const api = createTenantApi(tenantSlug);
  const [menu, setMenu] = useState<MenuPayload | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getMenu(), api.getTenant()])
      .then(([m, ten]) => {
        if (cancelled) return;
        setMenu(m);
        setTenant(ten);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error");
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  const items = [...(menu?.menuItems ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const currency = tenant?.currency ?? "USD";

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          .print-sheet {
            background: #fff !important;
            color: #000 !important;
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          .print-sheet table { width: 100%; border-collapse: collapse; }
          .print-sheet th, .print-sheet td {
            border-bottom: 1px solid #ccc;
            padding: 10px 4px;
            text-align: start;
            font-size: 14px;
          }
          .print-sheet .price-col { text-align: end; font-weight: 700; }
        }
      `}</style>
      <TerminalFrame
        header={
          <>
            <div>
              <div style={{ fontWeight: 800 }}>{t("prices.title")}</div>
              <div style={{ color: "var(--d-dim)", fontSize: 13 }}>{t("prices.sub")}</div>
            </div>
            <div className="no-print" style={{ display: "flex", gap: 8 }}>
              <Button variant="dark" onClick={() => router.back()}>
                {t("prices.back")}
              </Button>
              <Button onClick={() => window.print()}>{t("prices.print")}</Button>
            </div>
          </>
        }
      >
        <div style={{ padding: 24, display: "grid", placeItems: "start center" }}>
          {error ? <div style={{ color: "var(--danger)" }}>{error}</div> : null}
          <div
            className="print-sheet"
            style={{
              width: "100%",
              maxWidth: 560,
              background: "var(--d-surface)",
              border: "1px solid var(--d-border)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>{tenant?.name ?? tenantSlug}</h1>
            <p style={{ margin: "0 0 20px", color: "var(--d-dim)", fontSize: 13 }}>
              {t("prices.title")}
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "start",
                      padding: "8px 4px",
                      borderBottom: "1px solid var(--d-border)",
                      color: "var(--d-dim)",
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("prices.item")}
                  </th>
                  <th
                    className="price-col"
                    style={{
                      textAlign: "end",
                      padding: "8px 4px",
                      borderBottom: "1px solid var(--d-border)",
                      color: "var(--d-dim)",
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("prices.price")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "12px 4px", borderBottom: "1px solid var(--d-border)" }}>
                      {item.name}
                    </td>
                    <td
                      className="price-col"
                      style={{
                        padding: "12px 4px",
                        borderBottom: "1px solid var(--d-border)",
                        textAlign: "end",
                        fontWeight: 800,
                        color: "var(--accent)",
                      }}
                    >
                      {money(item.basePrice, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </TerminalFrame>
    </>
  );
}
