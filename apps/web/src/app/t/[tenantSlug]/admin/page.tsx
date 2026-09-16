"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StatCard, Chip } from "@saasfood/ui";
import {
  createTenantApi,
  type FloorPayload,
  type StaffPublic,
} from "@/lib/api-client";
import type { KitchenTicket } from "@saasfood/shared";
import { useT } from "@/lib/use-t";

export default function AdminDashboardPage() {
  const t = useT();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [floor, setFloor] = useState<FloorPayload | null>(null);
  const [staff, setStaff] = useState<StaffPublic[]>([]);
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const api = createTenantApi(tenantSlug);
    Promise.all([api.getFloor(), api.getStaff(), api.getKitchenTickets()])
      .then(([f, s, k]) => {
        if (cancelled) return;
        setFloor(f);
        setStaff(s);
        setTickets(k);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error");
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  const activeTables = (floor?.tables ?? []).filter((x) => x.status === "occupied").length;
  const onlineStaff = staff.filter((s) => s.active).length;
  const openTickets = tickets.filter((x) => x.status !== "dismissed").length;

  return (
    <div>
      <h1 className="sf-title">{t("dash.welcome")}</h1>
      <p className="sf-sub">{t("dash.sub")}</p>
      {error ? <div style={{ color: "var(--danger)", marginTop: 12 }}>{error}</div> : null}
      <div className="sf-stat-grid" style={{ marginTop: 24, marginBottom: 20 }}>
        <StatCard label={t("dash.tables")} value={`${activeTables} / ${floor?.tables.length ?? 0}`} />
        <StatCard label={t("dash.staff")} value={String(onlineStaff)} />
        <StatCard label={t("dash.revenue")} value={String(openTickets)} meta="Open kitchen tickets" />
        <StatCard label={t("nav.kds")} value={String(tickets.length)} />
      </div>
      <div className="sf-card">
        <strong>{t("dash.activity")}</strong>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {tickets.slice(0, 8).map((ticket) => (
            <div key={ticket.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {ticket.tableLabel} · {ticket.status}
                </div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>{ticket.waiterName}</div>
              </div>
              <Chip tone={ticket.status === "ready" ? "success" : "info"}>
                {new Date(ticket.createdAt).toLocaleTimeString()}
              </Chip>
            </div>
          ))}
          {tickets.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13 }}>No recent kitchen tickets</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
