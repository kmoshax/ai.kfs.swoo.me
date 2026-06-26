import Link from "next/link";
import { TERMS, TERMS_UPDATED } from "./terms-data";

export function TermsView() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16 sm:px-12 sm:py-20">
      <Link
        href="/"
        className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back
      </Link>

      <h1 className="mt-10 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        Terms of Use
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated {TERMS_UPDATED}
      </p>

      <div className="mt-12 space-y-10">
        {TERMS.map((s) => (
          <section key={s.heading}>
            <h2 className="font-heading text-lg font-semibold">{s.heading}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </section>
        ))}
      </div>

      <p className="mt-16 text-xs tracking-wide text-muted-foreground/50">
        ai.kfs.swoo.me
      </p>
    </div>
  );
}
