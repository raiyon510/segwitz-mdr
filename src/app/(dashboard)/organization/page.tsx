import Link from "next/link";
import { redirect } from "next/navigation";
import { getDivisions, getDepartments } from "@/actions/organization";
import { DivisionsTab } from "@/components/organization/divisions-tab";
import { DepartmentsTab } from "@/components/organization/departments-tab";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

interface OrganizationPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function OrganizationPage({ searchParams }: OrganizationPageProps) {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "organization:manage")) {
    redirect("/");
  }

  const { tab } = await searchParams;
  const activeTab = tab === "departments" ? "departments" : "divisions";

  const [divisions, departments] = await Promise.all([
    getDivisions(),
    getDepartments(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization</h1>
        <p className="text-muted-foreground">Manage divisions and departments.</p>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <Button
          variant="ghost"
          asChild
          className={cn(activeTab === "divisions" && "bg-accent")}
        >
          <Link href="/organization?tab=divisions">Divisions</Link>
        </Button>
        <Button
          variant="ghost"
          asChild
          className={cn(activeTab === "departments" && "bg-accent")}
        >
          <Link href="/organization?tab=departments">Departments</Link>
        </Button>
      </div>

      {activeTab === "divisions" ? (
        <DivisionsTab divisions={divisions} />
      ) : (
        <DepartmentsTab departments={departments} divisions={divisions} />
      )}
    </div>
  );
}
