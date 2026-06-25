"use client";

import {
  BookOpen01Icon,
  CheckmarkBadge01Icon,
  Database01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  enFaculty,
  enLevel,
  GPA_MAX,
  gpaLadder,
  gpaStanding,
  gradeChipStyle,
  scoreColor,
} from "@/lib/kfs/grade-meta";
import type { LookupResult } from "@/lib/kfs/types";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const on = () => setReduced(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** GPA counts up from 0 once on mount — the "verdict landing" moment. */
function useCountUp(target: number | null, reduced: boolean) {
  const [value, setValue] = useState(reduced || target === null ? target : 0);
  useEffect(() => {
    if (target === null || reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const dur = 900;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - (1 - p) ** 3;
      setValue(Number((target * eased).toFixed(2)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return value;
}

export function ResultView({
  result,
  onReset,
}: {
  result: LookupResult;
  onReset: () => void;
}) {
  const { identity, transcript, gpa } = result;
  const standing = gpaStanding(gpa.gpa);
  const reduced = usePrefersReducedMotion();
  const shown = useCountUp(gpa.gpa, reduced);

  const ladder = gpaLadder();
  const [marker, setMarker] = useState(reduced ? null : true);
  const markerPct = gpa.gpa !== null ? (gpa.gpa / GPA_MAX) * 100 : 0;
  // Slide the marker into place one frame after mount.
  useEffect(() => {
    if (reduced) return;
    const id = requestAnimationFrame(() => setMarker(false));
    return () => cancelAnimationFrame(id);
  }, [reduced]);
  const markerLeft = marker ? 0 : markerPct;

  return (
    <div className="animate-rise w-full max-w-2xl space-y-4">
      {/* Identity */}
      <Card>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-heading text-xl font-bold leading-tight sm:text-2xl">
              {identity.name}
            </h2>
            {result.cached && (
              <Badge
                variant="outline"
                className="shrink-0 gap-1 text-muted-foreground"
              >
                <HugeiconsIcon icon={Database01Icon} size={13} />
                Cached
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
            <Tag>{enFaculty(transcript.faculty)}</Tag>
            {enLevel(transcript.level) && (
              <Tag>{enLevel(transcript.level)}</Tag>
            )}
            <Tag mono>ID {identity.code}</Tag>
          </div>
        </CardContent>
      </Card>

      {/* GPA verdict + classification ladder (the signature) */}
      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Cumulative GPA
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  className="font-heading text-6xl font-bold leading-none tabular-nums"
                  style={{ color: standing.color }}
                >
                  {shown !== null ? shown.toFixed(2) : "—"}
                </span>
                <span className="text-lg font-medium text-muted-foreground">
                  / {GPA_MAX.toFixed(1)}
                </span>
              </div>
            </div>
            <div
              className="font-heading text-lg font-semibold"
              style={{ color: standing.color }}
            >
              {standing.label}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="relative pt-5">
              {/* marker */}
              {gpa.gpa !== null && (
                <div
                  className="absolute top-0 z-10 -translate-x-1/2 transition-[left] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ left: `${markerLeft}%` }}
                >
                  <div
                    className="mx-auto grid place-items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-background"
                    style={{ backgroundColor: standing.color }}
                  >
                    {gpa.gpa.toFixed(2)}
                  </div>
                  <div
                    className="mx-auto mt-0.5 h-3 w-0.5 rounded-full"
                    style={{ backgroundColor: standing.color }}
                  />
                </div>
              )}
              {/* track */}
              <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
                {ladder.map((seg) => {
                  const active = seg.label === standing.label;
                  return (
                    <div
                      key={seg.label}
                      style={{
                        width: `${seg.width}%`,
                        backgroundColor: `color-mix(in oklch, ${seg.color} ${
                          active ? 75 : 22
                        }%, transparent)`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
            {/* band labels */}
            <div className="flex w-full">
              {ladder.map((seg) => {
                const active = seg.label === standing.label;
                return (
                  <div
                    key={seg.label}
                    className="text-center text-[10px] leading-tight transition-colors"
                    style={{
                      width: `${seg.width}%`,
                      color: active ? seg.color : "var(--muted-foreground)",
                      opacity: active ? 1 : 0.6,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {seg.label}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6 border-t border-border pt-4 text-sm">
            <Stat value={gpa.totalCreditHours} label="Credit hours" />
            <div className="h-8 w-px bg-border" />
            <Stat value={transcript.courses.length} label="Courses" />
          </div>
        </CardContent>
      </Card>

      {/* Courses */}
      <Card>
        <CardContent className="space-y-1">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <HugeiconsIcon icon={BookOpen01Icon} size={15} />
            Courses & grades
          </div>
          <ul className="-mx-2 divide-y divide-border/60">
            {gpa.courses.map((c) => (
              <li
                key={c.name}
                className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-foreground/[0.03]"
              >
                <span
                  className="grid w-12 shrink-0 place-items-center rounded-lg border py-1 font-heading text-sm font-bold"
                  style={gradeChipStyle(c.grade)}
                >
                  {c.grade}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.creditHours} {c.creditHours === 1 ? "hour" : "hours"}
                    {!c.creditHoursKnown && " · estimated"}
                  </div>
                </div>
                <span
                  className="shrink-0 text-lg font-semibold tabular-nums"
                  style={{ color: scoreColor(c.score) }}
                >
                  {c.score !== null ? c.score : "—"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {gpa.provisional && (
        <p className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
          <HugeiconsIcon
            icon={CheckmarkBadge01Icon}
            size={15}
            className="mt-0.5 shrink-0 text-primary"
          />
          Some credit hours are estimated until officially confirmed, so the GPA
          may shift slightly.
        </p>
      )}

      <div className="flex justify-center pt-1 pb-2">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <HugeiconsIcon icon={RefreshIcon} size={16} />
          New search
        </Button>
      </div>

      <p className="pb-6 text-center text-xs text-muted-foreground/60">
        Official results are those issued by the faculty's student affairs.
      </p>
    </div>
  );
}

function Tag({
  children,
  mono,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <span
      className={`rounded-md border border-border bg-foreground/[0.03] px-2 py-1 text-muted-foreground ${
        mono ? "font-mono tabular-nums" : ""
      }`}
    >
      {children}
    </span>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-heading text-xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
