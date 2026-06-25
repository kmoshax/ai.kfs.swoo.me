/**
 * In-memory state for the lookup wizard.
 *
 * Three things are kept in process memory (swap for Redis/DB to scale out):
 *  - sessions:  short-lived wizard state (cookies + viewstate) keyed by a sid
 *  - identityCache:  national-id -> { code, password } — stable forever, so
 *                    caching it lets repeat students skip the getmail captcha.
 *  - gradesCache:    national-id -> finished result, with a TTL, so re-opening
 *                    within the window needs zero captchas.
 */

import type { GpaResult } from "./gpa";
import type { FormState, Identity, Transcript } from "./kfs";

export type Stage = "identify" | "grades";

export interface WizardSession {
  sid: string;
  stage: Stage;
  nationalId: string;
  form: FormState;
  identity?: Identity;
  createdAt: number;
}

export interface LookupResult {
  identity: Identity;
  transcript: Transcript;
  gpa: GpaResult;
  fetchedAt: number;
  cached: boolean;
}

const SESSION_TTL = 10 * 60 * 1000; // 10 min to finish the wizard
const GRADES_TTL = 30 * 60 * 1000; // 30 min before grades are refetched

const sessions = new Map<string, WizardSession>();
const identityCache = new Map<string, Identity>();
const gradesCache = new Map<string, LookupResult>();

function sweep() {
  const now = Date.now();
  for (const [k, s] of sessions)
    if (now - s.createdAt > SESSION_TTL) sessions.delete(k);
  for (const [k, r] of gradesCache)
    if (now - r.fetchedAt > GRADES_TTL) gradesCache.delete(k);
}

export function newSid(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function putSession(s: WizardSession): void {
  sweep();
  sessions.set(s.sid, s);
}

export function getSession(sid: string): WizardSession | undefined {
  const s = sessions.get(sid);
  if (!s) return undefined;
  if (Date.now() - s.createdAt > SESSION_TTL) {
    sessions.delete(sid);
    return undefined;
  }
  return s;
}

export function dropSession(sid: string): void {
  sessions.delete(sid);
}

export function cacheIdentity(nationalId: string, id: Identity): void {
  identityCache.set(nationalId, id);
}

export function getCachedIdentity(nationalId: string): Identity | undefined {
  return identityCache.get(nationalId);
}

export function cacheGrades(nationalId: string, result: LookupResult): void {
  gradesCache.set(nationalId, result);
}

export function getCachedGrades(nationalId: string): LookupResult | undefined {
  const r = gradesCache.get(nationalId);
  if (!r) return undefined;
  if (Date.now() - r.fetchedAt > GRADES_TTL) {
    gradesCache.delete(nationalId);
    return undefined;
  }
  return r;
}
