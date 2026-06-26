import type { CourseComputed, GradesSnapshot } from "@/types";
import { enLevel } from "./locale";

export interface TermEntry {
  level: string | null;
  fetchedAt: number;
  courses: CourseComputed[];
  termGpa: number | null;
  cumulativeGpa: number | null;
}

function courseKey(c: CourseComputed): string {
  return `${c.name}|${c.grade}|${c.score}`;
}

function termGpa(courses: CourseComputed[]): number | null {
  let quality = 0;
  let hours = 0;
  for (const c of courses)
    if (c.points !== null) {
      quality += c.points * c.creditHours;
      hours += c.creditHours;
    }
  return hours > 0 ? Number((quality / hours).toFixed(3)) : null;
}

export function toTermEntries(history: GradesSnapshot[]): TermEntry[] {
  return history.map((snap, i) => {
    const courses = snap.gpa.courses;
    const prev =
      i > 0 ? new Set(history[i - 1].gpa.courses.map(courseKey)) : null;
    const fresh = prev
      ? courses.filter((c) => !prev.has(courseKey(c)))
      : courses;
    return {
      level: enLevel(snap.level),
      fetchedAt: snap.fetchedAt,
      courses: fresh,
      termGpa: termGpa(fresh),
      cumulativeGpa: snap.gpa.gpa,
    };
  });
}
