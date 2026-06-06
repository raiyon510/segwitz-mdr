import { redirect } from "next/navigation";
import { getAuditLogs } from "@/actions/audit";
import { AuditLogsTable } from "@/components/audit/audit-logs-table";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function AuditLogsPage() {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "audit:view")) {
    redirect("/");
  }

  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Review system activity and changes across all entities.
        </p>
      </div>
      <AuditLogsTable logs={logs} />
    </div>
  );
}
