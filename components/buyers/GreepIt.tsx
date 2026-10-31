"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Blobatar } from "@blobatar/react";
import { happy, idle, thinking } from "blobatar/expression";
import {
  ArrowUp,
  Camera,
  Check,
  DoorOpen,
  ImagePlus,
  Link2,
  Lock,
  MapPin,
  Mic,
  Package,
  ScanSearch,
  Share2,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import { Eyebrow, Reveal, SplitWords } from "@/components/ui/Reveal";
import { AppTile } from "@/components/ui/Icons";
import { LogoMark } from "@/components/ui/Logo";
import { useLoop } from "@/components/ui/useLoop";

const INK = "#0a0a0a";
const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: "spring", stiffness: 420, damping: 28 } as const;

const STEPS = [
  {
    tab: "Send it",
    line: "Tap share on any post, video or pin and send it to Greep. A post, video, picture, screenshot or link. Anything you saw online or in real life.",
  },
  { tab: "We'll find it", line: "We'll find the exact match. Yes, that one!" },
  { tab: "Choose it", line: "Compare sellers. Compare prices. Pick your price and buy right there on Greep." },
  { tab: "Deliver it", line: "Get it delivered straight to your doorstep." },
];

const DURATIONS = [4400, 4800, 4200, 4600];

/* ------------------------------------------------------------------ timing */

/** 100ms ticks since the current step began. Pauses off screen. */
function useTick(step: number, live: boolean, reduce: boolean) {
  const [s, setS] = useState({ step, tick: 0 });
  if (s.step !== step) setS({ step, tick: 0 });
  useEffect(() => {
    if (!live || reduce) return;
    const id = setInterval(() => setS((p) => ({ ...p, tick: p.tick + 1 })), 100);
    return () => clearInterval(id);
  }, [live, reduce]);
  if (reduce) return 999;
  return s.step === step ? s.tick : 0;
}

type Clock = {
  step: number;
  tick: number;
  /** true once step `s` has reached tick `t` (and for every later step) */
  at: (s: number, t: number) => boolean;
  /** 0..1 progress between two ticks of step `s` */
  prog: (s: number, t0: number, t1: number) => number;
};

function makeClock(step: number, tick: number): Clock {
  return {
    step,
    tick,
    at: (s, t) => step > s || (step === s && tick >= t),
    prog: (s, t0, t1) => (step > s ? 1 : step < s ? 0 : Math.max(0, Math.min(1, (tick - t0) / (t1 - t0)))),
  };
}

/* ================================================================== section */

