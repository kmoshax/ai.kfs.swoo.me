import { GETMAIL_URL, ORIGIN } from "./constants";
import { CookieJar, jarFetch } from "./cookies";
import { type FormState, readForm } from "./form-state";
import { type GetmailResult, parseGetmail } from "./getmail-parse";

export type { GetmailResult };

export async function startGetmail(): Promise<FormState> {
  const jar = new CookieJar();
  const html = await (await jarFetch(jar, GETMAIL_URL)).text();
  return readForm(jar, `${ORIGIN}/getmail/`, html);
}

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
  return parseGetmail(await res.text());
}
