import { readFileSync, writeFileSync } from "node:fs";
import {
  CACHE_FILE,
  gradesCache,
  identityCache,
  type Persisted,
} from "./cache-state";

const g = globalThis as typeof globalThis & { __kfsLoaded?: boolean };

export function diskLoad(): void {
  if (g.__kfsLoaded) return;
  g.__kfsLoaded = true;
  try {
    const data: Persisted = JSON.parse(readFileSync(CACHE_FILE, "utf8"));
    for (const [k, v] of Object.entries(data.identity ?? {}))
      identityCache.set(k, v);
    for (const [k, v] of Object.entries(data.grades ?? {}))
      gradesCache.set(k, v);
  } catch {}
}

export function diskPersist(): void {
  try {
    const data: Persisted = {
      identity: Object.fromEntries(identityCache),
      grades: Object.fromEntries(gradesCache),
    };
    writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch {}
}
