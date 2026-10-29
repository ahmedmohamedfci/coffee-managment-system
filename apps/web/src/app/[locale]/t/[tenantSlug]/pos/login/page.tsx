"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Keypad, TerminalFrame, TextField } from "@saasfood/ui";
import { createTenantApi } from "@/lib/api-client";
import { useT, useLocalePath } from "@/lib/use-t";
import { DEMO_WAITER_CODE } from "@/lib/constants";

export default function StaffPinPage() {
  const t = useT();
  const lp = useLocalePath();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const router = useRouter();
  const api = createTenantApi(tenantSlug);
  const [staffCode, setStaffCode] = useState(DEMO_WAITER_CODE);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setError("");
    setBusy(true);
    try {
      const s = await api.login(staffCode, pin);
      if (s.role === "kitchen") {
        router.push(lp(`/t/${tenantSlug}/kitchen-display`));
      } else if (s.role === "admin") {
        router.push(lp(`/t/${tenantSlug}/admin`));
      } else {
        router.push(lp(`/t/${tenantSlug}/pos/floor`));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.REQUEST_FAILED"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <TerminalFrame
      header={
        <div>
          <div style={{ fontWeight: 800 }}>{t("app.name")}</div>
          <div style={{ color: "var(--d-dim)", fontSize: 13 }}>
            {t("pin.terminalLabeled", { slug: tenantSlug })}
          </div>
        </div>
      }
    >
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
        <div
          style={{
            width: 400,
            background: "var(--d-surface)",
            border: "1px solid var(--d-border)",
            borderRadius: 22,
            padding: 28,
            display: "grid",
            gap: 14,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{t("pin.title")}</h2>
            <p style={{ margin: "4px 0 0", color: "var(--d-dim)" }}>{t("pin.sub")}</p>
          </div>
          <TextField
            dark
            label={t("pin.id")}
            value={staffCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStaffCode(e.target.value)}
          />
          <div>
            <div className="sf-label">{t("pin.progress", { n: pin.length })}</div>
            <div style={{ letterSpacing: 8, fontSize: 24 }}>
              {"•".repeat(pin.length).padEnd(4, "○")}
            </div>
          </div>
          <Keypad
            clearLabel={t("pin.clear")}
            enterLabel={t("pin.enter")}
            onDigit={(d) => setPin((p) => (p.length < 4 ? p + d : p))}
            onClear={() => setPin("")}
            onEnter={() => {
              if (!busy) void login();
            }}
          />
          {error ? <div style={{ color: "var(--danger)" }}>{error}</div> : null}
        </div>
      </div>
    </TerminalFrame>
  );
}
