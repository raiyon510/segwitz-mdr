import { getClients } from "@/actions/clients";
import { ClientsTable } from "@/components/clients/clients-table";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function ClientsPage() {
  const session = await auth();
  const canManage = session?.user
    ? hasPermission(session.user.role, "clients:manage")
    : false;

  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">
          {canManage
            ? "Manage client records and contact information."
            : "View client records and contact information."}
        </p>
      </div>
      <ClientsTable clients={clients} canManage={canManage} />
    </div>
  );
}
