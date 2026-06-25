"use client";

import type { LookupResult } from "@/types";
import {
  useCountUp,
  useDownloadImage,
  useGpaFill,
  useReducedMotion,
} from "../../hooks";
import { GPA_MAX, gpaStanding } from "../../presentation";
import { ResultBody } from "./result-body";
import { ResultFooter } from "./result-footer";
import { ResultToolbar } from "./result-toolbar";

export function ResultView({
  result,
  onReset,
}: {
  result: LookupResult;
  onReset: () => void;
}) {
  const { identity, gpa } = result;
  const standing = gpaStanding(gpa.gpa);
  const reduced = useReducedMotion();
  const shown = useCountUp(gpa.gpa, reduced);

  const fillPct = gpa.gpa !== null ? (gpa.gpa / GPA_MAX) * 100 : 0;
  const filled = useGpaFill(fillPct, reduced);

  const name = identity.name?.trim() || "result";
  const { captureRef, downloading, downloadImage } = useDownloadImage(name);

  return (
    <div className="w-full max-w-5xl lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <ResultToolbar
        onReset={onReset}
        onDownload={downloadImage}
        downloading={downloading}
      />
      <ResultBody
        result={result}
        captureRef={captureRef}
        shown={shown}
        filled={filled}
        standingLabel={standing.label}
      />
      <ResultFooter provisional={gpa.provisional} />
    </div>
  );
}
