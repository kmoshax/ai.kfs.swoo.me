import { AI_FACULTY_ID, NEWRESULT_URL, ORIGIN } from "./constants";
import { CookieJar, jarFetch } from "./cookies";
import { type FormState, readForm } from "./form-state";
import { type GradesResult, parseNewresult } from "./newresult-parse";

export type { GradesResult };

export async function startNewresult(): Promise<FormState> {
  const jar = new CookieJar();
  const html = await (await jarFetch(jar, NEWRESULT_URL)).text();
  return readForm(jar, `${ORIGIN}/newresult/`, html);
}

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
  return parseNewresult(await res.text());
}
