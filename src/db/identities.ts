import type { Identity } from "@/types";
import { IdentityModel } from "./models";

export async function saveIdentity(
  nationalId: string,
  id: Identity,
): Promise<void> {
  await IdentityModel.updateOne(
    { _id: nationalId },
    { $set: id },
    { upsert: true },
  );
}

export async function getIdentity(
  nationalId: string,
): Promise<Identity | undefined> {
  const doc = await IdentityModel.findById(nationalId).lean<
    Identity & { _id: string }
  >();
  if (!doc) return undefined;
  const { _id, ...id } = doc;
  return id;
}
