import { type Model, model, models, Schema } from "mongoose";
import type { LookupResult } from "@/types";

export type GradesDoc = LookupResult & { _id: string };

const GradesSchema = new Schema<GradesDoc>(
  { _id: { type: String, required: true } },
  { versionKey: false, minimize: false, strict: false, collection: "grades" },
);

export const GradesModel: Model<GradesDoc> =
  (models.Grades as Model<GradesDoc>) ??
  model<GradesDoc>("Grades", GradesSchema);
