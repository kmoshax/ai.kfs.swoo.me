import {
  cacheIdentity,
  clearSeed,
  getCachedIdentity,
  getSeed,
  seedToForm,
} from "@/server/kfs/cache";
import { submitGetmail } from "@/server/kfs/scraper";
import type { Identity } from "@/types";
import { LookupError, SeedExpired } from "./errors";

export async function resolveIdentity(nationalId: string): Promise<Identity> {
  const cached = await getCachedIdentity(nationalId);
  if (cached) return cached;

  const seed = await getSeed("getmail");
  if (!seed) throw new SeedExpired("getmail");

  const res = await submitGetmail(
    seedToForm(seed),
    nationalId,
    seed.captchaText,
  );
  if (!res.ok) {
    if (res.reason === "captcha" || res.reason === "unknown") {
      await clearSeed("getmail");
      throw new SeedExpired("getmail");
    }
    throw new LookupError(res.reason, res.message);
  }
  await cacheIdentity(nationalId, res.identity);
  return res.identity;
}
