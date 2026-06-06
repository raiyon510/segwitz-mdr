"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { ProjectStatus } from "@/generated/prisma/browser";
import { deleteProject } from "@/actions/projects";
import { ProjectFormDialog, type ProjectFormData } from "@/components/projects/project-form-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

type Client = { id: string; name: string };

type ProjectRow = {
  id: string;
  name: string;
  clientId: string | null;
  clientName: string | null;
  description: string | null;
  status: ProjectStatus;
  client: Client | null;
};

interface ProjectsTableProps {
  projects: ProjectRow[];
  clients: Client[];
  canManage?: boolean;
}

export function ProjectsTable({ projects, clients, canManage = false }: ProjectsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectFormData | null>(null);

  function handleCreate() {
    setEditingProject(null);
    setDialogOpen(true);
  }

  function handleEdit(project: ProjectRow) {
    setEditingProject({
      id: project.id,
      name: project.name,
      clientId: project.clientId,
      clientName: project.clientName,
      description: project.description,
      status: project.status,
    });
    setDialogOpen(true);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this project? Related records may be affected.")) return;
    startTransition(async () => {
      const result = await deleteProject(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Project deleted");
      router.refresh();
    });
  }

  function clientDisplay(project: ProjectRow) {
    return project.client?.name ?? project.clientName ?? "—";
  }

  if (projects.length === 0) {
    return (
      <>
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description={
            canManage
              ? "Create a project to track meetings, decisions, and actions."
              : "No project records are available yet."
          }
          action={
            canManage ? (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            ) : undefined
          }
        />
        {canManage && (
          <ProjectFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            project={editingProject}
            clients={clients}
          />
        )}
      </>
    );
  }

  return (
    <>
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{clientDisplay(project)}</TableCell>
                <TableCell className="max-w-xs truncate">{project.description ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={project.status} />
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(project.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {canManage && (
        <ProjectFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          project={editingProject}
          clients={clients}
        />
      )}
    </>
  );
}
