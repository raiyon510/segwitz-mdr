import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDecision } from "@/actions/decisions";
import { DecisionDetail } from "@/components/decisions/decision-detail";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

interface DecisionPageProps {
  params: Promise<{ id: string }>;
}

export default async function DecisionPage({ params }: DecisionPageProps) {
  const { id } = await params;
  const [decision, session] = await Promise.all([getDecision(id), auth()]);

  if (!decision) notFound();

  const role = session?.user?.role;
  const canEdit = role ? hasPermission(role, "decisions:edit") : false;
  const canUpload = role ? hasPermission(role, "attachments:upload") : false;
  const canDeleteAttachment = role ? hasPermission(role, "attachments:delete") : false;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/decisions">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Decisions
        </Link>
      </Button>

      <DecisionDetail
        decision={decision}
        canEdit={canEdit}
        canUpload={canUpload}
        canDeleteAttachment={canDeleteAttachment}
      />
    </div>
  );
}
