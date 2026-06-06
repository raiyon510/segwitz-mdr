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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/generated/prisma/browser";
import { hasPermission, Permission } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { SegwitzLogo } from "@/components/brand/segwitz-logo";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission | null;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard, permission: null }],
  },
  {
    label: "Operations",
    items: [
      { href: "/meetings", label: "Meetings", icon: Calendar, permission: "meetings:view" },
      { href: "/decisions", label: "Decisions", icon: Scale, permission: "decisions:view" },
      { href: "/actions", label: "Action Items", icon: CheckSquare, permission: "actions:view" },
      { href: "/search", label: "Search", icon: Search, permission: "search:use" },
    ],
  },
  {
    label: "Directory",
    items: [
      { href: "/projects", label: "Projects", icon: Briefcase, permission: "meetings:view" },
      { href: "/clients", label: "Clients", icon: UserCircle, permission: "meetings:view" },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/users", label: "Users", icon: Users, permission: "users:manage" },
      { href: "/organization", label: "Organization", icon: Building2, permission: "organization:manage" },
      { href: "/audit-logs", label: "Audit Logs", icon: ScrollText, permission: "audit:view" },
    ],
  },
];

interface SidebarProps {
  role: Role;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarNav({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {navGroups.map((group) => {
        const items = group.items.filter(
          (item) => !item.permission || hasPermission(role, item.permission)
        );
        if (items.length === 0) return null;

        return (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted/80">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/12 text-white shadow-sm"
                        : "text-sidebar-muted hover:bg-white/8 hover:text-sidebar-foreground"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-accent" />
                    )}
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-sidebar-accent/25 text-white"
                          : "bg-white/5 text-sidebar-muted group-hover:bg-white/10 group-hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ role, mobileOpen, onMobileClose }: SidebarProps) {
  const content = (
    <>
      <div className="flex h-[4.5rem] shrink-0 items-center border-b border-sidebar-border/80 px-5">
        <Link href="/" className="flex min-w-0 flex-1 items-center" onClick={onMobileClose}>
          <SegwitzLogo variant="light" size="sm" showTagline />
        </Link>
        {onMobileClose && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 shrink-0 text-sidebar-foreground hover:bg-white/10 lg:hidden"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <SidebarNav role={role} onNavigate={onMobileClose} />
      <div className="shrink-0 border-t border-sidebar-border/80 px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-sidebar-muted/70">
          Enterprise Repository
        </p>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-[17.5rem] shrink-0 flex-col bg-sidebar shadow-xl lg:flex">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 flex h-full w-[17.5rem] flex-col bg-sidebar shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
