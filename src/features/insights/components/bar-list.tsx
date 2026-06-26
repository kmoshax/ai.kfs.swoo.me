export type BarItem = {
  label: string;
  count: number;
  color?: string;
};

export function BarList({ items }: { items: BarItem[] }) {
  const total = items.reduce((s, i) => s + i.count, 0);
  const max = items.reduce((m, i) => Math.max(m, i.count), 0) || 1;

  if (total === 0)
    return <p className="text-sm text-muted-foreground">No data yet.</p>;

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const share = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{item.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {item.count}
                <span className="ml-1.5 text-xs">({share}%)</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(item.count / max) * 100}%`,
                  backgroundColor: item.color ?? "var(--foreground)",
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
