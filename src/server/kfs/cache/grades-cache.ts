import type { LookupResult } from "@/types";
import { GRADES_TTL, type GradesDoc, gradesCache } from "./cache-state";
import { COLLECTIONS, getDb } from "./db";
import { diskLoad, diskPersist } from "./disk-store";

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
