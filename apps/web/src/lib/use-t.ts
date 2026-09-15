"use client";

import { translate, type MessageKey } from "@saasfood/shared";
import { useDemoStore } from "./demo-store";

export function useT() {
  const lang = useDemoStore((s) => s.lang);
  return (key: MessageKey, vars?: Record<string, string | number>) => translate(lang, key, vars);
}
