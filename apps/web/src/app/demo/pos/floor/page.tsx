"use client";

import { useRouter } from "next/navigation";
import { mockApi } from "@saasfood/shared";
import { Chip, FloorMap, TerminalFrame, Button } from "@saasfood/ui";
import { useDemoStore } from "@/lib/demo-store";
import { useMockState } from "@/lib/use-mock-state";
import { useT } from "@/lib/use-t";

export default function LiveFloorPage() {
  const t = useT();
  const state = useMockState();
  const session = useDemoStore((s) => s.session);
  const router = useRouter();

  return (
    <TerminalFrame
      header={
        <>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--d-dim)" }}>
              {t("floor.title")}
            </div>
            <div style={{ fontWeight: 700 }}>{session?.kind === "staff" ? session.name : "—"}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Chip tone="muted">{t("floor.hint")}</Chip>
            <Button variant="dark" onClick={() => router.push("/demo/pos/prices")}>
              {t("nav.prices")}
            </Button>
          </div>
        </>
      }
    >
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Chip tone="success">{t("floor.empty")}</Chip>
          <Chip tone="danger">{t("floor.occupied")}</Chip>
          <Chip tone="warning">{t("floor.reserved")}</Chip>
        </div>
        <FloorMap
          tables={state.tables.filter((tb) => tb.sectionId === "sec-main")}
          fixtures={state.fixtures.filter((fx) => fx.sectionId === "sec-main")}
          seatsLabel={(n) => t("floor.seats", { n })}
          onTableClick={async (tb) => {
            if (!session || session.kind !== "staff") {
              router.push("/demo/pos/login");
              return;
            }
            if (tb.status === "reserved") return;
            const order = await mockApi.openOrder(tb.id, session.staffId);
            router.push(`/demo/pos/order/${order.id}`);
          }}
        />
      </div>
    </TerminalFrame>
  );
}
