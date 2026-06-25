"use client";

import { toast } from "sonner";
import type { LookupState } from "./lookup-state";

export async function withLoading(s: LookupState, work: () => Promise<void>) {
  s.setLoading(true);
  try {
    await work();
  } catch {
    toast.error("Couldn't connect. Try again.");
  } finally {
    s.setLoading(false);
  }
}
