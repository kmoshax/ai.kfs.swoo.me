import { type Model, model, models, Schema } from "mongoose";
import type { Page } from "@/types";

export interface Seed {
  cookies: Record<string, string>;
  viewState: string;
  viewStateGenerator: string;
  eventValidation: string;
  captchaText: string;
  seededAt: number;
}

export type SeedDoc = Seed & { _id: Page };

const SeedSchema = new Schema<SeedDoc>(
  {
    _id: { type: String, required: true },
    cookies: { type: Schema.Types.Mixed, default: {} },
    viewState: String,
    viewStateGenerator: String,
    eventValidation: String,
    captchaText: String,
    seededAt: Number,
  },
  { versionKey: false, minimize: false, collection: "seeds" },
);

export const SeedModel: Model<SeedDoc> =
  (models.Seed as Model<SeedDoc>) ?? model<SeedDoc>("Seed", SeedSchema);
