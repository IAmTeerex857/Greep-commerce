"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Blobatar } from "@blobatar/react";
import { happy, idle, love } from "blobatar/expression";
import { ArrowRight, Gift, ShoppingBag, Ticket } from "lucide-react";
import { siVisa } from "simple-icons";
import { Eyebrow, Reveal, SplitWords } from "@/components/ui/Reveal";
import { LogoMark } from "@/components/ui/Logo";
import { useLoop } from "@/components/ui/useLoop";

/* ---------- data (invented merchants only) ---------- */

const MERCHANTS = [
  { name: "Ada Styles", seed: "ada.styles", hue: 22, item: "Ankara tote", paid: "$32", pts: 120, angle: -145, coupon: "15% off", code: "ADA15", ticket: "#c6f36d" },
  { name: "Zee Home", seed: "zee.home", hue: 150, item: "Ribbed vase", paid: "$24", pts: 90, angle: -35, coupon: "Free delivery", code: "ZEESHIP", ticket: "#f3c54c" },
  { name: "Tunde Kicks", seed: "tunde.kicks", hue: 255, item: "Chunky sneakers", paid: "$64", pts: 240, angle: 45, coupon: "$5 off", code: "TK5OFF", ticket: "#b9abf3" },
  { name: "Kemi Closet", seed: "kemi.closet", hue: 330, item: "Round shades", paid: "$18", pts: 70, angle: 140, coupon: "2x points", code: "KEMI2X", ticket: "#8fb5f5" },
] as const;

const CHIPS = [
  { label: "15% off", angle: -95 },
  { label: "Free delivery", angle: -10 },
  { label: "+120 pts", angle: 70 },
  { label: "$5 off", angle: 150 },
  { label: "2x points", angle: 215 },
];

// Per purchase: 0 paid · 1 coins fly in · 2 points roll up, stamp lands · 3 coupon tears out
const PHASES = [1100, 1000, 1300, 2000];
const DURATIONS = MERCHANTS.flatMap(() => PHASES);
const START_POINTS = 2480;
const START_STAMPS = 3;

/* Orbit canvas */
const S = 580;
const C = S / 2;
const R1 = 104;
const R2 = 172;
const R3 = 232;

/* ---------- section ---------- */

