"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Chip, FloorMap } from "@saasfood/ui";
import { createTenantApi, type FloorPayload } from "@/lib/api-client";
import { useT } from "@/lib/use-t";

export default function AdminFloorPage() {
  const t = useT();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [floor, setFloor] = useState<FloorPayload | null>(null);
  const [sectionId, setSectionId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    createTenantApi(tenantSlug)
      .getFloor()
      .then((f) => {
        if (cancelled) return;
        setFloor(f);
        setSectionId(f.sections[0]?.id ?? "");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error");
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  const tables = (floor?.tables ?? []).filter((tb) => !sectionId || tb.sectionId === sectionId);
  const fixtures = (floor?.fixtures ?? []).filter(
    (fx) => !sectionId || fx.sectionId === sectionId,
  );

  return (
    <div>
      <h1 className="sf-title">{t("floorEdit.title")}</h1>
      <p className="sf-sub">Read-only floor map for this tenant.</p>
      {error ? <div style={{ color: "var(--danger)" }}>{error}</div> : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, marginBottom: 12 }}>
        {(floor?.sections ?? []).map((sec) => (
          <Chip key={sec.id} tone={sectionId === sec.id ? "info" : "muted"}>
            <button
              type="button"
              onClick={() => setSectionId(sec.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              {sec.name}
            </button>
          </Chip>
        ))}
      </div>
      <div style={{ minHeight: 480 }}>
        <FloorMap
          light
          tables={tables}
          fixtures={fixtures}
          seatsLabel={(n) => t("floor.seats", { n })}
        />
      </div>
    </div>
  );
}
