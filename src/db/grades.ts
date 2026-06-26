import type { GradesSnapshot, LookupResult } from "@/types";
import { GradesModel } from "./models";

type StoredGrades = LookupResult & {
  _id: string;
  snapshots?: GradesSnapshot[];
};

export async function saveGrades(
  nationalId: string,
  result: LookupResult,
  snapshot: GradesSnapshot,
): Promise<void> {
  await GradesModel.updateOne(
    { _id: nationalId },
    { $set: { ...result, snapshots: [snapshot] } },
    { upsert: true },
  );
}

export async function getGrades(
  nationalId: string,
): Promise<LookupResult | undefined> {
  const doc = await GradesModel.findById(nationalId).lean<StoredGrades>();
  if (!doc) return undefined;
  const { _id, snapshots, ...result } = doc;
  return { ...result, history: snapshots ?? [] };
}

export const peekGrades = getGrades;

export async function dropGrades(nationalId: string): Promise<void> {
  await GradesModel.deleteOne({ _id: nationalId });
}
