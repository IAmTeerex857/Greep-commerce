"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { AppTile, BrandGlyph } from "@/components/ui/Icons";
import { Eyebrow, Reveal, SplitWords } from "@/components/ui/Reveal";

type Kind = "video" | "camera" | "chat" | "x" | "pin";

/* ---------- wall layout (design space: 1200 x 560, scaled to fit) ---------- */

const W = 1200;
const H = 560;
const ROW_Y = [20, 290];
const COL_X = 236;

type Skin = "light" | "dark" | "sun" | "plum";
type CardDef = { id: string; col: number; row: number; w: number; skin: Skin; body: ReactNode };

const SKINS: Record<Skin, string> = {
  light: "bg-paper text-ink border border-line",
  dark: "bg-[#161618] text-white border border-white/10",
  sun: "bg-[#f6d24c] text-[#0a0a0a] border border-black/5",
  plum: "bg-[#2a1d38] text-white border border-white/10",
};

/** The thread visits these cards in order. */
const PATH = ["ig", "bank", "tiktok", "delivery", "account", "views"];

type Notif = { app: Kind; label: string; title: string; body: string };
const NOTIFS: Record<string, [Notif, Notif]> = {
  ig: [
    { app: "camera", label: "Instagram", title: "kemi.closet", body: "DM for price 👀" },
    { app: "camera", label: "Instagram", title: "12 new DMs", body: "Everyone is asking how much." },
  ],
  bank: [
    { app: "chat", label: "WhatsApp", title: "Kemi", body: "Pay first, then I ship." },
    { app: "x", label: "Bank", title: "Transfer pending", body: "₦45,000 to an account you don't know." },
  ],
  tiktok: [
    { app: "video", label: "TikTok", title: "38 new comments", body: "“Price??” and 37 more" },
    { app: "video", label: "TikTok", title: "Your video is live", body: "12.4K views in the first hour." },
  ],
  delivery: [
    { app: "chat", label: "WhatsApp", title: "You", body: "Where is my order? 😩" },
    { app: "chat", label: "WhatsApp", title: "Kemi", body: "Seen 2h ago" },
  ],
  account: [
    { app: "chat", label: "WhatsApp", title: "Kemi", body: "Send me your account details." },
    { app: "x", label: "X", title: "Tolu asked", body: "Has anyone bought from Kemi before?" },
  ],
  views: [
    { app: "video", label: "TikTok", title: "12.4K views", body: "Your post is blowing up." },
    { app: "video", label: "TikTok", title: "0 orders", body: "Nobody could check out." },
  ],
};

/* ---------- card bodies ---------- */

function Head({ app, name, meta, dark }: { app: Kind; name: string; meta?: ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <AppTile kind={app} size={24} />
      <span className="text-[12.5px] font-semibold tracking-[-0.01em]">{name}</span>
      {meta && <span className={`ml-auto text-[11px] ${dark ? "text-white/45" : "text-muted"}`}>{meta}</span>}
    </div>
  );
}

function Dots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-current"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

