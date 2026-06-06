"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  UserCircle,
  Calendar,
  Scale,
  CheckSquare,
  Search,
  ScrollText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/generated/prisma/browser";
import { hasPermission } from "@/lib/rbac";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, permission: null },
  { href: "/meetings", label: "Meetings", icon: Calendar, permission: "meetings:view" as const },
  { href: "/decisions", label: "Decisions", icon: Scale, permission: "decisions:view" as const },
  { href: "/actions", label: "Action Items", icon: CheckSquare, permission: "actions:view" as const },
  { href: "/projects", label: "Projects", icon: Briefcase, permission: "meetings:view" as const },
  { href: "/clients", label: "Clients", icon: UserCircle, permission: "meetings:view" as const },
  { href: "/users", label: "Users", icon: Users, permission: "users:manage" as const },
  { href: "/organization", label: "Organization", icon: Building2, permission: "organization:manage" as const },
  { href: "/search", label: "Search", icon: Search, permission: "search:use" as const },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText, permission: "audit:view" as const },
];

interface SidebarProps {
  role: Role;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ role, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const filteredItems = navItems.filter(
    (item) => !item.permission || hasPermission(role, item.permission)
  );

  const content = (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2" onClick={onMobileClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            S
          </div>
          <div>
            <p className="text-sm font-bold leading-none">SegWitz</p>
            <p className="text-xs text-muted-foreground">Meeting & Decision Repo</p>
          </div>
        </Link>
        {onMobileClose && (
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={onMobileClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 flex-col border-r bg-card lg:flex">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r bg-card shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