export function Rewards() {
  const { ref, step, inView } = useLoop(DURATIONS, { amount: 0.25 });
  const wraps = useWraps(step, DURATIONS.length);
  const reduce = !!useReducedMotion();
  const n = MERCHANTS.length;
  const i = Math.floor(step / PHASES.length);
  const p = step % PHASES.length;
  const m = MERCHANTS[i];

  // Purchases whose points have landed, across loops.
  const done = wraps * n + i + (p >= 2 ? 1 : 0);
  const loopPts = MERCHANTS.reduce((a, x) => a + x.pts, 0);
  const points = START_POINTS + wraps * loopPts + MERCHANTS.slice(0, i + (p >= 2 ? 1 : 0)).reduce((a, x) => a + x.pts, 0);
  const torn = wraps * n + i + (p >= 3 ? 1 : 0);

  // Orbit angle, advanced every frame while on screen.
  const rot = useMotionValue(0);
  useAnimationFrame((_, dt) => {
    if (!inView || reduce) return;
    rot.set(rot.get() + Math.min(dt, 50) * 0.0055);
  });

  return (
    <section id="rewards" className="relative overflow-x-clip py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Eyebrow index="06">Rewards</Eyebrow>
          <h2 className="display mt-5 text-[clamp(36px,5.2vw,68px)]">
            <SplitWords text="Every purchase comes with" />
            <br className="hidden sm:block" />{" "}
            <SplitWords text="more to look forward to." delay={0.15} className="text-green" />
          </h2>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
              Shop from your favourite merchants and brands. Earn loyalty rewards and unlock brand coupons along the way. The more you shop, the more rewards you get from the brands you love.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <Kicker active={p} />
          </Reveal>
        </div>

        <div ref={ref} className="mt-12 grid grid-cols-1 items-center gap-4 md:mt-14 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_580px_minmax(0,1fr)] xl:gap-6">
          <div className="min-w-0 md:col-span-2 xl:order-2 xl:col-span-1">
            <Fit w={S} h={S}>
              <Orbit rot={rot} active={i} phase={p} reduce={reduce} k={wraps * n + i} />
            </Fit>
          </div>
          <div className="grid min-w-0 gap-4 xl:order-1">
            <PointsCard points={points} last={done > 0 ? MERCHANTS[(done - 1) % n] : null} lastKey={done} />
            <StampCard stamps={START_STAMPS + done} />
          </div>
          <div className="min-w-0 xl:order-3">
            <CouponCard index={i} torn={p >= 3} count={torn} reduce={reduce} k={wraps * n + i} merchant={m} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Kicker({ active }: { active: number }) {
  const steps = [
    { label: "Shop.", icon: <ShoppingBag size={15} strokeWidth={2.2} />, on: active <= 1 },
    { label: "Earn.", icon: <EarnIcon />, on: active === 2 },
    { label: "Get rewarded.", icon: <Gift size={15} strokeWidth={2.2} />, on: active === 3 },
  ];
  return (
    <p className="mt-8 flex flex-wrap items-center justify-center gap-1.5 text-[15px] font-semibold">
      {steps.map((s, j) => (
        <span key={s.label} className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 transition-colors duration-500 ${
              s.on ? "border-transparent bg-ink text-canvas" : "border-line bg-paper text-ink"
            }`}
          >
            <span className={s.on ? "text-lime" : "text-green"}>{s.icon}</span>
            {s.label}
          </span>
          {j < steps.length - 1 && <ArrowRight size={14} className="text-faint" aria-hidden />}
        </span>
      ))}
    </p>
  );
}

/** Counts how many times a useLoop step has wrapped, so totals keep climbing. */
function useWraps(step: number, n: number) {
  const [st, setSt] = useState({ step, wraps: 0 });
  if (st.step !== step) setSt({ step, wraps: st.wraps + (step === 0 && st.step === n - 1 ? 1 : 0) });
  return st.wraps;
}

/** Scales a fixed-size design canvas down to fit its column. */
function Fit({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setS(Math.min(1, el.clientWidth / w));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} className="mx-auto w-full" style={{ maxWidth: w }}>
      <div className="relative" style={{ height: h * s }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: w, height: h, transform: `scale(${s})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------- orbit ---------- */

const rad = (d: number) => (d * Math.PI) / 180;
const at = (deg: number, r: number) => ({ x: C + r * Math.cos(rad(deg)), y: C + r * Math.sin(rad(deg)) });

function Orbit({ rot, active, phase, reduce, k }: { rot: MotionValue<number>; active: number; phase: number; reduce: boolean; k: number }) {
  const m = MERCHANTS[active];
  return (
    <div className="relative size-full">
      {/* glow */}
      <div
        aria-hidden
        className="absolute inset-[60px] rounded-full"
        style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-green) 16%, transparent), transparent 75%)" }}
      />

      {/* rings */}
      <svg width={S} height={S} className="absolute inset-0" aria-hidden>
        <defs>
          <linearGradient id="rw-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c6f36d" />
            <stop offset="1" stopColor="#0d965e" />
          </linearGradient>
          <linearGradient id="rw-arc2" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#b9abf3" />
            <stop offset="1" stopColor="#f3c54c" />
          </linearGradient>
        </defs>
        <circle cx={C} cy={C} r={R1} fill="none" stroke="var(--color-line-strong)" strokeDasharray="2 6" strokeLinecap="round" />
        <circle cx={C} cy={C} r={R2} fill="none" stroke="var(--color-line-strong)" />
        <circle cx={C} cy={C} r={R3} fill="none" stroke="var(--color-line)" strokeWidth="1.5" />
        {/* glowing arcs that sweep the rings */}
        <g className="rw-spin" style={{ transformOrigin: `${C}px ${C}px`, animationDuration: "14s" }}>
          <circle cx={C} cy={C} r={R2} fill="none" stroke="url(#rw-arc)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${R2 * 1.1} ${R2 * 7}`} />
        </g>
        <g className="rw-spin" style={{ transformOrigin: `${C}px ${C}px`, animationDuration: "22s", animationDirection: "reverse" }}>
          <circle cx={C} cy={C} r={R3} fill="none" stroke="url(#rw-arc2)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${R3 * 0.8} ${R3 * 7}`} />
        </g>
        {/* tiny planets */}
        {[
          [R3, 20, "#f3c54c"],
          [R3, 200, "#7c6cf2"],
          [R2, 110, "#0d965e"],
          [R1 + 36, 300, "#8fb5f5"],
          [R1 + 36, 130, "#ee6f38"],
        ].map(([r, a, c], j) => {
          const q = at(a as number, r as number);
          return <circle key={j} cx={q.x} cy={q.y} r={j % 2 ? 3 : 4} fill={c as string} />;
        })}
      </svg>

      {/* inner ring: little coins */}
      {[0, 120, 240].map((a) => (
        <Orbiter key={a} rot={rot} base={a} r={R1} speed={1.8}>
          <Coin size={18} />
        </Orbiter>
      ))}

      {/* outer ring: coupon chips */}
      {CHIPS.map((c) => (
        <Orbiter key={c.label} rot={rot} base={c.angle} r={R3} speed={-0.55}>
          <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-paper px-3 py-1.5 text-[12.5px] font-semibold shadow-card">
            <Ticket size={13} className="text-green" strokeWidth={2.2} />
            {c.label}
          </span>
        </Orbiter>
      ))}

      {/* middle ring: merchants */}
      {MERCHANTS.map((x, j) => {
        const on = j === active;
        return (
          <Orbiter key={x.name} rot={rot} base={x.angle} r={R2} speed={1} z={on ? 30 : 20}>
            <MerchantBlob merchant={x} on={on} phase={phase} />
          </Orbiter>
        );
      })}

      {/* centre: Greep loyalty card */}
      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <LoyaltyCard bump={phase === 2} reduce={reduce} />
        <AnimatePresence>
          {phase === 2 && (
            <motion.span
              key={`plus-${k}`}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: [0, 1, 1, 0], y: -54, scale: 1 }}
              transition={{ duration: 1.25, ease: "easeOut", times: [0, 0.15, 0.7, 1] }}
              className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-lime px-3 py-1 font-mono text-[13px] font-bold text-[#0a0a0a] shadow-card"
            >
              +{m.pts} pts
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* coins flying from the merchant into the card */}
      <AnimatePresence>{phase === 1 && !reduce && <CoinBurst key={`burst-${k}`} rot={rot} base={m.angle} />}</AnimatePresence>

      <style>{`
        @keyframes rw-spin { to { transform: rotate(360deg); } }
        .rw-spin { animation: rw-spin linear infinite; }
        @media (prefers-reduced-motion: reduce) { .rw-spin { animation: none; } }
      `}</style>
    </div>
  );
}

function Orbiter({ rot, base, r, speed, z = 10, children }: { rot: MotionValue<number>; base: number; r: number; speed: number; z?: number; children: ReactNode }) {
  const x = useTransform(rot, (v) => C + r * Math.cos(rad(base + v * speed)));
  const y = useTransform(rot, (v) => C + r * Math.sin(rad(base + v * speed)));
  return (
    <motion.div className="absolute left-0 top-0" style={{ x, y, zIndex: z }}>
      <div className="-translate-x-1/2 -translate-y-1/2">{children}</div>
    </motion.div>
  );
}

function MerchantBlob({ merchant, on, phase }: { merchant: (typeof MERCHANTS)[number]; on: boolean; phase: number }) {
  const expr = on ? (phase === 0 ? happy : phase === 1 ? love : happy) : idle;
  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {on && phase <= 1 && (
          <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 460, damping: 22 }}
            className="absolute -top-10 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-canvas shadow-card"
          >
            Paid {merchant.paid}
            <span className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-ink" />
          </motion.span>
        )}
      </AnimatePresence>
      <motion.div
        animate={{ scale: on ? 1.14 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className={`relative grid size-[64px] place-items-center rounded-full bg-paper shadow-[0_0_0_1px_var(--color-line),0_14px_28px_-14px_rgb(0_0_0/0.45)] transition-shadow duration-500 ${
          on ? "!shadow-[0_0_0_2.5px_var(--color-green),0_0_28px_-2px_rgb(13_150_94/0.45)]" : ""
        }`}
      >
        <Blobatar name={merchant.seed} hue={merchant.hue} animate="always" expression={expr} size={62} />
      </motion.div>
      <span className={`mt-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold shadow-hairline ${on ? "bg-green text-white" : "bg-paper text-ink-2"}`}>
        {merchant.name}
      </span>
    </div>
  );
}

/** A Greep point: a lime coin with a stepped rim and the one-tone Greep mark. */
function Coin({ size = 22 }: { size?: number }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "#c6f36d",
        boxShadow: `inset 0 0 0 ${Math.max(1.5, size * 0.07)}px #0a0a0a, inset 0 -${size * 0.1}px 0 rgb(10 10 10 / .14), 0 0 14px rgb(198 243 109 / .55)`,
      }}
    >
      <span
        aria-hidden
        className="absolute rounded-full border-dashed"
        style={{ inset: size * 0.16, borderWidth: Math.max(0.75, size * 0.03), borderColor: "rgb(10 10 10 / .3)" }}
      />
      <span className="relative" style={{ marginTop: -size * 0.04 }}>
        <LogoMark size={size * 0.5} ink="#0a0a0a" mono />
      </span>
    </span>
  );
}

