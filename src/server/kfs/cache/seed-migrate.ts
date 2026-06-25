import { readFileSync } from "node:fs";
import type { Page } from "@/types";
import { COLLECTIONS, getDb } from "./db";
import { SEED_FILE, type SeedDoc, type SeedMap } from "./seed-state";

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
