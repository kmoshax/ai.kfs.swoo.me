"use client";

import { useLookup } from "../hooks";
import { BootingScreen } from "./booting-screen";
import { NationalIdScreen } from "./national-id-screen";
import { ReseedScreen } from "./reseed-screen";
import { ResultView } from "./result";

export function LookupWizard({ initialId }: { initialId?: string }) {
  const w = useLookup(initialId);

  if (w.booting) return <BootingScreen />;

  if (w.result)
    return (
      <div className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-7">
        <ResultView result={w.result} onReset={w.reset} />
      </div>
    );

  if (w.reseed)
    return (
      <ReseedScreen
        captcha={w.captcha}
        captchaImage={w.reseed.captcha}
        captchaRef={w.captchaRef}
        loading={w.loading}
        onCaptchaChange={w.setCaptcha}
        onReseed={w.onReseed}
        onCancel={w.reset}
      />
    );

  return (
    <NationalIdScreen
      nationalId={w.nationalId}
      loading={w.loading}
      onNationalIdChange={w.setNationalId}
      onSubmit={w.onSubmit}
    />
  );
}
