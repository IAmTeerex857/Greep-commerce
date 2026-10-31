"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Lock } from "lucide-react";
import { Eyebrow, Reveal, SplitWords } from "@/components/ui/Reveal";
import { useLoop } from "@/components/ui/useLoop";
import { Tote } from "@/components/illustrations/Tote";

/*
 * "Buy it in your own currency."
 * Big coins slide down a curving road toward you (the same road that pours out
 * of the hero), while a checkout card rolls its price from one currency to the
 * next, opens its currency picker and presses Pay, on a loop.
 */

/* ---------- coins (shared with the hero road) ---------- */

export type CoinSpec = { sym: string; face: string; ink: string };

export const COINS: Record<string, CoinSpec> = {
  NGN: { sym: "₦", face: "#c6f36d", ink: "#0a3b27" },
  USD: { sym: "$", face: "#f4fbf7", ink: "#0d965e" },
  GBP: { sym: "£", face: "#b9abf3", ink: "#241a5e" },
  GHS: { sym: "GH₵", face: "#f3c54c", ink: "#3d2a00" },
  KES: { sym: "KSh", face: "#ee6f38", ink: "#ffffff" },
  EUR: { sym: "€", face: "#8fb5f5", ink: "#0f2a5c" },
  ZAR: { sym: "R", face: "#e3574a", ink: "#ffffff" },
  MWK: { sym: "MK", face: "#9be7bd", ink: "#0a3b27" },
};

const RIM = "#12a466";
const RIM_HI = "#3cc98a";
const EDGE = "#0a6b43";
const EDGE_DARK = "#064d30";

/**
 * A thick 3D coin built from stacked discs. The parent sets rotateX/rotateY;
 * this keeps preserve-3d so the edge shows as real thickness.
 */
export function Coin({ spec, size = 88 }: { spec: CoinSpec; size?: number }) {
  const depth = Math.max(4, Math.round(size * 0.11));
  const len = spec.sym.length;
  const fs = size * (len === 1 ? 0.36 : len === 2 ? 0.25 : 0.2);
  const face = (
    <div
      className="absolute inset-0 grid place-items-center rounded-full"
      style={{
        background: `repeating-conic-gradient(from 8deg, ${RIM} 0deg 37deg, rgba(255,255,255,.88) 37deg 45deg)`,
        boxShadow: `inset 0 0 0 ${size * 0.03}px ${RIM_HI}`,
      }}
    >
      <div className="absolute inset-[9%] rounded-full" style={{ background: `radial-gradient(circle at 34% 28%, ${RIM_HI}, ${RIM} 70%)` }} />
      <div
        className="relative grid size-[66%] place-items-center rounded-full"
        style={{
          background: spec.face,
          boxShadow: `inset 0 ${size * 0.025}px 0 rgba(255,255,255,.45), inset 0 -${size * 0.03}px 0 rgba(0,0,0,.14), 0 0 0 ${size * 0.018}px rgba(0,0,0,.12)`,
        }}
      >
        <span className="font-display font-bold leading-none tracking-[-0.06em]" style={{ color: spec.ink, fontSize: fs }}>
          {spec.sym}
        </span>
      </div>
    </div>
  );
  return (
    <div className="relative" style={{ width: size, height: size, transformStyle: "preserve-3d" }}>
      {Array.from({ length: depth }, (_, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            background: i % 3 === 1 ? EDGE_DARK : EDGE,
            transform: `translateZ(${-(i + 1)}px)`,
          }}
        />
      ))}
      <div className="absolute inset-0" style={{ transform: `translateZ(${-depth - 1}px) rotateY(180deg)` }}>
        {face}
      </div>
      {face}
    </div>
  );
}

/* ---------- section ---------- */

