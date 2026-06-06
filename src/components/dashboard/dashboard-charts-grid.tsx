"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MeetingsByDepartmentChart,
  StatusPieChart,
} from "@/components/dashboard/dashboard-charts";

interface ChartData {
  name: string;
  value: number;
}

interface DashboardChartsGridProps {
  meetingsByDepartment: ChartData[];
  decisionsByStatus: ChartData[];
  actionsByStatus: ChartData[];
}

export function DashboardChartsGrid({
  meetingsByDepartment,
  decisionsByStatus,
  actionsByStatus,
}: DashboardChartsGridProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Meetings by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <MeetingsByDepartmentChart data={meetingsByDepartment} />
        </CardContent>
      </Card>
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Decisions by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusPieChart data={decisionsByStatus} />
        </CardContent>
      </Card>
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Action Items by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusPieChart data={actionsByStatus} />
        </CardContent>
      </Card>
    </div>
  );
}
