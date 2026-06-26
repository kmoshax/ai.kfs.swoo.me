import type { LookupResult } from "@/types";
import { type GradesDoc, gradesCache } from "./cache-state";
import { COLLECTIONS, getDb } from "./db";
import { diskLoad } from "./disk-store";

export async function getAllGrades(): Promise<LookupResult[]> {
  const db = await getDb();
  if (db) {
    const docs = await db
      .collection<GradesDoc>(COLLECTIONS.grades)
      .find({})
      .toArray();
    return docs.map(({ _id, ...result }) => result);
  }
  diskLoad();
  return [...gradesCache.values()];
}
