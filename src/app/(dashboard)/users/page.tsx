import { redirect } from "next/navigation";
import { getUsers } from "@/actions/users";
import { getDivisions, getDepartments } from "@/actions/organization";
import { UsersTable } from "@/components/users/users-table";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "users:manage")) {
    redirect("/");
  }

  const [users, divisions, departments] = await Promise.all([
    getUsers(),
    getDivisions(),
    getDepartments(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage user accounts, roles, and access.</p>
      </div>
      <UsersTable users={users} divisions={divisions} departments={departments} />
    </div>
  );
}
