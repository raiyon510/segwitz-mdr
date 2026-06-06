import Link from "next/link";
import { Plus } from "lucide-react";
import { getDecisions } from "@/actions/decisions";
import { DecisionsTable } from "@/components/decisions/decisions-table";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function DecisionsPage() {
  const [decisions, session] = await Promise.all([getDecisions(), auth()]);
  const canCreate = session?.user
    ? hasPermission(session.user.role, "decisions:create")
    : false;
  const canEdit = session?.user
    ? hasPermission(session.user.role, "decisions:edit")
    : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Decisions</h1>
          <p className="text-muted-foreground">
            Track what was decided, approved, and its current status.
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/decisions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Decision
            </Link>
          </Button>
        )}
      </div>

      <DecisionsTable decisions={decisions} canEdit={canEdit} />
    </div>
  );
}
