"use client";

import {
  ArrowLeft01Icon,
  Download01Icon,
  Link01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { copyLink } from "./copy-link";
import { ToolbarButton } from "./toolbar-button";

type ResultToolbarProps = {
  onReset: () => void;
  onDownload: () => void;
  downloading: boolean;
};

export function ResultToolbar({
  onReset,
  onDownload,
  downloading,
}: ResultToolbarProps) {
  return (
    <div className="animate-rise flex shrink-0 flex-wrap items-center justify-between gap-3">
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
      <div className="flex items-center gap-2">
        <ToolbarButton onClick={copyLink} icon={Link01Icon} label="Copy link" />
        <ToolbarButton
          onClick={onDownload}
          icon={Download01Icon}
          label="Download"
          busy={downloading}
        />
      </div>
    </div>
  );
}
