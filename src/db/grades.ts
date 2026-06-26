import type { LookupResult } from "@/types";
import { GradesModel } from "./models";

export async function saveGrades(
  nationalId: string,
  result: LookupResult,
): Promise<void> {
  await GradesModel.updateOne(
    { _id: nationalId },
    { $set: result },
    { upsert: true },
  );
}

export async function getGrades(
  nationalId: string,
): Promise<LookupResult | undefined> {
  const doc = await GradesModel.findById(nationalId).lean<
    LookupResult & { _id: string }
  >();
  if (!doc) return undefined;
  const { _id, ...result } = doc;
  return result;
}

export const peekGrades = getGrades;

export async function dropGrades(nationalId: string): Promise<void> {
  await GradesModel.deleteOne({ _id: nationalId });
}
