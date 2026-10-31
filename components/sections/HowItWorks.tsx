"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Lock, Tag, Truck } from "lucide-react";
import { Eyebrow } from "@/components/ui/Reveal";
import { HowItWorksFigure } from "@/components/sections/HowItWorksFigure";
import { AppTile } from "@/components/ui/Icons";
import { useLoop } from "@/components/ui/useLoop";

const STEPS = [
  {
    tab: "They see it",
    color: "#7c6cf2",
    title: "A customer spots your product.",
    line: "They're scrolling TikTok, Instagram or Pinterest, or out in the real world, and see something they love.",
    caption: "Anywhere they scroll",
    items: [
      { t: "Any app", s: "TikTok, Instagram, Pinterest or X", tag: "Social" },
      { t: "Real life too", s: "A photo of something they saw", tag: "Camera" },
      { t: "They share it", s: "The post, picture or link goes to Greep", tag: "1 tap" },
    ],
  },
  {
    tab: "We connect",
    color: "#ee6f38",
    title: "Greep brings them to you.",
    line: "We find the product, put your store first and connect the customer straight to you.",
    caption: "Matched to your store",
    items: [
      { t: "We find it", s: "The exact product, in your store", tag: "Match" },
      { t: "Your store first", s: "Your brand shows up before others", tag: "Priority" },
      { t: "They ask, you answer", s: "Questions and price requests in one chat", tag: "Price request" },
    ],
  },
  {
    tab: "You get paid",
    color: "#0d965e",
    title: "Close the sale. Get paid.",
    line: "The customer orders and pays on Greep. You manage the sale from your merchant account.",
    caption: "From the scroll to the sale",
    items: [
      { t: "The order comes in", s: "Straight to your merchant account", tag: "Order" },
      { t: "Money held safe", s: "Released when it arrives", tag: "Escrow" },
      { t: "You get paid", s: "In the currency you choose", tag: "Payout" },
    ],
  },
];

const DURATIONS = [4200, 4200, 4800];

