"use client";

import { NationalIdForm } from "./national-id-form";

type NationalIdScreenProps = {
  nationalId: string;
  loading: boolean;
  onNationalIdChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function NationalIdScreen(props: NationalIdScreenProps) {
  return (
    <div className="flex flex-1 flex-col px-6 py-10 sm:px-12 sm:py-12 lg:px-20">
      <p
        className="animate-rise text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground"
        style={{ animationDelay: "40ms" }}
      >
        Kafr El-Sheikh · Faculty of AI
      </p>

      <div className="flex flex-1 flex-col items-start justify-center gap-12 py-12">
        <h1
          className="animate-rise max-w-4xl font-heading text-6xl font-semibold leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl"
          style={{ animationDelay: "120ms" }}
        >
          Know your result.
        </h1>

        <NationalIdForm {...props} />
      </div>

      <p
        className="animate-rise text-xs tracking-wide text-muted-foreground/50"
        style={{ animationDelay: "320ms" }}
      >
        ai.kfs.swoo.me
      </p>
    </div>
  );
}
