"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Role } from "@/generated/prisma/browser";
import { createUser, updateUser } from "@/actions/users";
import { ROLE_LABELS } from "@/lib/rbac";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Division = { id: string; name: string };
type Department = { id: string; name: string; divisionId: string };

export type UserFormData = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  divisionId: string | null;
  departmentId: string | null;
  isActive: boolean;
};

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserFormData | null;
  divisions: Division[];
  departments: Department[];
}

const ROLES = Object.keys(ROLE_LABELS) as Role[];

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  divisions,
  departments,
}: UserFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!user;

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(user?.role ?? "TEAM_MEMBER");
  const [divisionId, setDivisionId] = useState(user?.divisionId ?? "");
  const [departmentId, setDepartmentId] = useState(user?.departmentId ?? "");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);

  const filteredDepartments = divisionId
    ? departments.filter((d) => d.divisionId === divisionId)
    : departments;

  function handleOpenChange(next: boolean) {
    if (next) {
      setFullName(user?.fullName ?? "");
      setEmail(user?.email ?? "");
      setPassword("");
      setRole(user?.role ?? "TEAM_MEMBER");
      setDivisionId(user?.divisionId ?? "");
      setDepartmentId(user?.departmentId ?? "");
      setIsActive(user?.isActive ?? true);
    }
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      fullName,
      email,
      password: password || undefined,
      role,
      divisionId: divisionId || null,
      departmentId: departmentId || null,
      isActive,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateUser(user!.id, payload)
        : await createUser({ ...payload, password });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "User updated" : "User created");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEdit && <span className="text-muted-foreground">(leave blank to keep)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Division</Label>
            <Select
              value={divisionId || "none"}
              onValueChange={(v) => {
                setDivisionId(v === "none" ? "" : v);
                setDepartmentId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {divisions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={departmentId || "none"}
              onValueChange={(v) => setDepartmentId(v === "none" ? "" : v)}
              disabled={filteredDepartments.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {filteredDepartments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={isActive ? "active" : "inactive"}
              onValueChange={(v) => setIsActive(v === "active")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
