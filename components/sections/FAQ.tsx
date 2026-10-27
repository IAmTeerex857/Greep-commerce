"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eyebrow, Reveal } from "@/components/ui/Reveal";

const QA = [
  { q: "Does the seller need Greep?", a: "No. When you buy, we invite them to claim the order." },
  { q: "What if the seller never replies?", a: "If they don't claim it in 48 hours, you get a full refund." },
  { q: "When does the seller get paid?", a: "When you confirm delivery. Or 72 hours after, if there's no issue." },
  { q: "How can I pay?", a: "Card, bank transfer, mobile money or your Greep balance." },
  { q: "Where does Greep work?", a: "Nigeria, Ghana, Kenya and Malawi to start. Buyers can pay from anywhere." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-16 md:py-22">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-[1fr_1.4fr]">
        <div>
          <Eyebrow index="07">Questions</Eyebrow>
          <h2 className="display mt-5 text-[clamp(38px,5vw,64px)]">Good to know.</h2>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {QA.map((item, i) => {
            const on = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.05}>
                <button onClick={() => setOpen(on ? null : i)} aria-expanded={on} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className="font-display text-xl font-semibold tracking-[-0.03em] md:text-2xl">{item.q}</span>
                  <motion.span
                    animate={{ rotate: on ? 45 : 0 }}
                    className={`grid size-9 shrink-0 place-items-center rounded-full text-xl transition-colors ${on ? "bg-green text-white" : "bg-sunken text-ink"}`}
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-lg pb-6 text-[17px] text-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
