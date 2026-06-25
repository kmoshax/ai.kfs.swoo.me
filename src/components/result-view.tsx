"use client";

import {
  Award01Icon,
  BookOpen01Icon,
  CheckmarkBadge01Icon,
  Database01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  arabicDigits,
  gpaStanding,
  gradeTone,
  scoreTone,
} from "@/lib/kfs/grade-meta";
import type { LookupResult } from "@/lib/kfs/types";

export function ResultView({
  result,
  onReset,
}: {
  result: LookupResult;
  onReset: () => void;
}) {
  const { identity, transcript, gpa } = result;
  const standing = gpaStanding(gpa.gpa);
  const pct = gpa.gpa !== null ? Math.min(100, (gpa.gpa / 4) * 100) : 0;

  return (
    <div className="w-full max-w-3xl space-y-5">
      {/* Header: student */}
      <Card className="overflow-hidden border-border/60">
        <CardContent className="flex flex-col gap-1 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold leading-tight sm:text-xl">
              {identity.name}
            </h2>
            {result.cached && (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <HugeiconsIcon icon={Database01Icon} size={14} />
                محفوظة
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span>{transcript.faculty ?? "كلية الذكاء الاصطناعي"}</span>
            {transcript.level && <span>{transcript.level}</span>}
            <span className="font-mono" dir="ltr">
              كود {arabicDigits(identity.code)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* GPA hero */}
      <Card className="border-border/60">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-20 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/20">
              <HugeiconsIcon
                icon={Award01Icon}
                size={34}
                className="text-primary"
              />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                المعدل التراكمي (GPA)
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-extrabold tabular-nums ${standing.tone}`}
                >
                  {gpa.gpa !== null ? arabicDigits(gpa.gpa.toFixed(2)) : "—"}
                </span>
                <span className="text-base text-muted-foreground">/ ٤٫٠</span>
              </div>
              <div className={`text-sm font-semibold ${standing.tone}`}>
                {standing.label}
              </div>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{arabicDigits(gpa.totalCreditHours)} ساعة معتمدة</span>
              <span>{arabicDigits(transcript.courses.length)} مادة</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-l from-primary to-emerald-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses */}
      <Card className="border-border/60">
        <CardContent className="p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2 px-2 text-sm font-semibold text-muted-foreground">
            <HugeiconsIcon icon={BookOpen01Icon} size={16} />
            المواد والدرجات
          </div>
          <ul className="divide-y divide-border/50">
            {gpa.courses.map((c) => (
              <li key={c.name} className="flex items-center gap-3 px-2 py-3">
                <span
                  className={`grid w-12 shrink-0 place-items-center rounded-lg border py-1 text-sm font-bold ${gradeTone(c.grade)}`}
                  dir="ltr"
                >
                  {c.grade}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-sm font-medium"
                    dir="ltr"
                    lang="en"
                  >
                    {c.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {arabicDigits(c.creditHours)} ساعة
                    {!c.creditHoursKnown && " (تقديري)"}
                  </div>
                </div>
                <span
                  className={`shrink-0 text-lg font-bold tabular-nums ${scoreTone(c.score)}`}
                >
                  {c.score !== null ? arabicDigits(c.score) : "—"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {gpa.provisional && (
        <p className="flex items-start gap-2 px-1 text-xs text-amber-400/80">
          <HugeiconsIcon
            icon={CheckmarkBadge01Icon}
            size={15}
            className="mt-0.5 shrink-0"
          />
          بعض الساعات المعتمدة تقديرية لحين اعتمادها رسمياً، فقد يختلف المعدل
          قليلاً.
        </p>
      )}

      <div className="flex justify-center pb-8">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <HugeiconsIcon icon={RefreshIcon} size={16} />
          بحث جديد
        </Button>
      </div>

      <p className="pb-6 text-center text-xs text-muted-foreground/70">
        النتيجة الرسمية المعتمدة هي ما تصدره شؤون الطلاب بالكلية.
      </p>
    </div>
  );
}
