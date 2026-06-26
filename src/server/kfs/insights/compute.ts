import { enFaculty, enLevel, GPA_BANDS } from "@/features/lookup/presentation";
import type { LookupResult } from "@/types";
import { getAllGrades } from "../cache";
import type {
  BandSlice,
  CourseStat,
  Insights,
  LeaderRow,
  NamedCount,
} from "./types";

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function bandFor(gpa: number): (typeof GPA_BANDS)[number] {
  let current: (typeof GPA_BANDS)[number] = GPA_BANDS[0];
  for (const band of GPA_BANDS) if (gpa >= band.min) current = band;
  return current;
}

function tally(entries: string[]): NamedCount[] {
  const map = new Map<string, number>();
  for (const e of entries) map.set(e, (map.get(e) ?? 0) + 1);
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function buildInsights(): Promise<Insights> {
  const all = await getAllGrades();

  const gpas = all.map((r) => r.gpa.gpa).filter((g): g is number => g !== null);

  const bands: BandSlice[] = GPA_BANDS.map((b) => ({
    label: b.label,
    color: b.color,
    count: 0,
  }));
  for (const g of gpas) {
    const band = bandFor(g);
    const slice = bands.find((s) => s.label === band.label);
    if (slice) slice.count += 1;
  }

  const faculties = tally(all.map((r) => enFaculty(r.transcript.faculty)));
  const levels = tally(
    all.map((r) => enLevel(r.transcript.level) ?? "Unknown"),
  );

  const gradeLetters: string[] = [];
  const courseAgg = new Map<
    string,
    { count: number; scoreSum: number; scored: number; passed: number }
  >();
  let totalCourses = 0;

  for (const r of all) {
    for (const c of r.gpa.courses) {
      totalCourses += 1;
      const letter = c.grade.replace(/\s+/g, "").toUpperCase().charAt(0) || "?";
      gradeLetters.push(/[A-F]/.test(letter) ? letter : "?");

      const agg = courseAgg.get(c.name) ?? {
        count: 0,
        scoreSum: 0,
        scored: 0,
        passed: 0,
      };
      agg.count += 1;
      if (c.score !== null) {
        agg.scoreSum += c.score;
        agg.scored += 1;
        if (c.score >= 60) agg.passed += 1;
      }
      courseAgg.set(c.name, agg);
    }
  }

  const courseStats: CourseStat[] = [...courseAgg.entries()].map(
    ([name, a]) => ({
      name,
      count: a.count,
      avgScore: a.scored > 0 ? a.scoreSum / a.scored : null,
      passRate: a.scored > 0 ? a.passed / a.scored : null,
    }),
  );

  const leaderboard: LeaderRow[] = all
    .filter((r) => r.gpa.gpa !== null)
    .sort((a, b) => (b.gpa.gpa ?? 0) - (a.gpa.gpa ?? 0))
    .slice(0, 20)
    .map((r) => ({
      name: r.identity.name,
      code: r.identity.code,
      gpa: r.gpa.gpa as number,
      faculty: enFaculty(r.transcript.faculty),
      level: enLevel(r.transcript.level),
    }));

  const recent = [...all]
    .sort((a, b) => b.fetchedAt - a.fetchedAt)
    .slice(0, 15)
    .map((r) => ({
      name: r.identity.name,
      code: r.identity.code,
      gpa: r.gpa.gpa,
      fetchedAt: r.fetchedAt,
    }));

  const hardestCourses = courseStats
    .filter((c) => c.avgScore !== null && c.count >= 2)
    .sort((a, b) => (a.avgScore as number) - (b.avgScore as number))
    .slice(0, 8);

  const popularCourses = [...courseStats]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const gradeOrder = ["A", "B", "C", "D", "F", "?"];
  const grades = tally(gradeLetters).sort(
    (a, b) => gradeOrder.indexOf(a.label) - gradeOrder.indexOf(b.label),
  );

  return {
    generatedAt: nowFromData(all),
    totalStudents: all.length,
    withGpa: gpas.length,
    avgGpa: gpas.length ? gpas.reduce((s, g) => s + g, 0) / gpas.length : null,
    medianGpa: median(gpas),
    topGpa: gpas.length ? Math.max(...gpas) : null,
    totalCourses,
    distinctCourses: courseAgg.size,
    bands,
    faculties,
    levels,
    grades,
    leaderboard,
    hardestCourses,
    popularCourses,
    recent,
  };
}

// Derive a "generated" timestamp from the freshest record so the page stays
// deterministic without relying on wall-clock side effects during render.
function nowFromData(all: LookupResult[]): number {
  let latest = 0;
  for (const r of all) if (r.fetchedAt > latest) latest = r.fetchedAt;
  return latest;
}
