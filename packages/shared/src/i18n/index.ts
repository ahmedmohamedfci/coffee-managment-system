import { ar } from "./ar";
import { cs } from "./cs";
import { de } from "./de";
import { en, type MessageKey } from "./en";
import type { Lang } from "../types";

const catalogs: Record<Lang, Record<MessageKey, string>> = {
  en: { ...en },
  cs,
  ar,
  de,
};

export function translate(lang: Lang, key: MessageKey, vars?: Record<string, string | number>) {
  let text = catalogs[lang]?.[key] ?? catalogs.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return text;
}

export function errorMessageKey(code: string): MessageKey | null {
  const key = `errors.${code}` as MessageKey;
  return key in en ? key : null;
}

export { en, cs, ar, de };
export type { MessageKey };
