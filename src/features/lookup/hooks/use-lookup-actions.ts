"use client";

import { toast } from "sonner";
import { postReseed } from "../api";
import type { LookupState } from "./lookup-state";
import { syncUrl, useRunLookup } from "./run-lookup";
import { withLoading } from "./with-loading";

export function useLookupActions(s: LookupState) {
  const runLookup = useRunLookup(s);

  function reset() {
    s.setResult(null);
    s.setReseed(null);
    s.setNationalId("");
    s.setCaptcha("");
    syncUrl(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{14}$/.test(s.nationalId)) {
      toast.error("Enter a valid 14-digit National ID.");
      return;
    }
    await withLoading(s, () => runLookup(s.nationalId));
  }

  async function onReseed(e: React.FormEvent) {
    e.preventDefault();
    const reseed = s.reseed;
    if (!reseed || s.captcha.trim().length < 4) {
      toast.error("Enter the code shown in the image.");
      return;
    }
    await withLoading(s, async () => {
      const res = await postReseed(reseed.seedId, s.captcha.trim());
      if (res.ok) toast.success("Verified — fetching your grades…");
      else toast.error("That code was wrong. Try the new one.");
      await runLookup(s.nationalId);
    });
  }

  return { reset, runLookup, onSubmit, onReseed };
}
