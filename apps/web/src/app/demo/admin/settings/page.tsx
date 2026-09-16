"use client";

import { useEffect, useState } from "react";
import type { ModifierGroup, ModifierOption } from "@saasfood/shared";
import { mockApi } from "@saasfood/shared";
import { Button, TextField } from "@saasfood/ui";
import { useMockState } from "@/lib/use-mock-state";
import { useT } from "@/lib/use-t";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function SettingsPage() {
  const t = useT();
  const state = useMockState();
  const [groups, setGroups] = useState<ModifierGroup[]>(state.modifierGroups);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setGroups(state.modifierGroups);
    setSaved(true);
  }, [state.modifierGroups]);

  function updateGroup(id: string, patch: Partial<ModifierGroup>) {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    setSaved(false);
  }

  function updateOption(groupId: string, optionId: string, patch: Partial<ModifierOption>) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              options: g.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)),
            },
      ),
    );
    setSaved(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h1 className="sf-title">{t("settings.title")}</h1>
          <p className="sf-sub">{t("settings.sub")}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="ghost"
            onClick={() => {
              setGroups((prev) => [
                ...prev,
                {
                  id: uid("mg"),
                  name: "New group",
                  selection: "single",
                  options: [{ id: uid("opt"), name: "Option", priceDelta: 0 }],
                },
              ]);
              setSaved(false);
            }}
          >
            {t("settings.addGroup")}
          </Button>
          <Button
            onClick={async () => {
              await mockApi.saveModifierGroups(groups);
              setSaved(true);
            }}
          >
            {saved ? t("settings.saved") : t("settings.save")}
          </Button>
        </div>
      </div>

      <h2 style={{ marginTop: 28, fontSize: 18 }}>{t("settings.multipliers")}</h2>

      {groups.length === 0 ? <p className="sf-sub">{t("settings.empty")}</p> : null}

      <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
        {groups.map((group) => (
          <div key={group.id} className="sf-card" style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
              <TextField
                label={t("settings.groupName")}
                value={group.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateGroup(group.id, { name: e.target.value })
                }
              />
              <Button
                variant="ghost"
                onClick={() => {
                  setGroups((prev) => prev.filter((g) => g.id !== group.id));
                  setSaved(false);
                }}
              >
                {t("settings.deleteGroup")}
              </Button>
            </div>

            <table className="sf-table">
              <thead>
                <tr>
                  <th>{t("settings.optionName")}</th>
                  <th>{t("settings.priceDelta")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {group.options.map((opt) => (
                  <tr key={opt.id}>
                    <td>
                      <input
                        className="sf-input"
                        value={opt.name}
                        onChange={(e) => updateOption(group.id, opt.id, { name: e.target.value })}
                      />
                    </td>
                    <td style={{ width: 140 }}>
                      <input
                        className="sf-input"
                        type="number"
                        step="0.1"
                        value={opt.priceDelta}
                        onChange={(e) =>
                          updateOption(group.id, opt.id, {
                            priceDelta: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td style={{ width: 120 }}>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setGroups((prev) =>
                            prev.map((g) =>
                              g.id !== group.id
                                ? g
                                : { ...g, options: g.options.filter((o) => o.id !== opt.id) },
                            ),
                          );
                          setSaved(false);
                        }}
                      >
                        {t("settings.deleteOption")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button
              variant="ghost"
              onClick={() => {
                setGroups((prev) =>
                  prev.map((g) =>
                    g.id !== group.id
                      ? g
                      : {
                          ...g,
                          options: [...g.options, { id: uid("opt"), name: "New multiplier", priceDelta: 0 }],
                        },
                  ),
                );
                setSaved(false);
              }}
            >
              {t("settings.addOption")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
