"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, UserX, Trash2 } from "lucide-react";
import { Role } from "@/generated/prisma/browser";
import { deactivateUser, deleteUser } from "@/actions/users";
import { ROLE_LABELS } from "@/lib/rbac";
import { UserFormDialog, type UserFormData } from "@/components/users/user-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

type Division = { id: string; name: string };
type Department = { id: string; name: string; divisionId: string };

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  divisionId: string | null;
  departmentId: string | null;
  isActive: boolean;
  division: Division | null;
  department: Department | null;
};

interface UsersTableProps {
  users: UserRow[];
  divisions: Division[];
  departments: Department[];
}

export function UsersTable({ users, divisions, departments }: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);

  function handleCreate() {
    setEditingUser(null);
    setDialogOpen(true);
  }

  function handleEdit(user: UserRow) {
    setEditingUser({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      divisionId: user.divisionId,
      departmentId: user.departmentId,
      isActive: user.isActive,
    });
    setDialogOpen(true);
  }

  function handleDeactivate(id: string) {
    if (!confirm("Deactivate this user?")) return;
    startTransition(async () => {
      const result = await deactivateUser(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("User deactivated");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteUser(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("User deleted");
      router.refresh();
    });
  }

  if (users.length === 0) {
    return (
      <>
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Create the first user account to get started."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          }
        />
        <UserFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          user={editingUser}
          divisions={divisions}
          departments={departments}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
                </TableCell>
                <TableCell>{user.division?.name ?? "—"}</TableCell>
                <TableCell>{user.department?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "success" : "outline"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {user.isActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Deactivate user"
                        onClick={() => handleDeactivate(user.id)}
                        disabled={isPending}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                    {!user.isActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete user (only when inactive)"
                        onClick={() => handleDelete(user.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        divisions={divisions}
        departments={departments}
      />
    </>
  );
}
