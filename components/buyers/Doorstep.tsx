"use client";

import { useState } from "react";
import { Eyebrow, Reveal, SplitWords } from "@/components/ui/Reveal";
import { DoorstepFigure } from "@/components/buyers/doorstep/Figure";
import { STEPS } from "@/components/buyers/doorstep/model";

const STEP_TONE = ["var(--color-orange)", "var(--color-violet)", "var(--color-sky)", "var(--color-green)"];

const KEYS = [
  { c: "var(--color-orange)", t: "Your order" },
  { c: "var(--color-green)", t: "Order status" },
  { c: "var(--color-violet)", t: "Seller chat" },
  { c: "var(--color-sun)", t: "Reviews" },
];

export function Doorstep() {
  const [step, setStep] = useState(0);

  return (
    <section id="track" className="relative overflow-x-clip py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <Eyebrow index="04">Tracking</Eyebrow>
        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-end md:gap-16">
          <h2 className="display text-[clamp(40px,6vw,76px)]">
            <SplitWords text="From checkout to your doorstep." />
          </h2>
          <div className="md:pb-2">
            <Reveal as="p" className="max-w-md text-[16px] leading-relaxed text-muted">
              Keep an eye on every order, every step of the way. Track your purchase and delivery status, chat with the seller, and see customer reviews before you buy.
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.05} className="mt-10 md:mt-14">
          <figure className="relative overflow-hidden rounded-[28px] border border-line bg-paper shadow-[var(--shadow-card)]">
            <div className="px-1 pb-14 pt-6 sm:pb-10 md:px-6 md:pb-12 md:pt-6">
              <DoorstepFigure onStep={setStep} />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4 md:p-5">
              <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.18em] text-faint sm:inline">Live, every order</span>
              <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-line bg-paper py-1 pl-2 pr-3 text-[12.5px] font-medium text-ink-2 shadow-[var(--shadow-hairline)]">
                <span className="size-2 rounded-full transition-colors duration-500" style={{ background: STEP_TONE[step] }} />
                <span className="font-mono text-[11px] text-muted">#GR-2041</span>
                <span aria-live="polite">{STEPS[step]}</span>
              </span>
            </div>
          </figure>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[12.5px] sm:gap-x-5 sm:text-[13px] text-muted">
            {KEYS.map((k) => (
              <span key={k.t} className="inline-flex items-center gap-2">
                <span className="size-2 rounded-[3px]" style={{ background: k.c }} />
                {k.t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
