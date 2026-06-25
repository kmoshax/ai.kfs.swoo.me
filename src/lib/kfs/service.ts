/**
 * Orchestrates the lookup wizard on top of the raw KFS flow + caches.
 *
 * The student only ever solves a captcha that the KFS site itself produced —
 * we never try to read it. Caching keeps the number of captchas minimal:
 *   - grades cached  -> 0 captchas
 *   - identity cached -> 1 captcha (grades only)
 *   - cold           -> 2 captchas (identify, then grades)
 */

import { computeGpa } from "./gpa";
import {
  startGetmail,
  startNewresult,
  submitGetmail,
  submitNewresult,
} from "./kfs";
import {
  cacheGrades,
  cacheIdentity,
  dropSession,
  getCachedGrades,
  getCachedIdentity,
  getSession,
  type LookupResult,
  newSid,
  putSession,
} from "./store";

export type Step =
  | { step: "identify"; sid: string; captcha: string; error?: "captcha" }
  | {
      step: "grades";
      sid: string;
      captcha: string;
      studentName?: string;
      error?: "captcha";
    }
  | { step: "done"; result: LookupResult }
  | { step: "error"; reason: string; message?: string };

async function openGrades(
  nationalId: string,
  identity: {
    name: string;
    code: string;
    password: string;
    email: string | null;
  },
): Promise<Step> {
  const form = await startNewresult();
  const sid = newSid();
  putSession({
    sid,
    stage: "grades",
    nationalId,
    form,
    identity,
    createdAt: Date.now(),
  });
  return {
    step: "grades",
    sid,
    captcha: form.captcha,
    studentName: identity.name,
  };
}

/** Entry point: given a national id, decide what the student must do next. */
export async function begin(nationalId: string): Promise<Step> {
  const cachedGrades = getCachedGrades(nationalId);
  if (cachedGrades)
    return { step: "done", result: { ...cachedGrades, cached: true } };

  const identity = getCachedIdentity(nationalId);
  if (identity) return openGrades(nationalId, identity);

  const form = await startGetmail();
  const sid = newSid();
  putSession({
    sid,
    stage: "identify",
    nationalId,
    form,
    createdAt: Date.now(),
  });
  return { step: "identify", sid, captcha: form.captcha };
}

/** Submit the getmail captcha, then move on to the grades captcha. */
export async function identify(sid: string, captcha: string): Promise<Step> {
  const session = getSession(sid);
  if (!session || session.stage !== "identify")
    return {
      step: "error",
      reason: "session",
      message: "انتهت الجلسة، حاول من جديد",
    };

  const res = await submitGetmail(session.form, session.nationalId, captcha);
  if (!res.ok) {
    if (res.reason === "captcha") {
      const form = await startGetmail();
      session.form = form;
      putSession(session);
      return { step: "identify", sid, captcha: form.captcha, error: "captcha" };
    }
    dropSession(sid);
    return {
      step: "error",
      reason: res.reason,
      message: res.message ?? "تعذّر العثور على الطالب",
    };
  }

  cacheIdentity(session.nationalId, res.identity);
  dropSession(sid);
  return openGrades(session.nationalId, res.identity);
}

/** Submit the grades captcha and produce the final transcript + GPA. */
export async function grades(sid: string, captcha: string): Promise<Step> {
  const session = getSession(sid);
  if (!session || session.stage !== "grades" || !session.identity)
    return {
      step: "error",
      reason: "session",
      message: "انتهت الجلسة، حاول من جديد",
    };

  const { code, password } = session.identity;
  const res = await submitNewresult(session.form, code, password, captcha);
  if (!res.ok) {
    if (res.reason === "captcha") {
      const form = await startNewresult();
      session.form = form;
      putSession(session);
      return {
        step: "grades",
        sid,
        captcha: form.captcha,
        studentName: session.identity.name,
        error: "captcha",
      };
    }
    dropSession(sid);
    return {
      step: "error",
      reason: res.reason,
      message: res.message ?? "تعذّر جلب الدرجات",
    };
  }

  const gpa = computeGpa(res.transcript.courses);
  const result: LookupResult = {
    identity: session.identity,
    transcript: res.transcript,
    gpa,
    fetchedAt: Date.now(),
    cached: false,
  };
  cacheGrades(session.nationalId, result);
  dropSession(sid);
  return { step: "done", result };
}
