"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/actions-utils";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { createAuditLog } from "@/lib/audit";
import { AuditAction } from "@/generated/prisma/client";
import {
  supabaseAdmin,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  STORAGE_BUCKET,
} from "@/lib/supabase";

export async function uploadMeetingAttachment(
  meetingId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("attachments:upload");
  const file = formData.get("file") as File | null;
  if (!file) return actionError("No file provided");
  if (!ALLOWED_FILE_TYPES.includes(file.type)) return actionError("File type not allowed");
  if (file.size > MAX_FILE_SIZE) return actionError("File too large (max 10MB)");

  const storagePath = `meetings/${meetingId}/${Date.now()}-${file.name}`;
  let fileUrl = `/api/files/${storagePath}`;

  if (supabaseAdmin) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });
    if (error) return actionError(error.message);

    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);
    fileUrl = urlData.publicUrl;
  }

  const attachment = await prisma.meetingAttachment.create({
    data: {
      meetingId,
      fileName: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      storagePath,
      uploadedById: user.id,
    },
  });

  await createAuditLog({
    entityType: "MeetingAttachment",
    entityId: attachment.id,
    action: AuditAction.UPLOAD,
    userId: user.id,
    details: `Uploaded ${file.name}`,
  });

  revalidatePath(`/meetings/${meetingId}`);
  return actionSuccess({ id: attachment.id });
}

export async function uploadDecisionAttachment(
  decisionId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("attachments:upload");
  const file = formData.get("file") as File | null;
  if (!file) return actionError("No file provided");
  if (!ALLOWED_FILE_TYPES.includes(file.type)) return actionError("File type not allowed");
  if (file.size > MAX_FILE_SIZE) return actionError("File too large (max 10MB)");

  const storagePath = `decisions/${decisionId}/${Date.now()}-${file.name}`;
  let fileUrl = `/api/files/${storagePath}`;

  if (supabaseAdmin) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });
    if (error) return actionError(error.message);

    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);
    fileUrl = urlData.publicUrl;
  }

  const attachment = await prisma.decisionAttachment.create({
    data: {
      decisionId,
      fileName: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      storagePath,
      uploadedById: user.id,
    },
  });

  await createAuditLog({
    entityType: "DecisionAttachment",
    entityId: attachment.id,
    action: AuditAction.UPLOAD,
    userId: user.id,
    details: `Uploaded ${file.name}`,
  });

  revalidatePath(`/decisions/${decisionId}`);
  return actionSuccess({ id: attachment.id });
}

export async function deleteMeetingAttachment(id: string): Promise<ActionResult> {
  const user = await requirePermission("attachments:delete");
  const attachment = await prisma.meetingAttachment.findUnique({ where: { id } });
  if (!attachment) return actionError("Attachment not found");

  if (supabaseAdmin) {
    await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([attachment.storagePath]);
  }

  await prisma.meetingAttachment.delete({ where: { id } });

  await createAuditLog({
    entityType: "MeetingAttachment",
    entityId: id,
    action: AuditAction.DELETE,
    userId: user.id,
    details: `Deleted ${attachment.fileName}`,
  });

  revalidatePath(`/meetings/${attachment.meetingId}`);
  return actionSuccess();
}

export async function deleteDecisionAttachment(id: string): Promise<ActionResult> {
  const user = await requirePermission("attachments:delete");
  const attachment = await prisma.decisionAttachment.findUnique({ where: { id } });
  if (!attachment) return actionError("Attachment not found");

  if (supabaseAdmin) {
    await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([attachment.storagePath]);
  }

  await prisma.decisionAttachment.delete({ where: { id } });
  revalidatePath(`/decisions/${attachment.decisionId}`);
  return actionSuccess();
}
