"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { actionItemSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/actions-utils";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { createAuditLog } from "@/lib/audit";
import { ActionStatus, AuditAction } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function getActionItems() {
  await requirePermission("actions:view");
  return prisma.actionItem.findMany({
    include: {
      assignedTo: true,
      meeting: true,
      decision: true,
      project: true,
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getActionItem(id: string) {
  await requirePermission("actions:view");
  return prisma.actionItem.findUnique({
    where: { id },
    include: {
      assignedTo: true,
      meeting: true,
      decision: true,
      project: true,
      createdBy: true,
      updatedBy: true,
    },
  });
}

export async function createActionItem(data: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("actions:create");
  const parsed = actionItemSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const created = await prisma.actionItem.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      assignedToId: parsed.data.assignedToId,
      dueDate: new Date(parsed.data.dueDate),
      priority: parsed.data.priority,
      status: parsed.data.status,
      meetingId: parsed.data.meetingId || null,
      decisionId: parsed.data.decisionId || null,
      projectId: parsed.data.projectId || null,
      completionNotes: parsed.data.completionNotes,
      createdById: user.id,
    },
  });

  await createAuditLog({
    entityType: "ActionItem",
    entityId: created.id,
    action: AuditAction.CREATE,
    userId: user.id,
    details: `Created action item: ${created.title}`,
  });

  revalidatePath("/actions");
  return actionSuccess({ id: created.id });
}

export async function updateActionItem(id: string, data: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorized");

  const parsed = actionItemSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const existing = await prisma.actionItem.findUnique({ where: { id } });
  if (!existing) return actionError("Action item not found");

  const canEdit = hasPermission(session.user.role, "actions:edit");
  const canUpdateAssigned =
    hasPermission(session.user.role, "actions:update_assigned") &&
    existing.assignedToId === session.user.id;

  if (!canEdit && !canUpdateAssigned) return actionError("Forbidden");

  const updateData = canEdit
    ? {
        title: parsed.data.title,
        description: parsed.data.description,
        assignedToId: parsed.data.assignedToId,
        dueDate: new Date(parsed.data.dueDate),
        priority: parsed.data.priority,
        status: parsed.data.status,
        meetingId: parsed.data.meetingId || null,
        decisionId: parsed.data.decisionId || null,
        projectId: parsed.data.projectId || null,
        completionNotes: parsed.data.completionNotes,
        updatedById: session.user.id,
      }
    : {
        status: parsed.data.status,
        completionNotes: parsed.data.completionNotes,
        updatedById: session.user.id,
      };

  await prisma.actionItem.update({ where: { id }, data: updateData });

  if (existing.status !== parsed.data.status) {
    await createAuditLog({
      entityType: "ActionItem",
      entityId: id,
      action: AuditAction.STATUS_CHANGE,
      userId: session.user.id,
      details: `Status changed from ${existing.status} to ${parsed.data.status}`,
      metadata: { from: existing.status, to: parsed.data.status },
    });
  }

  await createAuditLog({
    entityType: "ActionItem",
    entityId: id,
    action: AuditAction.UPDATE,
    userId: session.user.id,
    details: `Updated action item: ${parsed.data.title}`,
  });

  revalidatePath("/actions");
  revalidatePath(`/actions/${id}`);
  return actionSuccess();
}

export async function getOverdueActions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.actionItem.findMany({
    where: {
      dueDate: { lt: today },
      status: { notIn: [ActionStatus.COMPLETED, ActionStatus.CANCELLED] },
    },
    include: { assignedTo: true },
    orderBy: { dueDate: "asc" },
  });
}
