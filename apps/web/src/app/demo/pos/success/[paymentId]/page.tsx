"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, TerminalFrame } from "@saasfood/ui";
import { useMockState } from "@/lib/use-mock-state";
import { useT } from "@/lib/use-t";

export default function SuccessPage() {
  const t = useT();
  const { paymentId } = useParams<{ paymentId: string }>();
  const state = useMockState();
  const payment = state.payments.find((p) => p.id === paymentId);
  const order = state.orders.find((o) => o.id === payment?.orderId);
  const router = useRouter();

  if (!payment || !order) return <div style={{ padding: 24 }}>Missing payment</div>;

  return (
    <TerminalFrame header={<div style={{ fontWeight: 800 }}>{t("success.title")}</div>}>
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ width: 460, background: "var(--d-surface)", borderRadius: 22, border: "1px solid var(--d-border)", padding: 32, textAlign: "center", display: "grid", gap: 14 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: "var(--accent)" }}>${payment.amount.toFixed(2)}</div>
          <div style={{ textAlign: "start", background: "var(--d-surface-2)", borderRadius: 12, padding: 14, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--d-dim)" }}>Table</span><strong>{order.tableLabel}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--d-dim)" }}>Waiter</span><strong>{order.waiterName}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--d-dim)" }}>TXN</span><strong>{payment.txnId}</strong></div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Button variant="dark">{t("success.print")}</Button>
            <Button onClick={() => router.push("/demo/pos/floor")}>{t("success.new")}</Button>
          </div>
        </div>
      </div>
    </TerminalFrame>
  );
}
