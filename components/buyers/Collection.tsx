"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, Heart, TrendingDown } from "lucide-react";
import { Eyebrow, Reveal, SplitWords } from "@/components/ui/Reveal";
import { BrandGlyph, type AppKind } from "@/components/ui/Icons";
import { Tote } from "@/components/illustrations/Tote";
import { useLoop } from "@/components/ui/useLoop";

/* ---------- data ---------- */

const INK = "#0a0a0a";

const BOARDS = [
  { name: "Wishlist", base: 12, tone: "#e3574a" },
  { name: "Birthday", base: 4, tone: "#7c6cf2" },
  { name: "Home", base: 7, tone: "#0d965e" },
] as const;

type Find = {
  id: string;
  name: string;
  price: string;
  board: 0 | 1 | 2;
  tag: { text: string; app?: AppKind; bg: string; fg: string };
  Art: (p: { className?: string }) => ReactNode;
};

const INK_TAG = { bg: "var(--color-ink)", fg: "var(--color-canvas)" };

const FINDS: Find[] = [
  { id: "tote", name: "Ankara tote", price: "$32", board: 0, tag: { text: "@ada.styles", ...INK_TAG }, Art: (p) => <Tote {...p} bg="#f6dcc8" /> },
  { id: "vase", name: "Ribbed vase", price: "$24", board: 2, tag: { text: "from Pinterest", app: "pin", bg: "#e3574a", fg: "#fff" }, Art: VaseArt },
  { id: "shades", name: "Round shades", price: "$18", board: 1, tag: { text: "@kemi.closet", bg: "#7c6cf2", fg: "#fff" }, Art: ShadesArt },
  { id: "kicks", name: "Chunky sneakers", price: "$64", board: 0, tag: { text: "from TikTok", app: "video", ...INK_TAG }, Art: SneakerArt },
  { id: "lamp", name: "Mushroom lamp", price: "$45", board: 2, tag: { text: "@zee.home", bg: "#0d965e", fg: "#fff" }, Art: LampArt },
  { id: "scent", name: "Amber perfume", price: "$56", board: 1, tag: { text: "from Instagram", app: "camera", bg: "#e3574a", fg: "#fff" }, Art: PerfumeArt },
];

// Updates on finds saved a moment earlier in the loop.
const TOASTS = [
  { icon: "drop", title: "Price dropped", line: "Ankara tote", from: "$32", to: "$27" },
  { icon: "bell", title: "Back in stock", line: "Round shades · 3 left" },
  { icon: "drop", title: "Price dropped", line: "Mushroom lamp", from: "$45", to: "$38" },
] as const;

/* Design canvas for the stage. It scales down to fit narrow screens. */
const W = 540;
const H = 614;
const CARD_W = 168;
const CARD_H = 216;
const BOARD_Y = 428;
const BOARD_W = 172;
const boardX = (b: number) => b * (BOARD_W + 12);

type Slot = { x: number; y: number; r: number; s: number; z: number };
const SLOTS: Slot[] = [
  { x: 346, y: 120, r: 4, s: 1.04, z: 40 }, // front: the new find
  { x: 226, y: 140, r: -3, s: 0.96, z: 30 },
  { x: 116, y: 116, r: 5, s: 0.94, z: 20 },
  { x: 8, y: 144, r: -8, s: 0.92, z: 10 },
];

// Per find: 0 arrives (and the last one lands in its board) · 1 pointer to heart · 2 heart burst · 3 files away
const PHASES = [1500, 750, 1050, 800];
const DURATIONS = FINDS.flatMap(() => PHASES);

/* ---------- section ---------- */

