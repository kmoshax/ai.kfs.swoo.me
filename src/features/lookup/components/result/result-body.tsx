import type { RefObject } from "react";
import type { LookupResult } from "@/shared/types";
import { CourseList } from "./course-list";
import { GpaSummary } from "./gpa-summary";
import { IdentityHeader } from "./identity-header";

type ResultBodyProps = {
  result: LookupResult;
  captureRef: RefObject<HTMLDivElement | null>;
  shown: number | null;
  filled: number;
  standingLabel: string;
};

export function ResultBody({
  result,
  captureRef,
  shown,
  filled,
  standingLabel,
}: ResultBodyProps) {
  const { identity, transcript, gpa } = result;
  return (
    <div
      ref={captureRef}
      className="bg-background px-1 pt-10 pb-2 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-center lg:py-6"
    >
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-2">
        <div className="flex flex-col">
          <IdentityHeader identity={identity} transcript={transcript} />
          <GpaSummary
            gpa={gpa}
            shown={shown}
            filled={filled}
            standingLabel={standingLabel}
          />
        </div>
        <CourseList courses={gpa.courses} />
      </div>

      <p className="mt-12 text-xs tracking-wide text-muted-foreground/50">
        ai.kfs.swoo.me
      </p>
    </div>
  );
}
