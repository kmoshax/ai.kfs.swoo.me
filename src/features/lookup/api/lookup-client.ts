import type { LookupResponse, ReseedResponse } from "@/types";

export async function api<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}

export function postLookup(nationalId: string) {
  return api<LookupResponse>({ action: "lookup", nationalId });
}

export function postReseed(seedId: string, captcha: string) {
  return api<ReseedResponse>({ action: "reseed", seedId, captcha });
}