export function Collection() {
  return (
    <section id="saved" className="relative overflow-x-clip py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
        <div className="max-w-xl">
          <Eyebrow index="05">Saved finds</Eyebrow>
          <h2 className="display mt-5 text-[clamp(40px,5.6vw,76px)]">
            <SplitWords text="Saw it." />
            <br />
            <SplitWords text="Loved it." delay={0.08} />
            <br />
            <SplitWords text="Save it." delay={0.16} className="text-green" />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted">
              Not ready to buy just yet? No worries. Every find you save goes straight into your personal collection, ready whenever you are. Come back to it anytime.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-8 inline-flex items-center gap-3 rounded-full border border-line bg-paper py-1.5 pl-1.5 pr-5 text-[15px] font-semibold shadow-card">
              <span className="grid size-8 place-items-center rounded-full bg-red-tint text-rose">
                <Heart size={15} fill="currentColor" strokeWidth={0} />
              </span>
              You&apos;ll never lose a find again.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="min-w-0">
          <SaveStage />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- stage ---------- */

/** Counts how many times a useLoop step has wrapped, so totals keep climbing. */
function useWraps(step: number, n: number) {
  const [st, setSt] = useState({ step, wraps: 0 });
  if (st.step !== step) setSt({ step, wraps: st.wraps + (step === 0 && st.step === n - 1 ? 1 : 0) });
  return st.wraps;
}

function SaveStage() {
  const { ref, step } = useLoop(DURATIONS, { amount: 0.35 });
  const wraps = useWraps(step, DURATIONS.length);
  const reduce = !!useReducedMotion();
  const n = FINDS.length;
  const k = Math.floor(step / PHASES.length);
  const p = step % PHASES.length;

  // How many finds have landed in a board this loop (the one in flight lands as the next arrives).
  const filedNow = k;
  const counts = BOARDS.map((b, bi) => b.base + wraps * 2 + FINDS.slice(0, filedNow).filter((f) => f.board === bi).length);
  // Newest saved find per board, to order its thumbnails.
  const newest = BOARDS.map((_, bi) => {
    for (let j = filedNow - 1; j >= filedNow - n; j--) {
      const f = FINDS[((j % n) + n) % n];
      if (f.board === bi) return { id: f.id, at: wraps * n + j };
    }
    return null;
  });

  const queue = Array.from({ length: SLOTS.length }, (_, i) => FINDS[(k + i) % n]);
  const active = FINDS[k];
  const target = active.board;
  const started = k > 0 || wraps > 0;
  const lastBoard = FINDS[(k - 1 + n) % n].board;

  // Now and then, a toast about something already saved.
  const toastOn = k % 2 === 1 && p <= 2;
  const toastIdx = ((k - 1) / 2) % TOASTS.length;

  return (
    <div ref={ref}>
      <Fit w={W} h={H}>
        {/* soft backdrop */}
        <div aria-hidden className="dot-grid absolute inset-x-0 top-10 h-[370px] rounded-[32px] [mask-image:radial-gradient(closest-side,black,transparent)]" />

        {/* toast */}
        <div className="absolute right-0 top-0 z-[70] w-[262px]">
          <AnimatePresence>
            {toastOn && <Toast key={k} t={TOASTS[toastIdx]} />}
          </AnimatePresence>
        </div>

        {/* deck of finds */}
        <AnimatePresence initial={false}>
          {queue.map((f, i) => (
            <FindCard
              key={f.id}
              find={f}
              slot={i}
              phase={i === 0 ? p : -1}
              reduce={reduce}
            />
          ))}
        </AnimatePresence>

        {/* collection */}
        <div className="absolute inset-x-0 flex items-center justify-between" style={{ top: BOARD_Y - 34 }}>
          <p className="eyebrow flex items-center gap-2 text-muted">
            <span className="size-1.5 rounded-full bg-rose" />
            Your collection
          </p>
          <p className="font-mono text-[12px] text-muted">
            <Ticker value={counts.reduce((a, b) => a + b, 0)} /> saved
          </p>
        </div>
        {BOARDS.map((b, bi) => (
          <Board
            key={b.name}
            index={bi}
            count={counts[bi]}
            newest={newest[bi]}
            receiving={target === bi && p === 3}
            landed={started && lastBoard === bi && p === 0}
          />
        ))}
      </Fit>
    </div>
  );
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

/* ---------- card ---------- */

function FindCard({ find, slot, phase, reduce }: { find: Find; slot: number; phase: number; reduce: boolean }) {
  const s = SLOTS[slot];
  const front = slot === 0;
  const hearted = front && phase >= 2;
  const flying = front && phase >= 3;
  const showTag = front || slot === 2;

  const bx = boardX(find.board) + BOARD_W / 2 - CARD_W / 2;
  const by = BOARD_Y + 40 - CARD_H / 2;

  const rest = { x: s.x, y: s.y, rotate: s.r, scale: s.s, opacity: 1 };
  const filed = { x: bx, y: by, rotate: -10, scale: 0.14, opacity: [1, 1, 0] };

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ width: CARD_W, zIndex: flying ? 60 : s.z }}
      initial={{ x: s.x - 50, y: s.y + 40, rotate: -18, scale: 0.85, opacity: 0 }}
      animate={flying ? filed : rest}
      exit={{ opacity: 0, transition: { duration: 0 } }}
      transition={
        reduce
          ? { duration: 0 }
          : flying
            ? { duration: 0.72, ease: [0.55, 0, 0.25, 1], opacity: { duration: 0.72, times: [0, 0.75, 1] } }
            : { type: "spring", stiffness: 170, damping: 17, mass: 0.9 }
      }
    >
      {/* bob while resting */}
      <motion.div
        animate={reduce || front ? { y: 0 } : { y: [0, -5, 0] }}
        transition={{ duration: 3.4 + slot * 0.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <AnimatePresence>
          {showTag && (
            <motion.span
              key="tag"
              initial={{ opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 420, damping: 20, delay: front && !reduce ? 0.35 : 0 }}
              className="absolute -top-11 left-3 z-10 origin-bottom-left"
            >
              <SpeechTag {...find.tag} />
            </motion.span>
          )}
        </AnimatePresence>

        <div
          className="relative overflow-hidden rounded-[22px] border border-line bg-paper p-1.5 shadow-[0_1px_2px_rgb(0_0_0/0.05),0_24px_40px_-22px_rgb(0_0_0/0.45)]"
          style={{ height: CARD_H }}
        >
          <div className="h-[136px] overflow-hidden rounded-[16px]">
            <find.Art className="size-full" />
          </div>
          <div className="flex items-end justify-between gap-2 px-2 pt-2.5">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-muted">{find.name}</p>
              <p className="font-display text-[22px] font-bold leading-tight tracking-[-0.04em]">{find.price}</p>
            </div>
            <HeartButton on={hearted} burst={front && phase === 2 && !reduce} />
          </div>
        </div>

        {/* "saved to" chip */}
        <AnimatePresence>
          {front && phase === 2 && (
            <motion.span
              initial={{ opacity: 0, y: -6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 26, delay: 0.25 }}
              className="absolute -bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-canvas shadow-card"
            >
              <span className="size-2 rounded-full" style={{ background: BOARDS[find.board].tone }} />
              Saving to {BOARDS[find.board].name}
            </motion.span>
          )}
        </AnimatePresence>

        {/* finger that taps the heart */}
        <AnimatePresence>
          {front && (phase === 1 || phase === 2) && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute z-20"
              initial={{ left: CARD_W + 30, top: CARD_H + 40, opacity: 0 }}
              animate={{ left: CARD_W - 32, top: CARD_H - 30, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
            >
              <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                animate={{ scale: phase === 2 ? [1, 0.78, 1] : 1 }}
                transition={{ duration: 0.28 }}
                className="drop-shadow-[0_3px_5px_rgb(0_0_0/0.35)]"
              >
                <path d="M5 3l14 7.5-6.2 1.6L10 18.5z" fill={INK} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function SpeechTag({ text, app, bg, fg }: Find["tag"]) {
  return (
    <span className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] font-semibold tracking-[-0.01em] shadow-[0_8px_18px_-10px_rgb(0_0_0/0.5)]" style={{ background: bg, color: fg }}>
      {app && <BrandGlyph kind={app} size={13} />}
      {text}
      <span className="absolute -bottom-1.5 left-5 size-3.5 rotate-45 rounded-[3px]" style={{ background: bg }} />
    </span>
  );
}

function HeartButton({ on, burst }: { on: boolean; burst: boolean }) {
  return (
    <span className="relative grid size-9 shrink-0 place-items-center">
      <motion.span
        className={`grid size-9 place-items-center rounded-full ${on ? "bg-red-tint text-rose" : "bg-sunken text-muted"}`}
        animate={{ scale: on ? [1, 1.35, 0.92, 1] : 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Heart size={17} strokeWidth={2.2} fill={on ? "currentColor" : "none"} />
      </motion.span>
      <AnimatePresence>
        {burst && (
          <motion.span key="burst" className="pointer-events-none absolute inset-0" exit={{ opacity: 0 }}>
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-rose"
              initial={{ scale: 0.6, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
              const d = i % 2 ? 26 : 34;
              const c = ["#e3574a", "#f3c54c", "#7c6cf2", "#0d965e"][i % 4];
              return (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 -ml-1 -mt-1"
                  initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
                  animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, scale: [0.4, 1.1, 0.6], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  {i % 2 ? (
                    <span className="block size-2 rounded-full" style={{ background: c }} />
                  ) : (
                    <Heart size={10} fill={c} stroke={c} />
                  )}
                </motion.span>
              );
            })}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ---------- boards ---------- */

function Board({
  index,
  count,
  newest,
  receiving,
  landed,
}: {
  index: number;
  count: number;
  newest: { id: string; at: number } | null;
  receiving: boolean;
  landed: boolean;
}) {
  const b = BOARDS[index];
  const items = FINDS.filter((f) => f.board === index);
  const ordered = newest ? [...items.filter((f) => f.id === newest.id), ...items.filter((f) => f.id !== newest.id)] : items;

  return (
    <motion.div
      className="absolute rounded-[22px] border bg-paper p-2.5 shadow-card"
      style={{ left: boardX(index), top: BOARD_Y, width: BOARD_W }}
      animate={{
        scale: landed ? [1, 1.05, 1] : receiving ? 1.02 : 1,
        borderColor: receiving || landed ? b.tone : "var(--color-line)",
      }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="grid grid-cols-3 gap-1.5">
        {ordered.map((f, i) => (
          <motion.div
            layout
            key={newest?.id === f.id ? `${f.id}-${newest.at}` : f.id}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className={`aspect-square overflow-hidden rounded-[12px] ${i === 0 ? "ring-2 ring-paper" : ""}`}
          >
            <f.Art className="size-full" />
          </motion.div>
        ))}
        <div className="grid aspect-square place-items-center rounded-[12px] bg-sunken font-mono text-[12px] font-semibold text-muted">
          +{count - 2}
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between px-1">
        <p className="text-[15px] font-semibold tracking-[-0.02em]">{b.name}</p>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[12px] font-semibold"
          style={{ background: `color-mix(in srgb, ${b.tone} 14%, transparent)`, color: b.tone }}
        >
          <Ticker value={count} />
        </span>
      </div>
      <AnimatePresence>
        {landed && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.6 }}
            animate={{ opacity: 1, y: -14, scale: 1 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="absolute -top-2 right-3 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold text-white"
            style={{ background: b.tone }}
          >
            +1
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** A number whose digits roll up when it changes. */
function Ticker({ value }: { value: number }) {
  return (
    <span className="relative inline-flex h-[1.25em] overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="inline-block leading-[1.25em]"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ---------- toast ---------- */

function Toast({ t }: { t: (typeof TOASTS)[number] }) {
  const drop = t.icon === "drop";
  return (
    <motion.div
      initial={{ opacity: 0, y: -18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className="glass flex items-center gap-3 rounded-[18px] p-2.5 pr-4"
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-[12px] ${drop ? "bg-green-tint text-green" : "bg-orange-tint text-orange"}`}>
        {drop ? <TrendingDown size={17} strokeWidth={2.2} /> : <Bell size={16} strokeWidth={2.2} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold">{t.title}</span>
        <span className="block truncate text-[12px] text-muted">
          {t.line}
          {"from" in t && (
            <>
              {" · "}
              <s className="opacity-60">{t.from}</s> <span className="font-semibold text-green">{t.to}</span>
            </>
          )}
        </span>
      </span>
    </motion.div>
  );
}

/* ---------- product art (flat, ink outlined, same family as Tote) ---------- */

function ArtFrame({ bg, children, className = "" }: { bg: string; children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 140 120" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect x="-200" y="-200" width="540" height="520" fill={bg} />
      {children}
    </svg>
  );
}

function VaseArt({ className }: { className?: string }) {
  return (
    <ArtFrame bg="#d8efe1" className={className}>
      <ellipse cx="70" cy="104" rx="30" ry="5" fill="rgb(0 0 0 / .08)" />
      <g stroke={INK} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M66 46c-2-12-8-20-16-24M72 46c2-14 10-22 20-26" fill="none" />
        <path d="M50 22c-6 2-10 8-8 14 6-1 10-6 8-14z" fill="#0d965e" />
        <path d="M92 20c6 0 11 5 11 11-6 1-11-4-11-11z" fill="#c6f36d" />
        <path d="M60 44h20l-2 8c10 6 16 16 14 30-2 12-10 20-22 20s-20-8-22-20c-2-14 4-24 14-30z" fill="#f6efe2" />
        <path d="M60 60c-3 10-3 26 2 40M70 56v46M80 60c3 10 3 26-2 40" fill="none" strokeWidth="1.6" />
        <path d="M58 44h24" />
      </g>
    </ArtFrame>
  );
}

function ShadesArt({ className }: { className?: string }) {
  return (
    <ArtFrame bg="#fce7a6" className={className}>
      <ellipse cx="70" cy="92" rx="44" ry="5" fill="rgb(0 0 0 / .08)" />
      <g stroke={INK} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M30 58c-6-2-12-2-16 2M110 58c6-2 12-2 16 2" fill="none" />
        <path d="M62 58c4-4 12-4 16 0" fill="none" strokeWidth="3" />
        <circle cx="46" cy="62" r="18" fill="#ee6f38" />
        <circle cx="94" cy="62" r="18" fill="#ee6f38" />
        <circle cx="46" cy="62" r="12" fill="#2b2140" />
        <circle cx="94" cy="62" r="12" fill="#2b2140" />
      </g>
      <path d="M40 56a8 8 0 0 1 8-4M88 56a8 8 0 0 1 8-4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".8" />
    </ArtFrame>
  );
}

function SneakerArt({ className }: { className?: string }) {
  return (
    <ArtFrame bg="#d5e2fb" className={className}>
      <ellipse cx="70" cy="98" rx="50" ry="5" fill="rgb(0 0 0 / .1)" />
      <g stroke={INK} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M18 82h104v8a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5z" fill="#fbfaf6" />
        <path d="M22 82c0-16 6-28 18-32l16-2c8 8 22 14 40 16 16 2 24 8 24 18z" fill="#fbfaf6" />
        <path d="M22 82c0-16 6-28 18-32l6-1c-2 12 4 24 18 33z" fill="#7c6cf2" />
        <path d="M74 66c14 6 30 6 44 8" fill="none" />
        <path d="M56 48c-2-6 0-10 4-12" fill="none" />
        <path d="M60 56l8-4M66 60l8-4M72 63l8-4" fill="none" strokeWidth="2" />
        <path d="M18 88h104" fill="none" strokeWidth="1.6" />
        <path d="M92 82c4-6 12-8 20-6" fill="none" stroke="#ee6f38" strokeWidth="3.4" />
      </g>
    </ArtFrame>
  );
}

function LampArt({ className }: { className?: string }) {
  return (
    <ArtFrame bg="#e4ddfb" className={className}>
      <circle cx="70" cy="52" r="34" fill="#f3c54c" opacity=".35" />
      <ellipse cx="70" cy="104" rx="26" ry="5" fill="rgb(0 0 0 / .08)" />
      <g stroke={INK} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M62 62h16l3 38H59z" fill="#fbfaf6" />
        <path d="M54 100h32" />
        <path d="M34 62c0-20 16-34 36-34s36 14 36 34z" fill="#ee6f38" />
        <circle cx="54" cy="46" r="4" fill="#fbfaf6" strokeWidth="1.8" />
        <circle cx="76" cy="40" r="5" fill="#fbfaf6" strokeWidth="1.8" />
        <circle cx="92" cy="52" r="3.5" fill="#fbfaf6" strokeWidth="1.8" />
      </g>
    </ArtFrame>
  );
}

function PerfumeArt({ className }: { className?: string }) {
  return (
    <ArtFrame bg="#fbd6d1" className={className}>
      <ellipse cx="70" cy="104" rx="30" ry="5" fill="rgb(0 0 0 / .08)" />
      <g stroke={INK} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="62" y="24" width="16" height="14" rx="3" fill="#2b2140" />
        <rect x="66" y="38" width="8" height="8" fill="#f3c54c" />
        <rect x="44" y="46" width="52" height="56" rx="12" fill="#f3a94c" />
        <path d="M46 70h48v20a10 10 0 0 1-10 10H56a10 10 0 0 1-10-10z" fill="#ee6f38" strokeWidth="0" />
        <rect x="44" y="46" width="52" height="56" rx="12" fill="none" />
        <rect x="54" y="62" width="32" height="18" rx="3" fill="#fbfaf6" strokeWidth="1.8" />
        <path d="M60 71h20" strokeWidth="1.6" />
      </g>
      <path d="M52 54v10" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity=".7" />
    </ArtFrame>
  );
}
