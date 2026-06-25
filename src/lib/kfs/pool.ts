/**
 * Shared captcha-free credential pool.
 *
 * The KFS captcha is fixed per ASP.NET session and the same (cookie, captcha,
 * viewstate) tuple can be POSTed any number of times. So instead of asking
 * every student to solve a captcha, we solve ONE captcha per page, store the
 * tuple, and reuse it for everyone. Students then only type their national ID.
 *
 * Storage is MongoDB when `MONGODB_URI` is set, else an on-disk JSON file.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { COLLECTIONS, getDb } from "./db";
import type { FormState } from "./kfs";

export type Page = "getmail" | "newresult";

export interface Seed {
  cookies: Record<string, string>;
  viewState: string;
  viewStateGenerator: string;
  eventValidation: string;
  captchaText: string;
  seededAt: number;
}

const SEED_FILE = join(process.cwd(), ".kfs-seeds.json");
type SeedMap = Partial<Record<Page, Seed>>;

const g = globalThis as typeof globalThis & { __kfsSeeds?: SeedMap };

function diskLoad(): SeedMap {
  if (g.__kfsSeeds) return g.__kfsSeeds;
  let seeds: SeedMap = {};
  try {
    seeds = JSON.parse(readFileSync(SEED_FILE, "utf8"));
  } catch {
    seeds = {};
  }
  g.__kfsSeeds = seeds;
  return seeds;
}

function diskPersist(): void {
  try {
    writeFileSync(SEED_FILE, JSON.stringify(diskLoad(), null, 2));
  } catch {
    // best-effort
  }
}

type SeedDoc = Seed & { _id: Page };

export async function getSeed(page: Page): Promise<Seed | undefined> {
  const db = await getDb();
  if (db) {
    const doc = await db
      .collection<SeedDoc>(COLLECTIONS.seeds)
      .findOne({ _id: page });
    if (!doc) return undefined;
    const { _id, ...seed } = doc;
    return seed;
  }
  return diskLoad()[page];
}

export async function setSeed(page: Page, seed: Seed): Promise<void> {
  const db = await getDb();
  if (db) {
    await db
      .collection<SeedDoc>(COLLECTIONS.seeds)
      .updateOne({ _id: page }, { $set: seed }, { upsert: true });
    return;
  }
  diskLoad()[page] = seed;
  diskPersist();
}

export async function clearSeed(page: Page): Promise<void> {
  const db = await getDb();
  if (db) {
    await db.collection<SeedDoc>(COLLECTIONS.seeds).deleteOne({ _id: page });
    return;
  }
  delete diskLoad()[page];
  diskPersist();
}

/** One-time copy of on-disk seeds into Mongo (only fills missing pages). */
export async function migrateSeedsToDb(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  let disk: SeedMap = {};
  try {
    disk = JSON.parse(readFileSync(SEED_FILE, "utf8"));
  } catch {
    return;
  }
  const coll = db.collection<SeedDoc>(COLLECTIONS.seeds);
  for (const page of ["getmail", "newresult"] as Page[]) {
    const seed = disk[page];
    if (!seed) continue;
    if (!(await coll.findOne({ _id: page })))
      await coll.updateOne({ _id: page }, { $set: seed }, { upsert: true });
  }
}

/** A Seed is a FormState plus the solved captcha text. */
export function seedToForm(seed: Seed): FormState {
  return {
    cookies: seed.cookies,
    viewState: seed.viewState,
    viewStateGenerator: seed.viewStateGenerator,
    eventValidation: seed.eventValidation,
    captcha: "",
  };
}

export function formToSeed(form: FormState, captchaText: string): Seed {
  return {
    cookies: form.cookies,
    viewState: form.viewState,
    viewStateGenerator: form.viewStateGenerator,
    eventValidation: form.eventValidation,
    captchaText,
    seededAt: Date.now(),
  };
}
