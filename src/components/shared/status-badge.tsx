import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  FINALIZED: "success",
  PROPOSED: "secondary",
  APPROVED: "success",
  REJECTED: "destructive",
  ON_HOLD: "warning",
  REVERSED: "destructive",
  SUPERSEDED: "outline",
  NOT_STARTED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  BLOCKED: "destructive",
  CANCELLED: "outline",
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "warning",
  CRITICAL: "destructive",
  ACTIVE: "success",
  ON_HOLD_PROJECT: "warning",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  const variant = STATUS_VARIANTS[status] ?? "outline";
  return <Badge variant={variant}>{label}</Badge>;
}
