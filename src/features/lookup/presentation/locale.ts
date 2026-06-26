export function enFaculty(faculty: string | null): string {
  if (!faculty || /ذكاء/.test(faculty))
    return "Faculty of Artificial Intelligence";
  return faculty;
}

export function enProgram(section: string | null): string | null {
  if (!section) return null;
  if (/حيوي/.test(section)) return "Bio-AI Program";
  if (/عام/.test(section)) return "General Program";
  return section;
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
