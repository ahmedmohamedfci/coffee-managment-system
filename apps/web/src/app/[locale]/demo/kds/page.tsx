import { redirect } from "next/navigation";
import { DEFAULT_LANG, isLang, withLocale } from "@/lib/locale";

export default async function KdsAliasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLang(raw) ? raw : DEFAULT_LANG;
  redirect(withLocale(locale, "/demo/kitchen-display"));
}
