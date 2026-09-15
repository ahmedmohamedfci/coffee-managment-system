"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockApi } from "@saasfood/shared";
import { Button, Keypad, TerminalFrame, TextField } from "@saasfood/ui";
import { useDemoStore } from "@/lib/demo-store";
import { useT } from "@/lib/use-t";

export default function StaffPinPage() {
  const t = useT();
  const router = useRouter();
  const setSession = useDemoStore((s) => s.setSession);
  const [staffCode, setStaffCode] = useState("104");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [forceChange, setForceChange] = useState<{ staffId: string; name: string } | null>(null);
  const [newPin, setNewPin] = useState("");

  async function login() {
    setError("");
    try {
      const s = await mockApi.staffLogin(staffCode, pin);
      if (s.isDefaultPin) {
        setForceChange({ staffId: s.staffId, name: s.name });
        return;
      }
      setSession({ kind: "staff", staffId: s.staffId, name: s.name, role: s.role });
      router.push(s.role === "kitchen" ? "/kitchen-display" : "/pos/floor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <TerminalFrame
      header={
        <div>
          <div style={{ fontWeight: 800 }}>{t("app.name")}</div>
          <div style={{ color: "var(--d-dim)", fontSize: 13 }}>TERMINAL 1</div>
        </div>
      }
    >
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ width: 400, background: "var(--d-surface)", border: "1px solid var(--d-border)", borderRadius: 22, padding: 28, display: "grid", gap: 14 }}>
          {!forceChange ? (
            <>
              <div>
                <h2 style={{ margin: 0 }}>{t("pin.title")}</h2>
                <p style={{ margin: "4px 0 0", color: "var(--d-dim)" }}>{t("pin.sub")}</p>
              </div>
              <TextField dark label={t("pin.id")} value={staffCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStaffCode(e.target.value)} />
              <div>
                <div className="sf-label">{t("pin.enter")} PIN ({pin.length}/4)</div>
                <div style={{ letterSpacing: 8, fontSize: 24 }}>{ "•".repeat(pin.length).padEnd(4, "○") }</div>
              </div>
              <Keypad
                clearLabel={t("pin.clear")}
                enterLabel={t("pin.enter")}
                onDigit={(d) => setPin((p) => (p.length < 4 ? p + d : p))}
                onClear={() => setPin("")}
                onEnter={login}
              />
            </>
          ) : (
            <>
              <h2 style={{ margin: 0 }}>{t("pin.changeTitle")}</h2>
              <p style={{ color: "var(--d-dim)" }}>{t("pin.changeSub")}</p>
              <TextField dark label={t("pin.new")} value={newPin} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPin(e.target.value)} />
              <Button
                onClick={async () => {
                  try {
                    await mockApi.changePin(forceChange.staffId, newPin);
                    const s = await mockApi.staffLogin(staffCode, newPin);
                    setSession({ kind: "staff", staffId: s.staffId, name: s.name, role: s.role });
                    router.push("/pos/floor");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Error");
                  }
                }}
              >
                {t("pin.save")}
              </Button>
            </>
          )}
          {error ? <div style={{ color: "var(--danger)" }}>{error}</div> : null}
        </div>
      </div>
    </TerminalFrame>
  );
}
