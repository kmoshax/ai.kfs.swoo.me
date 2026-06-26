import { gpaStanding } from "@/features/lookup/presentation";
import type { LeaderRow } from "@/server/kfs/insights";
import { gpa } from "../format";

export function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  if (rows.length === 0)
    return <p className="text-sm text-muted-foreground">No data yet.</p>;

  return (
    <ol className="space-y-1">
      {rows.map((row, i) => {
        const standing = gpaStanding(row.gpa);
        return (
          <li
            key={row.code}
            className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-foreground/[0.035]"
          >
            <span className="w-6 shrink-0 text-center font-heading text-sm font-semibold tabular-nums text-muted-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{row.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {row.level ? `${row.level} · ` : ""}
                <span className="font-mono">{row.code}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-heading text-lg font-semibold tabular-nums">
                {gpa(row.gpa)}
              </span>
              <span
                role="img"
                aria-label={standing.label}
                title={standing.label}
                className="ml-2 inline-block size-2 rounded-full align-middle"
                style={{ backgroundColor: standing.color }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
