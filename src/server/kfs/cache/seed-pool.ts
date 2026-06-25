import type { Page } from "@/shared/types";
import { COLLECTIONS, getDb } from "./db";
import { diskLoad, diskPersist, type Seed, type SeedDoc } from "./seed-state";

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
