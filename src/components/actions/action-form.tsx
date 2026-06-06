"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createActionItem, updateActionItem } from "@/actions/action-items";
import { ACTION_PRIORITIES, ACTION_STATUSES } from "@/lib/constants";

type Option = { id: string; name?: string; fullName?: string; title?: string };

type ActionFormData = {
  title: string;
  description: string;
  assignedToId: string;
  dueDate: string;
  priority: string;
  status: string;
  meetingId: string | null;
  decisionId: string | null;
  projectId: string | null;
  completionNotes: string;
};

interface ActionFormProps {
  mode: "create" | "edit";
  actionId?: string;
  initialData?: Partial<ActionFormData>;
  users: Option[];
  projects: Option[];
  meetings: Option[];
  decisions: Option[];
  limitedEdit?: boolean;
}

function toInputDate(date?: string | Date): string {
  if (!date) return new Date().toISOString().split("T")[0];
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

const EMPTY = "none";

export function ActionForm({
  mode,
  actionId,
  initialData,
  users,
  projects,
  meetings,
  decisions,
  limitedEdit = false,
}: ActionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ActionFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    assignedToId: initialData?.assignedToId ?? "",
    dueDate: toInputDate(initialData?.dueDate),
    priority: initialData?.priority ?? "MEDIUM",
    status: initialData?.status ?? "NOT_STARTED",
    meetingId: initialData?.meetingId ?? null,
    decisionId: initialData?.decisionId ?? null,
    projectId: initialData?.projectId ?? null,
    completionNotes: initialData?.completionNotes ?? "",
  });

  function updateField<K extends keyof ActionFormData>(key: K, value: ActionFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      description: form.description || undefined,
      meetingId: form.meetingId || null,
      decisionId: form.decisionId || null,
      projectId: form.projectId || null,
      completionNotes: form.completionNotes || undefined,
    };

    const result =
      mode === "create"
        ? await createActionItem(payload)
        : await updateActionItem(actionId!, payload);

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(mode === "create" ? "Action item created" : "Action item updated");
    const id = mode === "create" ? result.data?.id : actionId;
    router.push(`/actions/${id}`);
    router.refresh();
  }

  if (limitedEdit) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="completionNotes">Completion Notes</Label>
          <Textarea
            id="completionNotes"
            value={form.completionNotes}
            onChange={(e) => updateField("completionNotes", e.target.value)}
            rows={3}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Update Progress"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Action Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Assignee *</Label>
              <Select
                value={form.assignedToId}
                onValueChange={(v) => updateField("assignedToId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => updateField("priority", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completionNotes">Completion Notes</Label>
            <Textarea
              id="completionNotes"
              value={form.completionNotes}
              onChange={(e) => updateField("completionNotes", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Related Meeting</Label>
            <Select
              value={form.meetingId ?? EMPTY}
              onValueChange={(v) => updateField("meetingId", v === EMPTY ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select meeting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY}>None</SelectItem>
                {meetings.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Related Decision</Label>
              <Select
                value={form.decisionId ?? EMPTY}
                onValueChange={(v) => updateField("decisionId", v === EMPTY ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY}>None</SelectItem>
                  {decisions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={form.projectId ?? EMPTY}
                onValueChange={(v) => updateField("projectId", v === EMPTY ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY}>None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "create" ? "Create Action Item" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
