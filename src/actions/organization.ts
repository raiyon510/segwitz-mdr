"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { divisionSchema, departmentSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/actions-utils";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { createAuditLog } from "@/lib/audit";
import { AuditAction } from "@/generated/prisma/client";

export async function getDivisions() {
  return prisma.division.findMany({
    include: { departments: true },
    orderBy: { name: "asc" },
  });
}

export async function getDepartments() {
  return prisma.department.findMany({
    include: { division: true },
    orderBy: { name: "asc" },
  });
}

export async function createDivision(data: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("organization:manage");
  const parsed = divisionSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const created = await prisma.division.create({ data: parsed.data });

  await createAuditLog({
    entityType: "Division",
    entityId: created.id,
    action: AuditAction.CREATE,
    userId: user.id,
    details: `Created division ${created.name}`,
  });

  revalidatePath("/organization");
  return actionSuccess({ id: created.id });
}

export async function updateDivision(id: string, data: unknown): Promise<ActionResult> {
  const user = await requirePermission("organization:manage");
  const parsed = divisionSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  await prisma.division.update({ where: { id }, data: parsed.data });

  await createAuditLog({
    entityType: "Division",
    entityId: id,
    action: AuditAction.UPDATE,
    userId: user.id,
    details: "Updated division",
  });

  revalidatePath("/organization");
  return actionSuccess();
}

export async function createDepartment(data: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("organization:manage");
  const parsed = departmentSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const created = await prisma.department.create({ data: parsed.data });

  await createAuditLog({
    entityType: "Department",
    entityId: created.id,
    action: AuditAction.CREATE,
    userId: user.id,
    details: `Created department ${created.name}`,
  });

  revalidatePath("/organization");
  return actionSuccess({ id: created.id });
}

export async function updateDepartment(id: string, data: unknown): Promise<ActionResult> {
  const user = await requirePermission("organization:manage");
  const parsed = departmentSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  await prisma.department.update({ where: { id }, data: parsed.data });

  await createAuditLog({
    entityType: "Department",
    entityId: id,
    action: AuditAction.UPDATE,
    userId: user.id,
    details: "Updated department",
  });

  revalidatePath("/organization");
  return actionSuccess();
}
