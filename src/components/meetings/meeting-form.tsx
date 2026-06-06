"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createMeeting, updateMeeting } from "@/actions/meetings";
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
import { MEETING_TYPES } from "@/lib/constants";

interface Division {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  divisionId: string;
}

interface Project {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
}

interface User {
  id: string;
  fullName: string;
}

export interface MeetingFormData {
  title: string;
  meetingType: string;
  date: string;
  time: string;
  location: string;
  onlineMeetingLink: string;
  divisionId: string;
  departmentId: string;
  projectId: string;
  clientId: string;
  ownerId: string;
  attendeeIds: string[];
  absenteeIds: string[];
  agenda: string;
  discussionSummary: string;
  keyDiscussionPoints: string;
  importantNotes: string;
  concernsRaised: string;
  risksIdentified: string;
  status: "DRAFT" | "FINALIZED";
}

interface MeetingFormProps {
  mode: "create" | "edit";
  meetingId?: string;
  initialData?: Partial<MeetingFormData>;
  divisions: Division[];
  departments: Department[];
  projects: Project[];
  clients: Client[];
  users: User[];
  currentUserId: string;
}

const defaultValues: MeetingFormData = {
  title: "",
  meetingType: "INTERNAL_MANAGEMENT",
  date: "",
  time: "",
  location: "",
  onlineMeetingLink: "",
  divisionId: "",
  departmentId: "",
  projectId: "",
  clientId: "",
  ownerId: "",
  attendeeIds: [],
  absenteeIds: [],
  agenda: "",
  discussionSummary: "",
  keyDiscussionPoints: "",
  importantNotes: "",
  concernsRaised: "",
  risksIdentified: "",
  status: "DRAFT",
};

export function MeetingForm({
  mode,
  meetingId,
  initialData,
  divisions,
  departments,
  projects,
  clients,
  users,
  currentUserId,
}: MeetingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<MeetingFormData>({
    ...defaultValues,
    ownerId: currentUserId,
    ...initialData,
  });

  const filteredDepartments = useMemo(
    () =>
      form.divisionId
        ? departments.filter((d) => d.divisionId === form.divisionId)
        : departments,
    [departments, form.divisionId]
  );

  function updateField<K extends keyof MeetingFormData>(key: K, value: MeetingFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleUserSelection(
    userId: string,
    field: "attendeeIds" | "absenteeIds"
  ) {
    setForm((prev) => {
      const otherField = field === "attendeeIds" ? "absenteeIds" : "attendeeIds";
      const isSelected = prev[field].includes(userId);
      return {
        ...prev,
        [field]: isSelected
          ? prev[field].filter((id) => id !== userId)
          : [...prev[field], userId],
        [otherField]: prev[otherField].filter((id) => id !== userId),
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      divisionId: form.divisionId || null,
      departmentId: form.departmentId || null,
      projectId: form.projectId || null,
      clientId: form.clientId || null,
      onlineMeetingLink: form.onlineMeetingLink || "",
    };

    const result =
      mode === "create"
        ? await createMeeting(payload)
        : await updateMeeting(meetingId!, payload);

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(mode === "create" ? "Meeting created" : "Meeting updated");

    if (mode === "create" && result.data?.id) {
      router.push(`/meetings/${result.data.id}`);
    } else {
      router.push(`/meetings/${meetingId}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Meeting Type *</Label>
            <Select
              value={form.meetingType}
              onValueChange={(v) => updateField("meetingType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => updateField("status", v as "DRAFT" | "FINALIZED")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="FINALIZED">Finalized</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={form.time}
              onChange={(e) => updateField("time", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onlineMeetingLink">Online Meeting Link</Label>
            <Input
              id="onlineMeetingLink"
              type="url"
              value={form.onlineMeetingLink}
              onChange={(e) => updateField("onlineMeetingLink", e.target.value)}
              placeholder="https://"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Division</Label>
            <Select
              value={form.divisionId || "none"}
              onValueChange={(v) => {
                updateField("divisionId", v === "none" ? "" : v);
                updateField("departmentId", "");
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
              value={form.departmentId || "none"}
              onValueChange={(v) => updateField("departmentId", v === "none" ? "" : v)}
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
            <Label>Project</Label>
            <Select
              value={form.projectId || "none"}
              onValueChange={(v) => updateField("projectId", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
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
              value={form.clientId || "none"}
              onValueChange={(v) => updateField("clientId", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Owner *</Label>
            <Select
              value={form.ownerId}
              onValueChange={(v) => updateField("ownerId", v)}
            >
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participants</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label>Attendees</Label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
              {users.map((user) => (
                <label
                  key={`attendee-${user.id}`}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.attendeeIds.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id, "attendeeIds")}
                    className="h-4 w-4 rounded border-input"
                  />
                  {user.fullName}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Absentees</Label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
              {users.map((user) => (
                <label
                  key={`absentee-${user.id}`}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.absenteeIds.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id, "absenteeIds")}
                    className="h-4 w-4 rounded border-input"
                  />
                  {user.fullName}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meeting Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea
              id="agenda"
              value={form.agenda}
              onChange={(e) => updateField("agenda", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discussionSummary">Discussion Summary</Label>
            <Textarea
              id="discussionSummary"
              value={form.discussionSummary}
              onChange={(e) => updateField("discussionSummary", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyDiscussionPoints">Key Discussion Points</Label>
            <Textarea
              id="keyDiscussionPoints"
              value={form.keyDiscussionPoints}
              onChange={(e) => updateField("keyDiscussionPoints", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="importantNotes">Important Notes</Label>
            <Textarea
              id="importantNotes"
              value={form.importantNotes}
              onChange={(e) => updateField("importantNotes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="concernsRaised">Concerns Raised</Label>
            <Textarea
              id="concernsRaised"
              value={form.concernsRaised}
              onChange={(e) => updateField("concernsRaised", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risksIdentified">Risks Identified</Label>
            <Textarea
              id="risksIdentified"
              value={form.risksIdentified}
              onChange={(e) => updateField("risksIdentified", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create Meeting"
              : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
