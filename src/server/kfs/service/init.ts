import { migrateCacheToDb, migrateSeedsToDb } from "@/server/kfs/cache";

const gi = globalThis as typeof globalThis & { __kfsInit?: Promise<void> };

export function ensureInit(): Promise<void> {
  gi.__kfsInit ??= Promise.all([migrateSeedsToDb(), migrateCacheToDb()])
    .then(() => {})
    .catch(() => {});
  return gi.__kfsInit;
}
