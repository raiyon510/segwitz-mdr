import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { getMeeting } from "@/actions/meetings";
import { MeetingDetail } from "@/components/meetings/meeting-detail";
import { Button } from "@/components/ui/button";

interface MeetingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const meeting = await getMeeting(id);

  if (!meeting) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/meetings">
          <ChevronLeft className="h-4 w-4" />
          Back to Meetings
        </Link>
      </Button>

      <MeetingDetail
        meeting={meeting}
        userRole={session!.user.role}
      />
    </div>
  );
}
