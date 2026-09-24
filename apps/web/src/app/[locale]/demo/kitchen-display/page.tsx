"use client";

import { mockApi } from "@saasfood/shared";
import { Button, Chip, TerminalFrame } from "@saasfood/ui";
import { useMockState } from "@/lib/use-mock-state";
import { useT } from "@/lib/use-t";

function elapsed(iso?: string) {
  if (!iso) return "0:00";
  const sec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function KitchenDisplayPage() {
  const t = useT();
  const state = useMockState();
  const active = state.tickets.filter((x) => x.status !== "dismissed");
  const pending = active.filter((x) => x.status === "pending");
  const preparing = active.filter((x) => x.status === "preparing");
  const ready = active.filter((x) => x.status === "ready");

  const columns = [
    { key: "pending" as const, title: t("kds.pending"), items: pending },
    { key: "preparing" as const, title: t("kds.preparing"), items: preparing },
    { key: "ready" as const, title: t("kds.ready"), items: ready },
  ];

  return (
    <TerminalFrame
      header={
        <>
          <div>
            <div style={{ fontWeight: 800, letterSpacing: "0.04em" }}>{t("kds.title")}</div>
            <div style={{ color: "var(--d-dim)", fontSize: 13 }}>{t("kds.station")}</div>
          </div>
          <Chip tone="success">{t("kds.connected")}</Chip>
        </>
      }
    >
      {active.length === 0 ? (
        <div style={{ padding: 32, color: "var(--d-dim)" }}>{t("kds.empty")}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, padding: 18 }}>
          {columns.map((col) => (
            <div key={col.key}>
              <h4 style={{ margin: "0 0 12px", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--d-dim)" }}>
                {col.title} ({col.items.length})
              </h4>
              {col.items.map((ticket) => (
                <article key={ticket.id} className={`sf-ticket ${ticket.status}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>{ticket.tableLabel}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{elapsed(ticket.createdAt)}</span>
                  </div>
                  <div style={{ color: "var(--d-dim)", fontSize: 13 }}>{ticket.waiterName}</div>
                  {ticket.lines.map((line, idx) => (
                    <div key={idx} style={{ padding: "8px 0", borderTop: "1px dashed var(--d-border)", fontSize: 14 }}>
                      {line.qty}× {line.name}
                      {line.note ? (
                        <div className={line.allergy ? "sf-note-allergy" : ""} style={{ fontSize: 12, marginTop: 4 }}>
                          {line.note}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {ticket.status === "ready" ? (
                    <Button variant="dark" block onClick={() => mockApi.dismissTicket(ticket.id)}>
                      {t("kds.dismiss")}
                    </Button>
                  ) : (
                    <Button variant="dark" block onClick={() => mockApi.advanceTicket(ticket.id)}>
                      {t("kds.advance")}
                    </Button>
                  )}
                </article>
              ))}
            </div>
          ))}
        </div>
      )}
    </TerminalFrame>
  );
}
