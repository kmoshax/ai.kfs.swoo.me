import type { Course, GradesSnapshot, LookupResult, Transcript } from "@/types";

export function toSnapshot(result: LookupResult): GradesSnapshot {
  return {
    fetchedAt: result.fetchedAt,
    level: result.transcript.level,
    transcript: result.transcript,
    gpa: result.gpa,
  };
}

function courseKey(c: Course): string {
  return `${c.name}|${c.grade}|${c.score}`;
}

export function sameTranscript(a: Transcript, b: Transcript): boolean {
  if (a.courses.length !== b.courses.length) return false;
  const seen = new Set(b.courses.map(courseKey));
  return a.courses.every((c) => seen.has(courseKey(c)));
}