export function HowItWorks() {
  const { ref, step, setStep, inView } = useLoop(DURATIONS);
  const cur = STEPS[step];

  return (
    <section id="how" className="relative overflow-x-clip py-16 md:py-22">
      <div ref={ref} className="mx-auto w-full max-w-6xl px-4">
        <Eyebrow index="02">How it works</Eyebrow>
        <h2 className="display mt-5 max-w-5xl text-[clamp(36px,5vw,64px)]">
          From discovery to sale. <span className="text-faint">Greep connects the dots.</span>
        </h2>

        {/* slim pill tabs */}
        <div className="mt-8 inline-flex rounded-full border border-line bg-sunken p-[3px]" role="tablist">
          {STEPS.map((s, i) => (
            <button key={s.tab} role="tab" aria-selected={step === i} onClick={() => setStep(i)} className="relative h-8 rounded-full px-4 text-[14px] font-medium md:px-5">
              {step === i && <motion.span layoutId="how-tab" className="absolute inset-0 rounded-full bg-paper shadow-[var(--ring-inset),0_1px_3px_rgb(0_0_0/0.1)]" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
              <span className={`relative transition-colors ${step === i ? "text-ink" : "text-muted hover:text-ink"}`}>{s.tab}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,540px)] md:gap-16">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
              <h3 className="font-display text-[clamp(26px,3vw,36px)] font-bold tracking-[-0.045em]">{cur.title}</h3>
              <p className="mt-3 max-w-md text-[16px] leading-relaxed text-muted">{cur.line}</p>
              <ul className="mt-7 space-y-3">
                {cur.items.map((it, i) => (
                  <motion.li
                    key={it.t}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 300, damping: 26 }}
                    className="flex items-center gap-4 rounded-2xl border border-line bg-paper px-4 py-3.5 shadow-[0_1px_2px_rgb(0_0_0/0.03)]"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.12, type: "spring", stiffness: 500, damping: 15 }}
                      className="grid size-6 shrink-0 place-items-center rounded-lg text-white"
                      style={{ background: cur.color }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold tracking-[-0.01em]">{it.t}</span>
                      <span className="block truncate text-[13.5px] text-muted">{it.s}</span>
                    </span>
                    <span className="hidden shrink-0 rounded-full border border-line px-3 py-1 text-[12.5px] font-medium text-ink-2 sm:block">{it.tag}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <Board step={step} inView={inView} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ board */

function Board({ step, inView }: { step: number; inView: boolean }) {
  const cur = STEPS[step];

  return (
    <div className="relative mx-auto w-full max-w-[540px] md:mx-0">
      <div
        className="relative overflow-hidden rounded-[32px] p-4 transition-[background-color] duration-700 md:p-5"
        style={{ backgroundColor: `color-mix(in srgb, ${cur.color} 13%, var(--color-paper))` }}
      >
        <BlobDoodles play={inView} />

        <div className="relative z-10 flex items-center justify-between gap-3 px-1">
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="rounded-full px-3 py-1 text-[12.5px] font-semibold text-white"
              style={{ background: cur.color }}
            >
              0{step + 1} · {cur.tab}
            </motion.span>
          </AnimatePresence>
          <span className="text-[13px] font-medium text-ink-2">{cur.caption}</span>
        </div>

        <div className="relative z-10 mx-auto mt-2 max-w-[470px]">
          <HowItWorksFigure step={step as 0 | 1 | 2} />
        </div>
      </div>

      <FloatChips step={step} />
    </div>
  );
}

/* Small white cards that hang off the board edges, one pair per step. */
function FloatChips({ step }: { step: number }) {
  const pairs = [
    [
      { label: "Found on", body: <span className="flex gap-1.5">{(["video", "camera", "pin"] as const).map((k) => <AppTile key={k} kind={k} size={30} />)}</span> },
      { label: "Price", body: <Pill bg="#0a0a0a"><Tag size={14} /> ₦45,000</Pill> },
    ],
    [
      { label: "Matched to", body: <Pill bg="#ee6f38"><Check size={14} strokeWidth={3} /> Your store</Pill> },
      { label: "Held safe", body: <Pill bg="#0a0a0a"><Lock size={14} /> ₦45,000</Pill> },
    ],
    [
      { label: "Delivered", body: <Pill bg="#7c6cf2"><Truck size={14} /> Today</Pill> },
      { label: "You got paid", body: <Pill bg="#0d965e">+₦45,000</Pill> },
    ],
  ][step];

  const spots = [
    { cls: "left-2 top-[34%] md:-left-8", rot: -4 },
    { cls: "right-2 top-[12%] md:-right-7", rot: 4 },
  ];

  return (
    <AnimatePresence mode="popLayout">
      {pairs.map((c, i) => (
        <motion.div
          key={`${step}-${i}`}
          initial={{ opacity: 0, scale: 0.6, rotate: spots[i].rot * 3 }}
          animate={{ opacity: 1, scale: 1, rotate: spots[i].rot }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
          transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.25 + i * 0.12 }}
          className={`absolute z-20 hidden rounded-2xl bg-white p-2 sm:block text-[#0a0a0a] shadow-[0_18px_40px_-16px_rgb(0_0_0/0.45)] ring-1 ring-black/5 ${spots[i].cls}`}
        >
          <p className="px-1 pb-1.5 text-[11.5px] font-medium text-[#71717a]">{c.label}</p>
          {c.body}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

function Pill({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <span className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-[14px] font-semibold text-white" style={{ background: bg }}>
      {children}
    </span>
  );
}

/* ---------------------------------------------------------- blob doodles */

const BLOBS = [
  "M32 6c12 0 24 8 24 22s-8 30-26 30S6 46 7 30 20 6 32 6z",
  "M30 8c10-3 26 4 27 18s-6 24-20 29S5 52 6 36s14-25 24-28z",
  "M34 7c14 2 22 14 20 28s-14 23-28 21S6 42 9 28 22 5 34 7z",
  "M28 9c13-4 29 6 28 21S45 56 31 56 6 47 7 32s8-20 21-23z",
];

const DOODLES: { x: string; y: string; size: number; fill: string; shape: number; face?: boolean; kind?: "squiggle" | "ring" }[] = [
  { x: "5%", y: "14%", size: 58, fill: "#b9abf3", shape: 0, face: true },
  { x: "82%", y: "36%", size: 52, fill: "#f3c54c", shape: 1, face: true },
  { x: "10%", y: "58%", size: 40, fill: "#c6f36d", shape: 2 },
  { x: "58%", y: "9%", size: 44, fill: "#8fb5f5", shape: 3, face: true },
  { x: "86%", y: "66%", size: 38, fill: "#ee6f38", shape: 0 },
  { x: "38%", y: "72%", size: 52, fill: "", shape: 0, kind: "squiggle" },
  { x: "28%", y: "8%", size: 28, fill: "", shape: 0, kind: "ring" },
  { x: "3%", y: "78%", size: 46, fill: "#e3574a", shape: 1, face: true },
  { x: "70%", y: "74%", size: 34, fill: "#b9abf3", shape: 3 },
  { x: "88%", y: "8%", size: 30, fill: "", shape: 0, kind: "ring" },
  { x: "46%", y: "30%", size: 36, fill: "#c6f36d", shape: 2, face: true },
];

function BlobDoodles({ play }: { play: boolean }) {
  const reduce = useReducedMotion();
  const live = play && !reduce;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {DOODLES.map((d, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ left: d.x, top: d.y, width: d.size, height: d.size }}
          initial={false}
          animate={live ? { scale: [0, 1.12, 1, 1, 0], rotate: [-20, 6, 0, -4, 10] } : { scale: 0.9, rotate: 0 }}
          transition={live ? { duration: 3.6 + (i % 3) * 0.8, times: [0, 0.12, 0.2, 0.82, 1], repeat: Infinity, repeatDelay: 0.6 + (i % 4) * 0.5, delay: i * 0.55, ease: "easeOut" } : { duration: 0.3 }}
        >
          <Doodle d={d} />
        </motion.span>
      ))}
    </div>
  );
}

function Doodle({ d }: { d: (typeof DOODLES)[number] }) {
  if (d.kind === "squiggle")
    return (
      <svg viewBox="0 0 64 64" className="size-full opacity-50" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M6 40c8-16 14-16 18 0s10 16 16 0 12-16 18 0" />
      </svg>
    );
  if (d.kind === "ring")
    return (
      <svg viewBox="0 0 64 64" className="size-full opacity-50" fill="none" stroke="currentColor" strokeWidth="6">
        <circle cx="32" cy="32" r="22" />
      </svg>
    );
  return (
    <svg viewBox="0 0 64 64" className="size-full">
      <path d={BLOBS[d.shape]} fill={d.fill} stroke="#0a0a0a" strokeWidth="3" strokeLinejoin="round" />
      {d.face && (
        <g fill="#0a0a0a">
          <circle cx="25" cy="29" r="3" />
          <circle cx="39" cy="29" r="3" />
          <path d="M26 38c3 4 9 4 12 0" fill="none" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
