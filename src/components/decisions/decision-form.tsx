"use client";

import { useMemo, useState } from "react";
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
import { createDecision, updateDecision } from "@/actions/decisions";
import { DECISION_STATUSES } from "@/lib/constants";

type Option = { id: string; name?: string; fullName?: string; title?: string };

type DecisionFormData = {
  title: string;
  description: string;
  meetingId: string | null;
  divisionId: string | null;
  departmentId: string | null;
  projectId: string | null;
  clientId: string | null;
  ownerId: string;
  approvedById: string | null;
  dateDecided: string;
  impactArea: string;
  status: string;
  remarks: string;
};

interface DecisionFormProps {
  mode: "create" | "edit";
  decisionId?: string;
  initialData?: Partial<DecisionFormData>;
  users: Option[];
  divisions: (Option & { departments?: Option[] })[];
  departments: (Option & { divisionId: string })[];
  projects: Option[];
  clients: Option[];
  meetings: Option[];
}

function toInputDate(date?: string | Date): string {
  if (!date) return new Date().toISOString().split("T")[0];
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

const EMPTY = "none";

export function DecisionForm({
  mode,
  decisionId,
  initialData,
  users,
  divisions,
  departments,
  projects,
  clients,
  meetings,
}: DecisionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [divisionId, setDivisionId] = useState(initialData?.divisionId ?? "");
  const [form, setForm] = useState<DecisionFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    meetingId: initialData?.meetingId ?? null,
    divisionId: initialData?.divisionId ?? null,
    departmentId: initialData?.departmentId ?? null,
    projectId: initialData?.projectId ?? null,
    clientId: initialData?.clientId ?? null,
    ownerId: initialData?.ownerId ?? "",
    approvedById: initialData?.approvedById ?? null,
    dateDecided: toInputDate(initialData?.dateDecided),
    impactArea: initialData?.impactArea ?? "",
    status: initialData?.status ?? "PROPOSED",
    remarks: initialData?.remarks ?? "",
  });

  const filteredDepartments = useMemo(
    () => (divisionId ? departments.filter((d) => d.divisionId === divisionId) : departments),
    [departments, divisionId]
  );

  function updateField<K extends keyof DecisionFormData>(key: K, value: DecisionFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      meetingId: form.meetingId || null,
      divisionId: form.divisionId || null,
      departmentId: form.departmentId || null,
      projectId: form.projectId || null,
      clientId: form.clientId || null,
      approvedById: form.approvedById || null,
      impactArea: form.impactArea || undefined,
      remarks: form.remarks || undefined,
    };

    const result =
      mode === "create"
        ? await createDecision(payload)
        : await updateDecision(decisionId!, payload);

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(mode === "create" ? "Decision created" : "Decision updated");
    const id = mode === "create" ? result.data?.id : decisionId;
    router.push(`/decisions/${id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decision Details</CardTitle>
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DECISION_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateDecided">Date Decided *</Label>
              <Input
                id="dateDecided"
                type="date"
                value={form.dateDecided}
                onChange={(e) => updateField("dateDecided", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="impactArea">Impact Area</Label>
            <Input
              id="impactArea"
              value={form.impactArea}
              onChange={(e) => updateField("impactArea", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={form.remarks}
              onChange={(e) => updateField("remarks", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ownership & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Owner *</Label>
              <Select value={form.ownerId} onValueChange={(v) => updateField("ownerId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
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
              <Label>Approved By</Label>
              <Select
                value={form.approvedById ?? EMPTY}
                onValueChange={(v) => updateField("approvedById", v === EMPTY ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY}>None</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              <Label>Division</Label>
              <Select
                value={form.divisionId ?? EMPTY}
                onValueChange={(v) => {
                  const id = v === EMPTY ? null : v;
                  setDivisionId(id ?? "");
                  updateField("divisionId", id);
                  updateField("departmentId", null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY}>None</SelectItem>
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
                value={form.departmentId ?? EMPTY}
                onValueChange={(v) => updateField("departmentId", v === EMPTY ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY}>None</SelectItem>
                  {filteredDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={form.clientId ?? EMPTY}
                onValueChange={(v) => updateField("clientId", v === EMPTY ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY}>None</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
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
          {loading ? "Saving..." : mode === "create" ? "Create Decision" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
