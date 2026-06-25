import { clearSeed, getSeed, seedToForm } from "@/server/kfs/cache";
import type { Page } from "@/types";
import { ensureInit } from "./init";
import { verifySeed } from "./verify";

const gk = globalThis as typeof globalThis & { __kfsKeepAlive?: boolean };
const KEEPALIVE_MS = 4 * 60 * 1000;

async function ping(page: Page): Promise<void> {
  const seed = await getSeed(page);
  if (!seed) return;
  const verdict = await verifySeed(page, seedToForm(seed), seed.captchaText);
  if (!verdict.ok) await clearSeed(page);
}

export function startKeepAlive(): void {
  if (gk.__kfsKeepAlive) return;
  gk.__kfsKeepAlive = true;
  void ensureInit();
  const timer = setInterval(() => {
    void ping("getmail");
    void ping("newresult");
  }, KEEPALIVE_MS);
  timer.unref?.();
}
