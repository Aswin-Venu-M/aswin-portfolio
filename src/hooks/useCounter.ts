"use client";

import { useEffect, useRef, useState } from "react";

export function useCounter(target: number, duration: number = 2000, trigger: boolean = false) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!trigger || startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, duration, trigger]);

  return count;
}
