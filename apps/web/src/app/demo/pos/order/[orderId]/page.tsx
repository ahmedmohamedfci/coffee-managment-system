"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockApi } from "@saasfood/shared";
import { Button, Chip, TerminalFrame } from "@saasfood/ui";
import { useDemoStore } from "@/lib/demo-store";
import { useMockState } from "@/lib/use-mock-state";
import { useT } from "@/lib/use-t";

export default function PosOrderPage() {
  const t = useT();
  const { orderId } = useParams<{ orderId: string }>();
  const state = useMockState();
  const router = useRouter();
  const clearSession = useDemoStore((s) => s.clearSession);
  const order = state.orders.find((o) => o.id === orderId);
  const [categoryId, setCategoryId] = useState("c-all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [allergy, setAllergy] = useState(false);
  const [modifierIds, setModifierIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const selectedItem = state.menuItems.find((m) => m.id === selectedItemId) ?? null;
  const groups = useMemo(
    () => state.modifierGroups.filter((g) => selectedItem?.modifierGroupIds.includes(g.id)),
    [state.modifierGroups, selectedItem],
  );

  const items =
    categoryId === "c-all"
      ? state.menuItems
      : state.menuItems.filter((m) => m.categoryId === categoryId);

  if (!order) {
    return (
      <TerminalFrame header={<div>{t("pos.title")}</div>}>
        <div style={{ padding: 24 }}>Order not found</div>
      </TerminalFrame>
    );
  }

  return (
    <TerminalFrame
      header={
        <>
          <div>
            <div style={{ fontWeight: 800 }}>{t("pos.title")}</div>
            <div style={{ color: "var(--d-dim)", fontSize: 13 }}>
              {order.tableLabel} · {order.waiterName}
            </div>
          </div>
            <div className="row-actions" style={{ display: "flex", gap: 8 }}>
              <Button variant="dark" onClick={() => router.push("/demo/pos/prices")}>{t("nav.prices")}</Button>
              <Button variant="dark" onClick={() => router.push("/demo/pos/floor")}>{t("pos.backFloor")}</Button>
              <Button
                variant="dark"
                onClick={() => {
                  clearSession();
                  router.push("/demo/pos/login");
                }}
              >
                {t("pos.lock")}
              </Button>
            </div>
        </>
      }
    >
      <div className="sf-pos">
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {state.categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: categoryId === c.id ? "var(--primary)" : "var(--d-surface-2)",
                  color: categoryId === c.id ? "#fff" : "var(--d-dim)",
                }}
              >
                {t(c.nameKey as "menu.cat.all")}
              </button>
            ))}
          </div>
          <div className="sf-menu-grid">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="sf-menu-card"
                onClick={() => {
                  setSelectedItemId(item.id);
                  const defaults = state.modifierGroups
                    .filter((g) => item.modifierGroupIds.includes(g.id))
                    .map((g) => g.options[0]?.id)
                    .filter(Boolean) as string[];
                  setModifierIds(defaults);
                  setNote("");
                  setAllergy(false);
                }}
              >
                <div style={{ fontWeight: 700 }}>{item.name}</div>
                <div className="price">${item.basePrice.toFixed(2)}</div>
              </button>
            ))}
          </div>

          {selectedItem ? (
            <div style={{ background: "var(--d-surface)", border: "1px solid var(--d-border)", borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{selectedItem.name}</strong>
                <button type="button" onClick={() => setSelectedItemId(null)} style={{ background: "transparent", border: "none", color: "var(--d-text)", cursor: "pointer" }}>×</button>
              </div>
              {groups.map((g) => (
                <div key={g.id} style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 13, color: "var(--d-dim)", marginBottom: 6 }}>{g.name}</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {g.options.map((o) => {
                      const active = modifierIds.includes(o.id);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            setModifierIds((prev) => {
                              const withoutGroup = prev.filter((id) => !g.options.some((opt) => opt.id === id));
                              return [...withoutGroup, o.id];
                            });
                          }}
                          style={{
                            textAlign: "start",
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: `2px solid ${active ? "var(--primary)" : "var(--d-border)"}`,
                            background: active ? "color-mix(in srgb, var(--primary) 14%, transparent)" : "var(--d-surface-2)",
                            color: "var(--d-text)",
                            cursor: "pointer",
                            font: "inherit",
                          }}
                        >
                          {o.name} {o.priceDelta > 0 ? `(+$${o.priceDelta.toFixed(2)})` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <label style={{ display: "block", marginTop: 12 }}>
                <span className="sf-label">{t("pos.note")}</span>
                <textarea
                  className="sf-input sf-input-dark"
                  style={{ height: 80, padding: 12 }}
                  placeholder={t("pos.notePh")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, fontSize: 13 }}>
                <input type="checkbox" checked={allergy} onChange={(e) => setAllergy(e.target.checked)} />
                {t("pos.allergy")}
              </label>
              <Button
                style={{ marginTop: 12 }}
                block
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await mockApi.addLine(order.id, {
                      menuItemId: selectedItem.id,
                      quantity: 1,
                      modifierOptionIds: modifierIds,
                      kitchenNote: note || undefined,
                      allergyNote: allergy,
                    });
                    setSelectedItemId(null);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t("pos.add")}
              </Button>
            </div>
          ) : null}
        </div>

        <aside className="sf-cart">
          <div>
            <h3 style={{ margin: 0 }}>{t("pos.cart")}</h3>
            <div style={{ color: "var(--d-dim)", fontSize: 13 }}>#{order.number}</div>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {order.lines.map((line) => (
              <div key={line.id} style={{ padding: "12px 0", borderBottom: "1px dashed var(--d-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong>{line.name} ×{line.quantity}</strong>
                  <span style={{ color: "var(--accent)", fontWeight: 800 }}>${line.lineTotal.toFixed(2)}</span>
                </div>
                <div style={{ color: "var(--d-dim)", fontSize: 12 }}>{line.modifierLabels.join(", ")}</div>
                {line.kitchenNote ? (
                  <div className={line.allergyNote ? "sf-note-allergy" : ""} style={{ fontSize: 12 }}>
                    {line.kitchenNote}
                  </div>
                ) : null}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Button variant="dark" onClick={() => mockApi.updateLineQty(order.id, line.id, line.quantity - 1)}>−</Button>
                  <Button variant="dark" onClick={() => mockApi.updateLineQty(order.id, line.id, line.quantity + 1)}>+</Button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--d-dim)" }}>
              <span>{t("pos.subtotal")}</span><span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--d-dim)" }}>
              <span>{t("pos.tax")}</span><span>${order.tax.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent)", fontSize: 22, fontWeight: 800 }}>
              <span>{t("pos.total")}</span><span>${order.total.toFixed(2)}</span>
            </div>
          </div>
          {message ? <Chip tone="info">{message}</Chip> : null}
          {order.status === "submitted" || order.status === "awaiting_payment" ? (
            <Chip tone="success">{t("pos.submitted")}</Chip>
          ) : null}
          <Button
            variant="cta"
            block
            disabled={busy || order.lines.length === 0 || order.status !== "open"}
            onClick={async () => {
              setBusy(true);
              setMessage("");
              try {
                await mockApi.submitOrder(order.id);
                setMessage(t("pos.submitted"));
              } catch (err) {
                setMessage(err instanceof Error ? err.message : "Error");
              } finally {
                setBusy(false);
              }
            }}
          >
            {t("pos.submit")}
          </Button>
          <Button
            variant="dark"
            block
            disabled={busy || order.lines.length === 0}
            onClick={async () => {
              setBusy(true);
              try {
                await mockApi.beginCheckout(order.id);
                router.push(`/demo/pos/checkout/${order.id}`);
              } finally {
                setBusy(false);
              }
            }}
          >
            {t("pos.pay")}
          </Button>
        </aside>
      </div>
    </TerminalFrame>
  );
}
