"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { meetingSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/actions-utils";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, MeetingStatus } from "@/generated/prisma/client";

const meetingInclude = {
  division: true,
  department: true,
  project: true,
  client: true,
  owner: true,
  createdBy: true,
  updatedBy: true,
  finalizedBy: true,
  attendees: { include: { user: true } },
  absentees: { include: { user: true } },
  attachments: true,
  decisions: true,
  actions: true,
};

export async function getMeetings() {
  await requirePermission("meetings:view");
  return prisma.meeting.findMany({
    include: {
      division: true,
      department: true,
      project: true,
      client: true,
      owner: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function getMeeting(id: string) {
  await requirePermission("meetings:view");
  return prisma.meeting.findUnique({
    where: { id },
    include: meetingInclude,
  });
}

async function syncAttendees(meetingId: string, attendeeIds: string[], absenteeIds: string[]) {
  await prisma.meetingAttendee.deleteMany({ where: { meetingId } });
  await prisma.meetingAbsentee.deleteMany({ where: { meetingId } });

  if (attendeeIds.length > 0) {
    await prisma.meetingAttendee.createMany({
      data: attendeeIds.map((userId) => ({ meetingId, userId })),
    });
  }
  if (absenteeIds.length > 0) {
    await prisma.meetingAbsentee.createMany({
      data: absenteeIds.map((userId) => ({ meetingId, userId })),
    });
  }
}

export async function createMeeting(data: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("meetings:create");
  const parsed = meetingSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const created = await prisma.meeting.create({
    data: {
      title: parsed.data.title,
      meetingType: parsed.data.meetingType,
      date: new Date(parsed.data.date),
      time: parsed.data.time,
      location: parsed.data.location,
      onlineMeetingLink: parsed.data.onlineMeetingLink || null,
      divisionId: parsed.data.divisionId || null,
      departmentId: parsed.data.departmentId || null,
      projectId: parsed.data.projectId || null,
      clientId: parsed.data.clientId || null,
      ownerId: parsed.data.ownerId,
      agenda: parsed.data.agenda,
      discussionSummary: parsed.data.discussionSummary,
      keyDiscussionPoints: parsed.data.keyDiscussionPoints,
      importantNotes: parsed.data.importantNotes,
      concernsRaised: parsed.data.concernsRaised,
      risksIdentified: parsed.data.risksIdentified,
      status: parsed.data.status,
      createdById: user.id,
    },
  });

  await syncAttendees(created.id, parsed.data.attendeeIds, parsed.data.absenteeIds);

  await createAuditLog({
    entityType: "Meeting",
    entityId: created.id,
    action: AuditAction.CREATE,
    userId: user.id,
    details: `Created meeting: ${created.title}`,
  });

  revalidatePath("/meetings");
  return actionSuccess({ id: created.id });
}

export async function updateMeeting(id: string, data: unknown): Promise<ActionResult> {
  const user = await requirePermission("meetings:edit");
  const parsed = meetingSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const existing = await prisma.meeting.findUnique({ where: { id } });
  if (!existing) return actionError("Meeting not found");
  if (existing.status === MeetingStatus.FINALIZED) {
    return actionError("Cannot edit a finalized meeting");
  }

  await prisma.meeting.update({
    where: { id },
    data: {
      title: parsed.data.title,
      meetingType: parsed.data.meetingType,
      date: new Date(parsed.data.date),
      time: parsed.data.time,
      location: parsed.data.location,
      onlineMeetingLink: parsed.data.onlineMeetingLink || null,
      divisionId: parsed.data.divisionId || null,
      departmentId: parsed.data.departmentId || null,
      projectId: parsed.data.projectId || null,
      clientId: parsed.data.clientId || null,
      ownerId: parsed.data.ownerId,
      agenda: parsed.data.agenda,
      discussionSummary: parsed.data.discussionSummary,
      keyDiscussionPoints: parsed.data.keyDiscussionPoints,
      importantNotes: parsed.data.importantNotes,
      concernsRaised: parsed.data.concernsRaised,
      risksIdentified: parsed.data.risksIdentified,
      status: parsed.data.status,
      updatedById: user.id,
    },
  });

  await syncAttendees(id, parsed.data.attendeeIds, parsed.data.absenteeIds);

  await createAuditLog({
    entityType: "Meeting",
    entityId: id,
    action: AuditAction.UPDATE,
    userId: user.id,
    details: `Updated meeting: ${parsed.data.title}`,
  });

  revalidatePath("/meetings");
  revalidatePath(`/meetings/${id}`);
  return actionSuccess();
}

export async function finalizeMeeting(id: string): Promise<ActionResult> {
  const user = await requirePermission("meetings:finalize");

  await prisma.meeting.update({
    where: { id },
    data: {
      status: MeetingStatus.FINALIZED,
      finalizedById: user.id,
      finalizedAt: new Date(),
      updatedById: user.id,
    },
  });

  await createAuditLog({
    entityType: "Meeting",
    entityId: id,
    action: AuditAction.FINALIZE,
    userId: user.id,
    details: "Meeting finalized",
  });

  revalidatePath("/meetings");
  revalidatePath(`/meetings/${id}`);
  return actionSuccess();
}

export async function deleteMeeting(id: string): Promise<ActionResult> {
  const user = await requirePermission("meetings:delete");

  const existing = await prisma.meeting.findUnique({ where: { id } });
  if (existing?.status === MeetingStatus.FINALIZED) {
    return actionError("Cannot delete a finalized meeting");
  }

  await prisma.meeting.delete({ where: { id } });

  await createAuditLog({
    entityType: "Meeting",
    entityId: id,
    action: AuditAction.DELETE,
    userId: user.id,
    details: "Deleted meeting",
  });

  revalidatePath("/meetings");
  return actionSuccess();
}
