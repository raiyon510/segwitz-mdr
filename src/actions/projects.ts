"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/actions-utils";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { createAuditLog } from "@/lib/audit";
import { AuditAction } from "@/generated/prisma/client";

export async function getProjects() {
  return prisma.project.findMany({
    include: { client: true },
    orderBy: { name: "asc" },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { client: true, meetings: true, decisions: true, actions: true },
  });
}

export async function createProject(data: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("projects:manage");
  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const created = await prisma.project.create({
    data: {
      name: parsed.data.name,
      clientId: parsed.data.clientId || null,
      clientName: parsed.data.clientName || null,
      description: parsed.data.description,
      status: parsed.data.status,
    },
  });

  await createAuditLog({
    entityType: "Project",
    entityId: created.id,
    action: AuditAction.CREATE,
    userId: user.id,
    details: `Created project ${created.name}`,
  });

  revalidatePath("/projects");
  return actionSuccess({ id: created.id });
}

export async function updateProject(id: string, data: unknown): Promise<ActionResult> {
  const user = await requirePermission("projects:manage");
  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  await prisma.project.update({
    where: { id },
    data: {
      name: parsed.data.name,
      clientId: parsed.data.clientId || null,
      clientName: parsed.data.clientName || null,
      description: parsed.data.description,
      status: parsed.data.status,
    },
  });

  await createAuditLog({
    entityType: "Project",
    entityId: id,
    action: AuditAction.UPDATE,
    userId: user.id,
    details: "Updated project",
  });

  revalidatePath("/projects");
  return actionSuccess();
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const user = await requirePermission("projects:manage");
  await prisma.project.delete({ where: { id } });

  await createAuditLog({
    entityType: "Project",
    entityId: id,
    action: AuditAction.DELETE,
    userId: user.id,
    details: "Deleted project",
  });

  revalidatePath("/projects");
  return actionSuccess();
}
