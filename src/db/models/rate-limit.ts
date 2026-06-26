import { type Model, model, models, Schema } from "mongoose";

export interface RateLimitDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<RateLimitDoc>(
  {
    _id: { type: String, required: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { versionKey: false, collection: "ratelimits" },
);

export const RateLimitModel: Model<RateLimitDoc> =
  (models.RateLimit as Model<RateLimitDoc>) ??
  model<RateLimitDoc>("RateLimit", RateLimitSchema);
