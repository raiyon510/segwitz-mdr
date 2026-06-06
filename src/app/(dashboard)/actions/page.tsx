import Link from "next/link";
import { Plus } from "lucide-react";
import { getActionItems } from "@/actions/action-items";
import { ActionsTable } from "@/components/actions/actions-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function ActionsPage() {
  const [actions, session] = await Promise.all([getActionItems(), auth()]);
  const canCreate = session?.user
    ? hasPermission(session.user.role, "actions:create")
    : false;
  const canEdit = session?.user
    ? hasPermission(session.user.role, "actions:edit")
    : false;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Action Items"
        description="Track follow-ups, assignments, and overdue items."
      >
        {canCreate && (
          <Button asChild>
            <Link href="/actions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Action Item
            </Link>
          </Button>
        )}
      </PageHeader>

      <ActionsTable
        actions={actions}
        canEdit={canEdit}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
