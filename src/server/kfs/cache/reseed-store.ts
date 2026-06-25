import type { FormState } from "@/server/kfs/scraper";
import type { Page } from "@/shared/types";
import { RESEED_TTL, reseeds } from "./cache-state";

export interface ReseedSession {
  seedId: string;
  page: Page;
  form: FormState;
  createdAt: number;
}

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