export function GreepIt() {
  const { ref, step, setStep, inView } = useLoop(DURATIONS, { amount: 0.25 });
  const reduce = !!useReducedMotion();
  const tick = useTick(step, inView, reduce);
  const c = makeClock(step, tick);

  return (
    <section id="how" className="relative overflow-x-clip py-16 md:py-24">
      <div ref={ref} className="mx-auto w-full max-w-6xl px-4">
        <Eyebrow index="02">How it works</Eyebrow>
        <h2 className="display mt-5 text-[clamp(40px,6.4vw,84px)]">
          <SplitWords text="Once you see it," />
          <br />
          <SplitWords text="Greep it!" delay={0.1} className="text-green" />
        </h2>
        <Reveal as="p" delay={0.1} className="mt-5 max-w-md text-[17px] leading-relaxed text-muted">
          Online or in real life, bring us what you saw.
        </Reveal>

        <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          {/* slim pill tabs */}
          <div className="inline-flex w-fit max-w-full rounded-full border border-line bg-sunken p-[3px]" role="tablist">
            {STEPS.map((s, i) => (
              <button
                key={s.tab}
                role="tab"
                aria-selected={step === i}
                onClick={() => setStep(i)}
                className="relative h-8 whitespace-nowrap rounded-full px-2.5 text-[13px] font-medium sm:px-4 sm:text-[14px] md:px-5"
              >
                {step === i && (
                  <motion.span
                    layoutId="greepit-tab"
                    className="absolute inset-0 overflow-hidden rounded-full bg-paper shadow-[var(--ring-inset),0_1px_3px_rgb(0_0_0/0.1)]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative transition-colors ${step === i ? "text-ink" : "text-muted hover:text-ink"}`}>{s.tab}</span>
              </button>
            ))}
          </div>

          {/* every step shares one grid cell, so the height never jumps */}
          <div className="grid max-w-xl">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.tab}
                aria-hidden={i !== step}
                initial={false}
                animate={{ opacity: i === step ? 1 : 0, y: i === step ? 0 : i < step ? -8 : 10 }}
                transition={{ duration: 0.35, ease, delay: i === step ? 0.12 : 0 }}
                className={`flex gap-3 [grid-area:1/1] ${i === step ? "" : "pointer-events-none"}`}
              >
                <span className="mt-1.5 font-mono text-[12px] text-green">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-[22px] font-bold tracking-[-0.04em]">{s.tab}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">{s.line}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Reveal className="mt-8">
          <div className="dot-grid relative rounded-[32px] border border-line bg-sunken/70 p-3 sm:p-5 lg:p-8">
            <DesktopBoard c={c} />
            <MobileBoard c={c} />
          </div>
        </Reveal>

        <Reveal className="mt-10 md:mt-14">
          <p className="display max-w-4xl text-[clamp(28px,4.2vw,52px)]">
            If all you have is what you saw, <span className="text-green">you have all we need!</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================ desktop board */

type Rect = { x: number; y: number; w: number; h: number };

function useRects(board: RefObject<HTMLDivElement | null>, refs: RefObject<HTMLDivElement | null>[]) {
  const [rects, setRects] = useState<(Rect | null)[]>([]);
  useLayoutEffect(() => {
    const root = board.current;
    if (!root) return;
    const measure = () => {
      const b = root.getBoundingClientRect();
      if (!b.width) return;
      setRects(
        refs.map((r) => {
          const el = r.current;
          if (!el) return null;
          const e = el.getBoundingClientRect();
          return { x: e.left - b.left, y: e.top - b.top, w: e.width, h: e.height };
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    refs.forEach((r) => r.current && ro.observe(r.current));
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return rects;
}

/** Orthogonal connector with rounded elbows, like a wired node graph. */
function elbow(x1: number, y1: number, x2: number, y2: number) {
  if (Math.abs(y2 - y1) < 1) return `M${x1} ${y1}H${x2}`;
  const mx = (x1 + x2) / 2;
  const dir = y2 > y1 ? 1 : -1;
  const r = Math.min(14, Math.abs(y2 - y1) / 2, Math.abs(x2 - x1) / 2);
  return `M${x1} ${y1}H${mx - r}Q${mx} ${y1} ${mx} ${y1 + dir * r}V${y2 - dir * r}Q${mx} ${y2} ${mx + r} ${y2}H${x2}`;
}

function DesktopBoard({ c }: { c: Clock }) {
  const board = useRef<HTMLDivElement>(null);
  const src = useRef<HTMLDivElement>(null);
  const see = useRef<HTMLDivElement>(null);
  const comp = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLDivElement>(null);
  const sell = useRef<HTMLDivElement>(null);
  const order = useRef<HTMLDivElement>(null);
  const [rs, rsee, rc, rrun, rsell, rorder] = useRects(board, [src, see, comp, run, sell, order]);

  const { step } = c;
  const wires: { d: string; on: boolean }[] = [];
  if (rs && rsee && rc && rrun && rsell && rorder) {
    const cl = rc.x, cr = rc.x + rc.w;
    wires.push(
      { d: elbow(rs.x + rs.w, rs.y + rs.h * 0.42, cl, rc.y + rc.h * 0.36), on: step === 0 },
      { d: elbow(rsee.x + rsee.w, rsee.y + rsee.h / 2, cl, rc.y + rc.h * 0.72), on: step === 1 },
      { d: elbow(cr, rc.y + rc.h * 0.36, rsell.x, rsell.y + rsell.h * 0.4), on: step === 1 || step === 2 },
      { d: elbow(cr, rc.y + rc.h * 0.72, rorder.x, rorder.y + rorder.h / 2), on: step === 3 },
      { d: `M${rc.x + rc.w / 2} ${rc.y + rc.h}V${rrun.y}`, on: step === 1 },
    );
  }

  return (
    <div ref={board} className="relative hidden grid-cols-[236px_minmax(0,1fr)_262px] gap-x-14 lg:grid xl:grid-cols-[250px_minmax(0,1fr)_276px] xl:gap-x-16">
      <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
        {wires.map((w, i) => (
          <g key={i}>
            <path d={w.d} fill="none" stroke="var(--color-line-strong)" strokeWidth="7" strokeLinecap="round" />
            <path d={w.d} fill="none" stroke="var(--color-paper)" strokeWidth="3.5" strokeLinecap="round" />
            <path
              d={w.d}
              fill="none"
              stroke="var(--color-green)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 6"
              style={{ opacity: w.on ? 1 : 0, transition: "opacity .4s", animation: "dash 1.1s linear infinite" }}
            />
          </g>
        ))}
      </svg>

      {/* left */}
      <div className="relative flex flex-col justify-center gap-5">
        <Panel innerRef={src} on={step === 0}>
          <SharedFrom c={c} />
        </Panel>
        <Panel innerRef={see} on={step === 1}>
          <WhatWeSee c={c} />
        </Panel>
      </div>

      {/* centre */}
      <div className="relative flex flex-col gap-7 pt-6">
        <div ref={comp}>
          <Composer c={c} />
        </div>
        <Panel innerRef={run} on={step === 1}>
          <ToolRun c={c} />
        </Panel>
      </div>

      {/* right */}
      <div className="relative flex flex-col justify-center gap-5">
        <Panel innerRef={sell} on={step === 1 || step === 2}>
          <Sellers c={c} />
        </Panel>
        <Panel innerRef={order} on={step === 3}>
          <Order c={c} />
        </Panel>
      </div>
    </div>
  );
}

function Panel({ children, on, innerRef }: { children: ReactNode; on: boolean; innerRef?: RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={innerRef}
      className={`relative rounded-[16px] bg-paper p-2.5 transition-[opacity,box-shadow,transform] duration-500 ${
        on ? "shadow-[0_0_0_1.5px_var(--color-green),0_18px_40px_-18px_rgb(13_150_94/0.45)]" : "opacity-[0.78] shadow-raised"
      }`}
    >
      {children}
    </div>
  );
}

function PanelHead({ icon, title, count }: { icon: ReactNode; title: string; count?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-1 pb-2 text-[12.5px] font-medium text-ink-2">
      <span className="flex text-ink-3">{icon}</span>
      {title}
      {count !== undefined && <span className="ml-auto rounded-[6px] bg-field px-1.5 font-mono text-[11px] tabular-nums text-ink-3">{count}</span>}
    </div>
  );
}

/* ============================================================= mobile board */

function MobileBoard({ c }: { c: Clock }) {
  const { step } = c;
  return (
    <div className="flex flex-col gap-3 lg:hidden">
      <Composer c={c} />
      <div className="relative mx-auto h-4 w-[3px] rounded-full bg-line-strong">
        <span className="absolute inset-0 rounded-full bg-green" style={{ animation: "dash 1s linear infinite" }} />
      </div>
      <div className="relative min-h-[262px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3, ease }}
          >
            <Panel on>
              {step === 0 && <SharedFrom c={c} />}
              {step === 1 && <ToolRun c={c} />}
              {step === 2 && <Sellers c={c} />}
              {step === 3 && <Order c={c} />}
            </Panel>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ================================================================== panels */

const SOURCES = [
  { label: "Pinterest pin", sub: "pin_4821.jpg", tile: <AppTile kind="pin" size={26} /> },
  { label: "Screenshot", sub: "IMG_2210.png", tile: <IconTile><Smartphone size={14} /></IconTile> },
  { label: "Link", sub: "shop.page/tote", tile: <IconTile><Link2 size={14} /></IconTile> },
  { label: "Photo you took", sub: "Seen at the mall", tile: <IconTile><Camera size={14} /></IconTile> },
];

function IconTile({ children }: { children: ReactNode }) {
  return <span className="grid size-[26px] shrink-0 place-items-center rounded-[8px] bg-field text-ink-2 shadow-hairline">{children}</span>;
}

function SharedFrom({ c }: { c: Clock }) {
  const { step, tick } = c;
  const scan = step === 0 && tick < 13 ? [1, 2, 3, 0][Math.min(3, Math.floor(tick / 3.2))] : -1;
  const picked = c.at(0, 13);
  return (
    <>
      <PanelHead icon={<Share2 size={13} />} title="Shared from" count={4} />
      <div className="flex flex-col gap-1">
        {SOURCES.map((s, i) => {
          const lit = scan === i || (picked && i === 0);
          return (
            <div
              key={s.label}
              className={`relative flex h-11 items-center gap-2.5 rounded-[10px] px-1.5 transition-colors duration-300 ${lit ? "bg-green-tint" : "bg-transparent"}`}
            >
              {s.tile}
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[13px] font-medium text-ink">{s.label}</span>
                <span className="block truncate font-mono text-[10.5px] text-ink-3">{s.sub}</span>
              </span>
              <AnimatePresence>
                {picked && i === 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="flex items-center gap-1 rounded-full bg-green px-2 py-0.5 text-[10.5px] font-semibold text-white"
                  >
                    <Check size={10} strokeWidth={3} /> Sent
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-1.5 border-t border-line px-1 pt-2 text-[11.5px] text-ink-3">
        Also
        {(["video", "camera", "chat", "x"] as const).map((k) => (
          <AppTile key={k} kind={k} size={18} className="!shadow-none" />
        ))}
      </div>
    </>
  );
}

const TRAITS = ["Tote", "Brown", "Ankara print", "Leather handles"];

function WhatWeSee({ c }: { c: Clock }) {
  const scanning = c.step === 1 && c.tick < 34;
  return (
    <>
      <PanelHead icon={<ScanSearch size={13} />} title="What we see" />
      <div className="flex gap-2.5 px-1">
        <div
          className={`relative size-[60px] shrink-0 overflow-hidden rounded-[12px] transition-colors duration-300 ${
            c.at(1, 0) ? "bg-[#f6e6d2]" : "border-[1.5px] border-dashed border-line-strong bg-transparent"
          }`}
        >
          {c.at(1, 0) && (
            <motion.span className="absolute inset-[10%]" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={spring}>
              <ToteArt className="size-full" />
            </motion.span>
          )}
          {scanning && (
            <span className="absolute inset-x-0 h-6 bg-gradient-to-b from-transparent via-green/45 to-transparent" style={{ animation: "greepit-scan 1.1s ease-in-out infinite alternate" }} />
          )}
          {/* corner brackets */}
          <span className="absolute inset-1 rounded-[9px] border-2 border-dashed border-green/0 transition-colors duration-300" style={{ borderColor: scanning ? "rgb(13 150 94 / 0.6)" : undefined }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap content-start gap-1">
          {TRAITS.map((t, i) => (
            <AnimatePresence key={t}>
              {c.at(1, 4 + i * 4) && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="inline-flex h-[22px] items-center rounded-[6px] bg-field px-1.5 text-[11.5px] text-ink-2 shadow-hairline"
                >
                  {t}
                </motion.span>
              )}
            </AnimatePresence>
          ))}
          {!c.at(1, 4) && <span className="text-[11.5px] text-ink-3">Nothing yet</span>}
        </div>
      </div>
      <style>{`@keyframes greepit-scan{from{top:-24px}to{top:60px}}`}</style>
    </>
  );
}

/* ---------------------------------------------------------------- composer */

const PROMPT = "Find this bag";

function Composer({ c }: { c: Clock }) {
  const reduce = useReducedMotion();
  const attached = c.at(0, 12);
  const chars = Math.round(c.prog(0, 16, 16 + PROMPT.length) * PROMPT.length);
  const typing = c.step === 0 && chars < PROMPT.length && chars > 0;
  const sent = c.at(0, 32);
  const offer = c.at(2, 18);
  const paid = c.at(2, 29);
  const pressing = (c.step === 0 && c.tick >= 30 && c.tick < 33) || (c.step === 2 && c.tick >= 27 && c.tick < 30);

  return (
    <div className="relative overflow-hidden rounded-[18px] bg-paper shadow-[0_0_0_1px_var(--color-line-strong),0_24px_50px_-24px_rgb(0_0_0/0.35)]">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <LogoMark size={18} ink="var(--color-ink)" />
        <span className="text-[13px] font-semibold tracking-[-0.01em]">Greep</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-mint px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-green-ink">
          <span className="size-1.5 rounded-full bg-green" />
          Finder
        </span>
      </div>

      <div className="flex min-h-[112px] gap-3 p-3">
        {/* the shared item */}
        <div className="relative size-[74px] shrink-0">
          <span className="absolute inset-0 grid place-items-center rounded-[14px] border-[1.5px] border-dashed border-line-strong text-ink-3">
            <ImagePlus size={18} />
          </span>
          <AnimatePresence>
            {attached && (
              <motion.div
                key="item"
                className="absolute inset-0 overflow-hidden rounded-[14px] bg-[#f6e6d2] shadow-[0_8px_20px_-10px_rgb(0_0_0/0.5)] ring-1 ring-black/5"
                initial={reduce ? { opacity: 0 } : { x: -150, y: -30, rotate: -16, scale: 0.6, opacity: 0 }}
                animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 210, damping: 19 }}
              >
                <ToteArt className="absolute inset-[9%]" />
                <span className="absolute bottom-1 right-1">
                  <AppTile kind="pin" size={18} />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <AnimatePresence>
            {attached && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-[10.5px] text-ink-3">
                pin_4821.jpg
              </motion.p>
            )}
          </AnimatePresence>
          <p className="mt-1 text-[16px] font-medium tracking-[-0.01em] text-ink">
            {chars === 0 ? (
              <span className="text-ink-3">{attached ? "" : "Share a post, pin or link"}</span>
            ) : (
              PROMPT.slice(0, chars)
            )}
            {(typing || (attached && chars === 0)) && (
              <span className="ml-px inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-green" style={{ animation: "caret-blink 1s step-end infinite" }} />
            )}
          </p>
          <AnimatePresence>
            {c.at(2, 16) && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted"
              >
                <Blobatar name="lagos.bags" hue={150} size={16} expression={happy} />
                lagos.bags · Best price
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-3 pb-3">
        <span className="grid size-8 place-items-center rounded-[9px] bg-field text-ink-2"><Mic size={14} /></span>
        <span className="hidden size-8 place-items-center rounded-[9px] bg-field text-ink-2 sm:grid"><ImagePlus size={14} /></span>
        <span className="flex h-8 min-w-0 items-center gap-1 truncate rounded-[9px] bg-field px-2 text-[12px] text-ink-2">
          <MapPin size={12} className="shrink-0" /> <span className="truncate">Deliver to Lagos</span>
        </span>

        <motion.span
          layout
          transition={spring}
          animate={{ scale: pressing && !reduce ? 0.9 : 1 }}
          className={`ml-auto flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-[10px] text-[12.5px] font-semibold ${
            offer ? "bg-green px-3 text-white" : sent ? "bg-ink px-3 text-canvas" : "w-8 bg-ink text-canvas"
          }`}
        >
          {paid ? (
            <>
              <Lock size={12} /> Paid, held safe
            </>
          ) : offer ? (
            <>Buy ₦42,000</>
          ) : sent ? (
            <>
              <Check size={13} strokeWidth={3} /> Sent
            </>
          ) : (
            <ArrowUp size={15} strokeWidth={2.4} />
          )}
        </motion.span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- tool run */

/* Adapted from Beautiful UI ToolChips + LoadingState (MIT): Greep rows,
 * driven by the section clock so the run replays every loop. */
const TOOL_ICONS: Record<string, ReactNode> = {
  read: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></g>,
  think: <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="currentColor" />,
  compare: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l4-4 4 4M7 5v14M21 15l-4 4-4-4M17 19V5" /></g>,
  tag: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></g>,
};

const TOOLS = [
  { icon: "read", label: "Reading image", chip: "pin_4821.jpg", mono: true, at: 3 },
  { icon: "think", label: "Matching item", chip: "Ankara tote, brown", mono: false, at: 11 },
  { icon: "compare", label: "Comparing sellers", chip: "6 stores", mono: false, at: 19 },
  { icon: "tag", label: "Best price", chip: "₦42,000", mono: true, at: 27 },
];

const CHEVRON = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3), cc = i % 3;
  return (cc + Math.abs(r - 1)) * 90;
});

function PixelGrid({ live }: { live: boolean }) {
  return (
    <span aria-hidden className="grid shrink-0 grid-cols-[repeat(3,4px)] gap-[1.5px]">
      {CHEVRON.map((delay, i) => (
        <span
          key={i}
          className="size-[4px] rounded-[1px] bg-ink"
          style={{ opacity: 0.15, animation: live ? `pixel-on 650ms ease-in-out ${delay}ms infinite` : "none" }}
        />
      ))}
    </span>
  );
}

function ToolRun({ c }: { c: Clock }) {
  const started = c.at(1, 0);
  const done = c.at(1, 34);
  const elapsed = Math.min(2.4, c.prog(1, 0, 32) * 2.4);

  return (
    <div className="px-1">
      {/* status line */}
      <div className="flex h-7 items-center gap-2.5">
        {done ? (
          <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-[13px] font-medium text-ink">
            <span className="grid size-4 place-items-center rounded-full bg-green text-white">
              <Check size={10} strokeWidth={3.2} />
            </span>
            Found your match
            <span className="font-mono text-[12px] tabular-nums text-ink-3">2.4s</span>
          </motion.span>
        ) : (
          <div role="status" className="flex items-center gap-2.5">
            <PixelGrid live={started} />
            <span
              className="bg-clip-text text-[13px] font-medium text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, var(--color-ink-3) 35%, var(--color-ink) 50%, var(--color-ink-3) 65%)",
                backgroundSize: "200% 100%",
                animation: started ? "shimmer-text 1.4s linear infinite" : "none",
              }}
            >
              {started ? "Finding your match" : "Waiting for what you saw"}
            </span>
            {started && <span className="font-mono text-[12px] tabular-nums text-ink-3">{elapsed.toFixed(1)}s</span>}
          </div>
        )}
      </div>

      {/* tool rows */}
      <div className="mt-1.5 flex flex-col gap-1">
        {TOOLS.map((row) =>
          c.at(1, row.at) ? (
            <div key={row.label} className="flex h-7 min-w-0 items-center gap-2" style={{ animation: "fade-up 300ms cubic-bezier(0.23,1,0.32,1) both" }}>
              <span className="flex size-4 shrink-0 items-center justify-center text-ink-3">
                <svg width="13" height="13" viewBox="0 0 24 24">{TOOL_ICONS[row.icon]}</svg>
              </span>
              <span className="shrink-0 text-[12.5px] font-medium text-ink">{row.label}</span>
              <span className={`inline-flex h-[22px] min-w-0 items-center truncate rounded-[6px] bg-field px-1.5 text-[11.5px] text-ink-2 shadow-hairline ${row.mono ? "font-mono" : ""}`}>
                {row.chip}
              </span>
            </div>
          ) : (
            <div key={row.label} className="flex h-7 items-center gap-2 opacity-60">
              <span className="size-3 rounded-[4px] bg-line-strong" />
              <span className="h-2 rounded-full bg-line" style={{ width: `${46 + ((row.at * 7) % 30)}%` }} />
            </div>
          ),
        )}
      </div>

      {/* result chips */}
      <div className="mt-2.5 flex h-8 flex-wrap gap-1.5 border-t border-line pt-2.5">
        {done && (
          <>
            {["98% match", "6 sellers", "From ₦42,000"].map((t, i) => (
              <span
                key={t}
                className={`inline-flex h-6 items-center rounded-[6px] px-2 font-mono text-[11px] shadow-btn ${i === 0 ? "bg-green-tint text-green" : "bg-surface text-ink"}`}
                style={{ animation: `pop-in 250ms cubic-bezier(0.23,1,0.32,1) ${i * 80}ms both` }}
              >
                {t}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- sellers */

const SELLERS = [
  { name: "adaeze.store", hue: 262, price: 48500, start: 4, len: 18 },
  { name: "kemi.closet", hue: 22, price: 45000, start: 8, len: 16 },
  { name: "tote.house", hue: 200, price: 51000, start: 6, len: 22 },
  { name: "lagos.bags", hue: 150, price: 42000, start: 10, len: 18 },
];
const SORTED = [...SELLERS].sort((a, b) => a.price - b.price);

function Sellers({ c }: { c: Clock }) {
  const sorted = c.at(2, 5);
  const picked = c.at(2, 14);
  const rows = sorted ? SORTED : SELLERS;
  const found = c.at(1, 0);

  return (
    <>
      <PanelHead icon={<Store size={13} />} title="Sellers found" count={found ? 6 : 0} />
      <div className="flex flex-col gap-1.5">
        {rows.map((s) => {
          const p = c.prog(1, s.start, s.start + s.len);
          const best = picked && s.name === "lagos.bags";
          return (
            <motion.div
              key={s.name}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`relative rounded-[11px] px-2 py-1.5 transition-[background-color,box-shadow,opacity] duration-300 ${
                best ? "bg-green-tint shadow-[0_0_0_1.5px_var(--color-green)]" : "bg-field/60"
              } ${picked && !best ? "opacity-55" : ""}`}
            >
              <div className="flex items-center gap-2">
                <Blobatar name={s.name} hue={s.hue} animate="always" expression={best ? happy : p > 0 && p < 1 ? thinking : idle} size={26} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[12.5px] font-semibold text-ink">{s.name}</span>
                  <span className="block font-mono text-[11px] tabular-nums text-ink-3">
                    {p >= 1 ? `₦${s.price.toLocaleString("en-NG")}` : p > 0 ? "Checking…" : "Queued"}
                  </span>
                </span>
                <AnimatePresence>
                  {best && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 16 }}
                      className="flex items-center gap-1 rounded-full bg-green px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    >
                      <Check size={10} strokeWidth={3} /> Best price
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {/* segmented progress */}
              <div className="mt-1.5 flex gap-[3px]">
                {Array.from({ length: 12 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-[3px] flex-1 rounded-full transition-colors duration-200 ${i < Math.round(p * 12) ? (best ? "bg-green" : "bg-ink-2/70") : "bg-line-strong"}`}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------- order */

function Order({ c }: { c: Clock }) {
  const reduce = useReducedMotion();
  const active = c.step === 3;
  const trip = c.prog(3, 2, 24);
  const delivered = c.at(3, 26);
  const paid = c.at(2, 29);

  return (
    <>
      <PanelHead icon={<Package size={13} />} title="Your order" />
      <div className="flex items-center gap-2.5 px-1">
        <span
          className={`relative size-9 shrink-0 overflow-hidden rounded-[9px] transition-colors duration-300 ${
            paid ? "bg-[#f6e6d2]" : "border-[1.5px] border-dashed border-line-strong"
          }`}
        >
          {paid && (
            <motion.span className="absolute inset-[10%]" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={spring}>
              <ToteArt className="size-full" />
            </motion.span>
          )}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className={`block truncate text-[12.5px] font-semibold ${paid ? "text-ink" : "text-ink-3"}`}>{paid ? "Ankara tote, brown" : "No order yet"}</span>
          <span className="block truncate font-mono text-[11px] text-ink-3">{paid ? "lagos.bags · ₦42,000" : "Pick a seller first"}</span>
        </span>
        {paid && (
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 rounded-full bg-mint px-1.5 py-0.5 text-[10px] font-semibold text-green-ink">
            <Lock size={9} /> Held safe
          </motion.span>
        )}
      </div>

      <div className="mt-3 px-1">
        {/* road to the doorstep */}
        <div className="relative h-9">
          <div className="absolute left-3 right-11 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-line-strong" />
          <div
            className="absolute left-3 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-green transition-[width] duration-150"
            style={{ width: `calc((100% - 56px) * ${active ? trip : 0})` }}
          />
          <span
            className="absolute top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-canvas shadow-btn transition-opacity duration-300"
            style={{ left: `calc(12px + (100% - 56px) * ${active ? trip : 0})`, opacity: delivered ? 0 : 1 }}
          >
            <Truck size={13} />
          </span>
          {/* the doorstep */}
          <span
            className={`absolute right-0 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-[10px] shadow-hairline transition-colors duration-300 ${
              delivered ? "bg-green text-white" : "bg-field text-ink-2"
            }`}
          >
            <DoorOpen size={16} />
            <AnimatePresence>
              {delivered && (
                <motion.span
                  className="absolute -bottom-1.5 -left-2 grid size-[18px] place-items-center rounded-[5px] bg-[#c98a4b] text-[#0a0a0a] ring-2 ring-paper"
                  initial={reduce ? false : { y: -16, scale: 0.4, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 16 }}
                >
                  <Package size={11} strokeWidth={2.4} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>

        <div className="mt-2 flex h-9 items-center justify-between gap-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={!active ? (paid ? "paid" : "wait") : delivered ? "done" : "way"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="leading-tight"
            >
              <span className={`block text-[13px] font-semibold ${delivered ? "text-green" : "text-ink"}`}>
                {!active ? (paid ? "Paid" : "Waiting for your pick") : delivered ? "Delivered" : "On the way"}
              </span>
              <span className="block text-[11px] text-ink-3">{!active ? (paid ? "Seller is packing it" : "Pay to start delivery") : delivered ? "Left at your doorstep" : "Arriving today"}</span>
            </motion.span>
          </AnimatePresence>
          {delivered && (
            <motion.span
              initial={reduce ? false : { scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
            >
              <Blobatar name="buyer-you" hue={330} animate="always" expression={happy} size={30} />
            </motion.span>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- tote art */

function ToteArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <g stroke={INK} strokeLinejoin="round" strokeLinecap="round">
        <path d="M22 24v-5a10 10 0 0 1 20 0v5" fill="none" strokeWidth="3.2" />
        <path d="M11 24h42l-3.2 30a4 4 0 0 1-4 3.6H18.2a4 4 0 0 1-4-3.6z" fill="#8a5a36" strokeWidth="2.6" />
        <path d="M12.3 35h39.4l-1 10H13.3z" fill="#ee6f38" strokeWidth="2" />
      </g>
      {[19, 27, 35, 43].map((x, i) => (
        <circle key={x} cx={x + 1} cy="40" r="2.4" fill={i % 2 ? "#c6f36d" : "#f3c54c"} stroke={INK} strokeWidth="1.3" />
      ))}
      <path d="M24 25.5h16" stroke="#5b3620" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
