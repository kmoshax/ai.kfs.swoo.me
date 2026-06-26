import { setSeed } from "@/db";
import { startGetmail, startNewresult } from "@/server/kfs/scraper";
import {
  dropReseed,
  formToSeed,
  getReseed,
  newSid,
  putReseed,
} from "@/server/kfs/session";
import type { Page } from "@/types";
import { verifySeed } from "./verify";

export async function startReseed(
  page: Page,
): Promise<{ seedId: string; captcha: string }> {
  const form =
    page === "getmail" ? await startGetmail() : await startNewresult();
  const seedId = newSid();
  putReseed({ seedId, page, form, createdAt: Date.now() });
  return { seedId, captcha: form.captcha };
}

export async function completeReseed(
  seedId: string,
  captchaText: string,
): Promise<{ ok: boolean; reason?: string }> {
  const r = getReseed(seedId);
  if (!r) return { ok: false, reason: "session" };

  const verdict = await verifySeed(r.page, r.form, captchaText);
  if (!verdict.ok) return verdict;

  await setSeed(r.page, formToSeed(r.form, captchaText));
  dropReseed(seedId);
  return { ok: true };
}
