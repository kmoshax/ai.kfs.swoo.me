import type { CourseComputed, GpaResult, Program } from "@/types";
import { creditHoursFor } from "./credit-hours";
import { gradePointsFor } from "./scale";

export interface CourseInput {
  name: string;
  score: number | null;
  grade: string;
}

export function computeGpa(
  courses: CourseInput[],
  program: Program,
): GpaResult {
  let qualityPoints = 0;
  let totalHours = 0;
  let provisional = false;

  const computed: CourseComputed[] = courses.map((c) => {
    const { hours, known } = creditHoursFor(c.name, program);
    const points = gradePointsFor(c.grade, program);
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
    program,
  };
}