export function Currency() {
  return (
    <section id="currency" className="relative overflow-x-clip py-24 md:py-32">
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-6">
        <div className="max-w-[520px]">
          <Reveal>
            <Eyebrow index="03">Pay your way</Eyebrow>
          </Reveal>
          <h2 className="display mt-5 text-[clamp(40px,5.2vw,76px)] leading-[0.98]">
            <SplitWords text="Buy it in your own currency." />
          </h2>
          <Reveal as="p" delay={0.15} className="mt-6 max-w-md text-[17px] leading-relaxed text-muted md:text-lg">
            Check out instantly on Greep in any currency, including African currencies.
          </Reveal>
          <Reveal delay={0.25} className="mt-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-tint py-2 pl-2 pr-4 text-[15px] font-semibold text-green">
              <span className="grid size-6 place-items-center rounded-full bg-green text-white">
                <Check size={14} strokeWidth={3} />
              </span>
              No need to convert.
            </span>
          </Reveal>
          <Reveal delay={0.35} className="mt-9 flex flex-wrap gap-1.5">
            {Object.entries(COINS).map(([code, c]) => (
              <span key={code} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-paper pl-1 pr-3 text-[12.5px] font-medium text-ink-2">
                <span className="grid size-6 place-items-center rounded-full font-display text-[10px] font-bold tracking-[-0.04em]" style={{ background: c.face, color: c.ink }}>
                  {c.sym.length > 2 ? c.sym.slice(0, 2) : c.sym}
                </span>
                {code}
              </span>
            ))}
          </Reveal>
        </div>

        <CurrencyStage />
      </div>
    </section>
  );
}

/* ---------- the stage: coin road + checkout card ---------- */

const SW = 660;
const SH = 600;
// Road centreline: far end top-left, swings right, then sweeps down toward you.
const RB = [
  { x: 150, y: 40 },
  { x: 720, y: 70 },
  { x: 640, y: 380 },
  { x: 500, y: 720 },
];
const ROAD_W = (t: number) => 10 + 330 * Math.pow(t, 1.35);
const ROAD_COINS = ["NGN", "GHS", "KES", "USD", "GBP", "EUR", "ZAR", "MWK"];
const FLOW_S = 16;

function bez(t: number, P = RB) {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return { x: a * P[0].x + b * P[1].x + c * P[2].x + d * P[3].x, y: a * P[0].y + b * P[1].y + c * P[2].y + d * P[3].y };
}
function bezN(t: number, P = RB) {
  const u = 1 - t;
  const dx = 3 * u * u * (P[1].x - P[0].x) + 6 * u * t * (P[2].x - P[1].x) + 3 * t * t * (P[3].x - P[2].x);
  const dy = 3 * u * u * (P[1].y - P[0].y) + 6 * u * t * (P[2].y - P[1].y) + 3 * t * t * (P[3].y - P[2].y);
  const l = Math.hypot(dx, dy) || 1;
  return { x: -dy / l, y: dx / l, a: Math.atan2(dy, dx) };
}
const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

function ribbon(from: number, to: number, wf: (t: number) => number, P = RB, steps = 48, k = 0.5) {
  const L: string[] = [];
  const Rr: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    const p = bez(t, P);
    const n = bezN(t, P);
    const w = wf(t) * k;
    L.push(`${(p.x + n.x * w).toFixed(1)} ${(p.y + n.y * w).toFixed(1)}`);
    Rr.unshift(`${(p.x - n.x * w).toFixed(1)} ${(p.y - n.y * w).toFixed(1)}`);
  }
  return `M${L.join("L")}L${Rr.join("L")}Z`;
}

const ROAD_D = ribbon(0, 1, ROAD_W);
const CURB_D = ribbon(0, 1, (t) => ROAD_W(t) + 6 + 18 * t);

