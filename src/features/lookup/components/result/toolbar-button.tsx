"use client";

import type { Link01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Spinner } from "@/shared/ui";

export function ToolbarButton({
  onClick,
  icon,
  label,
  busy,
}: {
  onClick: () => void;
  icon: typeof Link01Icon;
  label: string;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground disabled:opacity-60"
    >
      {busy ? (
        <Spinner className="size-[15px]" />
      ) : (
        <HugeiconsIcon icon={icon} size={15} />
      )}
      {label}
    </button>
  );
}
