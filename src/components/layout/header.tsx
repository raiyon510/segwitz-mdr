"use client";

import { signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HeaderSearch } from "@/components/layout/header-search";
import { ROLE_LABELS } from "@/lib/rbac";
import { Role } from "@/generated/prisma/browser";

interface HeaderProps {
  userName: string;
  userRole: Role;
  onMenuClick?: () => void;
}

export function Header({ userName, userRole, onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm font-medium">Welcome back, {userName}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABELS[userRole]}</p>
        </div>
      </div>
      <HeaderSearch />
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
