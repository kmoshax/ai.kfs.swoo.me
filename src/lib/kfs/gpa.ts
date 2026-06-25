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

/**
 * Official KFS AI-faculty letter → grade-point scale (NOT the generic 4.0 one).
 * Percentage bands per course: A+ 96+, A 92, A- 88, B+ 84, B 80, B- 76,
 * C+ 72, C 68, C- 64, D+ 60, D 55, D- 50, F <50.
 */
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

export const DEFAULT_CREDIT_HOURS = 3;

/**
 * Credit hours per course (normalized lowercase course name).
 * Level 1, both semesters. Mathematics-0 is 0 hours (graduation requirement,
 * excluded from the GPA). Higher levels are mostly 3 hours — extend as needed.
 */
export const CREDIT_HOURS: Record<string, number> = {
  // Level 1 — Semester 1
  "computer fundamentals": 3,
  "introduction to linear algebra": 3,
  "english language": 2,
  "electric circuits": 3,
  "structured programming": 3,
  "mathematics-1": 2,
  "mathematics-0": 0,
  "probability & statistics-1": 2,
  // Level 1 — Semester 2
  "concepts in artificial intelligence": 2,
  "introduction to programming with python": 3,
  "probability & statistics 2": 2,
  "scientific thinking": 3,
  "societal issues": 3,
  "logic design": 2,
  "numerical analysis": 3,
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
