import { gradeColor, type TermEntry } from "../../presentation";

const fmt = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", year: "numeric" });

export function TermBlock({ entry }: { entry: TermEntry }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">
          {entry.level ?? "Term"}
          <span className="ml-2 text-xs text-muted-foreground">
            {fmt(entry.fetchedAt)}
          </span>
        </p>
        <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
          Term {entry.termGpa ?? "—"} · CGPA {entry.cumulativeGpa ?? "—"}
        </p>
      </div>
      <ul className="mt-2 space-y-1">
        {entry.courses.map((c) => (
          <li key={c.name} className="flex items-center gap-3 text-sm">
            <span
              className="w-8 shrink-0 font-heading font-semibold"
              style={{ color: gradeColor(c.grade) }}
            >
              {c.grade}
            </span>
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {c.name}
            </span>
            <span className="shrink-0 tabular-nums">{c.score ?? "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
