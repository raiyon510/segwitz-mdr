import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  accent: "teal" | "lime" | "olive" | "charcoal" | "danger";
}

const accentStyles = {
  teal: "bg-brand-teal-steel/10 text-brand-teal-steel ring-brand-teal-steel/20",
  lime: "bg-brand-lime/10 text-brand-lime ring-brand-lime/20",
  olive: "bg-brand-olive/10 text-brand-olive ring-brand-olive/20",
  charcoal: "bg-brand-charcoal/10 text-brand-charcoal ring-brand-charcoal/20 dark:bg-white/10 dark:text-white",
  danger: "bg-destructive/10 text-destructive ring-destructive/20",
};

export function StatCard({ title, value, icon: Icon, accent }: StatCardProps) {
  return (
    <Card className="group overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105",
              accentStyles[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
