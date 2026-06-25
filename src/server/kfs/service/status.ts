import { getSeed } from "@/server/kfs/cache";
import type { Page } from "@/shared/types";

export async function seedStatus(): Promise<Record<Page, boolean>> {
  const [getmail, newresult] = await Promise.all([
    getSeed("getmail"),
    getSeed("newresult"),
  ]);
  return { getmail: !!getmail, newresult: !!newresult };
}
