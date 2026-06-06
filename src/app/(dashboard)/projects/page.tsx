import { getProjects } from "@/actions/projects";
import { getClients } from "@/actions/clients";
import { ProjectsTable } from "@/components/projects/projects-table";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function ProjectsPage() {
  const session = await auth();
  const canManage = session?.user
    ? hasPermission(session.user.role, "projects:manage")
    : false;

  const [projects, clients] = await Promise.all([getProjects(), getClients()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          {canManage
            ? "Manage projects and their associated clients."
            : "View projects and their associated clients."}
        </p>
      </div>
      <ProjectsTable projects={projects} clients={clients} canManage={canManage} />
    </div>
  );
}
