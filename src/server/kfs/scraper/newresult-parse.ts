import type { Transcript } from "@/shared/types";
import { parseTranscript } from "./transcript";

export type GradesResult =
  | { ok: true; transcript: Transcript }
  | {
      ok: false;
      reason: "captcha" | "not_found" | "view_limit" | "unknown";
      message?: string;
    };

export function parseNewresult(html: string): GradesResult {
  const transcript = parseTranscript(html);
  if (transcript.courses.length > 0) return { ok: true, transcript };

  if (/تعديت عدد المرات|عدد المرات المتاحة/.test(html))
    return {
      ok: false,
      reason: "view_limit",
      message: "لقد تعديت عدد مرات الاطلاع على النتيجة المسموح بها",
    };
  if (/برجاء ادخال الكود|الصورة/.test(html))
    return { ok: false, reason: "captcha" };
  if (/الكود او كلمة المرور|غير صحيح/.test(html))
    return { ok: false, reason: "not_found" };
  return { ok: false, reason: "unknown" };
}
