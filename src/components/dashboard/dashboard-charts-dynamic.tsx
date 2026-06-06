import dynamic from "next/dynamic";

export const DashboardChartsGrid = dynamic(
  () =>
    import("@/components/dashboard/dashboard-charts-grid").then(
      (mod) => mod.DashboardChartsGrid
    ),
  {
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[320px] animate-pulse rounded-xl border border-border/60 bg-muted/30"
          />
        ))}
      </div>
    ),
  }
);
