/**
 * GPA calculation for the KFS credit-hour system.
 *
 * The results page only exposes the letter grade and the numeric score per
 * course — NOT the credit hours. Credit hours therefore live in a config map
 * keyed by the (normalized) English course name. Until the official hours are
 * confirmed, unknown courses fall back to DEFAULT_CREDIT_HOURS and the result
 * is flagged `provisional` so the UI can say so.
 *
 * GPA = Σ(gradePoints × creditHours) / Σ(creditHours)
 */

/** Standard 4.0 letter → grade-point scale used by KFS credit-hour faculties. */
export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
};

export const DEFAULT_CREDIT_HOURS = 3;

/**
 * Credit hours per course. Keys are normalized course names (lowercase, single
 * spaces). TODO: fill in the official hours per course once confirmed.
 */
export const CREDIT_HOURS: Record<string, number> = {
  "numerical analysis": 3,
  "concepts in artificial intelligence": 3,
  "probability & statistics 2": 3,
  "logic design": 3,
  "societal issues": 2,
  "scientific thinking": 2,
  "introduction to programming with python": 3,
};

export function normalizeCourse(name: string): string {
  return name.replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().toLowerCase();
}

export function creditHoursFor(name: string): {
  hours: number;
  known: boolean;
} {
  const key = normalizeCourse(name);
  if (key in CREDIT_HOURS) return { hours: CREDIT_HOURS[key], known: true };
  return { hours: DEFAULT_CREDIT_HOURS, known: false };
}

export function gradePointsFor(grade: string): number | null {
  const key = grade.replace(/\s+/g, "").toUpperCase();
  return key in GRADE_POINTS ? GRADE_POINTS[key] : null;
}

export interface CourseInput {
  name: string;
  score: number | null;
  grade: string;
}

export interface CourseComputed extends CourseInput {
  creditHours: number;
  creditHoursKnown: boolean;
  points: number | null;
}

export interface GpaResult {
  courses: CourseComputed[];
  totalCreditHours: number;
  gpa: number | null;
  /** true when any course used a fallback credit-hours value. */
  provisional: boolean;
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
