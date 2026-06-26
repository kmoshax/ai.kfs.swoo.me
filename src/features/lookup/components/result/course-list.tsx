import type { CourseComputed } from "@/types";

export function CourseList({ courses }: { courses: CourseComputed[] }) {
  return (
    <section
      className="animate-rise min-w-0 border-t border-border pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-16"
      style={{ animationDelay: "200ms" }}
    >
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Courses
      </p>
      <ul className="mt-2">
        {courses.map((c, i) => (
          <li
            key={c.name}
            className="animate-rise -mx-3 flex items-center gap-3 rounded-xl border-b border-border px-3 py-3.5 transition-colors last:border-0 hover:bg-foreground/[0.035] sm:gap-4 sm:py-4"
            style={{ animationDelay: `${260 + i * 45}ms` }}
          >
            <span className="w-9 shrink-0 font-heading text-lg font-semibold">
              {c.grade}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate text-base">{c.name}</span>
              {c.training && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  training · not in GPA
                </span>
              )}
            </span>
            <span className="shrink-0 text-lg font-semibold tabular-nums">
              {c.score !== null ? c.score : "—"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
