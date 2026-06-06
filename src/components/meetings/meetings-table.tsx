"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MEETING_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface Meeting {
  id: string;
  title: string;
  meetingType: string;
  date: Date;
  time: string | null;
  status: string;
  division: { name: string } | null;
  department: { name: string } | null;
  owner: { fullName: string };
}

interface MeetingsTableProps {
  meetings: Meeting[];
}

function getMeetingTypeLabel(type: string): string {
  return MEETING_TYPES.find((t) => t.value === type)?.label ?? type.replace(/_/g, " ");
}

export function MeetingsTable({ meetings }: MeetingsTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow key={meeting.id}>
              <TableCell>
                <Link
                  href={`/meetings/${meeting.id}`}
                  className="font-medium hover:underline"
                >
                  {meeting.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {getMeetingTypeLabel(meeting.meetingType)}
              </TableCell>
              <TableCell>
                <div>
                  <span>{formatDate(meeting.date)}</span>
                  {meeting.time && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      {meeting.time}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {meeting.division?.name ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {meeting.department?.name ?? "—"}
              </TableCell>
              <TableCell>{meeting.owner.fullName}</TableCell>
              <TableCell>
                <StatusBadge status={meeting.status} />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/meetings/${meeting.id}`} title="View meeting">
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
