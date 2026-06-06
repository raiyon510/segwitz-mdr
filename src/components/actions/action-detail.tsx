"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionForm } from "@/components/actions/action-form";
import { cn, formatDate, isOverdue } from "@/lib/utils";

type UserRef = { id: string; fullName: string };
type Option = { id: string; name?: string; fullName?: string; title?: string };

type ActionDetailData = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | string;
  priority: string;
  status: string;
  completionNotes: string | null;
  assignedTo: UserRef;
  assignedToId: string;
  meeting: { id: string; title: string } | null;
  meetingId: string | null;
  decision: { id: string; title: string } | null;
  decisionId: string | null;
  project: { id: string; name: string } | null;
  projectId: string | null;
  createdBy: UserRef;
  updatedBy: UserRef | null;
};

interface ActionDetailProps {
  action: ActionDetailData;
  canEdit: boolean;
  canUpdateAssigned: boolean;
  users: Option[];
  projects: Option[];
  meetings: Option[];
  decisions: Option[];
}

export function ActionDetail({
  action,
  canEdit,
  canUpdateAssigned,
  users,
  projects,
  meetings,
  decisions,
}: ActionDetailProps) {
  const [editing, setEditing] = useState(false);
  const overdue = isOverdue(action.dueDate, action.status);
  const showLimitedEdit = !canEdit && canUpdateAssigned;
  const showFullEdit = canEdit;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {overdue && <AlertTriangle className="h-5 w-5 text-red-600" />}
            <h1 className="text-2xl font-bold tracking-tight">{action.title}</h1>
            <StatusBadge status={action.status} />
            <StatusBadge status={action.priority} />
          </div>
          <p
            className={cn(
              "mt-1 text-sm",
              overdue ? "font-medium text-red-700 dark:text-red-400" : "text-muted-foreground"
            )}
          >
            Due {formatDate(action.dueDate)}
            {overdue && " — Overdue"}
          </p>
        </div>
        {(showFullEdit || showLimitedEdit) && !editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            {showLimitedEdit ? "Update Progress" : "Edit"}
          </Button>
        )}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {showLimitedEdit ? "Update Progress" : "Edit Action Item"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm
              mode="edit"
              actionId={action.id}
              limitedEdit={showLimitedEdit}
              initialData={{
                title: action.title,
                description: action.description ?? "",
                assignedToId: action.assignedToId,
                dueDate:
                  typeof action.dueDate === "string"
                    ? action.dueDate
                    : action.dueDate.toISOString().split("T")[0],
                priority: action.priority,
                status: action.status,
                meetingId: action.meetingId,
                decisionId: action.decisionId,
                projectId: action.projectId,
                completionNotes: action.completionNotes ?? "",
              }}
              users={users}
              projects={projects}
              meetings={meetings}
              decisions={decisions}
            />
            <Button variant="ghost" className="mt-4" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">
                {action.description || "No description provided."}
              </p>
              {action.completionNotes && (
                <div className="mt-4 rounded-lg border bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Completion Notes</p>
                  <p className="mt-1 text-sm">{action.completionNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow label="Assignee" value={action.assignedTo.fullName} />
              <DetailRow label="Due Date" value={formatDate(action.dueDate)} overdue={overdue} />
              <DetailRow label="Priority" value={<StatusBadge status={action.priority} />} />
              <DetailRow label="Status" value={<StatusBadge status={action.status} />} />
              <DetailRow
                label="Meeting"
                value={
                  action.meeting ? (
                    <Link href={`/meetings/${action.meeting.id}`} className="hover:underline">
                      {action.meeting.title}
                    </Link>
                  ) : undefined
                }
              />
              <DetailRow
                label="Decision"
                value={
                  action.decision ? (
                    <Link href={`/decisions/${action.decision.id}`} className="hover:underline">
                      {action.decision.title}
                    </Link>
                  ) : undefined
                }
              />
              <DetailRow
                label="Project"
                value={
                  action.project ? (
                    <Link href={`/projects/${action.project.id}`} className="hover:underline">
                      {action.project.name}
                    </Link>
                  ) : undefined
                }
              />
              <DetailRow label="Created By" value={action.createdBy.fullName} />
              {action.updatedBy && (
                <DetailRow label="Last Updated By" value={action.updatedBy.fullName} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  overdue,
}: {
  label: string;
  value?: React.ReactNode | string | null;
  overdue?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right font-medium",
          overdue && "text-red-700 dark:text-red-400"
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}
