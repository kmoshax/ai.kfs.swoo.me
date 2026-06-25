import {
  cacheGrades,
  clearSeed,
  getSeed,
  seedToForm,
} from "@/server/kfs/cache";
import { computeGpa } from "@/server/kfs/gpa";
import { submitNewresult } from "@/server/kfs/scraper";
import type { LookupResult } from "@/shared/types";
import { LookupError, SeedExpired } from "./errors";
import { resolveIdentity } from "./identity";

export async function fetchFreshGrades(
  nationalId: string,
): Promise<LookupResult> {
  const identity = await resolveIdentity(nationalId);

  const seed = await getSeed("newresult");
  if (!seed) throw new SeedExpired("newresult");

  const res = await submitNewresult(
    seedToForm(seed),
    identity.code,
    identity.password,
    seed.captchaText,
  );
  if (!res.ok) {
    if (res.reason === "captcha" || res.reason === "unknown") {
      await clearSeed("newresult");
      throw new SeedExpired("newresult");
    }
    throw new LookupError(res.reason, res.message);
  }

  const result: LookupResult = {
    identity,
    transcript: res.transcript,
    gpa: computeGpa(res.transcript.courses),
    fetchedAt: Date.now(),
    cached: false,
  };
  await cacheGrades(nationalId, result);
  return result;
}
