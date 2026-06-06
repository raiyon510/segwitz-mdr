import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getActionItem } from "@/actions/action-items";
import { getActiveUsers } from "@/actions/users";
import { getProjects } from "@/actions/projects";
import { getMeetingOptions } from "@/actions/meetings";
import { getDecisionOptions } from "@/actions/decisions";
import { ActionDetail } from "@/components/actions/action-detail";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

interface ActionPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActionPage({ params }: ActionPageProps) {
  const { id } = await params;
  const [action, session, users, projects, meetings, decisions] = await Promise.all([
    getActionItem(id),
    auth(),
    getActiveUsers(),
    getProjects(),
    getMeetingOptions(),
    getDecisionOptions(),
  ]);

  if (!action) notFound();

  const userId = session?.user?.id;
  const role = session?.user?.role;
  const canEdit = role ? hasPermission(role, "actions:edit") : false;
  const canUpdateAssigned =
    !!userId &&
    !!role &&
    hasPermission(role, "actions:update_assigned") &&
    action.assignedToId === userId;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/actions">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Action Items
        </Link>
      </Button>

      <ActionDetail
        action={action}
        canEdit={canEdit}
        canUpdateAssigned={canUpdateAssigned}
        users={users}
        projects={projects}
        meetings={meetings}
        decisions={decisions}
      />
    </div>
  );
}
