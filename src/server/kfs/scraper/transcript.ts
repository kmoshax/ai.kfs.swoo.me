import type { Course, Transcript } from "@/types";
import { cellAfter, decode } from "./html";

export function parseTranscript(html: string): Transcript {
  const courses: Course[] = [];
  const rowRe = /<td>([^<]+)<\/td><td>([\d.]+)<\/td><td>([^<]+)<\/td>/g;
  for (const m of html.matchAll(rowRe)) {
    const name = decode(m[1]);
    if (/اســـم المـــادة|اسم المادة/.test(name)) continue;
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
