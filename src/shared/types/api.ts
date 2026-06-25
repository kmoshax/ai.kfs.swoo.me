import type { LookupResult } from "./domain";

export type Page = "getmail" | "newresult";

export type LookupErrorReason =
  | "invalid_id"
  | "not_found"
  | "view_limit"
  | "upstream"
  | "bad_request"
  | "unknown";

export type LookupResponse =
  | { ok: true; result: LookupResult }
  | { ok: false; reason: "reseed"; page: Page; seedId: string; captcha: string }
  | { ok: false; reason: LookupErrorReason; message?: string };

export type ReseedResponse = { ok: true } | { ok: false; reason: string };
