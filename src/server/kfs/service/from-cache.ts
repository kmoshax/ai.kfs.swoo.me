import { computeGpa, detectProgram } from "@/server/kfs/gpa";
import type { GradesSnapshot, LookupResult } from "@/types";

function recompute(snapshot: GradesSnapshot): GradesSnapshot {
  return {
    ...snapshot,
    gpa: computeGpa(
      snapshot.transcript.courses,
      detectProgram(snapshot.transcript),
    ),
  };
}

export function fromCache(stored: LookupResult): LookupResult {
  return {
    ...stored,
    gpa: computeGpa(
      stored.transcript.courses,
      detectProgram(stored.transcript),
    ),
    history: (stored.history ?? []).map(recompute),
    cached: true,
  };
}
