"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/actions-utils";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { createAuditLog } from "@/lib/audit";
import { AuditAction } from "@/generated/prisma/client";

export async function getClients() {
  return prisma.client.findMany({ orderBy: { name: "asc" } });
}

export async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: { projects: true, meetings: true, decisions: true },
  });
}

export async function createClient(data: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("clients:manage");
  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  const created = await prisma.client.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
    },
  });

  await createAuditLog({
    entityType: "Client",
    entityId: created.id,
    action: AuditAction.CREATE,
    userId: user.id,
    details: `Created client ${created.name}`,
  });

  revalidatePath("/clients");
  return actionSuccess({ id: created.id });
}

export async function updateClient(id: string, data: unknown): Promise<ActionResult> {
  const user = await requirePermission("clients:manage");
  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid data");

  await prisma.client.update({
    where: { id },
    data: { ...parsed.data, email: parsed.data.email || null },
  });

  await createAuditLog({
    entityType: "Client",
    entityId: id,
    action: AuditAction.UPDATE,
    userId: user.id,
    details: "Updated client",
  });

  revalidatePath("/clients");
  return actionSuccess();
}

export async function deleteClient(id: string): Promise<ActionResult> {
  const user = await requirePermission("clients:manage");
  await prisma.client.delete({ where: { id } });

  await createAuditLog({
    entityType: "Client",
    entityId: id,
    action: AuditAction.DELETE,
    userId: user.id,
    details: "Deleted client",
  });

  revalidatePath("/clients");
  return actionSuccess();
}
