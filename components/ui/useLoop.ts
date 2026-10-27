"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

/**
 * Steps through `durations` (ms per step) forever while the element is on screen,
 * then wraps to 0. Pauses off screen. Returns the ref to attach and the current step.
 */
export function useLoop(durations: number[], { amount = 0.3 }: { amount?: number } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount });
  const [step, setStep] = useState(0);
  const key = durations.join(",");

  useEffect(() => {
    if (!inView) return;
    const id = setTimeout(() => setStep((s) => (s + 1) % durations.length), durations[step]);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, step, key]);

  return { ref, step, setStep, inView };
}
