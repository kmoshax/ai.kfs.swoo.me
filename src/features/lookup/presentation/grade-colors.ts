export function gradeColor(grade: string): string {
  const g = grade.replace(/\s+/g, "").toUpperCase();
  if (g.startsWith("A")) return "var(--grade-a)";
  if (g.startsWith("B")) return "var(--grade-b)";
  if (g.startsWith("C")) return "var(--grade-c)";
  if (g.startsWith("D")) return "var(--grade-d)";
  if (g.startsWith("F")) return "var(--grade-f)";
  return "var(--muted-foreground)";
}

export function scoreColor(score: number | null): string {
  if (score === null) return "var(--muted-foreground)";
  if (score >= 85) return "var(--grade-a)";
  if (score >= 76) return "var(--grade-b)";
  if (score >= 68) return "var(--grade-c)";
  if (score >= 60) return "var(--grade-d)";
  return "var(--grade-f)";
}
