import { getGrades, peekGrades } from "@/db";
import { computeGpa, detectProgram } from "@/server/kfs/gpa";
import type { LookupResult } from "@/types";
import { SeedExpired } from "./errors";
import { fetchFreshGrades } from "./fetch-fresh";
import { ensureInit } from "./init";

function fromCache(stored: LookupResult): LookupResult {
  return {
    ...stored,
    gpa: computeGpa(
      stored.transcript.courses,
      detectProgram(stored.transcript),
    ),
    cached: true,
  };
}

export async function lookupGrades(nationalId: string): Promise<LookupResult> {
  await ensureInit();
  const stored = await getGrades(nationalId);
  if (stored) return fromCache(stored);

  try {
    return await fetchFreshGrades(nationalId);
  } catch (err) {
    if (err instanceof SeedExpired) {
      const stale = await peekGrades(nationalId);
      if (stale) return fromCache(stale);
    }
    throw err;
  }
}
