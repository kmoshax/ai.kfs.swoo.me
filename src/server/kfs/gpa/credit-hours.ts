export const DEFAULT_CREDIT_HOURS = 3;

export const CREDIT_HOURS: Record<string, number> = {
  "computer fundamentals": 3,
  "introduction to linear algebra": 3,
  "english language": 2,
  "electric circuits": 3,
  "structured programming": 3,
  "mathematics-1": 2,
  "mathematics-0": 0,
  "probability & statistics-1": 2,
  "concepts in artificial intelligence": 2,
  "introduction to programming with python": 3,
  "probability & statistics 2": 2,
  "scientific thinking": 3,
  "societal issues": 3,
  "logic design": 2,
  "numerical analysis": 3,
};

export function normalizeCourse(name: string): string {
  return name.replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().toLowerCase();
}

export function creditHoursFor(name: string): {
  hours: number;
  known: boolean;
} {
  const key = normalizeCourse(name);
  if (key in CREDIT_HOURS) return { hours: CREDIT_HOURS[key], known: true };
  return { hours: DEFAULT_CREDIT_HOURS, known: false };
}
