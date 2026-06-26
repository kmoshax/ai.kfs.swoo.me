import type { Program } from "@/types";

const GENERAL_BANDS = [
  { label: "Very Poor", min: 0, color: "var(--grade-f)" },
  { label: "Poor", min: 1.0, color: "var(--grade-f)" },
  { label: "Pass", min: 2.0, color: "var(--grade-d)" },
  { label: "Good", min: 2.5, color: "var(--grade-c)" },
  { label: "Very Good", min: 3.0, color: "var(--grade-b)" },
  { label: "Excellent", min: 3.5, color: "var(--grade-a)" },
] as const;

const BIO_BANDS = [
  { label: "Very Poor", min: 0, color: "var(--grade-f)" },
  { label: "Poor", min: 1.5, color: "var(--grade-f)" },
  { label: "Pass", min: 2.0, color: "var(--grade-d)" },
  { label: "Good", min: 2.4, color: "var(--grade-c)" },
  { label: "Very Good", min: 3.0, color: "var(--grade-b)" },
  { label: "Excellent", min: 3.7, color: "var(--grade-a)" },
] as const;

export const GPA_MAX = 4.0;

export function bandsFor(program: Program) {
  return program === "bio" ? BIO_BANDS : GENERAL_BANDS;
}

export function gpaStanding(
  gpa: number | null,
  program: Program,
): {
  label: string;
  color: string;
} {
  if (gpa === null) return { label: "—", color: "var(--muted-foreground)" };
  const bands = bandsFor(program);
  let current: { label: string; color: string } = bands[0];
  for (const band of bands) if (gpa >= band.min) current = band;
  return { label: current.label, color: current.color };
}
