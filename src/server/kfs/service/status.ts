import { getSeed } from "@/db";
import type { Page } from "@/types";

export async function seedStatus(): Promise<Record<Page, boolean>> {
  const [getmail, newresult] = await Promise.all([
    getSeed("getmail"),
    getSeed("newresult"),
  ]);
  return { getmail: !!getmail, newresult: !!newresult };
}
