import mongoose from "mongoose";

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "kfs_results";

const g = globalThis as typeof globalThis & {
  __kfsMongoose?: Promise<typeof mongoose> | null;
};

export function connectDb(): Promise<typeof mongoose> | null {
  if (!URI) return null;
  g.__kfsMongoose ??= mongoose
    .connect(URI, { dbName: DB_NAME })
    .catch((err) => {
      g.__kfsMongoose = null;
      throw err;
    });
  return g.__kfsMongoose;
}

connectDb();
