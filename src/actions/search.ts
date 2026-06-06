"use server";

import { prisma } from "@/lib/prisma";
import { searchSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/actions-utils"

import { Prisma } from "@/generated/prisma/client";

export async function globalSearch(params: unknown) {
  await requirePermission("search:use");
  const parsed = searchSchema.safeParse(params);
  if (!parsed.success) return { meetings: [], decisions: [], actions: [] };

  const {
    query,
    divisionId,
    departmentId,
    projectId,
    clientId,
    meetingType,
    decisionStatus,
    actionStatus,
    attendeeId,
    assignedToId,
    dateFrom,
    dateTo,
  } = parsed.data;

  const dateFilter: Prisma.DateTimeFilter | undefined =
    dateFrom || dateTo
      ? {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        }
      : undefined;

  const meetingWhere: Prisma.MeetingWhereInput = {
    ...(query && {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { agenda: { contains: query, mode: "insensitive" } },
        { discussionSummary: { contains: query, mode: "insensitive" } },
        { keyDiscussionPoints: { contains: query, mode: "insensitive" } },
      ],
    }),
    ...(divisionId && { divisionId }),
    ...(departmentId && { departmentId }),
    ...(projectId && { projectId }),
    ...(clientId && { clientId }),
    ...(meetingType && { meetingType: meetingType as Prisma.EnumMeetingTypeFilter["equals"] }),
    ...(dateFilter && { date: dateFilter }),
    ...(attendeeId && { attendees: { some: { userId: attendeeId } } }),
  };

  const decisionWhere: Prisma.DecisionWhereInput = {
    ...(query && {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { impactArea: { contains: query, mode: "insensitive" } },
      ],
    }),
    ...(divisionId && { divisionId }),
    ...(departmentId && { departmentId }),
    ...(projectId && { projectId }),
    ...(clientId && { clientId }),
    ...(decisionStatus && {
      status: decisionStatus as Prisma.EnumDecisionStatusFilter["equals"],
    }),
    ...(dateFilter && { dateDecided: dateFilter }),
  };

  const actionWhere: Prisma.ActionItemWhereInput = {
    ...(query && {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    }),
    ...(projectId && { projectId }),
    ...(actionStatus && { status: actionStatus as Prisma.EnumActionStatusFilter["equals"] }),
    ...(assignedToId && { assignedToId }),
    ...(dateFilter && { dueDate: dateFilter }),
  };

  const [meetings, decisions, actions] = await Promise.all([
    prisma.meeting.findMany({
      where: meetingWhere,
      include: { owner: true, department: true, project: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.decision.findMany({
      where: decisionWhere,
      include: { owner: true, approvedBy: true, project: true },
      orderBy: { dateDecided: "desc" },
      take: 50,
    }),
    prisma.actionItem.findMany({
      where: actionWhere,
      include: { assignedTo: true, meeting: true, decision: true },
      orderBy: { dueDate: "asc" },
      take: 50,
    }),
  ]);

  return { meetings, decisions, actions };
}
