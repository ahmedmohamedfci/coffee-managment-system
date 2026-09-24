"use client";

import { usePathname } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin-layout-client";
import { stripLocalePrefix } from "@/lib/locale";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  if (stripLocalePrefix(pathname) === "/demo/admin/login") return <>{children}</>;
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
