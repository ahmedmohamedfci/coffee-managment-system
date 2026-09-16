"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Chip } from "@saasfood/ui";
import { createTenantApi, type StaffPublic } from "@/lib/api-client";
import { useT } from "@/lib/use-t";

export default function StaffPage() {
  const t = useT();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [staff, setStaff] = useState<StaffPublic[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const list = await createTenantApi(tenantSlug).getStaff();
    setStaff(list);
  }

  useEffect(() => {
    let cancelled = false;
    load().catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Error");
    });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  return (
    <div>
      <h1 className="sf-title">{t("staff.title")}</h1>
      <p className="sf-sub">{t("staff.sub")}</p>
      {error ? <div style={{ color: "var(--danger)", marginTop: 12 }}>{error}</div> : null}
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
          {staff.map((s) => (
            <tr key={s.id}>
              <td>
                {s.name} <span style={{ color: "var(--muted)" }}>({s.staffCode})</span>
              </td>
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
                <Button
                  variant="ghost"
                  disabled={busyId === s.id}
                  onClick={async () => {
                    setBusyId(s.id);
                    setError("");
                    try {
                      await createTenantApi(tenantSlug).resetPin(s.id);
                      await load();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Error");
                    } finally {
                      setBusyId(null);
                    }
                  }}
                >
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
