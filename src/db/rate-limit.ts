import { RateLimitModel } from "./models";

export async function hitRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  try {
    const bucket = Math.floor(Date.now() / windowMs);
    const expiresAt = new Date((bucket + 1) * windowMs);
    const doc = await RateLimitModel.findOneAndUpdate(
      { _id: `${key}:${bucket}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, new: true },
    ).lean<{ count: number }>();
    return (doc?.count ?? 1) <= limit;
  } catch {
    return true;
  }
}
