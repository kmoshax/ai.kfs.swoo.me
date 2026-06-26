export function gpa(value: number | null): string {
  return value === null ? "—" : value.toFixed(2);
}

export function pct(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

export function score(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

export function relativeTime(from: number, to: number): string {
  const diff = Math.max(0, to - from);
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
