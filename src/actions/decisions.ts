"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { decisionSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/actions-utils";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, DecisionStatus } from "@/generated/prisma/client";

const decisionInclude = {
  meeting: true,
  division: true,
  department: true,
  project: true,
  client: true,
  owner: true,
  approvedBy: true,
  createdBy: true,
  updatedBy: true,
  statusHistory: { include: { changedBy: true }, orderBy: { createdAt: "desc" as const } },
  attachments: true,
  actions: { include: { assignedTo: true } },
};

export async function getDecisions() {
  await requirePermission("decisions:view");
  return prisma.decision.findMany({
    select: {
      id: true,
      title: true,
      dateDecided: true,
      status: true,
      owner: { select: { fullName: true } },
      division: { select: { name: true } },
      project: { select: { name: true } },
    },
    orderBy: { dateDecided: "desc" },
  });
}

export async function getDecisionOptions() {
  await requirePermission("decisions:view");
  return prisma.decision.findMany({
    select: { id: true, title: true },
    orderBy: { dateDecided: "desc" },
  });
}

export async function getDecisionForEdit(id: string) {
  await requirePermission("decisions:view");
  return prisma.decision.findUnique({ where: { id } });
}

export async function getDecision(id: string) {
  await requirePermission("decisions:view");
  return prisma.decision.findUnique({
    where: { id },
    include: decisionInclude,
  });
}

export async function createDecision(data: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("decisions:create");
  const parsed = decisionSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const created = await prisma.decision.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      meetingId: parsed.data.meetingId || null,
      divisionId: parsed.data.divisionId || null,
      departmentId: parsed.data.departmentId || null,
      projectId: parsed.data.projectId || null,
      clientId: parsed.data.clientId || null,
      ownerId: parsed.data.ownerId,
      approvedById: parsed.data.approvedById || null,
      dateDecided: new Date(parsed.data.dateDecided),
      impactArea: parsed.data.impactArea,
      status: parsed.data.status,
      remarks: parsed.data.remarks,
      createdById: user.id,
    },
  });

  await prisma.decisionStatusHistory.create({
    data: {
      decisionId: created.id,
      fromStatus: null,
      toStatus: parsed.data.status,
      changedById: user.id,
      remarks: "Initial status",
    },
  });

  await createAuditLog({
    entityType: "Decision",
    entityId: created.id,
    action: AuditAction.CREATE,
    userId: user.id,
    details: `Created decision: ${created.title}`,
  });

  revalidatePath("/decisions");
  return actionSuccess({ id: created.id });
}

export async function updateDecision(id: string, data: unknown): Promise<ActionResult> {
  const user = await requirePermission("decisions:edit");
  const parsed = decisionSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const existing = await prisma.decision.findUnique({ where: { id } });
  if (!existing) return actionError("Decision not found");

  await prisma.decision.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      meetingId: parsed.data.meetingId || null,
      divisionId: parsed.data.divisionId || null,
      departmentId: parsed.data.departmentId || null,
      projectId: parsed.data.projectId || null,
      clientId: parsed.data.clientId || null,
      ownerId: parsed.data.ownerId,
      approvedById: parsed.data.approvedById || null,
      dateDecided: new Date(parsed.data.dateDecided),
      impactArea: parsed.data.impactArea,
      status: parsed.data.status,
      remarks: parsed.data.remarks,
      updatedById: user.id,
    },
  });

  if (existing.status !== parsed.data.status) {
    await prisma.decisionStatusHistory.create({
      data: {
        decisionId: id,
        fromStatus: existing.status,
        toStatus: parsed.data.status as DecisionStatus,
        changedById: user.id,
        remarks: parsed.data.remarks,
      },
    });

    await createAuditLog({
      entityType: "Decision",
      entityId: id,
      action: AuditAction.STATUS_CHANGE,
      userId: user.id,
      details: `Status changed from ${existing.status} to ${parsed.data.status}`,
      metadata: { from: existing.status, to: parsed.data.status },
    });
  }

  await createAuditLog({
    entityType: "Decision",
    entityId: id,
    action: AuditAction.UPDATE,
    userId: user.id,
    details: `Updated decision: ${parsed.data.title}`,
  });

  revalidatePath("/decisions");
  revalidatePath(`/decisions/${id}`);
  return actionSuccess();
}

export async function updateDecisionStatus(
  id: string,
  status: DecisionStatus,
  remarks?: string
): Promise<ActionResult> {
  const user = await requirePermission("decisions:edit");
  const existing = await prisma.decision.findUnique({ where: { id } });
  if (!existing) return actionError("Decision not found");

  await prisma.decision.update({
    where: { id },
    data: { status, updatedById: user.id, remarks: remarks ?? existing.remarks },
  });

  await prisma.decisionStatusHistory.create({
    data: {
      decisionId: id,
      fromStatus: existing.status,
      toStatus: status,
      changedById: user.id,
      remarks,
    },
  });

  await createAuditLog({
    entityType: "Decision",
    entityId: id,
    action: AuditAction.STATUS_CHANGE,
    userId: user.id,
    details: `Status changed from ${existing.status} to ${status}`,
    metadata: { from: existing.status, to: status },
  });

  revalidatePath("/decisions");
  revalidatePath(`/decisions/${id}`);
  return actionSuccess();
}
