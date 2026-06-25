import { NextResponse } from "next/server";
import {
  completeReseed,
  LookupError,
  lookupGrades,
  SeedExpired,
  startKeepAlive,
  startReseed,
} from "@/lib/kfs/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Keep the shared seeds warm as soon as the server is touched.
startKeepAlive();

type Body =
  | { action: "lookup"; nationalId: string }
  | { action: "reseed"; seedId: string; captcha: string };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, reason: "bad_request" },
      { status: 400 },
    );
  }

  try {
    if (body.action === "lookup") {
      const nid = (body.nationalId ?? "").trim();
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

    if (body.action === "reseed") {
      const res = await completeReseed(
        body.seedId,
        (body.captcha ?? "").trim(),
      );
      if (res.ok) return NextResponse.json({ ok: true });
      // Same session = same captcha, so a wrong code needs a brand-new image.
      if (res.reason === "captcha" || res.reason === "session") {
        return NextResponse.json({ ok: false, reason: res.reason });
      }
      return NextResponse.json({ ok: false, reason: res.reason ?? "unknown" });
    }

    return NextResponse.json(
      { ok: false, reason: "bad_request" },
      { status: 400 },
    );
  } catch (err) {
    console.error("[lookup]", err);
    return NextResponse.json({
      ok: false,
      reason: "upstream",
      message: "تعذّر الاتصال بنظام الجامعة، حاول بعد قليل",
    });
  }
}
