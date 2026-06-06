import Link from "next/link";
import { Plus } from "lucide-react";
import { getActionItems } from "@/actions/action-items";
import { ActionsTable } from "@/components/actions/actions-table";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Action Items</h1>
          <p className="text-muted-foreground">
            Track follow-ups, assignments, and overdue items.
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/actions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Action Item
            </Link>
          </Button>
        )}
      </div>

      <ActionsTable
        actions={actions}
        canEdit={canEdit}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
