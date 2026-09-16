"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockApi } from "@saasfood/shared";
import { Button, TextField } from "@saasfood/ui";
import { useDemoStore } from "@/lib/demo-store";
import { useT } from "@/lib/use-t";

export default function AdminLoginPage() {
  const t = useT();
  const router = useRouter();
  const setSession = useDemoStore((s) => s.setSession);
  const [email, setEmail] = useState("admin@brewexpress.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,420px) 1fr", minHeight: "calc(100vh - 56px)" }}>
      <aside style={{ background: "var(--primary-strong)", color: "#fff", padding: 48, display: "grid", alignContent: "center", gap: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{t("app.name")}</div>
        <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.1, fontWeight: 800 }}>{t("login.brandHeadline")}</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>{t("login.brandLead")}</p>
      </aside>
      <div style={{ display: "grid", placeItems: "center", background: "var(--bg)", color: "var(--text)", padding: 24 }}>
        <form
          style={{ width: 360, background: "var(--surface)", borderRadius: 22, padding: 28, border: "1px solid var(--border)", display: "grid", gap: 14 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            try {
              const session = await mockApi.adminLogin(email, password);
              setSession(session);
              router.push("/demo/admin");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{t("login.welcome")}</h2>
            <p className="sf-sub">{t("login.sub")}</p>
          </div>
          <TextField label={t("login.email")} value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
          <TextField label={t("login.password")} type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
          {error ? <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div> : null}
          <Button type="submit" variant="strong" block lg disabled={loading}>{t("login.cta")}</Button>
        </form>
      </div>
    </div>
  );
}
