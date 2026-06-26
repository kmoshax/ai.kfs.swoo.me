import type { GradesSnapshot, LookupResult } from "@/types";
import { GradesModel } from "./models";

export async function touchGrades(
  nationalId: string,
  latest: LookupResult,
): Promise<void> {
  await GradesModel.updateOne(
    { _id: nationalId },
    {
      $set: {
        transcript: latest.transcript,
        gpa: latest.gpa,
        fetchedAt: latest.fetchedAt,
        cached: false,
      },
    },
  );
}

export async function appendSnapshot(
  nationalId: string,
  snapshot: GradesSnapshot,
  baseline?: GradesSnapshot,
): Promise<void> {
  const items = baseline ? [baseline, snapshot] : [snapshot];
  await GradesModel.updateOne(
    { _id: nationalId },
    { $push: { snapshots: { $each: items } } },
  );
}
