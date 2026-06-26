import { clearSeed, getSeed, saveGrades } from "@/db";
import { computeGpa, detectProgram } from "@/server/kfs/gpa";
import { submitNewresult } from "@/server/kfs/scraper";
import { seedToForm } from "@/server/kfs/session";
import type { LookupResult } from "@/types";
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
    gpa: computeGpa(res.transcript.courses, detectProgram(res.transcript)),
    fetchedAt: Date.now(),
    cached: false,
  };
  await saveGrades(nationalId, result);
  return result;
}
