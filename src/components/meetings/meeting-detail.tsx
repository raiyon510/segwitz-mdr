"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Pencil,
  FileCheck,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Role } from "@/generated/prisma/browser";
import { finalizeMeeting } from "@/actions/meetings";
import { hasPermission } from "@/lib/rbac";
import { MEETING_TYPES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttachmentUpload } from "@/components/meetings/attachment-upload";

interface MeetingDetailProps {
  meeting: {
    id: string;
    title: string;
    meetingType: string;
    date: Date;
    time: string | null;
    location: string | null;
    onlineMeetingLink: string | null;
    status: string;
    agenda: string | null;
    discussionSummary: string | null;
    keyDiscussionPoints: string | null;
    importantNotes: string | null;
    concernsRaised: string | null;
    risksIdentified: string | null;
    finalizedAt: Date | null;
    division: { name: string } | null;
    department: { name: string } | null;
    project: { name: string } | null;
    client: { name: string } | null;
    owner: { fullName: string };
    createdBy: { fullName: string };
    updatedBy: { fullName: string } | null;
    finalizedBy: { fullName: string } | null;
    attendees: { user: { id: string; fullName: string } }[];
    absentees: { user: { id: string; fullName: string } }[];
    attachments: {
      id: string;
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      createdAt: Date;
    }[];
    decisions: { id: string; title: string }[];
    actions: { id: string; title: string }[];
  };
  userRole: Role;
}

function getMeetingTypeLabel(type: string): string {
  return MEETING_TYPES.find((t) => t.value === type)?.label ?? type.replace(/_/g, " ");
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || (typeof value === "string" && !value.trim())) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="text-sm whitespace-pre-wrap">{value}</div>
    </div>
  );
}

export function MeetingDetail({ meeting, userRole }: MeetingDetailProps) {
  const router = useRouter();
  const [finalizing, setFinalizing] = useState(false);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);

  const isFinalized = meeting.status === "FINALIZED";
  const canEdit = !isFinalized && hasPermission(userRole, "meetings:edit");
  const canFinalize = !isFinalized && hasPermission(userRole, "meetings:finalize");
  const canUpload = hasPermission(userRole, "attachments:upload");
  const canDeleteAttachment = hasPermission(userRole, "attachments:delete");

  async function handleFinalize() {
    setFinalizing(true);
    const result = await finalizeMeeting(meeting.id);
    setFinalizing(false);
    setShowFinalizeDialog(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Meeting finalized");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{meeting.title}</h1>
            <StatusBadge status={meeting.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {getMeetingTypeLabel(meeting.meetingType)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/meetings/${meeting.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {canFinalize && (
            <Button onClick={() => setShowFinalizeDialog(true)}>
              <FileCheck className="h-4 w-4" />
              Finalize
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium">{formatDate(meeting.date)}</p>
            </div>
          </CardContent>
        </Card>
        {meeting.time && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium">{meeting.time}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {meeting.location && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{meeting.location}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {meeting.onlineMeetingLink && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Online Link</p>
                <a
                  href={meeting.onlineMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Join meeting
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailField label="Division" value={meeting.division?.name} />
            <DetailField label="Department" value={meeting.department?.name} />
            <DetailField label="Project" value={meeting.project?.name} />
            <DetailField label="Client" value={meeting.client?.name} />
            <DetailField label="Owner" value={meeting.owner.fullName} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4" />
                Attendees ({meeting.attendees.length})
              </div>
              {meeting.attendees.length === 0 ? (
                <p className="text-sm text-muted-foreground">None recorded</p>
              ) : (
                <ul className="space-y-1">
                  {meeting.attendees.map((a) => (
                    <li key={a.user.id} className="text-sm">
                      {a.user.fullName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <UserX className="h-4 w-4" />
                Absentees ({meeting.absentees.length})
              </div>
              {meeting.absentees.length === 0 ? (
                <p className="text-sm text-muted-foreground">None recorded</p>
              ) : (
                <ul className="space-y-1">
                  {meeting.absentees.map((a) => (
                    <li key={a.user.id} className="text-sm">
                      {a.user.fullName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meeting Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailField label="Agenda" value={meeting.agenda} />
          <DetailField label="Discussion Summary" value={meeting.discussionSummary} />
          <DetailField label="Key Discussion Points" value={meeting.keyDiscussionPoints} />
          <DetailField label="Important Notes" value={meeting.importantNotes} />
          <DetailField label="Concerns Raised" value={meeting.concernsRaised} />
          <DetailField label="Risks Identified" value={meeting.risksIdentified} />
          {!meeting.agenda &&
            !meeting.discussionSummary &&
            !meeting.keyDiscussionPoints &&
            !meeting.importantNotes &&
            !meeting.concernsRaised &&
            !meeting.risksIdentified && (
              <p className="text-sm text-muted-foreground">No notes recorded</p>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <AttachmentUpload
            meetingId={meeting.id}
            attachments={meeting.attachments}
            canUpload={canUpload && !isFinalized}
            canDelete={canDeleteAttachment && !isFinalized}
          />
        </CardContent>
      </Card>

      {(meeting.decisions.length > 0 || meeting.actions.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {meeting.decisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Decisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {meeting.decisions.map((d) => (
                  <Link
                    key={d.id}
                    href={`/decisions/${d.id}`}
                    className="block rounded-lg border p-3 text-sm hover:bg-accent"
                  >
                    {d.title}
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
          {meeting.actions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Action Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {meeting.actions.map((a) => (
                  <Link
                    key={a.id}
                    href={`/actions/${a.id}`}
                    className="block rounded-lg border p-3 text-sm hover:bg-accent"
                  >
                    {a.title}
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Created by {meeting.createdBy.fullName}</p>
          {meeting.updatedBy && <p>Last updated by {meeting.updatedBy.fullName}</p>}
          {meeting.finalizedBy && meeting.finalizedAt && (
            <p>
              Finalized by {meeting.finalizedBy.fullName} on{" "}
              {formatDateTime(meeting.finalizedAt)}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize Meeting</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Finalizing this meeting will lock it from further edits. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinalize} disabled={finalizing}>
              {finalizing ? "Finalizing..." : "Finalize Meeting"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
