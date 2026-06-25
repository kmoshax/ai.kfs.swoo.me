"use client";

import type { RefObject } from "react";
import { ReseedForm } from "./reseed-form";

type ReseedScreenProps = {
  captcha: string;
  captchaImage: string;
  captchaRef: RefObject<HTMLInputElement | null>;
  loading: boolean;
  onCaptchaChange: (value: string) => void;
  onReseed: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export function ReseedScreen({ onCancel, ...form }: ReseedScreenProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="animate-rise w-full max-w-sm text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          One quick check
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Type the code below to continue. This rarely happens.
        </p>

        <ReseedForm {...form} />

        <button
          type="button"
          onClick={onCancel}
          className="mt-5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
