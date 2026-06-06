import { cn } from "@/lib/utils";

interface SegwitzLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  showMark?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: { wordmark: "text-xs tracking-[0.28em]", tagline: "text-[10px]" },
  md: { wordmark: "text-sm tracking-[0.32em]", tagline: "text-xs" },
  lg: { wordmark: "text-xl tracking-[0.38em]", tagline: "text-sm" },
};

export function SegwitzLogo({
  variant = "dark",
  size = "md",
  showTagline = false,
  showMark = true,
  className,
}: SegwitzLogoProps) {
  const styles = sizeStyles[size];
  const wordmarkColor = variant === "light" ? "text-white" : "text-brand-charcoal";

  return (
    <div className={cn("flex flex-col", className)}>
      <span
        className={cn(
          "font-semibold uppercase leading-none",
          styles.wordmark,
          wordmarkColor
        )}
      >
        SEGWITZ{showMark && <span className="text-[0.55em] align-super">™</span>}
      </span>
      {showTagline && (
        <span
          className={cn(
            "mt-1.5 font-normal leading-tight",
            styles.tagline,
            variant === "light" ? "text-white/75" : "text-muted-foreground"
          )}
        >
          Meeting & Decision Repo
        </span>
      )}
    </div>
  );
}
