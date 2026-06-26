import type { FormState } from "@/server/kfs/scraper";
import type { Page } from "@/types";

export interface ReseedSession {
  seedId: string;
  page: Page;
  form: FormState;
  createdAt: number;
}

const RESEED_TTL = 10 * 60 * 1000;

const g = globalThis as typeof globalThis & {
  __kfsReseeds?: Map<string, ReseedSession>;
};
g.__kfsReseeds ??= new Map();
const reseeds = g.__kfsReseeds;

export function putReseed(s: ReseedSession): void {
  const now = Date.now();
  for (const [k, v] of reseeds)
    if (now - v.createdAt > RESEED_TTL) reseeds.delete(k);
  reseeds.set(s.seedId, s);
}

export function getReseed(seedId: string): ReseedSession | undefined {
  const s = reseeds.get(seedId);
  if (!s) return undefined;
  if (Date.now() - s.createdAt > RESEED_TTL) {
    reseeds.delete(seedId);
    return undefined;
  }
  return s;
}

export function dropReseed(seedId: string): void {
  reseeds.delete(seedId);
}
