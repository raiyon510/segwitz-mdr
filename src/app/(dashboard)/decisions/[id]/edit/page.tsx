import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDecisionForEdit } from "@/actions/decisions";
import { getActiveUsers } from "@/actions/users";
import { getDivisions, getDepartments } from "@/actions/organization";
import { getProjects } from "@/actions/projects";
import { getClients } from "@/actions/clients";
import { getMeetingOptions } from "@/actions/meetings";
import { DecisionForm } from "@/components/decisions/decision-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

interface EditDecisionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDecisionPage({ params }: EditDecisionPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "decisions:edit")) {
    redirect(`/decisions/${id}`);
  }

  const [decision, users, divisions, departments, projects, clients, meetings] =
    await Promise.all([
      getDecisionForEdit(id),
      getActiveUsers(),
      getDivisions(),
      getDepartments(),
      getProjects(),
      getClients(),
      getMeetingOptions(),
    ]);

  if (!decision) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/decisions/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Decision</h1>
          <p className="text-muted-foreground">{decision.title}</p>
        </div>
      </div>

      <DecisionForm
        mode="edit"
        decisionId={id}
        initialData={{
          title: decision.title,
          description: decision.description,
          meetingId: decision.meetingId,
          divisionId: decision.divisionId,
          departmentId: decision.departmentId,
          projectId: decision.projectId,
          clientId: decision.clientId,
          ownerId: decision.ownerId,
          approvedById: decision.approvedById,
          dateDecided: decision.dateDecided.toISOString().split("T")[0],
          impactArea: decision.impactArea ?? "",
          status: decision.status,
          remarks: decision.remarks ?? "",
        }}
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
