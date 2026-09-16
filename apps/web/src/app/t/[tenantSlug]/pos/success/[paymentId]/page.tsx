"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Order, Payment } from "@saasfood/shared";
import { Button, TerminalFrame } from "@saasfood/ui";
import {
  createTenantApi,
  money,
  readPaymentSuccess,
  type TenantInfo,
} from "@/lib/api-client";
import { useT } from "@/lib/use-t";

export default function SuccessPage() {
  const t = useT();
  const { tenantSlug, paymentId } = useParams<{ tenantSlug: string; paymentId: string }>();
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [order, setOrder] = useState<Pick<
    Order,
    "id" | "tableLabel" | "waiterName" | "total"
  > | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);

  useEffect(() => {
    const cached = readPaymentSuccess(paymentId);
    if (cached) {
      setPayment(cached.payment);
      setOrder(cached.order);
    }
    createTenantApi(tenantSlug)
      .getTenant()
      .then(setTenant)
      .catch(() => undefined);
  }, [paymentId, tenantSlug]);

  if (!payment || !order) {
    return (
      <div style={{ padding: 24 }}>
        Missing payment.{" "}
        <Button onClick={() => router.push(`/t/${tenantSlug}/pos/floor`)}>
          {t("success.new")}
        </Button>
      </div>
    );
  }

  const currency = tenant?.currency ?? "USD";

  return (
    <TerminalFrame header={<div style={{ fontWeight: 800 }}>{t("success.title")}</div>}>
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
        <div
          style={{
            width: 460,
            background: "var(--d-surface)",
            borderRadius: 22,
            border: "1px solid var(--d-border)",
            padding: 32,
            textAlign: "center",
            display: "grid",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 800, color: "var(--accent)" }}>
            {money(payment.amount, currency)}
          </div>
          <div
            style={{
              textAlign: "start",
              background: "var(--d-surface-2)",
              borderRadius: 12,
              padding: 14,
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--d-dim)" }}>Table</span>
              <strong>{order.tableLabel}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--d-dim)" }}>Waiter</span>
              <strong>{order.waiterName}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--d-dim)" }}>TXN</span>
              <strong>{payment.txnId}</strong>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Button variant="dark">{t("success.print")}</Button>
            <Button onClick={() => router.push(`/t/${tenantSlug}/pos/floor`)}>
              {t("success.new")}
            </Button>
          </div>
        </div>
      </div>
    </TerminalFrame>
  );
}
