import type { Identity } from "@/shared/types";
import { cellAfter, decode } from "./html";

export type GetmailResult =
  | { ok: true; identity: Identity }
  | {
      ok: false;
      reason: "captcha" | "not_found" | "unknown";
      message?: string;
    };

export function parseGetmail(html: string): GetmailResult {
  const code = cellAfter(html, "الكود");
  const password = cellAfter(html, "كلمة المرور");
  const name = cellAfter(html, "الاسم");
  if (code && password && name) {
    return {
      ok: true,
      identity: {
        name,
        code,
        password,
        email: cellAfter(html, "البريد الالكتروني"),
      },
    };
  }
  const err = html.match(/lblErrorMsg">([^<]*)/);
  const msg = err ? decode(err[1]) : "";
  if (msg.includes("الصورة"))
    return { ok: false, reason: "captcha", message: msg };
  if (msg) return { ok: false, reason: "not_found", message: msg };
  return { ok: false, reason: "unknown" };
}
