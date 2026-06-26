import { connectDb } from "@/db";

const gi = globalThis as typeof globalThis & { __kfsInit?: Promise<void> };

export function ensureInit(): Promise<void> {
  gi.__kfsInit ??= Promise.resolve(connectDb())
    .then(() => {})
    .catch(() => {});
  return gi.__kfsInit;
}
