"use client";

import Link from "next/link";
import { AlertTriangle, CheckSquare, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn, formatDate, isOverdue } from "@/lib/utils";

type ActionRow = {
  id: string;
  title: string;
  dueDate: Date | string;
  status: string;
  priority: string;
  assignedTo: { id: string; fullName: string };
  project: { name: string } | null;
};

interface ActionsTableProps {
  actions: ActionRow[];
  canEdit?: boolean;
  currentUserId?: string;
}

export function ActionsTable({
  actions,
  canEdit = false,
  currentUserId,
}: ActionsTableProps) {
  if (actions.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No action items yet"
        description="Create action items to track follow-ups from meetings and decisions."
      />
    );
  }

  const showActionsColumn =
    canEdit ||
    actions.some(
      (action) =>
        currentUserId &&
        action.assignedTo.id === currentUserId &&
        action.status !== "COMPLETED" &&
        action.status !== "CANCELLED"
    );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            {showActionsColumn && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((action) => {
            const overdue = isOverdue(action.dueDate, action.status);
            const canUpdateAssigned =
              !!currentUserId &&
              action.assignedTo.id === currentUserId &&
              action.status !== "COMPLETED" &&
              action.status !== "CANCELLED";
            const showEdit = canEdit || canUpdateAssigned;

            return (
              <TableRow
                key={action.id}
                className={cn(
                  overdue &&
                    "border-l-2 border-l-red-500 bg-red-950/30 dark:bg-red-950/40"
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {overdue && (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                    )}
                    <Link
                      href={`/actions/${action.id}`}
                      className={cn(
                        "font-medium hover:underline",
                        overdue && "text-red-300"
                      )}
                    >
                      {action.title}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className={cn(overdue && "text-red-100")}>
                  {action.assignedTo.fullName}
                </TableCell>
                <TableCell className={cn(overdue && "font-medium text-red-300")}>
                  {formatDate(action.dueDate)}
                  {overdue && (
                    <span className="ml-2 text-xs text-red-400">Overdue</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={action.priority} />
                </TableCell>
                <TableCell>{action.project?.name ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={action.status} />
                </TableCell>
                {showActionsColumn && (
                  <TableCell className="text-right">
                    {showEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title={canEdit ? "Edit action item" : "Update progress"}
                      >
                        <Link href={`/actions/${action.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
