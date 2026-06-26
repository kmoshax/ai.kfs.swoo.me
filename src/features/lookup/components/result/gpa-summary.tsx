import type { GpaResult } from "@/types";
import { GPA_MAX } from "../../presentation";

type GpaSummaryProps = {
  gpa: GpaResult;
  shown: number | null;
  filled: number;
  standingLabel: string;
};

export function GpaSummary({
  gpa,
  shown,
  filled,
  standingLabel,
}: GpaSummaryProps) {
  return (
    <section
      className="animate-rise mt-8 flex flex-1 flex-col justify-center lg:mt-16"
      style={{ animationDelay: "140ms" }}
    >
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Cumulative GPA
      </p>
      <div className="mt-5 flex items-baseline gap-3 sm:gap-4">
        <span className="font-heading text-7xl font-semibold leading-[0.85] tabular-nums sm:text-8xl">
          {shown !== null ? shown.toFixed(2) : "—"}
        </span>
        <span className="text-2xl font-medium text-muted-foreground sm:text-3xl">
          / {GPA_MAX.toFixed(1)}
        </span>
      </div>
      <p className="mt-4 font-heading text-2xl font-semibold text-muted-foreground sm:text-3xl">
        {standingLabel}
      </p>
      {gpa.gpa !== null && (
        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${filled}%` }}
          />
        </div>
      )}

      <p className="mt-5 text-sm text-muted-foreground">
        {gpa.courses.length} courses · {gpa.totalCreditHours} credit hours
      </p>
    </section>
  );
}
