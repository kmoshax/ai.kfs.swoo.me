"use client";

import { useEffect, useState } from "react";

export function useGpaFill(fillPct: number, reduced: boolean) {
  const [filled, setFilled] = useState(reduced ? fillPct : 0);
  useEffect(() => {
    if (reduced) return;
    const id = requestAnimationFrame(() => setFilled(fillPct));
    return () => cancelAnimationFrame(id);
  }, [reduced, fillPct]);
  return filled;
}
