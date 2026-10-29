"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockApi } from "@saasfood/shared";
import { Button, Keypad, TextField } from "@saasfood/ui";
import { useDemoStore } from "@/lib/demo-store";
import { useT, useLocalePath } from "@/lib/use-t";
import { DEMO_ADMIN_CODE, DEMO_ADMIN_EMAIL } from "@/lib/constants";

export default function AdminLoginPage() {
  const t = useT();
  const lp = useLocalePath();
  const router = useRouter();
  const setSession = useDemoStore((s) => s.setSession);
  const [staffCode, setStaffCode] = useState(DEMO_ADMIN_CODE);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setError("");
    setBusy(true);
    try {
      const s = await mockApi.staffLogin(staffCode, pin);
      if (s.role !== "admin") {
        setError(t("errors.ADMIN_REQUIRED"));
        return;
      }
      setSession({ kind: "admin", name: s.name, email: DEMO_ADMIN_EMAIL });
      router.push(lp("/demo/admin"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.REQUEST_FAILED"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,420px) 1fr", minHeight: "calc(100vh - 56px)" }}>
      <aside style={{ background: "var(--primary-strong)", color: "#fff", padding: 48, display: "grid", alignContent: "center", gap: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{t("app.name")}</div>
        <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.1, fontWeight: 800 }}>{t("login.brandHeadline")}</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>{t("login.brandLead")}</p>
        <p style={{ margin: 0, opacity: 0.65, fontSize: 13 }}>
          {t("login.staffPinHint", { slug: "demo" })}
        </p>
      </aside>
      <div style={{ display: "grid", placeItems: "center", background: "var(--bg)", color: "var(--text)", padding: 24 }}>
        <div
          style={{
            width: 360,
            background: "var(--surface)",
            borderRadius: 22,
            padding: 28,
            border: "1px solid var(--border)",
            display: "grid",
            gap: 14,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{t("login.welcome")}</h2>
            <p className="sf-sub">{t("login.adminPinSub")}</p>
          </div>
          <TextField
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
          {error ? <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div> : null}
          <Button variant="strong" block lg disabled={busy} onClick={() => void login()}>
            {t("login.cta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
