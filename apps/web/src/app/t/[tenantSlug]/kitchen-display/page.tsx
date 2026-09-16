"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { KitchenTicket, TicketStatus } from "@saasfood/shared";
import { Button, Chip, TerminalFrame } from "@saasfood/ui";
import { createTenantApi } from "@/lib/api-client";
import { useT } from "@/lib/use-t";

function elapsed(iso?: string) {
  if (!iso) return "0:00";
  const sec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

const NEXT: Record<Exclude<TicketStatus, "dismissed">, TicketStatus> = {
  pending: "preparing",
  preparing: "ready",
  ready: "dismissed",
};

export default function KitchenDisplayPage() {
  const t = useT();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const router = useRouter();
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const api = createTenantApi(tenantSlug);

    async function load() {
      const list = await api.getKitchenTickets();
      if (!cancelled) setTickets(list);
    }

    api
      .me()
      .then(() => load())
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof Error && "status" in err && (err as { status: number }).status === 401) {
          router.replace(`/t/${tenantSlug}/pos/login`);
          return;
        }
        setError(err instanceof Error ? err.message : "Error");
      });

    const poll = setInterval(() => {
      load().catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error");
      });
    }, 2500);

    const clock = setInterval(() => setTick((n) => n + 1), 1000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [tenantSlug, router]);

  void tick;

  const active = tickets.filter((x) => x.status !== "dismissed");
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
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Chip tone="success">{t("kds.connected")}</Chip>
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
      {error ? <div style={{ padding: 16, color: "var(--danger)" }}>{error}</div> : null}
      {active.length === 0 ? (
        <div style={{ padding: 32, color: "var(--d-dim)" }}>{t("kds.empty")}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, padding: 18 }}>
          {columns.map((col) => (
            <div key={col.key}>
              <h4
                style={{
                  margin: "0 0 12px",
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--d-dim)",
                }}
              >
                {col.title} ({col.items.length})
              </h4>
              {col.items.map((ticket) => (
                <article key={ticket.id} className={`sf-ticket ${ticket.status}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>{ticket.tableLabel}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      {elapsed(ticket.createdAt)}
                    </span>
                  </div>
                  <div style={{ color: "var(--d-dim)", fontSize: 13 }}>{ticket.waiterName}</div>
                  {ticket.lines.map((line, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 0",
                        borderTop: "1px dashed var(--d-border)",
                        fontSize: 14,
                      }}
                    >
                      {line.qty}× {line.name}
                      {line.note ? (
                        <div
                          className={line.allergy ? "sf-note-allergy" : ""}
                          style={{ fontSize: 12, marginTop: 4 }}
                        >
                          {line.note}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    variant="dark"
                    block
                    onClick={async () => {
                      const status =
                        ticket.status === "ready"
                          ? "dismissed"
                          : NEXT[ticket.status as Exclude<TicketStatus, "dismissed">];
                      try {
                        await createTenantApi(tenantSlug).updateTicketStatus(ticket.id, status);
                        const list = await createTenantApi(tenantSlug).getKitchenTickets();
                        setTickets(list);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Error");
                      }
                    }}
                  >
                    {ticket.status === "ready" ? t("kds.dismiss") : t("kds.advance")}
                  </Button>
                </article>
              ))}
            </div>
          ))}
        </div>
      )}
    </TerminalFrame>
  );
}
