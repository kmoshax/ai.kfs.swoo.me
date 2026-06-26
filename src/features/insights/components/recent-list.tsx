import type { RecentRow } from "@/server/kfs/insights";
import { gpa, relativeTime } from "../format";

export function RecentList({ rows, now }: { rows: RecentRow[]; now: number }) {
  if (rows.length === 0)
    return <p className="text-sm text-muted-foreground">No data yet.</p>;

  return (
    <ul className="space-y-1">
      {rows.map((row) => (
        <li
          key={row.code}
          className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">
              {relativeTime(row.fetchedAt, now)}
            </p>
          </div>
          <span className="shrink-0 font-heading text-base font-semibold tabular-nums">
            {gpa(row.gpa)}
          </span>
        </li>
      ))}
    </ul>
  );
}
