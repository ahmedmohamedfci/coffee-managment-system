"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Chip, FloorMap, TerminalFrame, Button } from "@saasfood/ui";
import {
  createTenantApi,
  type FloorPayload,
  type StaffSession,
} from "@/lib/api-client";
import { useT } from "@/lib/use-t";

export default function LiveFloorPage() {
  const t = useT();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const router = useRouter();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [floor, setFloor] = useState<FloorPayload | null>(null);
  const [sectionId, setSectionId] = useState<string>("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const api = createTenantApi(tenantSlug);
    (async () => {
      try {
        const [me, f] = await Promise.all([api.me(), api.getFloor()]);
        if (cancelled) return;
        setSession(me);
        setFloor(f);
        setSectionId((prev) => prev || f.sections[0]?.id || "");
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
  }, [tenantSlug, router]);

  const tables = useMemo(
    () => (floor?.tables ?? []).filter((tb) => !sectionId || tb.sectionId === sectionId),
    [floor, sectionId],
  );
  const fixtures = useMemo(
    () => (floor?.fixtures ?? []).filter((fx) => !sectionId || fx.sectionId === sectionId),
    [floor, sectionId],
  );

  return (
    <TerminalFrame
      header={
        <>
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--d-dim)",
              }}
            >
              {t("floor.title")}
            </div>
            <div style={{ fontWeight: 700 }}>{session?.name ?? "—"}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Chip tone="muted">{t("floor.hint")}</Chip>
            <Button variant="dark" onClick={() => router.push(`/t/${tenantSlug}/pos/prices`)}>
              {t("nav.prices")}
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
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {error ? <div style={{ color: "var(--danger)" }}>{error}</div> : null}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Chip tone="success">{t("floor.empty")}</Chip>
          <Chip tone="danger">{t("floor.occupied")}</Chip>
          <Chip tone="warning">{t("floor.reserved")}</Chip>
          {(floor?.sections ?? []).map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSectionId(sec.id)}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "8px 14px",
                fontWeight: 600,
                cursor: "pointer",
                background: sectionId === sec.id ? "var(--primary)" : "var(--d-surface-2)",
                color: sectionId === sec.id ? "#fff" : "var(--d-dim)",
              }}
            >
              {sec.name}
            </button>
          ))}
        </div>
        <FloorMap
          tables={tables}
          fixtures={fixtures}
          seatsLabel={(n) => t("floor.seats", { n })}
          onTableClick={async (tb) => {
            if (!session) {
              router.push(`/t/${tenantSlug}/pos/login`);
              return;
            }
            if (tb.status === "reserved" || busy) return;
            setBusy(true);
            setError("");
            try {
              const order = await createTenantApi(tenantSlug).openOrder(tb.id);
              router.push(`/t/${tenantSlug}/pos/order/${order.id}`);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
    </TerminalFrame>
  );
}