/** The Earn icon: a coin outline holding the Greep mark, in the pill's colour. */
function EarnIcon() {
  return (
    <span className="grid size-[17px] place-items-center rounded-full border-[1.75px] border-current">
      <LogoMark size={10} mono />
    </span>
  );
}

function CoinBurst({ rot, base }: { rot: MotionValue<number>; base: number }) {
  // Where the merchant is right now when the coins leave.
  const [from] = useState(() => at(base + rot.get(), R2));
  const mid = { x: (from.x + C) / 2 + (from.y - C) * 0.35, y: (from.y + C) / 2 - (from.x - C) * 0.35 };
  return (
    <motion.div className="pointer-events-none absolute inset-0 z-40" exit={{ opacity: 0 }}>
      {Array.from({ length: 6 }, (_, j) => (
        <motion.span
          key={j}
          className="absolute left-0 top-0 -ml-[13px] -mt-[13px]"
          initial={{ x: from.x, y: from.y, scale: 0.3, opacity: 0 }}
          animate={{
            x: [from.x, mid.x + (j - 2.5) * 6, C],
            y: [from.y, mid.y + (j % 2 ? 8 : -8), C],
            scale: [0.3, 1.1, 0.5],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 0.75, delay: j * 0.06, ease: [0.45, 0, 0.3, 1], opacity: { duration: 0.75, delay: j * 0.06, times: [0, 0.15, 0.85, 1] } }}
        >
          <Coin size={26} />
        </motion.span>
      ))}
    </motion.div>
  );
}

