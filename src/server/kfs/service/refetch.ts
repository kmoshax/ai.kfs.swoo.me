import { appendSnapshot, getGrades, touchGrades } from "@/db";
import { sameTranscript, toSnapshot } from "@/server/kfs/history";
import type { LookupResult } from "@/types";
import { buildFreshResult } from "./fetch-fresh";
import { fromCache } from "./from-cache";

export async function refetchGrades(
  nationalId: string,
  stored: LookupResult,
): Promise<LookupResult> {
  const fresh = await buildFreshResult(nationalId);

  if (!sameTranscript(fresh.transcript, stored.transcript)) {
    const baseline =
      (stored.history?.length ?? 0) === 0 ? toSnapshot(stored) : undefined;
    await appendSnapshot(nationalId, toSnapshot(fresh), baseline);
  }
  await touchGrades(nationalId, fresh);

  const merged = await getGrades(nationalId);
  return merged ? { ...fromCache(merged), cached: false } : fresh;
}
