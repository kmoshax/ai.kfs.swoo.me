/**
 * Captcha-free grade lookup.
 *
 * Students type only their national ID. The two upstream captchas are solved
 * once and stored as shared seeds (see pool.ts); every lookup reuses them. A
 * keep-alive loop pings both seeds so their ASP.NET sessions never time out.
 * If a seed does die, `SeedExpired` is thrown and the API drives a one-time
 * re-seed (a single captcha that revives the seed for everyone).
 */
import { computeGpa } from "./gpa";
import {
  type FormState,
  type Identity,
  startGetmail,
  startNewresult,
  submitGetmail,
  submitNewresult,
} from "./kfs";
import {
  clearSeed,
  formToSeed,
  getSeed,
  migrateSeedsToDb,
  type Page,
  seedToForm,
  setSeed,
} from "./pool";
import {
  cacheGrades,
  cacheIdentity,
  dropReseed,
  getCachedGrades,
  getCachedIdentity,
  getReseed,
  type LookupResult,
  migrateCacheToDb,
  newSid,
  peekCachedGrades,
  putReseed,
} from "./store";

// A real, known-good student used to health-check / verify seeds.
const PROBE = {
  nationalId: "30704071501452",
  code: "1620120250100828",
  password: "333613",
};

export class SeedExpired extends Error {
  constructor(public page: Page) {
    super(`seed expired: ${page}`);
  }
}
export class LookupError extends Error {
  constructor(
    public reason: string,
    message?: string,
  ) {
    super(message ?? reason);
  }
}

async function resolveIdentity(nationalId: string): Promise<Identity> {
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
    // A dead session returns a captcha error or an ASP "Runtime Error" page
    // (reason "unknown"); both mean the seed must be revived.
    if (res.reason === "captcha" || res.reason === "unknown") {
      await clearSeed("getmail");
      throw new SeedExpired("getmail");
    }
    throw new LookupError(res.reason, res.message);
  }
  await cacheIdentity(nationalId, res.identity);
  return res.identity;
}

const gi = globalThis as typeof globalThis & { __kfsInit?: Promise<void> };

/** Run the one-time disk -> Mongo migration once, before serving lookups. */
function ensureInit(): Promise<void> {
  gi.__kfsInit ??= Promise.all([migrateSeedsToDb(), migrateCacheToDb()])
    .then(() => {})
    .catch(() => {});
  return gi.__kfsInit;
}

/** Main entry: national ID -> grades + GPA, no captcha. */
export async function lookupGrades(nationalId: string): Promise<LookupResult> {
  await ensureInit();
  const cached = await getCachedGrades(nationalId);
  if (cached) return { ...cached, cached: true };

  try {
    return await fetchFreshGrades(nationalId);
  } catch (err) {
    // A student already in the DB should never be sent to a captcha. If the
    // shared seed is dead, serve their stored copy (even past its TTL) instead.
    if (err instanceof SeedExpired) {
      const stale = await peekCachedGrades(nationalId);
      if (stale) return { ...stale, cached: true };
    }
    throw err;
  }
}

/** Hit the upstream system for a student not served from cache. */
async function fetchFreshGrades(nationalId: string): Promise<LookupResult> {
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

// ---- Re-seeding (only when a seed dies) --------------------------------

/** Open a fresh upstream session and hand its captcha image to be solved. */
export async function startReseed(
  page: Page,
): Promise<{ seedId: string; captcha: string }> {
  const form =
    page === "getmail" ? await startGetmail() : await startNewresult();
  const seedId = newSid();
  putReseed({ seedId, page, form, createdAt: Date.now() });
  return { seedId, captcha: form.captcha };
}

/** Verify a solved captcha against the probe student, then store the seed. */
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

async function verifySeed(
  page: Page,
  form: FormState,
  captchaText: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (page === "getmail") {
    const res = await submitGetmail(form, PROBE.nationalId, captchaText);
    return res.ok ? { ok: true } : { ok: false, reason: res.reason };
  }
  const res = await submitNewresult(
    form,
    PROBE.code,
    PROBE.password,
    captchaText,
  );
  // `view_limit` means login (captcha + code/pass) was accepted — the seed is
  // alive; only the probe student's view quota is spent. That's a perfect
  // health signal that never burns a real student's quota.
  if (res.ok || res.reason === "view_limit") return { ok: true };
  return { ok: false, reason: res.reason };
}

export async function seedStatus(): Promise<Record<Page, boolean>> {
  const [getmail, newresult] = await Promise.all([
    getSeed("getmail"),
    getSeed("newresult"),
  ]);
  return { getmail: !!getmail, newresult: !!newresult };
}

// ---- Keep-alive --------------------------------------------------------

const gk = globalThis as typeof globalThis & { __kfsKeepAlive?: boolean };
const KEEPALIVE_MS = 4 * 60 * 1000; // < ASP.NET 20-min sliding timeout

async function ping(page: Page): Promise<void> {
  const seed = await getSeed(page);
  if (!seed) return;
  // The probe student is always valid, so any failure means the seed is dead.
  const verdict = await verifySeed(page, seedToForm(seed), seed.captchaText);
  if (!verdict.ok) await clearSeed(page);
}

export function startKeepAlive(): void {
  if (gk.__kfsKeepAlive) return;
  gk.__kfsKeepAlive = true;
  // Seed Mongo from any local files on first boot, then keep sessions warm.
  void ensureInit();
  const timer = setInterval(() => {
    void ping("getmail");
    void ping("newresult");
  }, KEEPALIVE_MS);
  timer.unref?.();
}
