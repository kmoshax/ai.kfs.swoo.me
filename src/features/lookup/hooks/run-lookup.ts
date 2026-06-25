"use client";

import { useCallback } from "react";
import { postLookup } from "../api";
import { toastLookupFailure } from "./lookup-messages";
import type { LookupState } from "./lookup-state";

export function syncUrl(nid: string | null) {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", nid ? `/${nid}` : "/");
}

export function useRunLookup(s: LookupState) {
  return useCallback(
    async (nid: string) => {
      const res = await postLookup(nid);
      if (res.ok) {
        s.setReseed(null);
        s.setResult(res.result);
        syncUrl(nid);
        return;
      }
      if (res.reason === "reseed") {
        s.setReseed({
          page: res.page,
          seedId: res.seedId,
          captcha: res.captcha,
        });
        s.setCaptcha("");
        setTimeout(() => s.captchaRef.current?.focus(), 50);
        return;
      }
      toastLookupFailure(res.reason);
    },
    [s.setReseed, s.setResult, s.setCaptcha, s.captchaRef],
  );
}