function CurrencyStage() {
  const reduce = useReducedMotion();
  const { ref, step, inView } = useLoop([3600, 3600, 3600, 3600, 3600], { amount: 0.25 });
  const [box, setBox] = useState({ scale: 1, left: false });
  const coinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marks = useRef<SVGPathElement>(null);
  const clock = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      // Phones: keep the card readable and let the road run off the right edge.
      setBox(w < SW * 0.8 ? { scale: Math.max(0.74, w / SW), left: true } : { scale: Math.min(1, w / SW), left: false });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  useAnimationFrame((_, delta) => {
    if (!inView && clock.current > 0) return;
    if (!reduce) clock.current += Math.min(delta, 60) / 1000;
    const t0 = clock.current;
    const N = ROAD_COINS.length;
    for (let i = 0; i < N; i++) {
      const el = coinRefs.current[i];
      const inner = innerRefs.current[i];
      if (!el || !inner) continue;
      const u = (i / N + t0 / FLOW_S) % 1;
      const t = Math.pow(u, 1.45);
      const p = bez(t);
      const n = bezN(t);
      const lane = i % 2 ? 1 : -1;
      const w = ROAD_W(t);
      const x = p.x + n.x * lane * w * 0.24;
      const y = p.y + n.y * lane * w * 0.24;
      const s = 0.12 + 0.98 * Math.pow(t, 1.3);
      const op = smooth(u / 0.08) * (1 - smooth((u - 0.88) / 0.1));
      const bob = Math.sin(t0 * 2.2 + i) * 2 * s;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${(y + bob).toFixed(1)}px,0) translate(-50%,-50%) scale(${s.toFixed(3)})`;
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = String(10 + Math.round(u * 100));
      const spin = Math.sin(t0 * 1.3 + i * 1.7) * 6;
      inner.style.transform = `perspective(700px) rotateX(58deg) rotateZ(${(n.a * 57.3 * 0.15 + spin).toFixed(1)}deg)`;
    }
    // lane dashes flowing toward you
    if (marks.current) {
      let d = "";
      const M = 14;
      for (let k = 0; k < M; k++) {
        const u = (k / M + t0 / FLOW_S) % 1;
        const ta = Math.pow(u, 1.45);
        const tb = Math.pow(Math.min(1, u + 0.022), 1.45);
        const a = bez(ta), b = bez(tb), na = bezN(ta), nb = bezN(tb);
        const wa = ROAD_W(ta) * 0.012, wb = ROAD_W(tb) * 0.012;
        d += `M${(a.x + na.x * wa).toFixed(1)} ${(a.y + na.y * wa).toFixed(1)}L${(b.x + nb.x * wb).toFixed(1)} ${(b.y + nb.y * wb).toFixed(1)}L${(b.x - nb.x * wb).toFixed(1)} ${(b.y - nb.y * wb).toFixed(1)}L${(a.x - na.x * wa).toFixed(1)} ${(a.y - na.y * wa).toFixed(1)}Z`;
      }
      marks.current.setAttribute("d", d);
    }
  });

  return (
    <div ref={ref} className="relative w-full" style={{ height: SH * box.scale }}>
      <div
        className={`absolute top-0 ${box.left ? "left-0 origin-top-left" : "left-1/2 origin-top"}`}
        style={{ width: SW, height: SH, transform: box.left ? `scale(${box.scale})` : `translateX(-50%) scale(${box.scale})` }}
      >
        <div className="absolute -inset-x-[240px] top-0 bottom-0 [mask-image:linear-gradient(180deg,black_78%,transparent)]">
          <div className="absolute left-[240px] top-0" style={{ width: SW, height: SH }}>
          <svg viewBox={`0 0 ${SW} ${SH}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="cur-road" gradientUnits="userSpaceOnUse" x1={RB[0].x} y1={RB[0].y} x2={RB[3].x} y2={RB[3].y}>
                <stop offset="0" stopColor="#0d965e" stopOpacity="0" />
                <stop offset="0.16" stopColor="#0b7a4c" />
                <stop offset="1" stopColor="#063a25" />
              </linearGradient>
              <linearGradient id="cur-curb" gradientUnits="userSpaceOnUse" x1={RB[0].x} y1={RB[0].y} x2={RB[3].x} y2={RB[3].y}>
                <stop offset="0" stopColor="#c6f36d" stopOpacity="0" />
                <stop offset="0.2" stopColor="#c6f36d" stopOpacity="0.9" />
                <stop offset="1" stopColor="#9be7bd" />
              </linearGradient>
            </defs>
            <path d={CURB_D} fill="url(#cur-curb)" />
            <path d={ROAD_D} fill="url(#cur-road)" />
            <path ref={marks} fill="#c6f36d" opacity="0.55" />
          </svg>

          {ROAD_COINS.map((code, i) => (
            <div
              key={code}
              ref={(el) => {
                coinRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 will-change-transform"
              style={{ opacity: 0 }}
            >
              <div
                ref={(el) => {
                  innerRefs.current[i] = el;
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Coin spec={COINS[code]} size={150} />
              </div>
            </div>
          ))}
          </div>
        </div>

        <div className="absolute left-[6px] top-[236px] z-[200]">
          <Checkout step={step} reduce={!!reduce} />
        </div>
      </div>
    </div>
  );
}

/* ---------- checkout card ---------- */

const PRICES = [
  { code: "NGN", sym: "₦", amount: "45,000" },
  { code: "USD", sym: "$", amount: "29" },
  { code: "GBP", sym: "£", amount: "23" },
  { code: "GHS", sym: "GH₵ ", amount: "350" },
  { code: "KES", sym: "KSh ", amount: "3,800" },
];

type Phase = "idle" | "press" | "paid" | "open" | "pick";

function Checkout({ step, reduce }: { step: number; reduce: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const price = PRICES[step];
  const next = (step + 1) % PRICES.length;

  useEffect(() => {
    setPhase("idle");
    if (reduce) return;
    const plan: [number, Phase][] = [
      [650, "press"],
      [900, "paid"],
      [1900, "idle"],
      [2450, "open"],
      [2950, "pick"],
    ];
    const ids = plan.map(([ms, p]) => setTimeout(() => setPhase(p), ms));
    return () => ids.forEach(clearTimeout);
  }, [step, reduce]);

  const open = phase === "open" || phase === "pick";
  const hi = phase === "pick" ? next : step;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: -2 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-[318px] rounded-[26px] bg-paper p-4 shadow-[var(--shadow-overlay)] ring-1 ring-line"
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-[19px] font-bold tracking-[-0.04em] text-ink">Checkout</p>

        {/* currency picker */}
        <div className="relative">
          <motion.div
            animate={{ scale: phase === "open" ? 0.96 : 1 }}
            className={`flex h-8 items-center gap-1.5 rounded-full border pl-1 pr-2 text-[12.5px] font-semibold transition-colors ${open ? "border-green bg-green-tint text-ink" : "border-line bg-sunken text-ink"}`}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={price.code}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="flex items-center gap-1.5"
              >
                <MiniCoin code={price.code} />
                {price.code}
              </motion.span>
            </AnimatePresence>
            <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-muted">
              <ChevronDown size={14} strokeWidth={2.5} />
            </motion.span>
          </motion.div>

          <AnimatePresence>
            {open && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="absolute right-0 top-10 z-10 w-[168px] origin-top-right rounded-[14px] bg-paper p-1 shadow-[var(--shadow-overlay)]"
              >
                {PRICES.map((p, i) => (
                  <li key={p.code} className="relative flex h-8 items-center gap-2 rounded-[10px] px-2 text-[12.5px] font-medium text-ink">
                    {i === hi && <motion.span layoutId="cur-hi" className="absolute inset-0 rounded-[10px] bg-hover-2" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                    <span className="relative flex items-center gap-2">
                      <MiniCoin code={p.code} />
                      <span className="w-9">{p.code}</span>
                      <span className="text-muted">{p.sym.trim()}</span>
                    </span>
                    {i === step && <Check size={13} strokeWidth={3} className="relative ml-auto text-green" />}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* item */}
      <div className="mt-3.5 flex items-center gap-3 rounded-[16px] bg-sunken p-2">
        <Tote className="size-12 rounded-[11px]" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[13.5px] font-semibold tracking-tight text-ink">Ankara tote</p>
          <p className="mt-0.5 text-[11.5px] text-muted">kemi.closet · Lagos</p>
        </div>
        <span className="rounded-full bg-paper px-2 py-1 text-[10.5px] font-semibold text-ink-2 shadow-hairline">x1</span>
      </div>

      {/* total */}
      <div className="mt-4 flex items-end justify-between px-1">
        <div>
          <p className="text-[12px] font-medium text-muted">Total</p>
          <p className="mt-1 flex items-baseline font-display text-[42px] font-bold leading-none tracking-[-0.05em] text-ink">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={price.sym}
                initial={{ y: "0.5em", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-0.5em", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="whitespace-pre"
              >
                {price.sym}
              </motion.span>
            </AnimatePresence>
            <Odometer value={price.amount} />
          </p>
        </div>
        <span className="mb-1 rounded-full bg-green-tint px-2 py-1 text-[10.5px] font-semibold text-green">No fees</span>
      </div>

      {/* pay */}
      <motion.div
        animate={{ scale: phase === "press" ? 0.95 : 1, backgroundColor: phase === "paid" ? "#0d965e" : "var(--color-ink)" }}
        transition={{ type: "spring", stiffness: 600, damping: 22 }}
        className="relative mt-4 flex h-12 items-center justify-center overflow-hidden rounded-[16px] text-[15px] font-semibold text-canvas"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "paid" ? (
            <motion.span key="paid" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} className="flex items-center gap-1.5 text-white">
              <Check size={17} strokeWidth={3} /> Paid
            </motion.span>
          ) : (
            <motion.span key={`pay-${price.code}`} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }}>
              Pay {price.sym}
              {price.amount}
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {phase === "press" && (
            <motion.span
              className="pointer-events-none absolute right-16 top-1/2 size-10 -translate-y-1/2 rounded-full border-2 border-lime bg-lime/30"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1.4, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-muted">
        <Lock size={12} strokeWidth={2.4} className="text-green" /> Held safe until it arrives
      </p>
    </motion.div>
  );
}

function MiniCoin({ code }: { code: string }) {
  const c = COINS[code];
  const s = c.sym.length > 2 ? c.sym.slice(0, 2) : c.sym;
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full font-display text-[9.5px] font-bold tracking-[-0.04em] ring-2 ring-[#12a466]" style={{ background: c.face, color: c.ink }}>
      {s}
    </span>
  );
}

/* ---------- odometer digits ---------- */

function Odometer({ value }: { value: string }) {
  const chars = value.split("");
  const n = chars.length;
  return (
    <span className="relative inline-flex tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        {chars.map((ch, i) => {
          const pos = n - 1 - i; // place from the right keeps units aligned
          const digit = /\d/.test(ch);
          return (
            <motion.span
              key={`${pos}-${digit ? "d" : ch}`}
              layout="position"
              initial={{ opacity: 0, y: "0.4em" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-0.4em" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="inline-block"
            >
              {digit ? <Wheel d={Number(ch)} delay={pos * 0.05} /> : <span className="inline-block w-[0.28em]">{ch}</span>}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </span>
  );
}

function Wheel({ d, delay }: { d: number; delay: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden [mask-image:linear-gradient(180deg,transparent,black_10%,black_90%,transparent)]">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-d}em` }}
        transition={{ type: "spring", stiffness: 110, damping: 18, delay }}
      >
        {Array.from({ length: 10 }, (_, k) => (
          <span key={k} className="block h-[1em] text-center leading-[1em]">
            {k}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
