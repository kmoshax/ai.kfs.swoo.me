"use client";

import type { RefObject } from "react";
import { Button, Input, Spinner } from "@/shared/ui";
import { CaptchaImage } from "./captcha-image";

type ReseedFormProps = {
  captcha: string;
  captchaImage: string;
  captchaRef: RefObject<HTMLInputElement | null>;
  loading: boolean;
  onCaptchaChange: (value: string) => void;
  onReseed: (e: React.FormEvent) => void;
};

export function ReseedForm({
  captcha,
  captchaImage,
  captchaRef,
  loading,
  onCaptchaChange,
  onReseed,
}: ReseedFormProps) {
  return (
    <>
      <CaptchaImage src={captchaImage} />
      <form onSubmit={onReseed} className="mt-6 space-y-3">
        <Input
          ref={captchaRef}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Code"
          value={captcha}
          onChange={(e) => onCaptchaChange(e.target.value.replace(/\D/g, ""))}
          className="h-14 rounded-2xl text-center font-mono text-xl tracking-[0.4em]"
        />
        <Button
          type="submit"
          className="h-14 w-full rounded-2xl text-base"
          disabled={loading}
        >
          {loading ? <Spinner /> : "Continue"}
        </Button>
      </form>
    </>
  );
}
