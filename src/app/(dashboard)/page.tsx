import Link from "next/link";
import {
  Calendar,
  Scale,
  CheckSquare,
  AlertTriangle,
  FileCheck,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { getDashboardStats } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardChartsGrid } from "@/components/dashboard/dashboard-charts-dynamic";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { stats, charts, recent } = await getDashboardStats();

  const statCards = [
    { title: "Total Meetings", value: stats.totalMeetings, icon: Calendar, accent: "teal" as const },
    { title: "Finalized Meetings", value: stats.finalizedMeetings, icon: FileCheck, accent: "lime" as const },
    { title: "Total Decisions", value: stats.totalDecisions, icon: Scale, accent: "charcoal" as const },
    { title: "Approved Decisions", value: stats.approvedDecisions, icon: CheckSquare, accent: "lime" as const },
    { title: "Pending Decisions", value: stats.pendingDecisions, icon: Clock, accent: "olive" as const },
    { title: "Overdue Actions", value: stats.overdueActions, icon: AlertTriangle, accent: "danger" as const },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive Dashboard"
        description="What was discussed, decided, approved, and what needs to happen next."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <DashboardChartsGrid
        meetingsByDepartment={charts.meetingsByDepartment}
        decisionsByStatus={charts.decisionsByStatus}
        actionsByStatus={charts.actionsByStatus}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Recent Meetings",
            items: recent.meetings.map((m) => ({
              id: m.id,
              href: `/meetings/${m.id}`,
              title: m.title,
              meta: formatDate(m.date),
              status: m.status,
            })),
          },
          {
            title: "Recent Decisions",
            items: recent.decisions.map((d) => ({
              id: d.id,
              href: `/decisions/${d.id}`,
              title: d.title,
              meta: formatDate(d.dateDecided),
              status: d.status,
            })),
          },
          {
            title: "Recent Action Items",
            items: recent.actions.map((a) => ({
              id: a.id,
              href: `/actions/${a.id}`,
              title: a.title,
              meta: a.assignedTo.fullName,
              status: a.status,
            })),
          },
        ].map((section) => (
          <Card key={section.title} className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.items.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No records yet</p>
              ) : (
                section.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 p-3.5 transition-all duration-200 hover:border-primary/20 hover:bg-background hover:shadow-sm"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.meta}</span>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
