"use client";

import { LOCALES, type AppLocale } from "@/lib/locale";
import { useLocale, useSwitchLocale, useT } from "@/lib/use-t";

export function LocaleSwitcher() {
  const t = useT();
  const lang = useLocale();
  const switchLocale = useSwitchLocale();

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {(LOCALES as readonly AppLocale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "6px 10px",
            fontWeight: 700,
            cursor: "pointer",
            background: lang === l ? "var(--brand-1, #0ea5e9)" : "transparent",
            color: "#fff",
            fontSize: 12,
          }}
        >
          {t(`lang.${l}`)}
        </button>
      ))}
    </div>
  );
}
