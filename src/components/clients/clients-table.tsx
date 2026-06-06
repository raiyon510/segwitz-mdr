"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UserCircle } from "lucide-react";
import { deleteClient } from "@/actions/clients";
import { ClientFormDialog, type ClientFormData } from "@/components/clients/client-form-dialog";
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

type ClientRow = {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

interface ClientsTableProps {
  clients: ClientRow[];
  canManage?: boolean;
}

export function ClientsTable({ clients, canManage = false }: ClientsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientFormData | null>(null);

  function handleCreate() {
    setEditingClient(null);
    setDialogOpen(true);
  }

  function handleEdit(client: ClientRow) {
    setEditingClient(client);
    setDialogOpen(true);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this client? Related records may be affected.")) return;
    startTransition(async () => {
      const result = await deleteClient(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Client deleted");
      router.refresh();
    });
  }

  if (clients.length === 0) {
    return (
      <>
        <EmptyState
          icon={UserCircle}
          title="No clients yet"
          description={
            canManage
              ? "Add your first client to start tracking projects and meetings."
              : "No client records are available yet."
          }
          action={
            canManage ? (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            ) : undefined
          }
        />
        {canManage && (
          <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} client={editingClient} />
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
            Add Client
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.contactPerson ?? "—"}</TableCell>
                <TableCell>{client.email ?? "—"}</TableCell>
                <TableCell>{client.phone ?? "—"}</TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(client.id)}
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
        <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} client={editingClient} />
      )}
    </>
  );
}
