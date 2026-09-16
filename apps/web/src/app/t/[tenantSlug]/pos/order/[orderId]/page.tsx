"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Order } from "@saasfood/shared";
import { Button, Chip, TerminalFrame } from "@saasfood/ui";
import {
  createTenantApi,
  money,
  type MenuPayload,
  type TenantInfo,
} from "@/lib/api-client";
import { useT } from "@/lib/use-t";

export default function PosOrderPage() {
  const t = useT();
  const { tenantSlug, orderId } = useParams<{ tenantSlug: string; orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [menu, setMenu] = useState<MenuPayload | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [categoryId, setCategoryId] = useState("c-all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [allergy, setAllergy] = useState(false);
  const [modifierIds, setModifierIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const api = createTenantApi(tenantSlug);
    (async () => {
      try {
        await api.me();
        const [o, m, ten] = await Promise.all([
          api.getOrder(orderId),
          api.getMenu(),
          api.getTenant(),
        ]);
        if (cancelled) return;
        setOrder(o);
        setMenu(m);
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

  const selectedItem = menu?.menuItems.find((m) => m.id === selectedItemId) ?? null;
  const groups = useMemo(
    () =>
      (menu?.modifierGroups ?? []).filter((g) => selectedItem?.modifierGroupIds.includes(g.id)),
    [menu, selectedItem],
  );

  const items =
    !menu
      ? []
      : categoryId === "c-all"
        ? menu.menuItems
        : menu.menuItems.filter((m) => m.categoryId === categoryId);

  const currency = tenant?.currency ?? "USD";

  if (error && !order) {
    return (
      <TerminalFrame header={<div>{t("pos.title")}</div>}>
        <div style={{ padding: 24, color: "var(--danger)" }}>{error}</div>
      </TerminalFrame>
    );
  }

  if (!order || !menu) {
    return (
      <TerminalFrame header={<div>{t("pos.title")}</div>}>
        <div style={{ padding: 24, color: "var(--d-dim)" }}>Loading…</div>
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
            <Button variant="dark" onClick={() => router.push(`/t/${tenantSlug}/pos/prices`)}>
              {t("nav.prices")}
            </Button>
            <Button variant="dark" onClick={() => router.push(`/t/${tenantSlug}/pos/floor`)}>
              {t("pos.backFloor")}
            </Button>
            <Button
              variant="dark"
              onClick={async () => {
                await createTenantApi(tenantSlug).logout().catch(() => undefined);
                router.push(`/t/${tenantSlug}/pos/login`);
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
            <button
              type="button"
              onClick={() => setCategoryId("c-all")}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "8px 14px",
                fontWeight: 600,
                cursor: "pointer",
                background: categoryId === "c-all" ? "var(--primary)" : "var(--d-surface-2)",
                color: categoryId === "c-all" ? "#fff" : "var(--d-dim)",
              }}
            >
              {t("menu.cat.all")}
            </button>
            {menu.categories.map((c) => (
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
                {c.name || c.nameKey}
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
                  const defaults = menu.modifierGroups
                    .filter((g) => item.modifierGroupIds.includes(g.id))
                    .map((g) => g.options[0]?.id)
                    .filter(Boolean) as string[];
                  setModifierIds(defaults);
                  setNote("");
                  setAllergy(false);
                }}
              >
                <div style={{ fontWeight: 700 }}>{item.name}</div>
                <div className="price">{money(item.basePrice, currency)}</div>
              </button>
            ))}
          </div>

          {selectedItem ? (
            <div
              style={{
                background: "var(--d-surface)",
                border: "1px solid var(--d-border)",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{selectedItem.name}</strong>
                <button
                  type="button"
                  onClick={() => setSelectedItemId(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--d-text)",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
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
                              const withoutGroup = prev.filter(
                                (id) => !g.options.some((opt) => opt.id === id),
                              );
                              return [...withoutGroup, o.id];
                            });
                          }}
                          style={{
                            textAlign: "start",
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: `2px solid ${active ? "var(--primary)" : "var(--d-border)"}`,
                            background: active
                              ? "color-mix(in srgb, var(--primary) 14%, transparent)"
                              : "var(--d-surface-2)",
                            color: "var(--d-text)",
                            cursor: "pointer",
                            font: "inherit",
                          }}
                        >
                          {o.name}{" "}
                          {o.priceDelta > 0 ? `(+${money(o.priceDelta, currency)})` : ""}
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
              <label
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 8,
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={allergy}
                  onChange={(e) => setAllergy(e.target.checked)}
                />
                {t("pos.allergy")}
              </label>
              <Button
                style={{ marginTop: 12 }}
                block
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setMessage("");
                  try {
                    const next = await createTenantApi(tenantSlug).addLine(order.id, {
                      menuItemId: selectedItem.id,
                      quantity: 1,
                      modifierOptionIds: modifierIds,
                      kitchenNote: note || undefined,
                      allergyNote: allergy,
                    });
                    setOrder(next);
                    setSelectedItemId(null);
                  } catch (err) {
                    setMessage(err instanceof Error ? err.message : "Error");
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
              <div
                key={line.id}
                style={{ padding: "12px 0", borderBottom: "1px dashed var(--d-border)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong>
                    {line.name} ×{line.quantity}
                  </strong>
                  <span style={{ color: "var(--accent)", fontWeight: 800 }}>
                    {money(line.lineTotal, currency)}
                  </span>
                </div>
                <div style={{ color: "var(--d-dim)", fontSize: 12 }}>
                  {line.modifierLabels.join(", ")}
                </div>
                {line.kitchenNote ? (
                  <div
                    className={line.allergyNote ? "sf-note-allergy" : ""}
                    style={{ fontSize: 12 }}
                  >
                    {line.kitchenNote}
                  </div>
                ) : null}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Button
                    variant="dark"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        const next = await createTenantApi(tenantSlug).updateLineQty(
                          order.id,
                          line.id,
                          line.quantity - 1,
                        );
                        setOrder(next);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    −
                  </Button>
                  <Button
                    variant="dark"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        const next = await createTenantApi(tenantSlug).updateLineQty(
                          order.id,
                          line.id,
                          line.quantity + 1,
                        );
                        setOrder(next);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--d-dim)" }}>
              <span>{t("pos.subtotal")}</span>
              <span>{money(order.subtotal, currency)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--d-dim)" }}>
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
                const next = await createTenantApi(tenantSlug).submitOrder(order.id);
                setOrder(next);
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
                await createTenantApi(tenantSlug).checkout(order.id);
                router.push(`/t/${tenantSlug}/pos/checkout/${order.id}`);
              } catch (err) {
                setMessage(err instanceof Error ? err.message : "Error");
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
