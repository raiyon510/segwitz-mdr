import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { Role } from "@/generated/prisma/browser";
import { getMeetings } from "@/actions/meetings";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MeetingsTable } from "@/components/meetings/meetings-table";

export default async function MeetingsPage() {
  const session = await auth();
  const meetings = await getMeetings();
  const canCreate = session?.user
    ? hasPermission(session.user.role as Role, "meetings:create")
    : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">
            Record and track all organizational meetings.
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/meetings/new">
              <Plus className="h-4 w-4" />
              New Meeting
            </Link>
          </Button>
        )}
      </div>

      {meetings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No meetings yet"
          description="Create your first meeting to start recording discussions and decisions."
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/meetings/new">
                  <Plus className="h-4 w-4" />
                  Create Meeting
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <MeetingsTable meetings={meetings} />
      )}
    </div>
  );
}
