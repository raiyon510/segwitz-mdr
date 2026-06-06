"use server";

import { auth } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/rbac";
import { Role } from "@/generated/prisma/browser";

export async function requirePermission(permission: Permission) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!hasPermission(session.user.role as Role, permission)) {
    throw new Error("Forbidden");
  }
  return session.user;
}
