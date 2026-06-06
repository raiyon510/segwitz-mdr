"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Pencil,
  Paperclip,
  Trash2,
  ArrowRight,
  CheckSquare,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { DECISION_STATUSES } from "@/lib/constants";
import { updateDecisionStatus } from "@/actions/decisions";
import {
  uploadDecisionAttachment,
  deleteDecisionAttachment,
} from "@/actions/attachments";

type UserRef = { id: string; fullName: string };
type Attachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: Date | string;
};
type StatusHistoryEntry = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  remarks: string | null;
  createdAt: Date | string;
  changedBy: UserRef;
};
type ActionRef = {
  id: string;
  title: string;
  status: string;
  assignedTo: UserRef;
};
type DecisionDetailData = {
  id: string;
  title: string;
  description: string;
  dateDecided: Date | string;
  impactArea: string | null;
  status: string;
  remarks: string | null;
  owner: UserRef;
  approvedBy: UserRef | null;
  meeting: { id: string; title: string } | null;
  division: { name: string } | null;
  department: { name: string } | null;
  project: { id: string; name: string } | null;
  client: { name: string } | null;
  createdBy: UserRef;
  statusHistory: StatusHistoryEntry[];
  attachments: Attachment[];
  actions: ActionRef[];
};

interface DecisionDetailProps {
  decision: DecisionDetailData;
  canEdit: boolean;
  canUpload: boolean;
  canDeleteAttachment: boolean;
}

export function DecisionDetail({
  decision,
  canEdit,
  canUpload,
  canDeleteAttachment,
}: DecisionDetailProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(decision.status);
  const [statusRemarks, setStatusRemarks] = useState("");

  async function handleStatusUpdate() {
    if (newStatus === decision.status) {
      toast.error("Select a different status");
      return;
    }
    setStatusLoading(true);
    const result = await updateDecisionStatus(
      decision.id,
      newStatus as (typeof DECISION_STATUSES)[number]["value"],
      statusRemarks || undefined
    );
    setStatusLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Status updated");
    router.refresh();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadDecisionAttachment(decision.id, formData);
    setUploadLoading(false);

    if (fileRef.current) fileRef.current.value = "";

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Attachment uploaded");
    router.refresh();
  }

  async function handleDeleteAttachment(id: string) {
    const result = await deleteDecisionAttachment(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Attachment deleted");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{decision.title}</h1>
            <StatusBadge status={decision.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Decided on {formatDate(decision.dateDecided)}
          </p>
        </div>
        {canEdit && (
          <Button asChild variant="outline">
            <Link href={`/decisions/${decision.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{decision.description}</p>
            {decision.remarks && (
              <div className="mt-4 rounded-lg border bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Remarks</p>
                <p className="mt-1 text-sm">{decision.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow label="Owner" value={decision.owner.fullName} />
            <DetailRow label="Approved By" value={decision.approvedBy?.fullName} />
            <DetailRow label="Impact Area" value={decision.impactArea} />
            <DetailRow label="Division" value={decision.division?.name} />
            <DetailRow label="Department" value={decision.department?.name} />
            <DetailRow
              label="Project"
              value={
                decision.project ? (
                  <Link href={`/projects/${decision.project.id}`} className="hover:underline">
                    {decision.project.name}
                  </Link>
                ) : undefined
              }
            />
            <DetailRow label="Client" value={decision.client?.name} />
            <DetailRow
              label="Meeting"
              value={
                decision.meeting ? (
                  <Link href={`/meetings/${decision.meeting.id}`} className="hover:underline">
                    {decision.meeting.title}
                  </Link>
                ) : undefined
              }
            />
            <DetailRow label="Created By" value={decision.createdBy.fullName} />
          </CardContent>
        </Card>
      </div>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DECISION_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Optional note for this status change"
                  rows={2}
                />
              </div>
            </div>
            <Button onClick={handleStatusUpdate} disabled={statusLoading}>
              {statusLoading ? "Updating..." : "Update Status"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status History</CardTitle>
        </CardHeader>
        <CardContent>
          {decision.statusHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No status changes recorded</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decision.statusHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDateTime(entry.createdAt)}</TableCell>
                      <TableCell>
                        {entry.fromStatus ? (
                          <StatusBadge status={entry.fromStatus} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={entry.toStatus} />
                      </TableCell>
                      <TableCell>{entry.changedBy.fullName}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.remarks ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Attachments</CardTitle>
          {canUpload && (
            <>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={uploadLoading}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadLoading ? "Uploading..." : "Upload"}
              </Button>
            </>
          )}
        </CardHeader>
        <CardContent>
          {decision.attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attachments</p>
          ) : (
            <ul className="space-y-2">
              {decision.attachments.map((att) => (
                <li
                  key={att.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    {att.fileName}
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(att.fileSize / 1024)} KB)
                    </span>
                  </a>
                  {canDeleteAttachment && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAttachment(att.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Related Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          {decision.actions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No linked action items</p>
          ) : (
            <ul className="space-y-2">
              {decision.actions.map((action) => (
                <li key={action.id}>
                  <Link
                    href={`/actions/${action.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{action.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{action.assignedTo.fullName}</span>
                      <StatusBadge status={action.status} />
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode | string | null;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}
