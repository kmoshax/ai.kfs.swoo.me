"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ResultView } from "@/components/result-view";
import { Button } from "@/components/ui/button";
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
      <div className="animate-rise w-full max-w-sm text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          One quick check
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Type the code below to continue. This rarely happens.
        </p>

        <div className="mt-8 flex justify-center">
          {/* biome-ignore lint/performance/noImgElement: captcha is a per-request data: URL, next/image cannot optimize it */}
          <img
            src={reseed.captcha}
            alt="Verification code"
            className="h-14 rounded-lg border border-border bg-white px-2"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        <form onSubmit={onReseed} className="mt-6 space-y-3">
          <Input
            ref={captchaRef}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Code"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value.replace(/\D/g, ""))}
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

        <button
          type="button"
          onClick={reset}
          className="mt-5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="animate-rise flex w-full max-w-md flex-col items-center text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Kafr El-Sheikh · Faculty of AI
      </p>

      <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl">
        Know your result.
      </h1>

      <p className="mt-5 max-w-sm text-lg leading-relaxed text-muted-foreground text-balance">
        Your grades and GPA from your National ID. No code, no password.
      </p>

      <form onSubmit={onSubmit} className="mt-12 w-full space-y-3">
        <Input
          inputMode="numeric"
          autoComplete="off"
          aria-label="National ID"
          placeholder="National ID"
          value={nationalId}
          onChange={(e) =>
            setNationalId(e.target.value.replace(/\D/g, "").slice(0, 14))
          }
          className="h-16 rounded-2xl text-center font-mono text-xl tracking-[0.12em] placeholder:tracking-normal placeholder:font-sans placeholder:text-muted-foreground/50"
        />
        <Button
          type="submit"
          className="h-16 w-full rounded-2xl text-lg font-semibold"
          disabled={loading}
        >
          {loading ? <Spinner className="size-5" /> : "Show my grades"}
        </Button>
      </form>

      <p className="mt-6 text-xs text-muted-foreground/70">
        Official results are issued by the faculty's student affairs.
      </p>
    </div>
  );
}
