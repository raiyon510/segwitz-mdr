import { AuditAction } from "@/generated/prisma/browser";
import { ScrollText } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

const ACTION_VARIANTS: Record<
  AuditAction,
  "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
> = {
  CREATE: "success",
  UPDATE: "default",
  DELETE: "destructive",
  STATUS_CHANGE: "warning",
  FINALIZE: "success",
  LOGIN: "secondary",
  UPLOAD: "outline",
};

type AuditLogRow = {
  id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  details: string | null;
  createdAt: Date;
  user: { fullName: string } | null;
};

interface AuditLogsTableProps {
  logs: AuditLogRow[];
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="No audit logs yet"
        description="System activity will appear here as users make changes."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap text-sm">
                {formatDateTime(log.createdAt)}
              </TableCell>
              <TableCell>{log.user?.fullName ?? "System"}</TableCell>
              <TableCell>
                <Badge variant={ACTION_VARIANTS[log.action] ?? "outline"}>
                  {log.action.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-medium">{log.entityType}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  {log.entityId.slice(0, 8)}…
                </span>
              </TableCell>
              <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                {log.details ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
