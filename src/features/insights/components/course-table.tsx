import { scoreColor } from "@/features/lookup/presentation";
import type { CourseStat } from "@/server/kfs/insights";
import { pct, score } from "../format";

export function CourseTable({
  rows,
  metric,
}: {
  rows: CourseStat[];
  metric: "avg" | "pass";
}) {
  if (rows.length === 0)
    return <p className="text-sm text-muted-foreground">No data yet.</p>;

  return (
    <ul className="space-y-1">
      {rows.map((row) => (
        <li
          key={row.name}
          className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{row.name}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {row.count} {row.count === 1 ? "student" : "students"}
            </p>
          </div>
          {metric === "avg" ? (
            <span
              className="shrink-0 font-heading text-base font-semibold tabular-nums"
              style={{ color: scoreColor(row.avgScore) }}
            >
              {score(row.avgScore)}
            </span>
          ) : (
            <span className="shrink-0 font-heading text-base font-semibold tabular-nums">
              {pct(row.passRate)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
