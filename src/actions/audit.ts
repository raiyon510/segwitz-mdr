"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/actions-utils"


export async function getAuditLogs(limit = 100) {
  await requirePermission("audit:view");
  return prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getEntityAuditLogs(entityType: string, entityId: string) {
  await requirePermission("audit:view");
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}
