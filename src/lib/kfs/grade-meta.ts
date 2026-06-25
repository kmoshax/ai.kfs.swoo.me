/** Presentation helpers for grades + GPA (pure, safe on the client). */

export function gradeTone(grade: string): string {
  const g = grade.replace(/\s+/g, "").toUpperCase();
  if (g.startsWith("A"))
    return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (g.startsWith("B")) return "text-sky-400 border-sky-500/30 bg-sky-500/10";
  if (g.startsWith("C"))
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  if (g.startsWith("D"))
    return "text-orange-400 border-orange-500/30 bg-orange-500/10";
  if (g.startsWith("F")) return "text-red-400 border-red-500/30 bg-red-500/10";
  return "text-muted-foreground border-border bg-muted";
}

export function scoreTone(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 85) return "text-emerald-400";
  if (score >= 75) return "text-sky-400";
  if (score >= 65) return "text-amber-400";
  if (score >= 60) return "text-orange-400";
  return "text-red-400";
}

/** Maps a 4.0 GPA to an Arabic standing label + color. */
export function gpaStanding(gpa: number | null): {
  label: string;
  tone: string;
} {
  if (gpa === null) return { label: "—", tone: "text-muted-foreground" };
  if (gpa >= 3.7) return { label: "ممتاز", tone: "text-emerald-400" };
  if (gpa >= 3.3) return { label: "جيد جداً مرتفع", tone: "text-emerald-400" };
  if (gpa >= 3.0) return { label: "جيد جداً", tone: "text-sky-400" };
  if (gpa >= 2.7) return { label: "جيد مرتفع", tone: "text-sky-400" };
  if (gpa >= 2.3) return { label: "جيد", tone: "text-amber-400" };
  if (gpa >= 2.0) return { label: "مقبول مرتفع", tone: "text-amber-400" };
  if (gpa >= 1.0) return { label: "مقبول", tone: "text-orange-400" };
  return { label: "ضعيف", tone: "text-red-400" };
}

/** Convert ASCII digits to Arabic-Indic for nicer display. */
export function arabicDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}
