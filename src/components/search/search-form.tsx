"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { globalSearch } from "@/actions/search";
import { MEETING_TYPES, DECISION_STATUSES, ACTION_STATUSES } from "@/lib/constants";
import { SearchResults } from "@/components/search/search-results";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { id: string; name: string };
type Division = Option;
type Department = Option & { divisionId: string };
type Project = Option;
type Client = Option;
type User = { id: string; fullName: string };

type SearchResult = Awaited<ReturnType<typeof globalSearch>>;

interface SearchFormProps {
  divisions: Division[];
  departments: Department[];
  projects: Project[];
  clients: Client[];
  users: User[];
  initialQuery?: string;
}

export function SearchForm({
  divisions,
  departments,
  projects,
  clients,
  users,
  initialQuery = "",
}: SearchFormProps) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [query, setQuery] = useState(initialQuery);
  const [divisionId, setDivisionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [clientId, setClientId] = useState("");
  const [meetingType, setMeetingType] = useState("");
  const [decisionStatus, setDecisionStatus] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [attendeeId, setAttendeeId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredDepartments = divisionId
    ? departments.filter((d) => d.divisionId === divisionId)
    : departments;

  function runSearch(searchQuery: string) {
    startTransition(async () => {
      const data = await globalSearch({
        query: searchQuery || undefined,
        divisionId: divisionId || undefined,
        departmentId: departmentId || undefined,
        projectId: projectId || undefined,
        clientId: clientId || undefined,
        meetingType: meetingType || undefined,
        decisionStatus: decisionStatus || undefined,
        actionStatus: actionStatus || undefined,
        attendeeId: attendeeId || undefined,
        assignedToId: assignedToId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setResults(data);
      setHasSearched(true);
    });
  }

  const didAutoSearch = useRef(false);
  useEffect(() => {
    if (initialQuery && !didAutoSearch.current) {
      didAutoSearch.current = true;
      runSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  function handleClear() {
    setQuery("");
    setDivisionId("");
    setDepartmentId("");
    setProjectId("");
    setClientId("");
    setMeetingType("");
    setDecisionStatus("");
    setActionStatus("");
    setAttendeeId("");
    setAssignedToId("");
    setDateFrom("");
    setDateTo("");
    setResults(null);
    setHasSearched(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Keywords</Label>
              <Input
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, descriptions, agendas..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Division</Label>
                <Select
                  value={divisionId || "all"}
                  onValueChange={(v) => {
                    setDivisionId(v === "all" ? "" : v);
                    setDepartmentId("");
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="All divisions" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All divisions</SelectItem>
                    {divisions.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={departmentId || "all"}
                  onValueChange={(v) => setDepartmentId(v === "all" ? "" : v)}
                >
                  <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {filteredDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={projectId || "all"} onValueChange={(v) => setProjectId(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All projects" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={clientId || "all"} onValueChange={(v) => setClientId(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All clients" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clients</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Meeting Type</Label>
                <Select value={meetingType || "all"} onValueChange={(v) => setMeetingType(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {MEETING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Decision Status</Label>
                <Select value={decisionStatus || "all"} onValueChange={(v) => setDecisionStatus(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {DECISION_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action Status</Label>
                <Select value={actionStatus || "all"} onValueChange={(v) => setActionStatus(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {ACTION_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Attendee</Label>
                <Select value={attendeeId || "all"} onValueChange={(v) => setAttendeeId(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Any attendee" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any attendee</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Select value={assignedToId || "all"} onValueChange={(v) => setAssignedToId(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Anyone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Anyone</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                <Search className="mr-2 h-4 w-4" />
                {isPending ? "Searching..." : "Search"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasSearched && results && <SearchResults results={results} />}
    </div>
  );
}
