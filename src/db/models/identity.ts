import { type Model, model, models, Schema } from "mongoose";
import type { Identity } from "@/types";

export type IdentityDoc = Identity & { _id: string };

const IdentitySchema = new Schema<IdentityDoc>(
  {
    _id: { type: String, required: true },
    name: String,
    code: String,
    password: String,
    email: { type: String, default: null },
  },
  { versionKey: false, minimize: false, collection: "identities" },
);

export const IdentityModel: Model<IdentityDoc> =
  (models.Identity as Model<IdentityDoc>) ??
  model<IdentityDoc>("Identity", IdentitySchema);
