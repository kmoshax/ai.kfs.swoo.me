export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  A: 3.7,
  "A-": 3.4,
  "B+": 3.2,
  B: 3.0,
  "B-": 2.8,
  "C+": 2.6,
  C: 2.4,
  "C-": 2.2,
  "D+": 2.0,
  D: 1.5,
  "D-": 1.0,
  F: 0.0,
};

export function gradePointsFor(grade: string): number | null {
  const key = grade.replace(/\s+/g, "").toUpperCase();
  return key in GRADE_POINTS ? GRADE_POINTS[key] : null;
}
