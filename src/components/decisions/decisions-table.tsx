"use client";

import Link from "next/link";
import { Scale, Pencil } from "lucide-react";
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
import { formatDate } from "@/lib/utils";

type DecisionRow = {
  id: string;
  title: string;
  dateDecided: Date | string;
  status: string;
  owner: { fullName: string };
  division: { name: string } | null;
  project: { name: string } | null;
};

interface DecisionsTableProps {
  decisions: DecisionRow[];
  canEdit?: boolean;
}

export function DecisionsTable({ decisions, canEdit = false }: DecisionsTableProps) {
  if (decisions.length === 0) {
    return (
      <EmptyState
        icon={Scale}
        title="No decisions yet"
        description="Record decisions from meetings or create one directly."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date Decided</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            {canEdit && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {decisions.map((decision) => (
            <TableRow key={decision.id}>
              <TableCell>
                <Link
                  href={`/decisions/${decision.id}`}
                  className="font-medium hover:underline"
                >
                  {decision.title}
                </Link>
              </TableCell>
              <TableCell>{formatDate(decision.dateDecided)}</TableCell>
              <TableCell>{decision.owner.fullName}</TableCell>
              <TableCell>{decision.division?.name ?? "—"}</TableCell>
              <TableCell>{decision.project?.name ?? "—"}</TableCell>
              <TableCell>
                <StatusBadge status={decision.status} />
              </TableCell>
              {canEdit && (
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild title="Edit decision">
                    <Link href={`/decisions/${decision.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
