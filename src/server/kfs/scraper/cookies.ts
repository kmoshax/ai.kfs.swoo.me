export type CookieMap = Record<string, string>;

export class CookieJar {
  private jar: CookieMap;

  constructor(jar: CookieMap = {}) {
    this.jar = { ...jar };
  }

  header(): string {
    return Object.entries(this.jar)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  absorb(res: Response): void {
    const list =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : ([res.headers.get("set-cookie")].filter(Boolean) as string[]);
    for (const raw of list) {
      const m = raw.match(/^([^=]+)=([^;]+)/);
      if (m) this.jar[m[1].trim()] = m[2].trim();
    }
  }

  snapshot(): CookieMap {
    return { ...this.jar };
  }
}

const UA =
  "Mozilla/5.0 (X11; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0";

export async function jarFetch(
  jar: CookieJar,
  url: string,
  init: RequestInit & { headers?: Record<string, string> } = {},
): Promise<Response> {
  const headers = new Headers(init.headers ?? {});
  headers.set("User-Agent", UA);
  const cookie = jar.header();
  if (cookie) headers.set("Cookie", cookie);
  const res = await fetch(url, { ...init, headers, redirect: "manual" });
  jar.absorb(res);
  return res;
}
