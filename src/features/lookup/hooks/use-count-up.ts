"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number | null, reduced: boolean) {
  const [value, setValue] = useState(reduced || target === null ? target : 0);
  useEffect(() => {
    if (target === null || reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const dur = 850;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - (1 - p) ** 3;
      setValue(Number((target * eased).toFixed(2)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return value;
}
