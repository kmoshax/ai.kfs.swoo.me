import { NextResponse } from "next/server";
import { startKeepAlive } from "@/server/kfs/service";
import { handleLookup, handleReseed } from "./handlers";
import { lookupRateLimited } from "./rate-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      const limited = await lookupRateLimited(request);
      if (limited) return limited;
      return await handleLookup((body.nationalId ?? "").trim());
    }
    if (body.action === "reseed")
      return await handleReseed(body.seedId, (body.captcha ?? "").trim());
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
