"use client";

import { useRouter } from "next/navigation";
import { Button, TerminalFrame } from "@saasfood/ui";
import { useMockState } from "@/lib/use-mock-state";
import { useT } from "@/lib/use-t";

export default function PriceListPage() {
  const t = useT();
  const state = useMockState();
  const router = useRouter();
  const items = [...state.menuItems].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <style>{`
        @media print {
          .demo-hud-hide, .no-print { display: none !important; }
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
            <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>{state.tenantName}</h1>
            <p style={{ margin: "0 0 20px", color: "var(--d-dim)", fontSize: 13 }}>{t("prices.title")}</p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "start", padding: "8px 4px", borderBottom: "1px solid var(--d-border)", color: "var(--d-dim)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {t("prices.item")}
                  </th>
                  <th className="price-col" style={{ textAlign: "end", padding: "8px 4px", borderBottom: "1px solid var(--d-border)", color: "var(--d-dim)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {t("prices.price")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "12px 4px", borderBottom: "1px solid var(--d-border)" }}>{item.name}</td>
                    <td className="price-col" style={{ padding: "12px 4px", borderBottom: "1px solid var(--d-border)", textAlign: "end", fontWeight: 800, color: "var(--accent)" }}>
                      ${item.basePrice.toFixed(2)}
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
