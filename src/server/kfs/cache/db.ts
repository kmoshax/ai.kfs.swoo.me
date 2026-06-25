import { type Db, MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "kfs_results";

const g = globalThis as typeof globalThis & {
  __kfsDb?: Promise<Db | null>;
};

export function getDb(): Promise<Db | null> {
  if (!URI) return Promise.resolve(null);
  if (g.__kfsDb) return g.__kfsDb;
  g.__kfsDb = (async () => {
    try {
      const client = new MongoClient(URI);
      await client.connect();
      return client.db(DB_NAME);
    } catch (err) {
      console.error(
        "[kfs] Mongo connection failed, using local fallback:",
        err,
      );
      return null;
    }
  })();
  return g.__kfsDb;
}

export const COLLECTIONS = {
  seeds: "seeds",
  identities: "identities",
  grades: "grades",
} as const;
