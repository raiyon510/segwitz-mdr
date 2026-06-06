import { Role } from "@/generated/prisma/browser";

export type { Role };

export type Permission =
  | "users:manage"
  | "organization:manage"
  | "clients:manage"
  | "projects:manage"
  | "meetings:create"
  | "meetings:edit"
  | "meetings:delete"
  | "meetings:finalize"
  | "meetings:view"
  | "decisions:create"
  | "decisions:edit"
  | "decisions:view"
  | "actions:create"
  | "actions:edit"
  | "actions:update_assigned"
  | "actions:view"
  | "attachments:upload"
  | "attachments:delete"
  | "audit:view"
  | "search:use";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "users:manage",
    "organization:manage",
    "clients:manage",
    "projects:manage",
    "meetings:create",
    "meetings:edit",
    "meetings:delete",
    "meetings:finalize",
    "meetings:view",
    "decisions:create",
    "decisions:edit",
    "decisions:view",
    "actions:create",
    "actions:edit",
    "actions:update_assigned",
    "actions:view",
    "attachments:upload",
    "attachments:delete",
    "audit:view",
    "search:use",
  ],
  MANAGEMENT: [
    "meetings:view",
    "decisions:view",
    "actions:view",
    "search:use",
    "audit:view",
  ],
  DEPARTMENT_HEAD: [
    "clients:manage",
    "projects:manage",
    "meetings:create",
    "meetings:edit",
    "meetings:finalize",
    "meetings:view",
    "decisions:create",
    "decisions:edit",
    "decisions:view",
    "actions:create",
    "actions:edit",
    "actions:view",
    "attachments:upload",
    "search:use",
  ],
  PROJECT_MANAGER: [
    "clients:manage",
    "projects:manage",
    "meetings:create",
    "meetings:edit",
    "meetings:finalize",
    "meetings:view",
    "decisions:create",
    "decisions:edit",
    "decisions:view",
    "actions:create",
    "actions:edit",
    "actions:view",
    "attachments:upload",
    "search:use",
  ],
  TEAM_MEMBER: [
    "meetings:view",
    "decisions:view",
    "actions:view",
    "actions:update_assigned",
    "search:use",
  ],
  VIEW_ONLY: [
    "meetings:view",
    "decisions:view",
    "actions:view",
    "search:use",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canManageDepartment(
  role: Role,
  userDepartmentId: string | null | undefined,
  targetDepartmentId: string | null | undefined
): boolean {
  if (role === Role.ADMIN) return true;
  if (role === Role.DEPARTMENT_HEAD) {
    return !!userDepartmentId && userDepartmentId === targetDepartmentId;
  }
  return false;
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGEMENT: "Management",
  DEPARTMENT_HEAD: "Department Head",
  PROJECT_MANAGER: "Project Manager",
  TEAM_MEMBER: "Team Member",
  VIEW_ONLY: "View Only",
};
