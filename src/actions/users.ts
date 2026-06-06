"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/actions-utils";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { createAuditLog } from "@/lib/audit";
import { AuditAction } from "@/generated/prisma/client";

export async function getUsers() {
  await requirePermission("users:manage");
  return prisma.user.findMany({
    include: { division: true, department: true },
    orderBy: { fullName: "asc" },
  });
}

export async function getActiveUsers() {
  return prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, fullName: true, email: true, role: true },
    orderBy: { fullName: "asc" },
  });
}

export async function createUser(data: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("users:manage");
  const parsed = userSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");
  if (!parsed.data.password) return actionError("Password is required");

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return actionError("Email already exists");

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  const created = await prisma.user.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      password: hashed,
      role: parsed.data.role,
      divisionId: parsed.data.divisionId || null,
      departmentId: parsed.data.departmentId || null,
      isActive: parsed.data.isActive,
    },
  });

  await createAuditLog({
    entityType: "User",
    entityId: created.id,
    action: AuditAction.CREATE,
    userId: user.id,
    details: `Created user ${created.email}`,
  });

  revalidatePath("/users");
  return actionSuccess({ id: created.id });
}

export async function updateUser(id: string, data: unknown): Promise<ActionResult> {
  const user = await requirePermission("users:manage");
  const parsed = userSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const updateData: Record<string, unknown> = {
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    role: parsed.data.role,
    divisionId: parsed.data.divisionId || null,
    departmentId: parsed.data.departmentId || null,
    isActive: parsed.data.isActive,
  };

  if (parsed.data.password) {
    updateData.password = await bcrypt.hash(parsed.data.password, 12);
  }

  await prisma.user.update({ where: { id }, data: updateData });

  await createAuditLog({
    entityType: "User",
    entityId: id,
    action: AuditAction.UPDATE,
    userId: user.id,
    details: `Updated user ${parsed.data.email}`,
  });

  revalidatePath("/users");
  return actionSuccess();
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const user = await requirePermission("users:manage");
  if (user.id === id) return actionError("Cannot delete your own account");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return actionError("User not found");
  if (target.isActive) {
    return actionError("Deactivate this user before deleting their account.");
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "P2003") {
      return actionError(
        "Cannot delete this user because they are linked to meetings, decisions, or action items. Keep them deactivated instead."
      );
    }
    throw error;
  }

  await createAuditLog({
    entityType: "User",
    entityId: id,
    action: AuditAction.DELETE,
    userId: user.id,
    details: "Deleted user",
  });

  revalidatePath("/users");
  return actionSuccess();
}

export async function deactivateUser(id: string): Promise<ActionResult> {
  const user = await requirePermission("users:manage");
  if (user.id === id) return actionError("Cannot deactivate your own account");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return actionError("User not found");
  if (!target.isActive) return actionError("User is already inactive");

  await prisma.user.update({ where: { id }, data: { isActive: false } });

  await createAuditLog({
    entityType: "User",
    entityId: id,
    action: AuditAction.UPDATE,
    userId: user.id,
    details: "Deactivated user",
  });

  revalidatePath("/users");
  return actionSuccess();
}
