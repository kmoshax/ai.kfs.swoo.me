"use client";

import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import {
  enFaculty,
  enLevel,
  GPA_MAX,
  gpaStanding,
  gradeColor,
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

/** GPA counts up from 0 once on mount — the one quiet flourish. */
function useCountUp(target: number | null, reduced: boolean) {
  const [value, setValue] = useState(reduced || target === null ? target : 0);
  useEffect(() => {
    if (target === null || reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const dur = 850;
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

  const fillPct = gpa.gpa !== null ? (gpa.gpa / GPA_MAX) * 100 : 0;
  const [filled, setFilled] = useState(reduced ? fillPct : 0);
  useEffect(() => {
    if (reduced) return;
    const id = requestAnimationFrame(() => setFilled(fillPct));
    return () => cancelAnimationFrame(id);
  }, [reduced, fillPct]);

  const level = enLevel(transcript.level);

  return (
    <div className="animate-rise w-full max-w-xl">
      <button
        type="button"
        onClick={onReset}
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={16}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        New search
      </button>

      {/* Identity */}
      <header className="mt-10">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {identity.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {enFaculty(transcript.faculty)}
          {level && ` · ${level}`}
          <span className="font-mono"> · ID {identity.code}</span>
          {result.cached && " · cached"}
        </p>
      </header>

      {/* GPA — the verdict */}
      <section className="mt-14 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Cumulative GPA
        </p>
        <div className="mt-3 flex items-baseline justify-center gap-3">
          <span
            className="font-heading text-7xl font-semibold leading-none tabular-nums sm:text-8xl"
            style={{ color: standing.color }}
          >
            {shown !== null ? shown.toFixed(2) : "—"}
          </span>
          <span className="text-2xl font-medium text-muted-foreground">
            / {GPA_MAX.toFixed(1)}
          </span>
        </div>
        <p
          className="mt-4 font-heading text-xl font-semibold"
          style={{ color: standing.color }}
        >
          {standing.label}
        </p>

        {gpa.gpa !== null && (
          <div className="mx-auto mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${filled}%`, backgroundColor: standing.color }}
            />
          </div>
        )}
      </section>

      {/* Courses */}
      <section className="mt-16">
        <ul className="divide-y divide-border">
          {gpa.courses.map((c) => (
            <li key={c.name} className="flex items-center gap-4 py-5">
              <span
                className="w-9 shrink-0 font-heading text-xl font-semibold"
                style={{ color: gradeColor(c.grade) }}
              >
                {c.grade}
              </span>
              <span className="min-w-0 flex-1 truncate text-base">
                {c.name}
              </span>
              <span
                className="shrink-0 text-xl font-semibold tabular-nums"
                style={{ color: scoreColor(c.score) }}
              >
                {c.score !== null ? c.score : "—"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-12 space-y-3 text-center">
        {gpa.provisional && (
          <p className="text-xs text-muted-foreground">
            Some credit hours are estimated, so the GPA may shift slightly.
          </p>
        )}
        <p className="text-xs text-muted-foreground/70">
          Official results are issued by the faculty's student affairs.
        </p>
      </footer>
    </div>
  );
}
