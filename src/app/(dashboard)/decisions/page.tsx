import Link from "next/link";
import { Plus } from "lucide-react";
import { getDecisions } from "@/actions/decisions";
import { DecisionsTable } from "@/components/decisions/decisions-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
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
    <div className="space-y-8">
      <PageHeader
        title="Decisions"
        description="Track what was decided, approved, and its current status."
      >
        {canCreate && (
          <Button asChild>
            <Link href="/decisions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Decision
            </Link>
          </Button>
        )}
      </PageHeader>

      <DecisionsTable decisions={decisions} canEdit={canEdit} />
    </div>
  );
}