const CARDS: CardDef[] = [
  /* top row */
  {
    id: "family",
    col: -2,
    row: 0,
    w: 210,
    skin: "dark",
    body: (
      <>
        <Head app="chat" name="WhatsApp" meta="3 unread" dark />
        {[
          { n: "K", c: "#ee6f38", who: "Kemi", msg: "Send me your acc…", u: 2 },
          { n: "T", c: "#7c6cf2", who: "Tolu", msg: "Did she reply?", u: 1 },
        ].map((r) => (
          <div key={r.who} className="mt-3 flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: r.c }}>
              {r.n}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-semibold">{r.who}</span>
              <span className="block truncate text-[11px] text-white/50">{r.msg}</span>
            </span>
            <span className="grid size-[18px] place-items-center rounded-full bg-[#25c06a] text-[10px] font-bold text-white">{r.u}</span>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "ig",
    col: -1,
    row: 0,
    w: 226,
    skin: "light",
    body: (
      <>
        <Head app="camera" name="kemi.closet" meta="2m" />
        <div className="mt-3 flex flex-col gap-1.5">
          <span className="self-end rounded-2xl rounded-br-md bg-ink px-3 py-1.5 text-[12.5px] text-canvas">How much is this one?</span>
          <span className="self-start rounded-2xl rounded-bl-md bg-sunken px-3 py-1.5 text-[12.5px]">DM for price 👀</span>
          <span className="self-end text-[10.5px] text-muted">Seen</span>
        </div>
      </>
    ),
  },
  {
    id: "bank",
    col: 0,
    row: 0,
    w: 262,
    skin: "dark",
    body: (
      <>
        <div className="flex items-center gap-2.5">
          <span className="grid size-6 place-items-center rounded-[7px] bg-white/10 text-[12px] font-bold">₦</span>
          <span className="text-[12.5px] font-semibold">Bank transfer</span>
          <span className="ml-auto text-[11px] text-white/45">now</span>
        </div>
        <p className="mt-3 font-display text-[28px] font-bold leading-none tracking-[-0.05em]">₦45,000</p>
        <p className="mt-1.5 text-[11.5px] text-white/55">to kemi.closet · “pay first, then I ship”</p>
        <div className="relative mt-4 h-1.5 rounded-full bg-white/15">
          <div className="absolute inset-y-0 left-0 w-[78%] rounded-full bg-white/70" />
          <span className="absolute left-[78%] top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,.15)]" />
          <span className="absolute right-0 top-1/2 size-3 -translate-y-1/2 rounded-[3px] border-2 border-white/60" />
        </div>
        <div className="mt-3 flex justify-between text-[10.5px] text-white/45">
          <span>No receipt</span>
          <span>No refund</span>
        </div>
      </>
    ),
  },
  {
    id: "tiktok",
    col: 1,
    row: 0,
    w: 214,
    skin: "sun",
    body: (
      <>
        <Head app="video" name="Comments" />
        <p className="mt-3 font-display text-[30px] font-bold leading-none tracking-[-0.05em]">
          38<span className="ml-1 text-[12px] font-medium tracking-normal opacity-60">comments</span>
        </p>
        <p className="mt-1 text-[11.5px] opacity-70">all asking “how much?”</p>
        <div className="mt-3 flex items-center gap-1.5">
          {["#e3574a", "#e3574a", "#7c6cf2"].map((c, i) => (
            <span key={i} className="size-3 rounded-[4px]" style={{ background: c }} />
          ))}
          <span className="ml-1 text-[10.5px] opacity-60">Ade, Zee and 36 more</span>
        </div>
      </>
    ),
  },
  {
    id: "bio",
    col: 2,
    row: 0,
    w: 196,
    skin: "light",
    body: (
      <>
        <div className="flex items-center gap-2.5">
          <span className="size-8 rounded-full bg-orange" />
          <span>
            <span className="block text-[12.5px] font-semibold">drip.lagos</span>
            <span className="block text-[10.5px] text-muted">Sneakers · Lagos</span>
          </span>
        </div>
        <p className="mt-2.5 text-[12px] leading-snug">Price in bio 👆<br />DM to order 📩</p>
        <div className="mt-2.5 grid grid-cols-3 gap-1">
          {["bg-lilac", "bg-orange", "bg-green"].map((g) => (
            <span key={g} className={`aspect-square rounded-md ${g}`} />
          ))}
        </div>
      </>
    ),
  },
  /* bottom row */
  {
    id: "seen",
    col: -2,
    row: 1,
    w: 200,
    skin: "plum",
    body: (
      <>
        <Head app="camera" name="you" meta="1h" dark />
        <span className="mt-3 inline-block rounded-2xl rounded-br-md bg-white/12 px-3 py-1.5 text-[12px]">Is it still available?</span>
        <p className="mt-3 font-display text-[22px] font-bold tracking-[-0.04em] text-[#d6b4ff]">Seen 2h ago</p>
        <Dots className="mt-1.5 text-white/50" />
      </>
    ),
  },
  {
    id: "account",
    col: -1,
    row: 1,
    w: 226,
    skin: "light",
    body: (
      <>
        <Head app="chat" name="Kemi" meta="9m" />
        <span className="mt-3 inline-block rounded-2xl rounded-bl-md bg-sunken px-3 py-1.5 text-[12.5px]">Send me your account details</span>
        <div className="mt-2.5 rounded-xl border border-line bg-sunken/60 p-2.5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Account no.</p>
          <div className="mt-0.5 flex items-center justify-between">
            <span className="font-mono text-[15px] font-semibold tracking-wider">0123 •••• 789</span>
            <span className="rounded-md bg-paper px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-line">Copy</span>
          </div>
        </div>
        <p className="mt-2 text-[10.5px] font-medium text-rose">No buyer protection</p>
      </>
    ),
  },
  {
    id: "delivery",
    col: 0,
    row: 1,
    w: 262,
    skin: "light",
    body: (
      <>
        <div className="flex items-start justify-between">
          <Head app="chat" name="Order chat" />
          <span className="font-display text-[26px] font-bold leading-none tracking-[-0.05em] text-orange">
            6<span className="ml-0.5 text-[12px] font-medium tracking-normal">days</span>
          </span>
        </div>
        <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em]">Where is my order?</p>
        <div className="mt-3 flex gap-1.5">
          <span className="h-1.5 flex-1 rounded-full bg-orange" />
          <span className="h-1.5 flex-1 rounded-full bg-orange/80" />
          <span className="h-1.5 flex-1 rounded-full bg-sunken" />
        </div>
        <div className="mt-3 flex justify-between text-[10.5px] text-muted">
          <span>Ankara tote · 1 item</span>
          <span>Seller quiet</span>
        </div>
      </>
    ),
  },
  {
    id: "views",
    col: 1,
    row: 1,
    w: 214,
    skin: "dark",
    body: (
      <>
        <Head app="video" name="TikTok" meta="now" dark />
        <p className="mt-3 font-display text-[30px] font-bold leading-none tracking-[-0.05em]">
          12.4K<span className="ml-1 text-[12px] font-medium tracking-normal text-white/50">views</span>
        </p>
        <svg viewBox="0 0 180 40" className="mt-2 h-9 w-full" fill="none" aria-hidden>
          <path d="M0 36 C 30 34, 50 30, 70 24 S 120 12, 180 4" stroke="#ff4f6d" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M0 36 C 30 34, 50 30, 70 24 S 120 12, 180 4 V40 H0z" fill="url(#vg)" opacity=".35" />
          <defs>
            <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#ff4f6d" />
              <stop offset="1" stopColor="#ff4f6d" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="mt-1 flex justify-between text-[11px]">
          <span className="text-white/50">Orders</span>
          <span className="font-semibold text-[#ff6b6b]">0</span>
        </div>
      </>
    ),
  },
  {
    id: "accra",
    col: 2,
    row: 1,
    w: 196,
    skin: "light",
    body: (
      <>
        <Head app="x" name="you" meta="2d" />
        <span className="mt-3 inline-block rounded-2xl rounded-br-md bg-ink px-3 py-1.5 text-[12px] text-canvas">Do you deliver to Accra?</span>
        <span className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-[10.5px] font-medium text-muted">
          <span className="size-1.5 rounded-full bg-faint" />
          No reply
        </span>
      </>
    ),
  },
];

function cardTransform(c: CardDef, lifted: boolean) {
  const a = Math.abs(c.col);
  const x = c.col * COL_X;
  const z = -a * a * 46 + (lifted ? 60 : 0);
  const ry = -c.col * 17;
  return `translate3d(calc(-50% + ${x}px), 0, ${z}px) rotateY(${ry}deg) scale(${lifted ? 1.04 : 1})`;
}

/* ---------- section ---------- */

export function Problem() {
  const section = useRef<HTMLElement>(null);
  const outer = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const inView = useInView(outer, { margin: "200px" });

  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0.12, 0.5], [22, 6]);
  const tilt = useTransform(scrollYProgress, [0.12, 0.5], [0.9, 1]);

  const [step, setStep] = useState(0);
  const active = PATH[step];
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setStep((s) => (s + 1) % PATH.length), 2200);
    return () => clearInterval(id);
  }, [inView]);

  // Fit the 1200px design wall to the container; on phones keep it legible and crop the sides.
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(Math.max(0.58, Math.min(1, e.contentRect.width / W))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Thread endpoints, measured from real on-screen rects every frame while visible.
  const pinX = useMotionValue(600);
  const tx = useMotionValue(600);
  const ty = useMotionValue(200);
  const sx = useSpring(tx, { stiffness: 140, damping: 18 });
  const sy = useSpring(ty, { stiffness: 140, damping: 18 });
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const loop = () => {
      const o = outer.current?.getBoundingClientRect();
      const c = cardRefs.current[active]?.getBoundingClientRect();
      if (o && c) {
        pinX.set(o.width / 2);
        tx.set(c.left + c.width / 2 - o.left);
        ty.set(c.top - o.top);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, active, pinX, tx, ty]);

  const PIN_Y = 6;
  const d = useTransform([pinX, sx, sy], ([px, x, y]: number[]) => `M ${px} ${PIN_Y} C ${px} ${PIN_Y + 90}, ${x} ${y - 120}, ${x} ${y}`);
  const labelX = useSpring(useTransform([sx, pinX], ([x, px]: number[]): number => (x > px ? -214 : 22)), { stiffness: 200, damping: 22 });

  const notifs = NOTIFS[active];
  const activeCol = CARDS.find((c) => c.id === active)!.col;

  return (
    <section ref={section} className="relative overflow-hidden py-16 md:py-22">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <Eyebrow index="01" className="justify-center">
          The problem
        </Eyebrow>
        <h2 className="display mt-5 text-[clamp(40px,7vw,92px)]">
          <SplitWords text="Most sales die" />
          <br />
          <span className="inline-flex flex-wrap items-center justify-center gap-x-[0.22em]">
            <SplitWords text="in the" delay={0.12} />
            <Reveal delay={0.22} as="span" className="inline-flex items-center align-middle">
              <span className="hidden -space-x-3 align-middle md:inline-flex">
                <AppTile kind="camera" size={64} className="-rotate-6 ring-4 ring-canvas" />
                <AppTile kind="chat" size={64} className="z-10 ring-4 ring-canvas" />
                <AppTile kind="video" size={64} className="z-20 rotate-6 ring-4 ring-canvas" />
              </span>
              <span className="inline-flex -space-x-2 align-middle md:hidden">
                <AppTile kind="camera" size={36} className="-rotate-6 ring-2 ring-canvas" />
                <AppTile kind="chat" size={36} className="z-10 ring-2 ring-canvas" />
                <AppTile kind="video" size={36} className="z-20 rotate-6 ring-2 ring-canvas" />
              </span>
            </Reveal>
            <SplitWords text="DMs." delay={0.3} className="text-orange" />
          </span>
        </h2>
        <Reveal delay={0.2} as="p" className="mx-auto mt-6 max-w-xl text-lg text-muted">
          You get the views and the comments. People ask “How much?” You reply, they disappear.{" "}
          <span className="font-semibold text-ink">Greep fixes that.</span>
        </Reveal>
      </div>

      {/* the wall */}
      <div ref={outer} className="relative mx-auto mt-10 max-w-[1240px] md:mt-14" style={{ height: 96 + (H - 30) * k }}>
        <div aria-hidden className="dot-grid pointer-events-none absolute -inset-x-20 inset-y-0 [mask-image:radial-gradient(ellipse_at_50%_45%,black_30%,transparent_72%)]" />

        {/* thread */}
        <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible" aria-hidden>
          <motion.path d={d} fill="none" stroke="#ee6f38" strokeWidth="2.25" strokeLinecap="round" />
          <motion.circle cx={pinX} cy={PIN_Y} r="13" fill="#ee6f38" opacity=".18" />
          <motion.circle cx={pinX} cy={PIN_Y} r="6.5" fill="#ee6f38" />
          <motion.circle cx={sx} cy={sy} r="5" fill="#ee6f38" />
          <motion.circle cx={sx} cy={sy} r="11" fill="none" stroke="#ee6f38" strokeOpacity=".35" strokeWidth="2" />
        </svg>
        <motion.span
          className="absolute top-8 z-30 hidden rounded-full border border-orange/25 bg-paper px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] text-orange shadow-[var(--shadow-card)] sm:block"
          style={{ left: pinX, x: labelX }}
        >
          your sale, stuck here ↓
        </motion.span>

        {/* scaled 3D stage */}
        <div className="absolute left-1/2 top-[96px] origin-top" style={{ width: W, height: H, transform: `translateX(-50%) scale(${k})` }}>
          <div className="absolute inset-0 [perspective:1300px] [perspective-origin:50%_30%]">
            <motion.div style={{ rotateX, scale: tilt, transformStyle: "preserve-3d" }} className="absolute inset-0 origin-[50%_0%]">
              {/* centre axis, like a dashed plumb line behind the cards */}
              <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 border-l border-dashed border-orange/30" style={{ transform: "translateZ(-80px)" }} />
              {CARDS.map((c, i) => {
                const lifted = c.id === active;
                const a = Math.abs(c.col);
                return (
                  <div
                    key={c.id}
                    ref={(el) => {
                      cardRefs.current[c.id] = el;
                    }}
                    className="absolute left-1/2"
                    style={{
                      top: ROW_Y[c.row],
                      width: c.w,
                      transform: cardTransform(c, lifted),
                      transition: "transform .7s cubic-bezier(.34,1.56,.64,1)",
                      zIndex: lifted ? 20 : 10 - a,
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-10%" }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 * i }}
                    >
                      <div
                        className={`rounded-[22px] p-4 transition-[box-shadow,filter,opacity] duration-500 ${SKINS[c.skin]}`}
                        style={{
                          opacity: a === 2 ? 0.55 : 1,
                          filter: a === 2 ? "blur(1.4px) saturate(.6)" : "none",
                          boxShadow: lifted
                            ? "0 0 0 2px #ee6f38, 0 0 0 7px rgba(238,111,56,.16), 0 30px 60px -20px rgba(238,111,56,.55)"
                            : "var(--shadow-pop)",
                        }}
                      >
                        {c.body}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* glass notifications that follow the story */}
          <Notification side={activeCol <= 0 ? "left" : "right"} n={notifs[0]} k={`${active}-a`} />
          <Notification side={activeCol <= 0 ? "right" : "left"} n={notifs[1]} k={`${active}-b`} low />
        </div>
      </div>
    </section>
  );
}

function Notification({ side, n, k, low }: { side: "left" | "right"; n: Notif; k: string; low?: boolean }) {
  return (
    <div className={`absolute z-40 hidden h-[90px] w-[300px] md:block ${side === "left" ? "-left-2" : "-right-2"} ${low ? "top-[350px]" : "top-[140px]"}`}>
      <AnimatePresence initial={false}>
        <motion.div
          key={k}
          initial={{ opacity: 0, y: low ? 18 : -18, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: low ? -12 : 12, scale: 0.97 }}
          transition={{ y: { type: "spring", stiffness: 300, damping: 26 }, scale: { type: "spring", stiffness: 300, damping: 26 }, opacity: { duration: 0.3 } }}
          className="glass absolute inset-x-0 top-0 flex gap-3 rounded-[20px] p-3.5"
        >
          <AppTile kind={n.app} size={34} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{n.label}</span>
              <span className="text-[10.5px] text-muted">now</span>
            </div>
            <p className="mt-0.5 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">{n.title}</p>
            <p className="truncate text-[12.5px] text-ink-2">{n.body}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const APPS: { kind: Kind; name: string }[] = [
  { kind: "video", name: "TikTok" },
  { kind: "camera", name: "Instagram" },
  { kind: "pin", name: "Pinterest" },
  { kind: "chat", name: "WhatsApp" },
  { kind: "x", name: "X" },
];

export function AppMarquee() {
  const row = [...APPS, ...APPS, ...APPS];
  return (
    <div className="relative border-y border-line bg-canvas py-5">
      <div className="mx-auto flex max-w-6xl items-center gap-8 overflow-hidden px-4">
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-12">
            {[...row, ...row].map((a, i) => (
              <span key={i} className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.02em] text-ink">
                <BrandGlyph kind={a.kind} size={22} />
                {a.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
