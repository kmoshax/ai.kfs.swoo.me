"use client";

import {
  ArrowLeft01Icon,
  IdentityCardIcon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ResultView } from "@/components/result-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { arabicDigits } from "@/lib/kfs/grade-meta";
import type { Step } from "@/lib/kfs/types";

async function call(body: Record<string, unknown>): Promise<Step> {
  const res = await fetch("/api/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as Step;
}

export function LookupWizard() {
  const [nationalId, setNationalId] = useState("");
  const [step, setStep] = useState<Step | null>(null);
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);

  const captchaRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep(null);
    setNationalId("");
    setCaptcha("");
  }

  function handle(next: Step) {
    setCaptcha("");
    if (
      next.step === "error" &&
      (next.reason === "captcha" || next.reason === "session")
    ) {
      toast.error(next.message ?? "حصل خطأ، حاول تاني");
    } else if (next.step === "error") {
      toast.error(next.message ?? "حصل خطأ");
    }
    if (next.step === "identify" || next.step === "grades") {
      if (next.error === "captcha") toast.error("الكود غلط، جرّب الكود الجديد");
      setStep(next);
      setTimeout(() => captchaRef.current?.focus(), 50);
    } else if (next.step === "done") {
      setStep(next);
    } else if (next.reason === "session") {
      reset();
    }
  }

  async function onBegin(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{14}$/.test(nationalId)) {
      toast.error("اكتب الرقم القومي صح (١٤ رقم)");
      return;
    }
    setLoading(true);
    try {
      handle(await call({ action: "begin", nationalId }));
    } catch {
      toast.error("تعذّر الاتصال، حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  async function onCaptcha(e: React.FormEvent) {
    e.preventDefault();
    if (!step || (step.step !== "identify" && step.step !== "grades")) return;
    if (captcha.trim().length < 4) {
      toast.error("اكتب الكود اللي في الصورة");
      return;
    }
    setLoading(true);
    try {
      handle(
        await call({
          action: step.step,
          sid: step.sid,
          captcha: captcha.trim(),
        }),
      );
    } catch {
      toast.error("تعذّر الاتصال، حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  if (step?.step === "done") {
    return <ResultView result={step.result} onReset={reset} />;
  }

  const captchaStep =
    step?.step === "identify" || step?.step === "grades" ? step : null;

  return (
    <div className="w-full max-w-md">
      {!captchaStep ? (
        <Card className="border-border/60">
          <CardContent className="space-y-5 p-6">
            <Field
              icon={IdentityCardIcon}
              title="ادخل رقمك القومي"
              hint="هنجيب درجاتك ومعدلك التراكمي بالرقم القومي بس."
            />
            <form onSubmit={onBegin} className="space-y-3">
              <Input
                dir="ltr"
                inputMode="numeric"
                autoComplete="off"
                placeholder="٣٠٧٠٤٠٧١٥٠١٤٥٢"
                value={nationalId}
                onChange={(e) =>
                  setNationalId(e.target.value.replace(/\D/g, "").slice(0, 14))
                }
                className="h-12 text-center font-mono text-lg tracking-[0.2em]"
              />
              <div className="text-center text-xs text-muted-foreground">
                {arabicDigits(nationalId.length)} / ١٤
              </div>
              <Button
                type="submit"
                className="h-12 w-full text-base"
                disabled={loading}
              >
                {loading ? <Spinner /> : "عرض الدرجات"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <CardContent className="space-y-5 p-6">
            <Field
              icon={SecurityCheckIcon}
              title={
                captchaStep.step === "identify"
                  ? "خطوة ١: تأكيد إنك مش روبوت"
                  : "خطوة ٢: عرض الدرجات"
              }
              hint={
                captchaStep.step === "grades" && captchaStep.studentName
                  ? `أهلاً ${captchaStep.studentName} 👋 اكتب الكود لعرض درجاتك.`
                  : "اكتب الأرقام اللي في الصورة بالظبط."
              }
            />

            <div className="flex items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
              {/* biome-ignore lint/performance/noImgElement: captcha is a per-request data: URL, next/image cannot optimize it */}
              <img
                src={captchaStep.captcha}
                alt="captcha"
                className="h-12 rounded-md bg-white px-1"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            <form onSubmit={onCaptcha} className="space-y-3">
              <Input
                ref={captchaRef}
                dir="ltr"
                inputMode="numeric"
                autoComplete="off"
                placeholder="الكود"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value.replace(/\D/g, ""))}
                className="h-12 text-center font-mono text-lg tracking-[0.3em]"
              />
              <Button
                type="submit"
                className="h-12 w-full text-base"
                disabled={loading}
              >
                {loading ? <Spinner /> : "تأكيد"}
              </Button>
            </form>

            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                رجوع
              </button>
              <span className="text-muted-foreground/70">
                لو الكود مش واضح، اضغط تأكيد وهييجي كود جديد.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  icon,
  title,
  hint,
}: {
  icon: typeof IdentityCardIcon;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
        <HugeiconsIcon icon={icon} size={22} className="text-primary" />
      </div>
      <div className="space-y-0.5">
        <h2 className="font-bold leading-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
