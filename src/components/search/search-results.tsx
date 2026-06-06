"use client";

import Link from "next/link";
import { Calendar, Scale, CheckSquare } from "lucide-react";
import { globalSearch } from "@/actions/search";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type SearchResult = Awaited<ReturnType<typeof globalSearch>>;

interface SearchResultsProps {
  results: SearchResult;
}

export function SearchResults({ results }: SearchResultsProps) {
  const total =
    results.meetings.length + results.decisions.length + results.actions.length;

  if (total === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No results found"
        description="Try adjusting your search filters or keywords."
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Found {total} result{total !== 1 ? "s" : ""}
      </p>

      {results.meetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Meetings
              <Badge variant="secondary">{results.meetings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.meetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="block rounded-lg border p-3 hover:bg-accent"
              >
                <p className="font-medium text-sm">{meeting.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(meeting.date)}</span>
                  {meeting.owner && <span>{meeting.owner.fullName}</span>}
                  {meeting.department && <span>{meeting.department.name}</span>}
                  <StatusBadge status={meeting.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {results.decisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4" />
              Decisions
              <Badge variant="secondary">{results.decisions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.decisions.map((decision) => (
              <Link
                key={decision.id}
                href={`/decisions/${decision.id}`}
                className="block rounded-lg border p-3 hover:bg-accent"
              >
                <p className="font-medium text-sm">{decision.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(decision.dateDecided)}</span>
                  {decision.owner && <span>{decision.owner.fullName}</span>}
                  <StatusBadge status={decision.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {results.actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="h-4 w-4" />
              Action Items
              <Badge variant="secondary">{results.actions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.actions.map((action) => (
              <Link
                key={action.id}
                href={`/actions/${action.id}`}
                className="block rounded-lg border p-3 hover:bg-accent"
              >
                <p className="font-medium text-sm">{action.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Due {formatDate(action.dueDate)}</span>
                  {action.assignedTo && <span>{action.assignedTo.fullName}</span>}
                  <StatusBadge status={action.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
