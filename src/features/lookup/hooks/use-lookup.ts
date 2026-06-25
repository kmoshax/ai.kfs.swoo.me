"use client";

import { useRef, useState } from "react";
import type { LookupResult } from "@/shared/types";
import type { LookupState, Reseed } from "./lookup-state";
import { useBootLookup } from "./use-boot-lookup";
import { useLookupActions } from "./use-lookup-actions";

export function useLookup(initialId?: string) {
  const [nationalId, setNationalId] = useState(initialId ?? "");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [reseed, setReseed] = useState<Reseed | null>(null);
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(!!initialId);
  const captchaRef = useRef<HTMLInputElement>(null);

  const state: LookupState = {
    nationalId,
    setNationalId,
    result,
    setResult,
    reseed,
    setReseed,
    captcha,
    setCaptcha,
    loading,
    setLoading,
    booting,
    setBooting,
    captchaRef,
  };

  const actions = useLookupActions(state);
  useBootLookup(state, initialId, actions.runLookup);

  return { ...state, ...actions };
}
