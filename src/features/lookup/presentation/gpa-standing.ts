export const GPA_BANDS = [
  { label: "Very Poor", min: 0, color: "var(--grade-f)" },
  { label: "Poor", min: 1.0, color: "var(--grade-f)" },
  { label: "Pass", min: 2.0, color: "var(--grade-d)" },
  { label: "Good", min: 2.5, color: "var(--grade-c)" },
  { label: "Very Good", min: 3.0, color: "var(--grade-b)" },
  { label: "Excellent", min: 3.5, color: "var(--grade-a)" },
] as const;

export const GPA_MAX = 4.0;

export function gpaStanding(gpa: number | null): {
  label: string;
  color: string;
} {
  if (gpa === null) return { label: "—", color: "var(--muted-foreground)" };
  let current: { label: string; color: string } = GPA_BANDS[0];
  for (const band of GPA_BANDS) if (gpa >= band.min) current = band;
  return { label: current.label, color: current.color };
}
