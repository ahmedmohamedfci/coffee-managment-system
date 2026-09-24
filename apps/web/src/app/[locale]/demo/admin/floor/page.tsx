"use client";

import { useEffect, useState } from "react";
import type { FixtureKind, FloorFixture, FloorTable, TableShape } from "@saasfood/shared";
import { mockApi } from "@saasfood/shared";
import { Button, FloorMap, ShapePicker, TextField } from "@saasfood/ui";
import { useMockState } from "@/lib/use-mock-state";
import { useT } from "@/lib/use-t";

type Selection =
  | { type: "table"; id: string }
  | { type: "fixture"; id: string }
  | null;

const FIXTURE_KINDS: FixtureKind[] = [
  "entrance",
  "bar",
  "windows",
  "kitchen",
  "restroom",
  "counter",
  "other",
];

const FIXTURE_DEFAULTS: Record<FixtureKind, { w: number; h: number }> = {
  entrance: { w: 18, h: 8 },
  bar: { w: 14, h: 40 },
  windows: { w: 50, h: 10 },
  kitchen: { w: 16, h: 16 },
  restroom: { w: 12, h: 12 },
  counter: { w: 28, h: 10 },
  other: { w: 16, h: 12 },
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function FloorEditorPage() {
  const t = useT();
  const state = useMockState();
  const [tables, setTables] = useState<FloorTable[]>(state.tables);
  const [fixtures, setFixtures] = useState<FloorFixture[]>(state.fixtures);
  const [selection, setSelection] = useState<Selection>(
    state.tables[0] ? { type: "table", id: state.tables[0].id } : null,
  );
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setTables(state.tables);
    setFixtures(state.fixtures);
    setSaved(true);
  }, [state.tables, state.fixtures]);

  const selectedTable =
    selection?.type === "table" ? tables.find((x) => x.id === selection.id) ?? null : null;
  const selectedFixture =
    selection?.type === "fixture" ? fixtures.find((x) => x.id === selection.id) ?? null : null;

  function markDirty() {
    setSaved(false);
  }

  function dragPercent(
    e: React.PointerEvent,
    mapEl: HTMLElement | null,
    onMove: (x: number, y: number) => void,
  ) {
    if (!mapEl) return;
    e.preventDefault();
    const move = (ev: PointerEvent) => {
      const rect = mapEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(90, ((ev.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(90, ((ev.clientY - rect.top) / rect.height) * 100));
      onMove(x, y);
      markDirty();
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function addFixture(kind: FixtureKind) {
    const id = uid("fx");
    const label = t(`fixture.${kind}`);
    const size = FIXTURE_DEFAULTS[kind];
    const next: FloorFixture = {
      id,
      sectionId: "sec-main",
      kind,
      label,
      x: 10,
      y: 40,
      w: size.w,
      h: size.h,
    };
    setFixtures((prev) => [...prev, next]);
    setSelection({ type: "fixture", id });
    markDirty();
  }

  function addTable() {
    const id = uid("t");
    const next: FloorTable = {
      id,
      sectionId: "sec-main",
      label: `Table ${tables.length + 1}`,
      seats: 4,
      shape: "rect",
      x: 40,
      y: 40,
      status: "empty",
    };
    setTables((prev) => [...prev, next]);
    setSelection({ type: "table", id });
    markDirty();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h1 className="sf-title">{t("floorEdit.title")}</h1>
          <p className="sf-sub">{t("floorEdit.sub")}</p>
        </div>
        <Button
          onClick={async () => {
            await mockApi.saveFloorLayout(tables, fixtures);
            setSaved(true);
          }}
        >
          {saved ? t("floorEdit.saved") : t("floorEdit.save")}
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14, marginTop: 20, minHeight: 520 }}>
        <FloorMap
          light
          editable
          selectedId={selection?.id ?? null}
          tables={tables.filter((tb) => tb.sectionId === "sec-main")}
          fixtures={fixtures.filter((fx) => fx.sectionId === "sec-main")}
          seatsLabel={(n) => t("floor.seats", { n })}
          onTableClick={(tb) => setSelection({ type: "table", id: tb.id })}
          onFixtureClick={(fx) => setSelection({ type: "fixture", id: fx.id })}
          onTablePointerDown={(tb, e) => {
            setSelection({ type: "table", id: tb.id });
            dragPercent(e, e.currentTarget.parentElement, (x, y) => {
              setTables((prev) => prev.map((p) => (p.id === tb.id ? { ...p, x, y } : p)));
            });
          }}
          onFixturePointerDown={(fx, e) => {
            setSelection({ type: "fixture", id: fx.id });
            dragPercent(e, e.currentTarget.parentElement, (x, y) => {
              setFixtures((prev) => prev.map((p) => (p.id === fx.id ? { ...p, x, y } : p)));
            });
          }}
        />

        <aside className="sf-card" style={{ alignSelf: "start", display: "grid", gap: 14 }}>
          <div>
            <div className="sf-label">{t("floorEdit.fixtures")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {FIXTURE_KINDS.map((kind) => (
                <Button key={kind} variant="ghost" onClick={() => addFixture(kind)}>
                  + {t(`fixture.${kind}`)}
                </Button>
              ))}
            </div>
            <Button variant="ghost" style={{ marginTop: 8 }} block onClick={addTable}>
              {t("floorEdit.addTable")}
            </Button>
          </div>

          {selectedTable ? (
            <div style={{ display: "grid", gap: 12 }}>
              <strong>{t("floorEdit.table")}</strong>
              <TextField
                label={t("floorEdit.label")}
                value={selectedTable.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setTables((prev) =>
                    prev.map((p) => (p.id === selectedTable.id ? { ...p, label: e.target.value } : p)),
                  );
                  markDirty();
                }}
              />
              <TextField
                label={t("floorEdit.seats")}
                type="number"
                min={1}
                value={selectedTable.seats}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setTables((prev) =>
                    prev.map((p) =>
                      p.id === selectedTable.id ? { ...p, seats: Number(e.target.value) || 1 } : p,
                    ),
                  );
                  markDirty();
                }}
              />
              <div>
                <div className="sf-label">{t("floorEdit.shape")}</div>
                <ShapePicker
                  value={selectedTable.shape}
                  labels={{
                    round: t("floorEdit.shapeRound"),
                    rect: t("floorEdit.shapeRect"),
                    large: t("floorEdit.shapeLarge"),
                  }}
                  onChange={(shape: TableShape) => {
                    setTables((prev) =>
                      prev.map((p) => (p.id === selectedTable.id ? { ...p, shape } : p)),
                    );
                    markDirty();
                  }}
                />
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setTables((prev) => prev.filter((p) => p.id !== selectedTable.id));
                  setSelection(null);
                  markDirty();
                }}
              >
                {t("floorEdit.delete")}
              </Button>
            </div>
          ) : null}

          {selectedFixture ? (
            <div style={{ display: "grid", gap: 12 }}>
              <strong>{t("floorEdit.fixture")}</strong>
              <label>
                <span className="sf-label">{t("floorEdit.kind")}</span>
                <select
                  className="sf-input"
                  value={selectedFixture.kind}
                  onChange={(e) => {
                    const kind = e.target.value as FixtureKind;
                    setFixtures((prev) =>
                      prev.map((p) =>
                        p.id === selectedFixture.id
                          ? { ...p, kind, label: p.label || t(`fixture.${kind}`) }
                          : p,
                      ),
                    );
                    markDirty();
                  }}
                >
                  {FIXTURE_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {t(`fixture.${kind}`)}
                    </option>
                  ))}
                </select>
              </label>
              <TextField
                label={t("floorEdit.label")}
                value={selectedFixture.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFixtures((prev) =>
                    prev.map((p) =>
                      p.id === selectedFixture.id ? { ...p, label: e.target.value } : p,
                    ),
                  );
                  markDirty();
                }}
              />
              <TextField
                label={t("floorEdit.width")}
                type="number"
                min={6}
                max={95}
                value={selectedFixture.w}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFixtures((prev) =>
                    prev.map((p) =>
                      p.id === selectedFixture.id
                        ? { ...p, w: Math.max(6, Number(e.target.value) || 6) }
                        : p,
                    ),
                  );
                  markDirty();
                }}
              />
              <TextField
                label={t("floorEdit.height")}
                type="number"
                min={6}
                max={95}
                value={selectedFixture.h}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFixtures((prev) =>
                    prev.map((p) =>
                      p.id === selectedFixture.id
                        ? { ...p, h: Math.max(6, Number(e.target.value) || 6) }
                        : p,
                    ),
                  );
                  markDirty();
                }}
              />
              <Button
                variant="ghost"
                onClick={() => {
                  setFixtures((prev) => prev.filter((p) => p.id !== selectedFixture.id));
                  setSelection(null);
                  markDirty();
                }}
              >
                {t("floorEdit.delete")}
              </Button>
            </div>
          ) : null}

          {!selectedTable && !selectedFixture ? (
            <p className="sf-sub">{t("floorEdit.selectHint")}</p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
