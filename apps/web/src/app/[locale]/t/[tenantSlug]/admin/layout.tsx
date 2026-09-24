"use client";

import { usePathname } from "next/navigation";
import { TenantAdminLayoutClient } from "@/components/tenant-admin-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.endsWith("/admin/login")) return <>{children}</>;
  return <TenantAdminLayoutClient>{children}</TenantAdminLayoutClient>;
}
