"use client";

import { usePathname } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin-layout-client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
