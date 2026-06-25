import { getCachedGrades, peekCachedGrades } from "@/server/kfs/cache";
import type { LookupResult } from "@/shared/types";
import { SeedExpired } from "./errors";
import { fetchFreshGrades } from "./fetch-fresh";
import { ensureInit } from "./init";

export async function lookupGrades(nationalId: string): Promise<LookupResult> {
  await ensureInit();
  const cached = await getCachedGrades(nationalId);
  if (cached) return { ...cached, cached: true };

  try {
    return await fetchFreshGrades(nationalId);
  } catch (err) {
    if (err instanceof SeedExpired) {
      const stale = await peekCachedGrades(nationalId);
      if (stale) return { ...stale, cached: true };
    }
    throw err;
  }
}
