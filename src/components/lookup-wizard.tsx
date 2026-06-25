"use client";

import {
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
import type {
  LookupResponse,
  LookupResult,
  Page,
  ReseedResponse,
} from "@/lib/kfs/types";

type Reseed = { page: Page; seedId: string; captcha: string };

async function api<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}

export function LookupWizard() {
  const [nationalId, setNationalId] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [reseed, setReseed] = useState<Reseed | null>(null);
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<HTMLInputElement>(null);

  function reset() {
    setResult(null);
    setReseed(null);
    setNationalId("");
    setCaptcha("");
  }

  async function runLookup(nid: string) {
    const res = await api<LookupResponse>({
      action: "lookup",
      nationalId: nid,
    });
    if (res.ok) {
      setReseed(null);
      setResult(res.result);
      return;
    }
    if (res.reason === "reseed") {
      setReseed({ page: res.page, seedId: res.seedId, captcha: res.captcha });
      setCaptcha("");
      setTimeout(() => captchaRef.current?.focus(), 50);
      return;
    }
    if (res.reason === "not_found")
      toast.error(res.message ?? "مفيش طالب بالرقم القومي ده");
    else if (res.reason === "invalid_id")
      toast.error(res.message ?? "اكتب الرقم القومي صح");
    else if (res.reason === "view_limit")
      toast.error(
        res.message ?? "لقد تعديت عدد مرات الاطلاع على النتيجة المسموح بها",
      );
    else toast.error(res.message ?? "حصل خطأ، حاول تاني");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{14}$/.test(nationalId)) {
      toast.error("اكتب الرقم القومي صح (١٤ رقم)");
      return;
    }
    setLoading(true);
    try {
      await runLookup(nationalId);
    } catch {
      toast.error("تعذّر الاتصال، حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  async function onReseed(e: React.FormEvent) {
    e.preventDefault();
    if (!reseed || captcha.trim().length < 4) {
      toast.error("اكتب الكود اللي في الصورة");
      return;
    }
    setLoading(true);
    try {
      const res = await api<ReseedResponse>({
        action: "reseed",
        seedId: reseed.seedId,
        captcha: captcha.trim(),
      });
      if (res.ok) {
        toast.success("تم التفعيل، بنجيب درجاتك…");
        await runLookup(nationalId);
      } else {
        toast.error("الكود غلط، جرّب الكود الجديد");
        await runLookup(nationalId); // fetch a fresh captcha image
      }
    } catch {
      toast.error("تعذّر الاتصال، حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  if (result) return <ResultView result={result} onReset={reset} />;

  if (reseed) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-border/60">
          <CardContent className="space-y-5 p-6">
            <Field
              icon={SecurityCheckIcon}
              title="تأكيد سريع لمرة واحدة"
              hint="النظام محتاج تنشيط بسيط — اكتب الكود اللي في الصورة وكمّل. ده بيحصل نادراً."
            />
            <div className="flex items-center justify-center rounded-xl border border-border/60 bg-muted/30 p-3">
              {/* biome-ignore lint/performance/noImgElement: captcha is a per-request data: URL, next/image cannot optimize it */}
              <img
                src={reseed.captcha}
                alt="captcha"
                className="h-12 rounded-md bg-white px-1"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <form onSubmit={onReseed} className="space-y-3">
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
                {loading ? <Spinner /> : "تأكيد ومتابعة"}
              </Button>
            </form>
            <button
              type="button"
              onClick={reset}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              إلغاء
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border-border/60">
        <CardContent className="space-y-5 p-6">
          <Field
            icon={IdentityCardIcon}
            title="ادخل رقمك القومي"
            hint="هنجيب درجاتك ومعدلك التراكمي بالرقم القومي بس — من غير كود ولا باسورد."
          />
          <form onSubmit={onSubmit} className="space-y-3">
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
