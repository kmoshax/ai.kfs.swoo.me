import type { CourseComputed } from "@/types";

export function trainingHours(courses: CourseComputed[]): number | null {
  const rows = courses.filter((c) => c.training);
  if (rows.length === 0) return null;
  return rows.reduce((sum, c) => sum + c.creditHours, 0);
}
