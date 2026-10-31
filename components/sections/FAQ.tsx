"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eyebrow, Reveal } from "@/components/ui/Reveal";

export type QA = { q: string; a: string };

export const BUYER_FAQ: QA[] = [
  { q: "What can I send Greep?", a: "A post, video, picture, screenshot or link. Even a photo you took on the street." },
  { q: "Does the seller need Greep?", a: "No. When you buy, we invite them to claim the order." },
  { q: "What if the seller never replies?", a: "If they don't claim it in 48 hours, you get a full refund." },
  { q: "Is my money safe?", a: "Yes. We hold it until your order arrives. The seller gets paid after that." },
  { q: "How can I pay?", a: "Card, bank transfer, mobile money or your Greep balance, in your own currency." },
];

export const SELLER_FAQ: QA[] = [
  { q: "Do I need to sign up first?", a: "No. When a customer orders from your post, we invite you to claim your store and the order." },
  { q: "What if I miss an order?", a: "Claim it within 48 hours. After that, the customer gets a full refund." },
  { q: "When do I get paid?", a: "When the customer confirms delivery. Or 72 hours after, if there's no issue." },
  { q: "How can customers pay me?", a: "Card, bank transfer, mobile money or their Greep balance, in their own currency." },
  { q: "Where does Greep work?", a: "Nigeria, Ghana, Kenya and Malawi to start. Customers can pay from anywhere." },
];

export function FAQ({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-[1fr_1.4fr]">
        <div className="md:sticky md:top-28 md:self-start">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="display mt-5 text-[clamp(38px,5vw,64px)]">Good to know.</h2>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {items.map((item, i) => {
            const on = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.05}>
                <button onClick={() => setOpen(on ? null : i)} aria-expanded={on} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className="font-display text-xl font-semibold tracking-[-0.03em] md:text-2xl">{item.q}</span>
                  <motion.span
                    animate={{ rotate: on ? 45 : 0 }}
                    className={`grid size-9 shrink-0 place-items-center rounded-full text-xl transition-colors ${on ? "bg-ink text-canvas" : "bg-sunken text-ink"}`}
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
