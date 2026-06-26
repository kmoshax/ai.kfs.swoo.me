export interface Identity {
  name: string;
  code: string;
  password: string;
  email: string | null;
}

export interface Course {
  name: string;
  score: number | null;
  grade: string;
}

export interface Transcript {
  faculty: string | null;
  level: string | null;
  section: string | null;
  name: string | null;
  code: string | null;
  nationalId: string | null;
  courses: Course[];
}

export type Program = "general" | "bio";

export interface CourseComputed extends Course {
  creditHours: number;
  creditHoursKnown: boolean;
  points: number | null;
  training?: boolean;
}

export interface GpaResult {
  courses: CourseComputed[];
  totalCreditHours: number;
  gpa: number | null;
  provisional: boolean;
  program: Program;
}

export interface GradesSnapshot {
  fetchedAt: number;
  level: string | null;
  transcript: Transcript;
  gpa: GpaResult;
}

export interface LookupResult {
  identity: Identity;
  transcript: Transcript;
  gpa: GpaResult;
  fetchedAt: number;
  cached: boolean;
  history?: GradesSnapshot[];
}
