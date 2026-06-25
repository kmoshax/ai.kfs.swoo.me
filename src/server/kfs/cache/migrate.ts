import { readFileSync } from "node:fs";
import {
  CACHE_FILE,
  type GradesDoc,
  type IdentityDoc,
  type Persisted,
} from "./cache-state";
import { COLLECTIONS, getDb } from "./db";

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
