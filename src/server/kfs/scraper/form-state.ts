import { type CookieJar, jarFetch } from "./cookies";
import { field } from "./html";

export interface FormState {
  cookies: Record<string, string>;
  viewState: string;
  viewStateGenerator: string;
  eventValidation: string;
  captcha: string;
}

export async function readForm(
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
