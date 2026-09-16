"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Order, PaymentMethod } from "@saasfood/shared";
import { Button, TerminalFrame } from "@saasfood/ui";
import {
  createTenantApi,
  money,
  stashPaymentSuccess,
  type TenantInfo,
} from "@/lib/api-client";
import { useT } from "@/lib/use-t";

export default function CheckoutPage() {
  const t = useT();
  const { tenantSlug, orderId } = useParams<{ tenantSlug: string; orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const api = createTenantApi(tenantSlug);
    (async () => {
      try {
        await api.me();
        const [o, ten] = await Promise.all([api.getOrder(orderId), api.getTenant()]);
        if (cancelled) return;
        setOrder(o);
        setTenant(ten);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && "status" in err && (err as { status: number }).status === 401) {
          router.replace(`/t/${tenantSlug}/pos/login`);
          return;
        }
        setError(err instanceof Error ? err.message : "Error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantSlug, orderId, router]);

  if (!order) {
    return <div style={{ padding: 24 }}>{error || "Loading…"}</div>;
  }

  const currency = tenant?.currency ?? "USD";
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
          <Button
            variant="dark"
            onClick={() => router.push(`/t/${tenantSlug}/pos/order/${order.id}`)}
          >
            {t("checkout.back")}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16, padding: 20 }}>
        <div
          style={{
            background: "var(--d-surface)",
            borderRadius: 16,
            border: "1px solid var(--d-border)",
            padding: 18,
          }}
        >
          {order.lines.map((l) => (
            <div
              key={l.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px dashed var(--d-border)",
              }}
            >
              <div>
                <div>
                  {l.name} x{l.quantity}
                </div>
                <small style={{ color: "var(--d-dim)" }}>{l.modifierLabels.join(", ")}</small>
              </div>
              <strong>{money(l.lineTotal, currency)}</strong>
            </div>
          ))}
          <div style={{ marginTop: 16, display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{t("pos.subtotal")}</span>
              <span>{money(order.subtotal, currency)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{t("pos.tax")}</span>
              <span>{money(order.tax, currency)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--accent)",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              <span>{t("pos.total")}</span>
              <span>{money(order.total, currency)}</span>
            </div>
          </div>
        </div>
        <div
          style={{
            background: "var(--d-surface)",
            borderRadius: 16,
            border: "1px solid var(--d-border)",
            padding: 18,
          }}
        >
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
                background:
                  method === m.id
                    ? "color-mix(in srgb, var(--primary) 14%, transparent)"
                    : "var(--d-surface-2)",
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
            disabled={busy}
            onClick={async () => {
              setError("");
              setBusy(true);
              try {
                const payment = await createTenantApi(tenantSlug).pay(order.id, method);
                stashPaymentSuccess({
                  payment,
                  order: {
                    id: order.id,
                    tableLabel: order.tableLabel,
                    waiterName: order.waiterName,
                    total: order.total,
                  },
                });
                router.push(`/t/${tenantSlug}/pos/success/${payment.id}`);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Error");
              } finally {
                setBusy(false);
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
