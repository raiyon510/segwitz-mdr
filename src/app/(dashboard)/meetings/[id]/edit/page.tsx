import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { Role, MeetingStatus } from "@/generated/prisma/browser";
import { getMeeting } from "@/actions/meetings";
import { getActiveUsers } from "@/actions/users";
import { getDivisions, getDepartments } from "@/actions/organization";
import { getProjects } from "@/actions/projects";
import { getClients } from "@/actions/clients";
import { MeetingForm, type MeetingFormData } from "@/components/meetings/meeting-form";
import { Button } from "@/components/ui/button";

interface EditMeetingPageProps {
  params: Promise<{ id: string }>;
}

function toFormDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default async function EditMeetingPage({ params }: EditMeetingPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!hasPermission(session.user.role as Role, "meetings:edit")) {
    redirect(`/meetings/${id}`);
  }

  const meeting = await getMeeting(id);
  if (!meeting) notFound();

  if (meeting.status === MeetingStatus.FINALIZED) {
    redirect(`/meetings/${id}`);
  }

  const [users, divisions, departments, projects, clients] = await Promise.all([
    getActiveUsers(),
    getDivisions(),
    getDepartments(),
    getProjects(),
    getClients(),
  ]);

  const initialData: MeetingFormData = {
    title: meeting.title,
    meetingType: meeting.meetingType,
    date: toFormDate(meeting.date),
    time: meeting.time ?? "",
    location: meeting.location ?? "",
    onlineMeetingLink: meeting.onlineMeetingLink ?? "",
    divisionId: meeting.divisionId ?? "",
    departmentId: meeting.departmentId ?? "",
    projectId: meeting.projectId ?? "",
    clientId: meeting.clientId ?? "",
    ownerId: meeting.ownerId,
    attendeeIds: meeting.attendees.map((a) => a.userId),
    absenteeIds: meeting.absentees.map((a) => a.userId),
    agenda: meeting.agenda ?? "",
    discussionSummary: meeting.discussionSummary ?? "",
    keyDiscussionPoints: meeting.keyDiscussionPoints ?? "",
    importantNotes: meeting.importantNotes ?? "",
    concernsRaised: meeting.concernsRaised ?? "",
    risksIdentified: meeting.risksIdentified ?? "",
    status: meeting.status,
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/meetings/${id}`}>
          <ChevronLeft className="h-4 w-4" />
          Back to Meeting
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Meeting</h1>
        <p className="text-muted-foreground">{meeting.title}</p>
      </div>

      <MeetingForm
        mode="edit"
        meetingId={id}
        initialData={initialData}
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
