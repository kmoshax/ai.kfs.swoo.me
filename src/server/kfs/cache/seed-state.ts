import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@/types";

export interface Seed {
  cookies: Record<string, string>;
  viewState: string;
  viewStateGenerator: string;
  eventValidation: string;
  captchaText: string;
  seededAt: number;
}

export const SEED_FILE = join(process.cwd(), ".kfs-seeds.json");
export type SeedMap = Partial<Record<Page, Seed>>;
export type SeedDoc = Seed & { _id: Page };

const g = globalThis as typeof globalThis & { __kfsSeeds?: SeedMap };

export function diskLoad(): SeedMap {
  if (g.__kfsSeeds) return g.__kfsSeeds;
  let seeds: SeedMap = {};
  try {
    seeds = JSON.parse(readFileSync(SEED_FILE, "utf8"));
  } catch {
    seeds = {};
  }
  g.__kfsSeeds = seeds;
  return seeds;
}

export function diskPersist(): void {
  try {
    writeFileSync(SEED_FILE, JSON.stringify(diskLoad(), null, 2));
  } catch {}
}
