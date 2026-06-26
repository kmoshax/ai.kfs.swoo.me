import { clearSeed, getIdentity, getSeed, saveIdentity } from "@/db";
import { submitGetmail } from "@/server/kfs/scraper";
import { seedToForm } from "@/server/kfs/session";
import type { Identity } from "@/types";
import { LookupError, SeedExpired } from "./errors";

export async function resolveIdentity(nationalId: string): Promise<Identity> {
  const stored = await getIdentity(nationalId);
  if (stored) return stored;

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
  await saveIdentity(nationalId, res.identity);
  return res.identity;
}
