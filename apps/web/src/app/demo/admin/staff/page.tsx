"use client";

import { Button, Chip } from "@saasfood/ui";
import { mockApi } from "@saasfood/shared";
import { useMockState } from "@/lib/use-mock-state";
import { useT } from "@/lib/use-t";

export default function StaffPage() {
  const t = useT();
  const state = useMockState();

  return (
    <div>
      <h1 className="sf-title">{t("staff.title")}</h1>
      <p className="sf-sub">{t("staff.sub")}</p>
      <table className="sf-table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>PIN</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {state.staff.map((s) => (
            <tr key={s.id}>
              <td>{s.name} <span style={{ color: "var(--muted)" }}>({s.staffCode})</span></td>
              <td>{s.role}</td>
              <td>
                <Chip tone={s.active ? "success" : "danger"}>
                  {s.active ? t("staff.active") : t("staff.inactive")}
                </Chip>
              </td>
              <td>
                <Chip tone={s.isDefaultPin ? "warning" : "success"}>
                  {s.isDefaultPin ? t("staff.defaultPin") : t("staff.configured")}
                </Chip>
              </td>
              <td>
                <Button variant="ghost" onClick={() => mockApi.resetPin(s.id)}>
                  {t("staff.reset")}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
