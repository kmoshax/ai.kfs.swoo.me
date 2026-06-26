import { NextResponse } from "next/server";
import { hitRateLimit } from "@/db";
import { clientIp } from "./client-ip";

const LIMIT = 60;
const WINDOW_MS = 60_000;

export async function lookupRateLimited(
  req: Request,
): Promise<NextResponse | null> {
  const ok = await hitRateLimit(`lookup:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (ok) return null;
  return NextResponse.json(
    {
      ok: false,
      reason: "rate_limited",
      message: "Too many requests. Please wait a moment and try again.",
    },
    { status: 429 },
  );
}
