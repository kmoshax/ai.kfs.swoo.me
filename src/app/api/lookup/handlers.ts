import { NextResponse } from "next/server";
import { completeReseed } from "@/server/kfs/service";

export { handleLookup } from "./lookup-handler";

export async function handleReseed(
  seedId: string,
  captcha: string,
): Promise<NextResponse> {
  const res = await completeReseed(seedId, captcha);
  if (res.ok) return NextResponse.json({ ok: true });
  if (res.reason === "captcha" || res.reason === "session") {
    return NextResponse.json({ ok: false, reason: res.reason });
  }
  return NextResponse.json({ ok: false, reason: res.reason ?? "unknown" });
}
