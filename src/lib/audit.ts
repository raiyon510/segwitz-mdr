import { AuditAction, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function createAuditLog(params: {
  entityType: string;
  entityId: string;
  action: AuditAction;
  userId?: string | null;
  details?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      userId: params.userId ?? null,
      details: params.details,
      metadata: params.metadata,
    },
  });
}
