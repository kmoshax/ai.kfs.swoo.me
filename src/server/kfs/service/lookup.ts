import { getGrades, peekGrades } from "@/db";
import type { LookupResult } from "@/types";
import { SeedExpired } from "./errors";
import { fetchFreshGrades } from "./fetch-fresh";
import { ensureInit } from "./init";

export async function lookupGrades(nationalId: string): Promise<LookupResult> {
  await ensureInit();
  const stored = await getGrades(nationalId);
  if (stored) return { ...stored, cached: true };

  try {
    return await fetchFreshGrades(nationalId);
  } catch (err) {
    if (err instanceof SeedExpired) {
      const stale = await peekGrades(nationalId);
      if (stale) return { ...stale, cached: true };
    }
    throw err;
  }
}
