"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { LookupState } from "./lookup-state";

export function useBootLookup(
  s: LookupState,
  initialId: string | undefined,
  runLookup: (nid: string) => Promise<void>,
) {
  const hasRun = useRef(false);
  useEffect(() => {
    if (!initialId || hasRun.current) return;
    hasRun.current = true;
    (async () => {
      s.setLoading(true);
      try {
        await runLookup(initialId);
      } catch {
        toast.error("Couldn't connect. Try again.");
      } finally {
        s.setLoading(false);
        s.setBooting(false);
      }
    })();
  }, [initialId, runLookup, s.setLoading, s.setBooting]);
}
