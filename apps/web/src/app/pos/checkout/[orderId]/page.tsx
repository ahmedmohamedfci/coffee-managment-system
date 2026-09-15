"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockApi, type PaymentMethod } from "@saasfood/shared";
import { Button, TerminalFrame } from "@saasfood/ui";
import { useMockState } from "@/lib/use-mock-state";
import { useT } from "@/lib/use-t";

export default function CheckoutPage() {
  const t = useT();
  const { orderId } = useParams<{ orderId: string }>();
  const state = useMockState();
  const order = state.orders.find((o) => o.id === orderId);
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [error, setError] = useState("");

  if (!order) return <div style={{ padding: 24 }}>Missing order</div>;

  const methods: Array<{ id: PaymentMethod; label: string }> = [
    { id: "cash", label: t("checkout.cash") },
    { id: "manual_card", label: t("checkout.card") },
    { id: "tap", label: t("checkout.tap") },
  ];

  return (
    <TerminalFrame
      header={
        <>
          <div>
            <div style={{ fontWeight: 800 }}>{t("checkout.title")}</div>
            <div style={{ color: "var(--d-dim)" }}>{order.tableLabel}</div>
          </div>
          <Button variant="dark" onClick={() => router.push(`/pos/order/${order.id}`)}>{t("checkout.back")}</Button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16, padding: 20 }}>
        <div style={{ background: "var(--d-surface)", borderRadius: 16, border: "1px solid var(--d-border)", padding: 18 }}>
          {order.lines.map((l) => (
            <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed var(--d-border)" }}>
              <div>
                <div>{l.name} x{l.quantity}</div>
                <small style={{ color: "var(--d-dim)" }}>{l.modifierLabels.join(", ")}</small>
              </div>
              <strong>${l.lineTotal.toFixed(2)}</strong>
            </div>
          ))}
          <div style={{ marginTop: 16, display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>{t("pos.subtotal")}</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>{t("pos.tax")}</span><span>${order.tax.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent)", fontSize: 22, fontWeight: 800 }}>
              <span>{t("pos.total")}</span><span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div style={{ background: "var(--d-surface)", borderRadius: 16, border: "1px solid var(--d-border)", padding: 18 }}>
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              style={{
                width: "100%",
                textAlign: "start",
                marginBottom: 10,
                padding: "14px 16px",
                borderRadius: 12,
                border: `2px solid ${method === m.id ? "var(--primary)" : "var(--d-border)"}`,
                background: method === m.id ? "color-mix(in srgb, var(--primary) 14%, transparent)" : "var(--d-surface-2)",
                color: "var(--d-text)",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              <strong>{m.label}</strong>
            </button>
          ))}
          {error ? <div style={{ color: "var(--danger)", marginBottom: 8 }}>{error}</div> : null}
          <Button
            variant="cta"
            block
            onClick={async () => {
              setError("");
              try {
                const payment = await mockApi.pay(order.id, method);
                router.push(`/pos/success/${payment.id}`);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Error");
              }
            }}
          >
            {t("checkout.confirm")}
          </Button>
        </div>
      </div>
    </TerminalFrame>
  );
}
