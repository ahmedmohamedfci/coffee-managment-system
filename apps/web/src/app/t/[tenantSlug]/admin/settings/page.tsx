"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { MenuItem, ModifierGroup, ModifierOption } from "@saasfood/shared";
import { Button, TextField } from "@saasfood/ui";
import {
  createTenantApi,
  money,
  type MenuPayload,
  type TenantInfo,
} from "@/lib/api-client";
import { useT } from "@/lib/use-t";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

type ItemDraft = {
  id?: string;
  categoryId: string;
  name: string;
  basePrice: number;
  modifierGroupIds: string[];
};

export default function SettingsPage() {
  const t = useT();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [menu, setMenu] = useState<MenuPayload | null>(null);
  const [groups, setGroups] = useState<ModifierGroup[]>([]);
  const [settingsName, setSettingsName] = useState("");
  const [taxRate, setTaxRate] = useState("0.08");
  const [savedMods, setSavedMods] = useState(true);
  const [savedSettings, setSavedSettings] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<ItemDraft | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const api = createTenantApi(tenantSlug);
    const [ten, m] = await Promise.all([api.getTenant(), api.getMenu()]);
    setTenant(ten);
    setMenu(m);
    setGroups(m.modifierGroups);
    setSettingsName(ten.name);
    setTaxRate(String(ten.taxRate));
    setSavedMods(true);
    setSavedSettings(true);
  }

  useEffect(() => {
    let cancelled = false;
    reload().catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Error");
    });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  function updateGroup(id: string, patch: Partial<ModifierGroup>) {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    setSavedMods(false);
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
    setSavedMods(false);
  }

  function startEdit(item?: MenuItem) {
    if (!menu) return;
    if (item) {
      setEditing({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        basePrice: item.basePrice,
        modifierGroupIds: [...item.modifierGroupIds],
      });
    } else {
      setEditing({
        categoryId: menu.categories[0]?.id ?? "",
        name: "",
        basePrice: 0,
        modifierGroupIds: [],
      });
    }
  }

  const currency = tenant?.currency ?? "USD";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h1 className="sf-title">{t("settings.title")}</h1>
          <p className="sf-sub">Menu items, prices, modifiers, and restaurant settings.</p>
        </div>
      </div>

      {error ? <div style={{ color: "var(--danger)", marginTop: 12 }}>{error}</div> : null}
      {message ? <div style={{ color: "var(--accent)", marginTop: 12 }}>{message}</div> : null}

      <section className="sf-card" style={{ marginTop: 24, display: "grid", gap: 12 }}>
        <strong>Restaurant</strong>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px auto", gap: 12, alignItems: "end" }}>
          <TextField
            label="Name"
            value={settingsName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSettingsName(e.target.value);
              setSavedSettings(false);
            }}
          />
          <TextField
            label="Tax rate"
            type="number"
            step="0.01"
            value={taxRate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTaxRate(e.target.value);
              setSavedSettings(false);
            }}
          />
          <Button
            disabled={busy || savedSettings}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const next = await createTenantApi(tenantSlug).updateSettings({
                  name: settingsName,
                  taxRate: Number(taxRate) || 0,
                });
                setTenant(next);
                setSavedSettings(true);
                setMessage("Settings saved");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Error");
              } finally {
                setBusy(false);
              }
            }}
          >
            {savedSettings ? "Saved" : "Save settings"}
          </Button>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Menu items</h2>
          <Button variant="ghost" onClick={() => startEdit()}>
            Add item
          </Button>
        </div>

        {editing ? (
          <div className="sf-card" style={{ marginTop: 12, display: "grid", gap: 12 }}>
            <TextField
              label="Name"
              value={editing.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />
            <TextField
              label="Price"
              type="number"
              step="0.01"
              value={editing.basePrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditing({ ...editing, basePrice: Number(e.target.value) || 0 })
              }
            />
            <label>
              <span className="sf-label">Category</span>
              <select
                className="sf-input"
                value={editing.categoryId}
                onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
              >
                {(menu?.categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.nameKey}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <div className="sf-label">Modifier groups</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {groups.map((g) => {
                  const on = editing.modifierGroupIds.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          modifierGroupIds: on
                            ? editing.modifierGroupIds.filter((id) => id !== g.id)
                            : [...editing.modifierGroupIds, g.id],
                        })
                      }
                      style={{
                        borderRadius: 999,
                        border: `1px solid ${on ? "var(--primary)" : "var(--border)"}`,
                        background: on
                          ? "color-mix(in srgb, var(--primary) 14%, transparent)"
                          : "transparent",
                        padding: "6px 12px",
                        cursor: "pointer",
                        font: "inherit",
                      }}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                disabled={busy || !editing.name || !editing.categoryId}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    const api = createTenantApi(tenantSlug);
                    if (editing.id) {
                      await api.updateMenuItem(editing.id, {
                        name: editing.name,
                        basePrice: editing.basePrice,
                        categoryId: editing.categoryId,
                        modifierGroupIds: editing.modifierGroupIds,
                      });
                    } else {
                      await api.createMenuItem({
                        name: editing.name,
                        basePrice: editing.basePrice,
                        categoryId: editing.categoryId,
                        modifierGroupIds: editing.modifierGroupIds,
                      });
                    }
                    setEditing(null);
                    await reload();
                    setMessage(editing.id ? "Item updated" : "Item created");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Error");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {editing.id ? "Update item" : "Create item"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        <table className="sf-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(menu?.menuItems ?? []).map((item) => {
              const cat = menu?.categories.find((c) => c.id === item.categoryId);
              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{cat?.name || cat?.nameKey || "—"}</td>
                  <td>{money(item.basePrice, currency)}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <Button variant="ghost" onClick={() => startEdit(item)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm(`Delete ${item.name}?`)) return;
                        setBusy(true);
                        setError("");
                        try {
                          await createTenantApi(tenantSlug).deleteMenuItem(item.id);
                          await reload();
                          setMessage("Item deleted");
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Error");
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>{t("settings.multipliers")}</h2>
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
                setSavedMods(false);
              }}
            >
              {t("settings.addGroup")}
            </Button>
            <Button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await createTenantApi(tenantSlug).saveModifiers(groups);
                  setSavedMods(true);
                  await reload();
                  setMessage("Modifiers saved");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Error");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {savedMods ? t("settings.saved") : t("settings.save")}
            </Button>
          </div>
        </div>

        {groups.length === 0 ? <p className="sf-sub">{t("settings.empty")}</p> : null}

        <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
          {groups.map((group) => (
            <div key={group.id} className="sf-card" style={{ display: "grid", gap: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                  alignItems: "end",
                }}
              >
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
                    setSavedMods(false);
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
                          onChange={(e) =>
                            updateOption(group.id, opt.id, { name: e.target.value })
                          }
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
                            setSavedMods(false);
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
                            options: [
                              ...g.options,
                              { id: uid("opt"), name: "New multiplier", priceDelta: 0 },
                            ],
                          },
                    ),
                  );
                  setSavedMods(false);
                }}
              >
                {t("settings.addOption")}
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
