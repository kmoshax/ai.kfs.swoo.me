import type { Identity } from "@/types";
import { type IdentityDoc, identityCache } from "./cache-state";
import { COLLECTIONS, getDb } from "./db";
import { diskLoad, diskPersist } from "./disk-store";

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
