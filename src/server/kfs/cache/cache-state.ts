import { join } from "node:path";
import type { Identity, LookupResult } from "@/types";
import type { ReseedSession } from "./reseed-store";

export const GRADES_TTL = 30 * 24 * 60 * 60 * 1000;
export const RESEED_TTL = 10 * 60 * 1000;
export const CACHE_FILE = join(process.cwd(), ".kfs-cache.json");

export interface Persisted {
  identity: Record<string, Identity>;
  grades: Record<string, LookupResult>;
}

export type IdentityDoc = Identity & { _id: string };
export type GradesDoc = LookupResult & { _id: string };

const g = globalThis as typeof globalThis & {
  __kfsIdentity?: Map<string, Identity>;
  __kfsGrades?: Map<string, LookupResult>;
  __kfsReseeds?: Map<string, ReseedSession>;
  __kfsLoaded?: boolean;
};

g.__kfsIdentity ??= new Map();
g.__kfsGrades ??= new Map();
g.__kfsReseeds ??= new Map();
export const identityCache = g.__kfsIdentity;
export const gradesCache = g.__kfsGrades;
export const reseeds = g.__kfsReseeds;
