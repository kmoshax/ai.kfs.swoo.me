import type { CourseComputed, GpaResult, Program } from "@/types";
import { creditHoursFor } from "./credit-hours";
import { gradePointsFor } from "./scale";
import { isTraining, trainingHours } from "./training";

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
    const training = isTraining(c.name);
    const { hours, known } = training
      ? { hours: trainingHours(program), known: true }
      : creditHoursFor(c.name, program);
    const points = training ? null : gradePointsFor(c.grade, program);
    if (!training && !known) provisional = true;
    if (points !== null) {
      qualityPoints += points * hours;
      totalHours += hours;
    }
    return {
      ...c,
      creditHours: hours,
      creditHoursKnown: known,
      points,
      training,
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
