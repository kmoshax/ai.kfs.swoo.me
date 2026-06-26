"use client";

import { useState } from "react";
import type { GradesSnapshot } from "@/types";
import { toTermEntries } from "../../presentation";
import { TermBlock } from "./term-block";

export function HistorySection({ history }: { history?: GradesSnapshot[] }) {
  const [open, setOpen] = useState(false);
  if (!history || history.length < 2) return null;

  const entries = toTermEntries(history).slice().reverse();

  return (
    <section className="shrink-0 border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>History · {entries.length} terms</span>
        <span aria-hidden>{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="mt-5 space-y-7">
          {entries.map((e) => (
            <TermBlock key={e.fetchedAt} entry={e} />
          ))}
        </div>
      )}
    </section>
  );
}
