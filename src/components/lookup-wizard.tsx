"use client";

import {
  IdentityCardIcon,
  SecurityCheckIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ResultView } from "@/components/result-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
      toast.error("No student found with that National ID.");
    else if (res.reason === "invalid_id")
      toast.error("Enter a valid 14-digit National ID.");
    else if (res.reason === "view_limit")
      toast.error("You've reached the maximum number of result views.");
    else toast.error("Something went wrong. Please try again shortly.");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{14}$/.test(nationalId)) {
      toast.error("Enter a valid 14-digit National ID.");
      return;
    }
    setLoading(true);
    try {
      await runLookup(nationalId);
    } catch {
      toast.error("Couldn't connect. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onReseed(e: React.FormEvent) {
    e.preventDefault();
    if (!reseed || captcha.trim().length < 4) {
      toast.error("Enter the code shown in the image.");
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
        toast.success("Verified — fetching your grades…");
        await runLookup(nationalId);
      } else {
        toast.error("That code was wrong. Try the new one.");
        await runLookup(nationalId); // fetch a fresh captcha image
      }
    } catch {
      toast.error("Couldn't connect. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (result) return <ResultView result={result} onReset={reset} />;

  if (reseed) {
    return (
      <div className="animate-rise w-full max-w-md">
        <Card>
          <CardContent className="space-y-5">
            <Field
              icon={SecurityCheckIcon}
              title="One quick check"
              hint="The system needs a light verification. Type the code in the image to continue — this rarely happens."
            />
            <div className="flex items-center justify-center rounded-xl border border-border bg-black/20 p-3">
              {/* biome-ignore lint/performance/noImgElement: captcha is a per-request data: URL, next/image cannot optimize it */}
              <img
                src={reseed.captcha}
                alt="Verification code"
                className="h-12 rounded-md bg-white px-1"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <form onSubmit={onReseed} className="space-y-3">
              <Input
                ref={captchaRef}
                inputMode="numeric"
                autoComplete="off"
                placeholder="Code"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value.replace(/\D/g, ""))}
                className="h-12 text-center font-mono text-lg tracking-[0.4em]"
              />
              <Button
                type="submit"
                className="h-12 w-full text-base"
                disabled={loading}
              >
                {loading ? <Spinner /> : "Verify & continue"}
              </Button>
            </form>
            <button
              type="button"
              onClick={reset}
              className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <header className="animate-rise mb-8 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary/90 backdrop-blur">
          <HugeiconsIcon icon={SparklesIcon} size={14} />
          Faculty of Artificial Intelligence · Kafr El-Sheikh University
        </div>

        <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl">
          Know your <span className="text-primary">result</span>.
        </h1>

        <p className="max-w-xs text-balance text-sm leading-relaxed text-muted-foreground">
          Your grades and cumulative GPA from your National ID alone — no code,
          no password.
        </p>
      </header>

      <div className="animate-rise w-full" style={{ animationDelay: "120ms" }}>
        <Card>
          <CardContent className="space-y-5">
            <Field
              icon={IdentityCardIcon}
              title="Enter your National ID"
              hint="14 digits. We use it only to look up your transcript."
            />
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2.5">
                <Input
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="3 0 7 0 4 0 7 1 5 0 1 4 5 2"
                  value={nationalId}
                  onChange={(e) =>
                    setNationalId(
                      e.target.value.replace(/\D/g, "").slice(0, 14),
                    )
                  }
                  className="h-13 text-center font-mono text-lg tracking-[0.18em] placeholder:tracking-[0.1em] placeholder:text-muted-foreground/40"
                />
                <DigitMeter filled={nationalId.length} total={14} />
              </div>
              <Button
                type="submit"
                className="h-12 w-full text-base font-semibold"
                disabled={loading}
              >
                {loading ? <Spinner /> : "Show my grades"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-xs text-muted-foreground/70">
          Official results are those issued by the faculty's student affairs.
        </p>
      </div>
    </div>
  );
}

function DigitMeter({ filled, total }: { filled: number; total: number }) {
  const ticks = Array.from({ length: total }, (_, i) => `tick-${i}`);
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1" aria-hidden>
        {ticks.map((id, i) => (
          <span
            key={id}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i < filled ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {filled}/{total}
      </span>
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
        <h2 className="font-heading font-semibold leading-tight">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
