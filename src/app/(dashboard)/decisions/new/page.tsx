import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getActiveUsers } from "@/actions/users";
import { getDivisions, getDepartments } from "@/actions/organization";
import { getProjects } from "@/actions/projects";
import { getClients } from "@/actions/clients";
import { getMeetingOptions } from "@/actions/meetings";
import { DecisionForm } from "@/components/decisions/decision-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function NewDecisionPage() {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "decisions:create")) {
    redirect("/decisions");
  }

  const [users, divisions, departments, projects, clients, meetings] = await Promise.all([
    getActiveUsers(),
    getDivisions(),
    getDepartments(),
    getProjects(),
    getClients(),
    getMeetingOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/decisions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Decision</h1>
          <p className="text-muted-foreground">Record a new decision and its context.</p>
        </div>
      </div>

      <DecisionForm
        mode="create"
        users={users}
        divisions={divisions}
        departments={departments.map((d: { id: string; name: string; divisionId: string }) => ({
          ...d,
          divisionId: d.divisionId,
        }))}
        projects={projects}
        clients={clients}
        meetings={meetings}
      />
    </div>
  );
}
