import { ar } from "./ar";
import { cs } from "./cs";
import { en, type MessageKey } from "./en";
import type { Lang } from "../types";

const catalogs: Record<Lang, Record<MessageKey, string>> = { en: { ...en }, cs, ar };

export function translate(lang: Lang, key: MessageKey, vars?: Record<string, string | number>) {
  let text = catalogs[lang][key] ?? catalogs.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{{${k}}}`, String(v));
    }
  }
  return text;
}

export { en, cs, ar };
export type { MessageKey };
