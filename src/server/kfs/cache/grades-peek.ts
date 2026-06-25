import type { LookupResult } from "@/types";
import { type GradesDoc, gradesCache } from "./cache-state";
import { COLLECTIONS, getDb } from "./db";
import { diskLoad, diskPersist } from "./disk-store";

export async function peekCachedGrades(
  nationalId: string,
): Promise<LookupResult | undefined> {
  const db = await getDb();
  if (db) {
    const doc = await db
      .collection<GradesDoc>(COLLECTIONS.grades)
      .findOne({ _id: nationalId });
    if (!doc) return undefined;
    const { _id, ...result } = doc;
    return result;
  }
  diskLoad();
  return gradesCache.get(nationalId);
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
