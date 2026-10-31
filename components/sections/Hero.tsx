"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { AppSticker, CashArt, Sticker } from "@/components/illustrations/Stickers";
import { HeroStage, STEP_LABELS } from "@/components/sections/HeroStage";
import { AudienceToggle } from "@/components/ui/AudienceToggle";

const ease = [0.16, 1, 0.3, 1] as const;
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.9, ease, delay },
});

export function Hero() {
  const [step, setStep] = useState(0);

  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-32">
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-6">
        <div className="max-w-[560px]">
          <motion.div {...rise(0.05)} className="mb-7">
            <AudienceToggle current="sellers" />
          </motion.div>
          <motion.p {...rise(0.1)} className="font-display text-[clamp(20px,2.2vw,28px)] font-semibold leading-[1.25] tracking-[-0.035em] text-muted">
            <span className="whitespace-nowrap">
              <AppSticker kind="video" rotate={-8} delay={0.5} />
              <AppSticker kind="camera" rotate={7} delay={0.58} />
              <AppSticker kind="pin" rotate={-4} delay={0.66} />
            </span>{" "}
            Social media gets you seen.
          </motion.p>
          <motion.h1 {...rise(0.2)} className="display mt-3 text-[clamp(48px,6.4vw,92px)] leading-[0.98]">
            Greep gets you{" "}
            <span className="whitespace-nowrap text-green">
              <Sticker rotate={-6} delay={0.75}>
                <CashArt />
              </Sticker>{" "}
              sales.
            </span>
          </motion.h1>

          <motion.p {...rise(0.35)} className="mt-6 max-w-md text-[17px] leading-relaxed text-muted md:text-lg">
            Your customers are already scrolling. Greep connects what they want to your store, so they buy straight from you.
          </motion.p>

          <motion.div {...rise(0.5)} className="mt-8">
            <WaitlistForm align="start" audience="seller" cta="Claim your store" ctaShort="Claim" />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, ease, delay: 0.4 }} className="relative">
          <HeroStage onStep={setStep} />
          <div className="relative z-10 -mt-5 flex justify-center">
            <StepTracker step={step} />
          </div>
        </motion.div>
      </div>
      <div className="h-10 md:h-14" />
    </section>
  );
}

function StepTracker({ step }: { step: number }) {
  return (
    <ol className="flex rounded-full border border-line bg-sunken p-[3px]">
      {STEP_LABELS.map((label, i) => (
        <li key={label} className="relative">
          {i === step && <motion.span layoutId="tracker" className="absolute inset-0 rounded-full bg-paper shadow-[var(--ring-inset),0_1px_3px_rgb(0_0_0/0.1)]" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
          <span className={`relative flex h-7 items-center whitespace-nowrap rounded-full px-3 text-[12.5px] font-medium transition-colors md:px-4 ${i === step ? "text-ink" : "text-muted"}`}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
