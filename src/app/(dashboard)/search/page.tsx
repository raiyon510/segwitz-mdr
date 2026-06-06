import { getDivisions, getDepartments } from "@/actions/organization";
import { getProjects } from "@/actions/projects";
import { getClients } from "@/actions/clients";
import { getActiveUsers } from "@/actions/users";
import { SearchForm } from "@/components/search/search-form";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [divisions, departments, projects, clients, users] = await Promise.all([
    getDivisions(),
    getDepartments(),
    getProjects(),
    getClients(),
    getActiveUsers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Global Search</h1>
        <p className="text-muted-foreground">
          Search across meetings, decisions, and action items with advanced filters.
        </p>
      </div>
      <SearchForm
        divisions={divisions}
        departments={departments}
        projects={projects}
        clients={clients}
        users={users}
        initialQuery={q ?? ""}
      />
    </div>
  );
}
