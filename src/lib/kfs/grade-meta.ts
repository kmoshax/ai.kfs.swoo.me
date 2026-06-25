/** Presentation helpers for grades + GPA (pure, safe on the client). */

/** Maps a letter grade to one of the five data hues defined in globals.css. */
export function gradeColor(grade: string): string {
  const g = grade.replace(/\s+/g, "").toUpperCase();
  if (g.startsWith("A")) return "var(--grade-a)";
  if (g.startsWith("B")) return "var(--grade-b)";
  if (g.startsWith("C")) return "var(--grade-c)";
  if (g.startsWith("D")) return "var(--grade-d)";
  if (g.startsWith("F")) return "var(--grade-f)";
  return "var(--muted-foreground)";
}

export function scoreColor(score: number | null): string {
  if (score === null) return "var(--muted-foreground)";
  if (score >= 85) return "var(--grade-a)";
  if (score >= 76) return "var(--grade-b)";
  if (score >= 68) return "var(--grade-c)";
  if (score >= 60) return "var(--grade-d)";
  return "var(--grade-f)";
}

/** Official standing bands on the 4.0 scale — the label/color for a GPA. */
export const GPA_BANDS = [
  { label: "Poor", min: 0, color: "var(--grade-f)" },
  { label: "Pass", min: 2.0, color: "var(--grade-d)" },
  { label: "Good", min: 2.4, color: "var(--grade-c)" },
  { label: "Very Good", min: 2.8, color: "var(--grade-b)" },
  { label: "Excellent", min: 3.4, color: "var(--grade-a)" },
] as const;

export const GPA_MAX = 4.0;

/** Faculty/level come from the (Arabic) upstream page — present them in English. */
export function enFaculty(faculty: string | null): string {
  if (!faculty || /ذكاء/.test(faculty))
    return "Faculty of Artificial Intelligence";
  return faculty;
}

export function enLevel(level: string | null): string | null {
  if (!level) return null;
  const map: [RegExp, string][] = [
    [/أول|اول|الأولى|الاولى/, "Level 1"],
    [/ثاني|الثانية/, "Level 2"],
    [/ثالث|الثالثة/, "Level 3"],
    [/رابع|الرابعة/, "Level 4"],
  ];
  for (const [re, en] of map) if (re.test(level)) return en;
  return level;
}

/** Highest band whose threshold the GPA reaches. */
export function gpaStanding(gpa: number | null): {
  label: string;
  color: string;
} {
  if (gpa === null) return { label: "—", color: "var(--muted-foreground)" };
  let current: { label: string; color: string } = GPA_BANDS[0];
  for (const band of GPA_BANDS) if (gpa >= band.min) current = band;
  return { label: current.label, color: current.color };
}
