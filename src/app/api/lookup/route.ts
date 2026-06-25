import { NextResponse } from "next/server";
import { begin, grades, identify, type Step } from "@/lib/kfs/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body =
  | { action: "begin"; nationalId: string }
  | { action: "identify"; sid: string; captcha: string }
  | { action: "grades"; sid: string; captcha: string };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { step: "error", reason: "bad_request" },
      { status: 400 },
    );
  }

  try {
    let step: Step;
    switch (body.action) {
      case "begin": {
        const nid = (body.nationalId ?? "").trim();
        if (!/^\d{14}$/.test(nid))
          return NextResponse.json({
            step: "error",
            reason: "invalid_id",
            message: "الرقم القومي لازم يكون ١٤ رقم",
          });
        step = await begin(nid);
        break;
      }
      case "identify":
        step = await identify(body.sid, (body.captcha ?? "").trim());
        break;
      case "grades":
        step = await grades(body.sid, (body.captcha ?? "").trim());
        break;
      default:
        return NextResponse.json(
          { step: "error", reason: "bad_request" },
          { status: 400 },
        );
    }
    return NextResponse.json(step);
  } catch (err) {
    console.error("[lookup]", err);
    return NextResponse.json({
      step: "error",
      reason: "upstream",
      message: "تعذّر الاتصال بنظام الجامعة، حاول بعد قليل",
    });
  }
}
