import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { Role } from "@/generated/prisma/browser";
import { getActiveUsers } from "@/actions/users";
import { getDivisions, getDepartments } from "@/actions/organization";
import { getProjects } from "@/actions/projects";
import { getClients } from "@/actions/clients";
import { MeetingForm } from "@/components/meetings/meeting-form";

export default async function NewMeetingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!hasPermission(session.user.role as Role, "meetings:create")) {
    redirect("/meetings");
  }

  const [users, divisions, departments, projects, clients] = await Promise.all([
    getActiveUsers(),
    getDivisions(),
    getDepartments(),
    getProjects(),
    getClients(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Meeting</h1>
        <p className="text-muted-foreground">
          Record a new meeting with attendees, notes, and context.
        </p>
      </div>

      <MeetingForm
        mode="create"
        divisions={divisions}
        departments={departments}
        projects={projects}
        clients={clients}
        users={users}
        currentUserId={session.user.id}
      />
    </div>
  );
}
