/**
 * KFS MIS scraping flow.
 *
 * Two ASP.NET WebForms pages are involved:
 *  1. /getmail/                       national-id + captcha  -> code + password
 *  2. /newresult/stud_credithours.aspx code + password + captcha -> grades
 *
 * Each page is a postback: we must GET it first to read the hidden
 * __VIEWSTATE / __EVENTVALIDATION fields and trigger the captcha, then POST
 * the form back within the same session cookie. The captcha value is fixed per
 * session, so a wrong captcha means we must start a fresh session.
 */
import { CookieJar, jarFetch } from "./cookies";

const ORIGIN = "https://mis.kfs.edu.eg";
export const GETMAIL_URL = `${ORIGIN}/getmail/`;
export const NEWRESULT_URL = `${ORIGIN}/newresult/stud_credithours.aspx`;

/** كلية الذكاء الإصطناعي */
export const AI_FACULTY_ID = "602";

export interface FormState {
  cookies: Record<string, string>;
  viewState: string;
  viewStateGenerator: string;
  eventValidation: string;
  /** data: URL of the captcha image, ready to drop into an <img src>. */
  captcha: string;
}

export interface Identity {
  name: string;
  code: string;
  password: string;
  email: string | null;
}

export interface Course {
  name: string;
  score: number | null;
  grade: string;
}

export interface Transcript {
  faculty: string | null;
  level: string | null;
  section: string | null;
  name: string | null;
  code: string | null;
  nationalId: string | null;
  courses: Course[];
}

function field(html: string, name: string): string {
  const m = html.match(new RegExp(`name="${name}"[^>]*value="([^"]*)"`));
  return m ? m[1] : "";
}

/** Pull the value cell that follows a labelled <td> in an ASP DetailsView. */
function cellAfter(html: string, label: string): string | null {
  const m = html.match(new RegExp(`${label}</td>\\s*<td[^>]*>([^<]*)</td>`));
  return m ? decode(m[1].trim()) : null;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function readForm(
  jar: CookieJar,
  captchaBase: string,
  html: string,
): Promise<FormState> {
  const q = html.match(/GenerateCaptcha\.aspx\?(\d+)/);
  let captcha = "";
  if (q) {
    const res = await jarFetch(
      jar,
      `${captchaBase}GenerateCaptcha.aspx?${q[1]}`,
    );
    const buf = Buffer.from(await res.arrayBuffer());
    const type = res.headers.get("content-type") || "image/jpeg";
    captcha = `data:${type};base64,${buf.toString("base64")}`;
  }
  return {
    cookies: jar.snapshot(),
    viewState: field(html, "__VIEWSTATE"),
    viewStateGenerator: field(html, "__VIEWSTATEGENERATOR"),
    eventValidation: field(html, "__EVENTVALIDATION"),
    captcha,
  };
}

/** Step 1a: open a /getmail/ session and grab its captcha. */
export async function startGetmail(): Promise<FormState> {
  const jar = new CookieJar();
  const html = await (await jarFetch(jar, GETMAIL_URL)).text();
  return readForm(jar, `${ORIGIN}/getmail/`, html);
}

export type GetmailResult =
  | { ok: true; identity: Identity }
  | {
      ok: false;
      reason: "captcha" | "not_found" | "unknown";
      message?: string;
    };

/** Step 1b: submit national-id + captcha, return code/password/email. */
export async function submitGetmail(
  state: FormState,
  nationalId: string,
  captcha: string,
): Promise<GetmailResult> {
  const jar = new CookieJar(state.cookies);
  const body = new URLSearchParams({
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: state.viewState,
    __VIEWSTATEGENERATOR: state.viewStateGenerator,
    __EVENTVALIDATION: state.eventValidation,
    ctl00$ContentPlaceHolder1$nattional_txt: nationalId,
    ctl00$ContentPlaceHolder1$txtCaptcha: captcha,
    ctl00$ContentPlaceHolder1$Button1: "مـــوافق",
  });
  const res = await jarFetch(jar, GETMAIL_URL, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: ORIGIN,
      Referer: GETMAIL_URL,
    },
  });
  const html = await res.text();

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

/** Step 2a: open a /newresult/ session and grab its captcha. */
export async function startNewresult(): Promise<FormState> {
  const jar = new CookieJar();
  const html = await (await jarFetch(jar, NEWRESULT_URL)).text();
  return readForm(jar, `${ORIGIN}/newresult/`, html);
}

export type GradesResult =
  | { ok: true; transcript: Transcript }
  | {
      ok: false;
      reason: "captcha" | "not_found" | "unknown";
      message?: string;
    };

/** Step 2b: submit code + password + captcha, return the transcript. */
export async function submitNewresult(
  state: FormState,
  code: string,
  password: string,
  captcha: string,
  faculty: string = AI_FACULTY_ID,
): Promise<GradesResult> {
  const jar = new CookieJar(state.cookies);
  const body = new URLSearchParams({
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: state.viewState,
    __VIEWSTATEGENERATOR: state.viewStateGenerator,
    __EVENTVALIDATION: state.eventValidation,
    DropDownList1: faculty,
    txt_code: code,
    txt_pass: password,
    txtCaptcha: captcha,
    Button1: "دخـــــول",
  });
  const res = await jarFetch(jar, NEWRESULT_URL, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: ORIGIN,
      Referer: NEWRESULT_URL,
    },
  });
  const html = await res.text();
  const transcript = parseTranscript(html);
  if (transcript.courses.length > 0) return { ok: true, transcript };

  // No grid: figure out why. The captcha error on this page is a generic label.
  if (/برجاء ادخال الكود|الصورة/.test(html))
    return { ok: false, reason: "captcha" };
  if (/الكود او كلمة المرور|غير صحيح/.test(html))
    return { ok: false, reason: "not_found" };
  return { ok: false, reason: "unknown" };
}

export function parseTranscript(html: string): Transcript {
  const courses: Course[] = [];
  // GridView6 rows: <td>name</td><td>score</td><td>grade</td>
  const rowRe = /<td>([^<]+)<\/td><td>([\d.]+)<\/td><td>([^<]+)<\/td>/g;
  for (const m of html.matchAll(rowRe)) {
    const name = decode(m[1]);
    if (/اســـم المـــادة|اسم المادة/.test(name)) continue; // header
    courses.push({
      name,
      score: m[2] ? Number(m[2]) : null,
      grade: decode(m[3]),
    });
  }
  return {
    faculty: cellAfter(html, "الكليـــــة") ?? cellAfter(html, "الكلية"),
    level: cellAfter(html, "المستـوى") ?? cellAfter(html, "المستوى"),
    section: cellAfter(html, "الشعبـــــة") ?? cellAfter(html, "الشعبة"),
    name: cellAfter(html, "اســـم الطـــالب") ?? cellAfter(html, "اسم الطالب"),
    code: cellAfter(html, "كـــود الطـــالب") ?? cellAfter(html, "كود الطالب"),
    nationalId:
      cellAfter(html, "الرقـــم القـــومى") ?? cellAfter(html, "الرقم القومى"),
    courses,
  };
}
