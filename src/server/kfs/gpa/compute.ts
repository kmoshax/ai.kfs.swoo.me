import type { CourseComputed, GpaResult } from "@/types";
import { creditHoursFor } from "./credit-hours";
import { gradePointsFor } from "./scale";

export interface CourseInput {
  name: string;
  score: number | null;
  grade: string;
}

export function computeGpa(courses: CourseInput[]): GpaResult {
  let qualityPoints = 0;
  let totalHours = 0;
  let provisional = false;

  const computed: CourseComputed[] = courses.map((c) => {
    const { hours, known } = creditHoursFor(c.name);
    const points = gradePointsFor(c.grade);
    if (!known) provisional = true;
    if (points !== null) {
      qualityPoints += points * hours;
      totalHours += hours;
    }
    return {
      ...c,
      creditHours: hours,
      creditHoursKnown: known,
      points,
    };
  });

  return {
    courses: computed,
    totalCreditHours: totalHours,
    gpa:
      totalHours > 0 ? Number((qualityPoints / totalHours).toFixed(3)) : null,
    provisional,
  };
}
