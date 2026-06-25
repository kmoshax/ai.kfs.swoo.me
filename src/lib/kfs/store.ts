/**
 * Caches + short-lived sessions for the captcha-free lookup.
 *
 *  - identity: national-id -> code/password (stable forever).
 *  - grades:   national-id -> finished result.
 *  - reseeds:  short-lived pending re-seed sessions (always in-memory).
 *
 * The university caps how many times each student may VIEW their result, so we
 * persist identity + grades and refetch a given student rarely. Storage is
 * MongoDB when `MONGODB_URI` is set, else in-memory + an on-disk JSON file.
 *
 * Note: we only ever store the *result-system* password (needed for the grades
 * request). The student's email-account password is never parsed or stored.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { COLLECTIONS, getDb } from "./db";
import type { GpaResult } from "./gpa";
import type { FormState, Identity, Transcript } from "./kfs";
import type { Page } from "./pool";

export interface LookupResult {
  identity: Identity;
  transcript: Transcript;
  gpa: GpaResult;
  fetchedAt: number;
  cached: boolean;
}

export interface ReseedSession {
  seedId: string;
  page: Page;
  form: FormState;
  createdAt: number;
}

// Grades barely change within a term; keep them long so we never waste a view.
const GRADES_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
const RESEED_TTL = 10 * 60 * 1000;
const CACHE_FILE = join(process.cwd(), ".kfs-cache.json");

interface Persisted {
  identity: Record<string, Identity>;
  grades: Record<string, LookupResult>;
}

type IdentityDoc = Identity & { _id: string };
type GradesDoc = LookupResult & { _id: string };

const g = globalThis as typeof globalThis & {
  __kfsIdentity?: Map<string, Identity>;
  __kfsGrades?: Map<string, LookupResult>;
  __kfsReseeds?: Map<string, ReseedSession>;
  __kfsLoaded?: boolean;
};

g.__kfsIdentity ??= new Map();
g.__kfsGrades ??= new Map();
g.__kfsReseeds ??= new Map();
const identityCache = g.__kfsIdentity;
const gradesCache = g.__kfsGrades;
const reseeds = g.__kfsReseeds;

function diskLoad(): void {
  if (g.__kfsLoaded) return;
  g.__kfsLoaded = true;
  try {
    const data: Persisted = JSON.parse(readFileSync(CACHE_FILE, "utf8"));
    for (const [k, v] of Object.entries(data.identity ?? {}))
      identityCache.set(k, v);
    for (const [k, v] of Object.entries(data.grades ?? {}))
      gradesCache.set(k, v);
  } catch {
    // no cache yet
  }
}

function diskPersist(): void {
  try {
    const data: Persisted = {
      identity: Object.fromEntries(identityCache),
      grades: Object.fromEntries(gradesCache),
    };
    writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch {
    // best-effort
  }
}

export function newSid(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

// ---- identity ----------------------------------------------------------

export async function cacheIdentity(
  nationalId: string,
  id: Identity,
): Promise<void> {
  const db = await getDb();
  if (db) {
    await db
      .collection<IdentityDoc>(COLLECTIONS.identities)
      .updateOne({ _id: nationalId }, { $set: id }, { upsert: true });
    return;
  }
  diskLoad();
  identityCache.set(nationalId, id);
  diskPersist();
}

export async function getCachedIdentity(
  nationalId: string,
): Promise<Identity | undefined> {
  const db = await getDb();
  if (db) {
    const doc = await db
      .collection<IdentityDoc>(COLLECTIONS.identities)
      .findOne({ _id: nationalId });
    if (!doc) return undefined;
    const { _id, ...id } = doc;
    return id;
  }
  diskLoad();
  return identityCache.get(nationalId);
}

// ---- grades ------------------------------------------------------------

export async function cacheGrades(
  nationalId: string,
  result: LookupResult,
): Promise<void> {
  const db = await getDb();
  if (db) {
    await db
      .collection<GradesDoc>(COLLECTIONS.grades)
      .updateOne({ _id: nationalId }, { $set: result }, { upsert: true });
    return;
  }
  diskLoad();
  gradesCache.set(nationalId, result);
  diskPersist();
}

export async function getCachedGrades(
  nationalId: string,
): Promise<LookupResult | undefined> {
  const db = await getDb();
  if (db) {
    const coll = db.collection<GradesDoc>(COLLECTIONS.grades);
    const doc = await coll.findOne({ _id: nationalId });
    if (!doc) return undefined;
    if (Date.now() - doc.fetchedAt > GRADES_TTL) {
      await coll.deleteOne({ _id: nationalId });
      return undefined;
    }
    const { _id, ...result } = doc;
    return result;
  }
  diskLoad();
  const r = gradesCache.get(nationalId);
  if (!r) return undefined;
  if (Date.now() - r.fetchedAt > GRADES_TTL) {
    gradesCache.delete(nationalId);
    diskPersist();
    return undefined;
  }
  return r;
}

export async function dropCachedGrades(nationalId: string): Promise<void> {
  const db = await getDb();
  if (db) {
    await db
      .collection<GradesDoc>(COLLECTIONS.grades)
      .deleteOne({ _id: nationalId });
    return;
  }
  diskLoad();
  gradesCache.delete(nationalId);
  diskPersist();
}

/** One-time copy of the on-disk identity/grades cache into Mongo. */
export async function migrateCacheToDb(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  let data: Persisted;
  try {
    data = JSON.parse(readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return;
  }
  const idColl = db.collection<IdentityDoc>(COLLECTIONS.identities);
  for (const [nid, id] of Object.entries(data.identity ?? {})) {
    if (!(await idColl.findOne({ _id: nid })))
      await idColl.updateOne({ _id: nid }, { $set: id }, { upsert: true });
  }
  const grColl = db.collection<GradesDoc>(COLLECTIONS.grades);
  for (const [nid, gr] of Object.entries(data.grades ?? {})) {
    if (!(await grColl.findOne({ _id: nid })))
      await grColl.updateOne({ _id: nid }, { $set: gr }, { upsert: true });
  }
}

// ---- reseed sessions (always in-memory, short-lived) -------------------

export function putReseed(s: ReseedSession): void {
  const now = Date.now();
  for (const [k, v] of reseeds)
    if (now - v.createdAt > RESEED_TTL) reseeds.delete(k);
  reseeds.set(s.seedId, s);
}
export function getReseed(seedId: string): ReseedSession | undefined {
  const s = reseeds.get(seedId);
  if (!s) return undefined;
  if (Date.now() - s.createdAt > RESEED_TTL) {
    reseeds.delete(seedId);
    return undefined;
  }
  return s;
}
export function dropReseed(seedId: string): void {
  reseeds.delete(seedId);
}
