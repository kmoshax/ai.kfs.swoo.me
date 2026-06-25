import {
  type FormState,
  submitGetmail,
  submitNewresult,
} from "@/server/kfs/scraper";
import type { Page } from "@/types";
import { PROBE } from "./probe";

export async function verifySeed(
  page: Page,
  form: FormState,
  captchaText: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (page === "getmail") {
    const res = await submitGetmail(form, PROBE.nationalId, captchaText);
    return res.ok ? { ok: true } : { ok: false, reason: res.reason };
  }
  const res = await submitNewresult(
    form,
    PROBE.code,
    PROBE.password,
    captchaText,
  );
  if (res.ok || res.reason === "view_limit") return { ok: true };
  return { ok: false, reason: res.reason };
}
