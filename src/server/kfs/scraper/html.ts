export function field(html: string, name: string): string {
  const m = html.match(new RegExp(`name="${name}"[^>]*value="([^"]*)"`));
  return m ? m[1] : "";
}

export function cellAfter(html: string, label: string): string | null {
  const m = html.match(new RegExp(`${label}</td>\\s*<td[^>]*>([^<]*)</td>`));
  return m ? decode(m[1].trim()) : null;
}

export function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();
}
