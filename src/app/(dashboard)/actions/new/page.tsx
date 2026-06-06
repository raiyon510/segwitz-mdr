import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getActiveUsers } from "@/actions/users";
import { getProjects } from "@/actions/projects";
import { getMeetingOptions } from "@/actions/meetings";
import { getDecisionOptions } from "@/actions/decisions";
import { ActionForm } from "@/components/actions/action-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

interface NewActionPageProps {
  searchParams: Promise<{ decisionId?: string; meetingId?: string; projectId?: string }>;
}

export default async function NewActionPage({ searchParams }: NewActionPageProps) {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "actions:create")) {
    redirect("/actions");
  }

  const params = await searchParams;
  const [users, projects, meetings, decisions] = await Promise.all([
    getActiveUsers(),
    getProjects(),
    getMeetingOptions(),
    getDecisionOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/actions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Action Item</h1>
          <p className="text-muted-foreground">Create a follow-up task with an assignee and due date.</p>
        </div>
      </div>

      <ActionForm
        mode="create"
        initialData={{
          decisionId: params.decisionId ?? null,
          meetingId: params.meetingId ?? null,
          projectId: params.projectId ?? null,
        }}
        users={users}
        projects={projects}
        meetings={meetings}
        decisions={decisions}
      />
    </div>
  );
}
