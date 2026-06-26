import { getGrades, peekGrades } from "@/db";
import { shouldRefetch } from "@/server/kfs/history";
import type { LookupResult } from "@/types";
import { SeedExpired } from "./errors";
import { fetchFreshGrades } from "./fetch-fresh";
import { fromCache } from "./from-cache";
import { ensureInit } from "./init";
import { refetchGrades } from "./refetch";

export async function lookupGrades(nationalId: string): Promise<LookupResult> {
  await ensureInit();
  const stored = await getGrades(nationalId);

  if (stored) {
    if (!shouldRefetch(stored.fetchedAt, Date.now())) return fromCache(stored);
    try {
      return await refetchGrades(nationalId, stored);
    } catch {
      return fromCache(stored);
    }
  }

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
