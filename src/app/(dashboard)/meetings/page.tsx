import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { Role } from "@/generated/prisma/browser";
import { getMeetings } from "@/actions/meetings";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { MeetingsTable } from "@/components/meetings/meetings-table";

export default async function MeetingsPage() {
  const [session, meetings] = await Promise.all([auth(), getMeetings()]);
  const canCreate = session?.user
    ? hasPermission(session.user.role as Role, "meetings:create")
    : false;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Meetings"
        description="Record and track all organizational meetings."
      >
        {canCreate && (
          <Button asChild>
            <Link href="/meetings/new">
              <Plus className="h-4 w-4" />
              New Meeting
            </Link>
          </Button>
        )}
      </PageHeader>

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
