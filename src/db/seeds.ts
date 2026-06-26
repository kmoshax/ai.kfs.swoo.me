import type { Page } from "@/types";
import { type Seed, SeedModel } from "./models";

export async function getSeed(page: Page): Promise<Seed | undefined> {
  const doc = await SeedModel.findById(page).lean<Seed & { _id: Page }>();
  if (!doc) return undefined;
  const { _id, ...seed } = doc;
  return seed;
}

export async function setSeed(page: Page, seed: Seed): Promise<void> {
  await SeedModel.updateOne({ _id: page }, { $set: seed }, { upsert: true });
}

export async function clearSeed(page: Page): Promise<void> {
  await SeedModel.deleteOne({ _id: page });
}
