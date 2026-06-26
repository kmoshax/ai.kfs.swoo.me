export interface BandSlice {
  label: string;
  color: string;
  count: number;
}

export interface NamedCount {
  label: string;
  count: number;
}

export interface LeaderRow {
  name: string;
  code: string;
  gpa: number;
  faculty: string;
  level: string | null;
}

export interface RecentRow {
  name: string;
  code: string;
  gpa: number | null;
  fetchedAt: number;
}

export interface CourseStat {
  name: string;
  count: number;
  avgScore: number | null;
  passRate: number | null;
}

export interface Insights {
  generatedAt: number;
  totalStudents: number;
  withGpa: number;
  avgGpa: number | null;
  medianGpa: number | null;
  topGpa: number | null;
  totalCourses: number;
  distinctCourses: number;
  bands: BandSlice[];
  faculties: NamedCount[];
  levels: NamedCount[];
  grades: NamedCount[];
  leaderboard: LeaderRow[];
  hardestCourses: CourseStat[];
  popularCourses: CourseStat[];
  recent: RecentRow[];
}
