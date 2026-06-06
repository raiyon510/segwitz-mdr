"use client";

import { useState } from "react";
import { Role } from "@/generated/prisma/browser";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: Role;
}

export function DashboardShell({ children, userName, userRole }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={userRole} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userName={userName}
          userRole={userRole}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
