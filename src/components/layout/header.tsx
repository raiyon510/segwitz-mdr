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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Header({ userName, userRole, onMenuClick }: HeaderProps) {
  const initials = getInitials(userName);

  return (
    <header className="sticky top-0 z-40 flex h-[4.5rem] shrink-0 items-center gap-4 border-b border-border/60 bg-card/80 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold leading-none">{userName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{ROLE_LABELS[userRole]}</p>
        </div>
      </div>

      <HeaderSearch />

      <div className="ml-auto flex items-center gap-1 shrink-0">
        <div className="mr-2 hidden items-center gap-3 rounded-full border border-border/60 bg-muted/40 py-1 pl-1 pr-3 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium leading-none">{userName}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{ROLE_LABELS[userRole]}</p>
          </div>
        </div>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
