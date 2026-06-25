import { NextResponse } from "next/server";
import {
  LookupError,
  lookupGrades,
  SeedExpired,
  startReseed,
} from "@/server/kfs/service";

export async function handleLookup(nid: string): Promise<NextResponse> {
  if (!/^\d{14}$/.test(nid))
    return NextResponse.json({
      ok: false,
      reason: "invalid_id",
      message: "الرقم القومي لازم يكون ١٤ رقم",
    });
  try {
    const result = await lookupGrades(nid);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    if (err instanceof SeedExpired) {
      const { seedId, captcha } = await startReseed(err.page);
      return NextResponse.json({
        ok: false,
        reason: "reseed",
        page: err.page,
        seedId,
        captcha,
      });
    }
    if (err instanceof LookupError)
      return NextResponse.json({
        ok: false,
        reason: err.reason,
        message: err.message,
      });
    throw err;
  }
}
