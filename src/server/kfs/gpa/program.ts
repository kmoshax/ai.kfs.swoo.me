import type { Course, Program, Transcript } from "@/types";
import { CREDIT_HOURS, normalizeCourse } from "./credit-hours";
import { BIO_CREDIT_HOURS } from "./credit-hours-bio";

function matches(courses: Course[], table: Record<string, number>): number {
  return courses.filter((c) => normalizeCourse(c.name) in table).length;
}

export function detectProgram(transcript: Transcript): Program {
  const section = transcript.section ?? "";
  if (section.includes("حيوي")) return "bio";
  if (section.includes("عام")) return "general";
  const bio = matches(transcript.courses, BIO_CREDIT_HOURS);
  const general = matches(transcript.courses, CREDIT_HOURS);
  return bio > general ? "bio" : "general";
}
