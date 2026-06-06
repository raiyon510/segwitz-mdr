import Link from "next/link";
import {
  Calendar,
  Scale,
  CheckSquare,
  AlertTriangle,
  FileCheck,
  Clock,
} from "lucide-react";
import { getDashboardStats } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingsByDepartmentChart, StatusPieChart } from "@/components/dashboard/dashboard-charts";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { stats, charts, recent } = await getDashboardStats();

  const statCards = [
    { title: "Total Meetings", value: stats.totalMeetings, icon: Calendar, color: "text-blue-600" },
    { title: "Finalized Meetings", value: stats.finalizedMeetings, icon: FileCheck, color: "text-emerald-600" },
    { title: "Total Decisions", value: stats.totalDecisions, icon: Scale, color: "text-purple-600" },
    { title: "Approved Decisions", value: stats.approvedDecisions, icon: CheckSquare, color: "text-green-600" },
    { title: "Pending Decisions", value: stats.pendingDecisions, icon: Clock, color: "text-amber-600" },
    { title: "Overdue Actions", value: stats.overdueActions, icon: AlertTriangle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground">
          What was discussed, decided, approved, and what needs to happen next.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meetings by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <MeetingsByDepartmentChart data={charts.meetingsByDepartment} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Decisions by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={charts.decisionsByStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Items by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={charts.actionsByStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Meetings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meetings yet</p>
            ) : (
              recent.meetings.map((m) => (
                <Link key={m.id} href={`/meetings/${m.id}`} className="block rounded-lg border p-3 hover:bg-accent">
                  <p className="font-medium text-sm">{m.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(m.date)}</span>
                    <StatusBadge status={m.status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.decisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No decisions yet</p>
            ) : (
              recent.decisions.map((d) => (
                <Link key={d.id} href={`/decisions/${d.id}`} className="block rounded-lg border p-3 hover:bg-accent">
                  <p className="font-medium text-sm">{d.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(d.dateDecided)}</span>
                    <StatusBadge status={d.status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Action Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.actions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No action items yet</p>
            ) : (
              recent.actions.map((a) => (
                <Link key={a.id} href={`/actions/${a.id}`} className="block rounded-lg border p-3 hover:bg-accent">
                  <p className="font-medium text-sm">{a.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{a.assignedTo.fullName}</span>
                    <StatusBadge status={a.status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