/** The Greep card, matched to the app's CardFace: lime, faint mark off the corner, chip, mono number, Visa. */
function LoyaltyCard({ bump, reduce }: { bump: boolean; reduce: boolean }) {
  const soft = "rgb(10 10 10 / .55)";
  return (
    <motion.div
      animate={reduce ? {} : { rotateX: [8, -4, 8], rotateY: [-10, 10, -10], y: [0, -4, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformPerspective: 700 }}
    >
      <motion.div
        animate={{ scale: bump ? [1, 1.07, 1] : 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative flex h-[126px] w-[200px] flex-col justify-between overflow-hidden rounded-[15px] bg-lime p-3 text-[#0a0a0a] shadow-[0_12px_28px_rgb(0_0_0/0.14)]"
      >
        <span aria-hidden className="absolute -bottom-[38px] -right-[26px] opacity-[0.07]">
          <LogoMark size={146} ink="#0a0a0a" mono />
        </span>
        <motion.span
          aria-hidden
          className="absolute inset-y-0 w-16 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          initial={{ left: "-30%" }}
          animate={{ left: bump ? ["-30%", "130%"] : "-30%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div className="relative flex items-center gap-[5px]">
          <LogoMark size={13} ink="#0a0a0a" mono />
          <span className="font-display text-[11.5px] font-bold leading-none tracking-[-0.03em]">greep</span>
          <span className="mx-px h-[9px] w-px" style={{ background: soft }} />
          <span className="text-[9px] font-medium leading-none" style={{ color: soft }}>Rewards</span>
        </div>
        <svg width="24" height="18" viewBox="0 0 40 30" className="relative" aria-hidden>
          <rect x="0.5" y="0.5" width="39" height="29" rx="6" fill="#e8e2c4" stroke="rgb(10 10 10 / .28)" strokeWidth="0.75" />
          <path d="M0 10 H13 M0 20 H13 M27 10 H40 M27 20 H40 M13 0 V30 M27 0 V30 M13 15 H27" stroke="rgb(10 10 10 / .28)" strokeWidth="0.75" fill="none" />
        </svg>
        <div className="relative">
          <p className="font-mono text-[11px] leading-none tracking-[0.08em] tabular-nums">••••&nbsp; ••••&nbsp; ••••&nbsp; 2481</p>
          <div className="mt-[7px] flex items-end justify-between">
            <span className="flex gap-3">
              <CardField label="Card holder" value="Tolu A." soft={soft} />
              <CardField label="Expires" value="08/29" soft={soft} />
            </span>
            <svg width="30" height="10" viewBox="0 0 24 8" aria-hidden>
              <path d={siVisa.path} fill="#0a0a0a" transform="translate(0 -8)" />
            </svg>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardField({ label, value, soft }: { label: string; value: string; soft: string }) {
  return (
    <span className="flex flex-col gap-px">
      <span className="text-[6.5px] leading-none" style={{ color: soft }}>{label}</span>
      <span className="text-[8.5px] font-medium leading-tight tabular-nums">{value}</span>
    </span>
  );
}

/* ---------- side cards ---------- */

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card relative p-5 ${className}`}>{children}</div>;
}

function Rolling({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const sp = useSpring(mv, { stiffness: 55, damping: 18 });
  const txt = useTransform(sp, (v) => Math.round(v).toLocaleString("en-US"));
  useEffect(() => {
    mv.set(value);
  }, [mv, value]);
  return <motion.span className="tabular-nums">{txt}</motion.span>;
}

function PointsCard({ points, last, lastKey }: { points: number; last: (typeof MERCHANTS)[number] | null; lastKey: number }) {
  const next = Math.ceil((points + 1) / 500) * 500;
  const pct = ((points % 500) / 500) * 100;
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <p className="eyebrow text-muted">Greep points</p>
        <Coin size={22} />
      </div>
      <p className="mt-3 font-display text-[44px] font-bold leading-none tracking-[-0.05em]">
        <Rolling value={points} />
      </p>
      <div className="mt-2 h-5 overflow-hidden text-[13px]">
        <AnimatePresence mode="wait" initial={false}>
          {last && (
            <motion.p
              key={lastKey}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="truncate text-muted"
            >
              <span className="font-semibold text-green">+{last.pts}</span> from {last.name}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-sunken">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #0d965e, #c6f36d)" }}
          initial={false}
          animate={{ width: `${Math.max(4, pct)}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </div>
      <p className="mt-2 flex justify-between font-mono text-[11px] text-muted">
        <span>Next reward</span>
        <span>{next.toLocaleString("en-US")} pts</span>
      </p>
    </Panel>
  );
}

function StampCard({ stamps }: { stamps: number }) {
  const filled = stamps % 8 === 0 ? 8 : stamps % 8;
  const full = filled === 8;
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-muted">Stamp card</p>
          <p className="mt-1.5 text-[14px] font-semibold">Buy 8, get free delivery</p>
        </div>
        <span className="font-mono text-[12px] font-semibold text-muted tabular-nums">{filled}/8</span>
      </div>
      <div className="mt-4 grid max-w-[232px] grid-cols-4 gap-2.5">
        {Array.from({ length: 8 }, (_, j) => {
          const on = j < filled;
          const fresh = j === filled - 1;
          return (
            <span key={j} className="relative grid aspect-square place-items-center rounded-full border-[1.5px] border-dashed border-line-strong">
              <AnimatePresence>
                {on && (
                  <motion.span
                    key={fresh ? `s-${stamps}` : `s-${j}`}
                    initial={fresh ? { scale: 1.9, rotate: -40, opacity: 0 } : false}
                    animate={{ scale: 1, rotate: -14, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 520, damping: 17, delay: fresh ? 0.2 : 0 }}
                    className="absolute inset-[-1.5px] grid place-items-center rounded-full border-2 border-green bg-green-tint"
                  >
                    <LogoMark size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          );
        })}
      </div>
      <AnimatePresence>
        {full && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 400, damping: 24, delay: 0.4 }}
            className="mt-4 flex items-center gap-2 rounded-[12px] bg-lime px-3 py-2 text-[13px] font-semibold text-[#0a3b27]"
          >
            <Gift size={15} /> Free delivery unlocked
          </motion.p>
        )}
      </AnimatePresence>
      {!full && <p className="mt-4 h-[36px] text-[13px] leading-[36px] text-muted">{8 - filled} more to go</p>}
    </Panel>
  );
}

const PERF = 7; // perforation hole spacing

function CouponCard({
  index,
  torn,
  count,
  reduce,
  k,
  merchant,
}: {
  index: number;
  torn: boolean;
  count: number;
  reduce: boolean;
  k: number;
  merchant: (typeof MERCHANTS)[number];
}) {
  const n = MERCHANTS.length;
  // Latest three coupons kept, newest first.
  const kept = [0, 1, 2].map((d) => count - 1 - d);

  return (
    <Panel className="flex flex-col">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-muted">Brand coupons</p>
        <span className="font-mono text-[12px] font-semibold text-muted tabular-nums">{count + 3} saved</span>
      </div>

      {/* ticket strip */}
      <div className="relative mt-4 h-[118px]">
        <AnimatePresence initial={false}>
          <motion.div
            key={k}
            className="absolute inset-0 flex"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            {/* stub stays in the book */}
            <div
              className="flex w-[78px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-l-[16px] bg-sunken px-2"
              style={{
                maskImage: `radial-gradient(circle at 100% ${PERF / 2}px, transparent 2.6px, #000 3px)`,
                maskSize: `100% ${PERF}px`,
                WebkitMaskImage: `radial-gradient(circle at 100% ${PERF / 2}px, transparent 2.6px, #000 3px)`,
                WebkitMaskSize: `100% ${PERF}px`,
              }}
            >
              <Blobatar name={merchant.seed} hue={merchant.hue} size={46} />
              <span className="text-center text-[10.5px] font-semibold leading-tight text-muted">{merchant.name}</span>
            </div>
            {/* the coupon tears out */}
            <motion.div
              className="relative flex min-w-0 flex-1 flex-col justify-between rounded-r-[16px] p-3.5 pl-4 text-[#0a0a0a]"
              style={{
                background: merchant.ticket,
                transformOrigin: "0% 100%",
                maskImage: `radial-gradient(circle at 0 ${PERF / 2}px, transparent 2.6px, #000 3px)`,
                maskSize: `100% ${PERF}px`,
                WebkitMaskImage: `radial-gradient(circle at 0 ${PERF / 2}px, transparent 2.6px, #000 3px)`,
                WebkitMaskSize: `100% ${PERF}px`,
              }}
              initial={false}
              animate={torn ? { rotate: -6, x: 8, y: 3 } : { rotate: 0, x: 0, y: 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 13 }}
            >
              <span className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">Coupon</span>
                <Ticket size={15} strokeWidth={2.2} className="opacity-60" />
              </span>
              <span>
                <span className="block font-display text-[26px] font-bold leading-none tracking-[-0.05em]">{merchant.coupon}</span>
                <span className="mt-1 block truncate text-[12.5px] font-medium opacity-75">at {merchant.name}</span>
              </span>
              <span className="w-fit rounded-md border border-dashed border-[#0a0a0a]/40 px-1.5 py-0.5 font-mono text-[10.5px] font-bold">{merchant.code}</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {torn && (
            <motion.span
              key={`t-${k}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
              className="absolute -bottom-3 left-[54px] z-10 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-canvas shadow-card"
            >
              Unlocked
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* kept coupons */}
      <p className="mt-6 text-[12px] font-medium text-muted">Ready to use</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {kept.map((g) => {
            const x = MERCHANTS[((g % n) + n) % n];
            return (
              <motion.li
                layout
                key={g}
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 30, delay: g === count - 1 && torn && index === ((g % n) + n) % n ? 0.45 : 0 }}
                className="flex items-center gap-2.5 rounded-[12px] bg-sunken px-2.5 py-2"
              >
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: x.ticket }} />
                <span className="min-w-0 flex-1 truncate text-[13px]">
                  <span className="font-semibold">{x.coupon}</span> <span className="text-muted">at {x.name}</span>
                </span>
                <span className="font-mono text-[10.5px] text-muted">{x.code}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </Panel>
  );
}
