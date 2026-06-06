"use server";

import { prisma } from "@/lib/prisma";
import { ActionStatus, DecisionStatus, MeetingStatus } from "@/generated/prisma/client";

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalMeetings,
    finalizedMeetings,
    totalDecisions,
    approvedDecisions,
    pendingDecisions,
    overdueActions,
    meetingsByDepartment,
    decisionsByStatus,
    actionsByStatus,
    recentMeetings,
    recentDecisions,
    recentActions,
  ] = await Promise.all([
    prisma.meeting.count(),
    prisma.meeting.count({ where: { status: MeetingStatus.FINALIZED } }),
    prisma.decision.count(),
    prisma.decision.count({ where: { status: DecisionStatus.APPROVED } }),
    prisma.decision.count({
      where: { status: { in: [DecisionStatus.PROPOSED, DecisionStatus.ON_HOLD] } },
    }),
    prisma.actionItem.count({
      where: {
        dueDate: { lt: today },
        status: { notIn: [ActionStatus.COMPLETED, ActionStatus.CANCELLED] },
      },
    }),
    prisma.meeting.groupBy({
      by: ["departmentId"],
      _count: true,
      where: { departmentId: { not: null } },
    }),
    prisma.decision.groupBy({ by: ["status"], _count: true }),
    prisma.actionItem.groupBy({ by: ["status"], _count: true }),
    prisma.meeting.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { owner: true, department: true },
    }),
    prisma.decision.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { owner: true, approvedBy: true },
    }),
    prisma.actionItem.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { assignedTo: true },
    }),
  ]);

  const departmentIds = meetingsByDepartment.map((m) => m.departmentId!).filter(Boolean);
  const departments = await prisma.department.findMany({
    where: { id: { in: departmentIds } },
  });
  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

  return {
    stats: {
      totalMeetings,
      finalizedMeetings,
      totalDecisions,
      approvedDecisions,
      pendingDecisions,
      overdueActions,
    },
    charts: {
      meetingsByDepartment: meetingsByDepartment.map((m) => ({
        name: deptMap[m.departmentId!] ?? "Unknown",
        value: m._count,
      })),
      decisionsByStatus: decisionsByStatus.map((d) => ({
        name: d.status,
        value: d._count,
      })),
      actionsByStatus: actionsByStatus.map((a) => ({
        name: a.status,
        value: a._count,
      })),
    },
    recent: {
      meetings: recentMeetings,
      decisions: recentDecisions,
      actions: recentActions,
    },
  };
}
