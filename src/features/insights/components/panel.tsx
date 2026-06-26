import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-5 sm:p-6 ${className ?? ""}`}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {subtitle && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
