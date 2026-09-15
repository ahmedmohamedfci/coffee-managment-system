"use client";

import { StatCard, Chip } from "@saasfood/ui";
import { useMockState } from "@/lib/use-mock-state";
import { useT } from "@/lib/use-t";

export default function AdminDashboardPage() {
  const t = useT();
  const state = useMockState();
  const activeTables = state.tables.filter((x) => x.status === "occupied").length;
  const onlineStaff = state.staff.filter((s) => s.active).length;
  const openTickets = state.tickets.filter((x) => x.status !== "dismissed").length;

  return (
    <div>
      <h1 className="sf-title">{t("dash.welcome")}</h1>
      <p className="sf-sub">{t("dash.sub")}</p>
      <div className="sf-stat-grid" style={{ marginTop: 24, marginBottom: 20 }}>
        <StatCard label={t("dash.orders")} value={String(state.orders.length)} />
        <StatCard label={t("dash.tables")} value={`${activeTables} / ${state.tables.length}`} />
        <StatCard label={t("dash.staff")} value={String(onlineStaff)} />
        <StatCard label={t("dash.revenue")} value={String(openTickets)} />
      </div>
      <div className="sf-card">
        <strong>{t("dash.activity")}</strong>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {state.activity.slice(0, 8).map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>{a.actor}</div>
              </div>
              <Chip tone={a.tone}>{new Date(a.at).toLocaleTimeString()}</Chip>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
