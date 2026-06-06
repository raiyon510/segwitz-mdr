"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Upload, Trash2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { uploadMeetingAttachment, deleteMeetingAttachment } from "@/actions/attachments";
import { Button } from "@/components/ui/button";
import { ALLOWED_EXTENSIONS } from "@/lib/supabase";

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

interface AttachmentUploadProps {
  meetingId: string;
  attachments: Attachment[];
  canUpload: boolean;
  canDelete: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentUpload({
  meetingId,
  attachments,
  canUpload,
  canDelete,
}: AttachmentUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadMeetingAttachment(meetingId, formData);
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Attachment uploaded");
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteMeetingAttachment(id);
    setDeletingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Attachment deleted");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {canUpload && (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleUpload}
            className="hidden"
            id="meeting-attachment-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            PDF, Word, Excel, PowerPoint, or images (max 10MB)
          </p>
        </div>
      )}

      {attachments.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          <Paperclip className="h-4 w-4" />
          No attachments yet
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{attachment.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open file"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === attachment.id}
                    onClick={() => handleDelete(attachment.id)}
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
