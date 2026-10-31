"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Blobatar } from "@blobatar/react";
import { happy, idle, sleepy, unsure } from "blobatar/expression";
import {
  Bookmark,
  Camera,
  Check,
  Heart,
  Hourglass,
  Link2,
  Link2Off,
  MessageCircle,
  MessagesSquare,
  Send,
  Users,
  X,
} from "lucide-react";
import { Eyebrow, Reveal, SplitWords } from "@/components/ui/Reveal";
import { AppTile, type AppKind } from "@/components/ui/Icons";
import { LogoMark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useLoop } from "@/components/ui/useLoop";

const INK = "#0a0a0a";
const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: "spring", stiffness: 420, damping: 26 } as const;

/* ================================================================== section */

export function Feeling() {
  return (
    <section id="feeling" className="relative overflow-x-clip py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <Eyebrow>You know that feeling</Eyebrow>
        <div className="mt-5 grid items-end gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12">
          <h2 className="display text-[clamp(40px,6.4vw,84px)]">
            <SplitWords text="You know" />
            <br />
            <SplitWords text="that feeling." delay={0.1} />
          </h2>
          <Reveal as="p" delay={0.15} className="max-w-md text-[17px] leading-relaxed text-muted md:pb-2">
            You&apos;re scrolling Pinterest, Instagram, TikTok, SHEIN, or just out in the real world.{" "}
            <span className="font-medium text-ink">Suddenly, you see it.</span>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Reveal className="min-w-0">
            <FeedCard />
          </Reveal>
          <Reveal delay={0.08} className="min-w-0">
            <SearchCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* Graphite bento shell. Stays dark in both themes. */
function Graphite({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative h-full overflow-hidden rounded-[28px] bg-[#151517] text-[#fafafa] shadow-[0_1px_2px_rgb(0_0_0/0.08),0_24px_60px_-28px_rgb(0_0_0/0.55)] ring-1 ring-white/[0.06] ${className}`}
    >
      {children}
    </div>
  );
}

/* ================================================================ feed card */

type Find = { word: string; art: "bag" | "shoes" | "dress" | "gadget"; bg: string; src: AppKind | "real"; handle: string; meta: string };

const FINDS: Find[] = [
  { word: "That bag.", art: "bag", bg: "#f3c54c", src: "pin", handle: "styled.by.temi", meta: "Pinned to Fits" },
  { word: "Those shoes.", art: "shoes", bg: "#b9abf3", src: "camera", handle: "lagos.street.fits", meta: "Sponsored" },
  { word: "That dress.", art: "dress", bg: "#8fb5f5", src: "video", handle: "dami.wears", meta: "12.4k likes" },
  { word: "That gadget.", art: "gadget", bg: "#ee6f38", src: "real", handle: "Out and about", meta: "Photo you took" },
];

function FeedCard() {
  const { ref, step } = useLoop([2000, 2000, 2000, 2000]);
  const reduce = useReducedMotion();
  const f = FINDS[step];

  return (
    <Graphite className="flex flex-col p-5 md:p-6">
      <div ref={ref} className="flex items-center justify-end">
        <span className="flex gap-1">
          {FINDS.map((x, i) => (
            <span key={x.word} className={`h-1 rounded-full transition-all duration-500 ${i === step ? "w-5 bg-white" : "w-1.5 bg-white/20"}`} />
          ))}
        </span>
      </div>

      {/* the post, scrolling like a feed */}
      <div className="relative mt-4 h-[318px] overflow-hidden rounded-[22px] bg-[#1e1e21] ring-1 ring-white/[0.05]">
        <AnimatePresence initial={false}>
          <motion.div
            key={step}
            className="absolute inset-0 flex flex-col p-3"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: "0%" }}
            exit={reduce ? { opacity: 0 } : { y: "-100%" }}
            transition={{ duration: 0.75, ease }}
          >
            <Post f={f} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* rotating word */}
      <div className="mt-6">
        <p className="text-[14px] text-white/50">Suddenly, you see it.</p>
        <p className="relative mt-1 h-[1.05em] overflow-hidden font-display text-[clamp(38px,4.4vw,54px)] font-medium leading-none tracking-[-0.05em]" aria-label="That bag. Those shoes. That dress. That gadget.">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={step}
              aria-hidden
              className="block"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              {f.word}
            </motion.span>
          </AnimatePresence>
        </p>
        <p className="mt-3 flex items-center gap-2 text-[16px] font-medium text-white/80">
          <motion.span
            key={step}
            className="grid size-7 place-items-center rounded-full bg-[#e3574a]/15 text-[#ff6b5e]"
            initial={{ scale: 1 }}
            animate={reduce ? {} : { scale: [1, 1.35, 0.92, 1.12, 1] }}
            transition={{ duration: 0.9, delay: 0.75, ease: "easeOut" }}
          >
            <Heart size={15} fill="currentColor" />
          </motion.span>
          You love it. You want it.
        </p>
      </div>
    </Graphite>
  );
}

function Post({ f }: { f: Find }) {
  const reduce = useReducedMotion();
  return (
    <>
      <div className="flex items-center gap-2.5 px-1 pb-2.5">
        {f.src === "real" ? (
          <span className="grid size-7 place-items-center rounded-[26%] bg-white text-[#0a0a0a]">
            <Camera size={15} strokeWidth={2.2} />
          </span>
        ) : (
          <AppTile kind={f.src} size={28} />
        )}
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-semibold">{f.handle}</span>
          <span className="block truncate text-[11px] text-white/45">{f.meta}</span>
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">Follow</span>
      </div>

      <div className="relative grid flex-1 place-items-center overflow-hidden rounded-[16px]" style={{ background: f.bg }}>
        {/* soft shapes behind the item */}
        <span className="absolute -left-6 -top-8 size-32 rounded-full bg-white/25" />
        <span className="absolute -bottom-10 -right-4 size-36 rounded-full bg-black/10" />
        <motion.div
          className="relative size-[176px]"
          initial={reduce ? false : { scale: 0.6, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.3 }}
        >
          <FindArt art={f.art} />
        </motion.div>
        {/* double tap heart */}
        {!reduce && (
          <motion.span
            className="absolute grid place-items-center text-white drop-shadow-[0_6px_16px_rgb(0_0_0/0.3)]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.25, 1, 1.05], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1, delay: 0.85, times: [0, 0.3, 0.6, 1] }}
          >
            <Heart size={84} fill="currentColor" strokeWidth={0} />
          </motion.span>
        )}
      </div>

      <div className="flex items-center gap-3.5 px-1 pt-2.5 text-white/85">
        <motion.span
          initial={{ color: "rgb(255 255 255 / 0.85)", scale: 1 }}
          animate={{ color: "#ff5a4e", scale: reduce ? 1 : [1, 1.4, 1] }}
          transition={{ delay: 0.95, duration: 0.45 }}
          className="flex"
        >
          <Heart size={19} fill="currentColor" fillOpacity={1} />
        </motion.span>
        <MessageCircle size={19} />
        <Send size={18} />
        <Bookmark size={18} className="ml-auto" />
      </div>
    </>
  );
}

/* ----------------------------------------------------------- flat item art */

function FindArt({ art }: { art: Find["art"] }) {
  const s = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  if (art === "bag")
    return (
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden>
        <path d="M42 46c0-13 8-22 18-22s18 9 18 22" fill="none" {...s} strokeWidth={5} />
        <path d="M24 46h72l-6 52a7 7 0 0 1-7 6H37a7 7 0 0 1-7-6z" fill="#8a5a36" {...s} />
        <path d="M27 64h66l-1.6 15H28.6z" fill="#ee6f38" {...s} strokeWidth={2.4} />
        {[36, 48, 60, 72, 84].map((x, i) => (
          <circle key={x} cx={x} cy="71.5" r="3.4" fill={i % 2 ? "#c6f36d" : "#fbfaf6"} stroke={INK} strokeWidth="1.8" />
        ))}
        <rect x="53" y="50" width="14" height="9" rx="2.5" fill="#f3c54c" {...s} strokeWidth={2.4} />
      </svg>
    );
  if (art === "shoes")
    return (
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden>
        <path d="M12 84c0-14 5-30 12-36l16 9c9 5 18 4 24-3l6 6c10 9 24 12 36 14 6 1 9 5 9 10v6H12z" fill="#fbfaf6" {...s} />
        <path d="M10 90h100v6a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z" fill="#0d965e" {...s} />
        <path d="M40 73c10 4 26 5 40 1" fill="none" stroke="#ee6f38" strokeWidth="6" strokeLinecap="round" />
        <path d="M46 58l6 8M54 55l6 8M62 54l5 7" fill="none" {...s} strokeWidth={2.4} />
        <circle cx="26" cy="62" r="4" fill="#c6f36d" stroke={INK} strokeWidth="2" />
      </svg>
    );
  if (art === "dress")
    return (
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden>
        <path d="M48 14l4 20M72 14l-4 20" fill="none" {...s} />
        <path d="M50 34h20l3 20H47z" fill="#e3574a" {...s} />
        <path d="M47 54h26l24 52H23z" fill="#e3574a" {...s} />
        <rect x="45" y="51" width="30" height="7" rx="3" fill="#f3c54c" {...s} strokeWidth={2.4} />
        {[
          [44, 76], [60, 70], [76, 76], [38, 94], [54, 88], [68, 92], [84, 94],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#fbfaf6" />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden>
      <path d="M26 70V58a34 34 0 0 1 68 0v12" fill="none" {...s} strokeWidth={8} />
      <path d="M26 70V58a34 34 0 0 1 68 0v12" fill="none" stroke="#fbfaf6" strokeWidth={3} strokeLinecap="round" />
      <rect x="14" y="62" width="26" height="40" rx="11" fill="#fbfaf6" {...s} />
      <rect x="80" y="62" width="26" height="40" rx="11" fill="#fbfaf6" {...s} />
      <rect x="22" y="70" width="12" height="24" rx="6" fill="#0d965e" stroke={INK} strokeWidth="2.2" />
      <rect x="86" y="70" width="12" height="24" rx="6" fill="#0d965e" stroke={INK} strokeWidth="2.2" />
      <circle cx="60" cy="30" r="3.5" fill="#c6f36d" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

/* ============================================================== search card */

const PAINS = [
  { label: "Slide into the DMs.", icon: MessageCircle, fail: "Seen. No reply." },
  { label: "Click the link in bio.", icon: Link2, fail: "Link broken." },
  { label: "Dig through the comments.", icon: MessagesSquare, fail: "Just more “price??”" },
  { label: "Ask your friends.", icon: Users, fail: "“No idea.”" },
  { label: "Wait for a reply…", icon: Hourglass, fail: "Still waiting." },
];

// 0-4: try each pain, 5: strike the list, 6: stamp + Greep press
const SEARCH_DURATIONS = [2300, 2300, 2500, 2300, 2700, 1300, 3400];

function SearchCard() {
  const { ref, step } = useLoop(SEARCH_DURATIONS);
  const reduce = useReducedMotion();
  const struck = step >= 5;
  const stamped = step === 6;

  return (
    <Graphite className="p-5 md:p-7">
      <motion.div
        ref={ref}
        className="flex h-full flex-col"
        animate={stamped && !reduce ? { x: [0, -5, 4, -2, 0] } : { x: 0 }}
        transition={{ duration: 0.35, delay: 0.32 }}
      >
        <h3 className="font-display text-[clamp(30px,3.4vw,44px)] font-medium leading-[1] tracking-[-0.05em]">
          But how on earth do you find it?
        </h3>
        <p className="mt-3 text-[15px] text-white/55">And if your next instinct is to search&hellip;</p>

        <div className="mt-6 grid flex-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* checklist */}
          <div className="relative order-2 md:order-1">
            <ol className="flex flex-col gap-1.5">
              {PAINS.map((p, i) => {
                const state = step < i ? "todo" : step === i ? "trying" : "failed";
                const Icon = p.icon;
                return (
                  <li
                    key={p.label}
                    className={`relative flex items-center gap-3 rounded-[14px] px-2.5 py-2 transition-colors duration-300 ${state === "trying" ? "bg-white/[0.07]" : ""}`}
                    style={{ opacity: struck ? 0.45 : 1, transition: "opacity .4s, background-color .3s" }}
                  >
                    <span
                      className={`relative grid size-9 shrink-0 place-items-center rounded-[11px] transition-colors duration-300 ${
                        state === "trying" ? "bg-white text-[#0a0a0a]" : state === "failed" ? "bg-[#e3574a]/15 text-[#ff6b5e]" : "bg-white/[0.06] text-white/45"
                      }`}
                    >
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={state === "failed" ? "x" : "i"}
                          initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0.4, opacity: 0 }}
                          transition={spring}
                          className="flex"
                        >
                          {state === "failed" ? <X size={16} strokeWidth={2.6} /> : <Icon size={16} strokeWidth={2.2} />}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`relative inline-block text-[15px] font-medium transition-colors duration-300 ${state === "todo" ? "text-white/45" : "text-white"}`}>
                        {p.label}
                        <motion.span
                          aria-hidden
                          className="absolute left-[-2px] right-[-2px] top-1/2 h-[2px] origin-left rounded-full bg-white"
                          initial={false}
                          animate={{ scaleX: struck ? 1 : 0 }}
                          transition={{ duration: struck ? 0.35 : 0.2, delay: struck ? i * 0.09 : 0, ease }}
                        />
                      </span>
                      <span className="block h-[18px] text-[12.5px]">
                        {state === "trying" && (
                          <span className="flex items-center gap-2 text-white/60">
                            <PixelGrid size={3} />
                            <Shimmer>Trying</Shimmer>
                          </span>
                        )}
                        {state === "failed" && (
                          <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="block text-[#ff8a80]">
                            {p.fail}
                          </motion.span>
                        )}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>

            {/* the stamp */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <motion.div
                className="rounded-[18px] border-[3px] border-lime bg-[#151517]/90 px-5 py-3 text-center text-lime shadow-[0_20px_50px_-12px_rgb(0_0_0/0.8)] backdrop-blur-[2px]"
                initial={false}
                animate={
                  stamped
                    ? { opacity: 1, scale: 1, rotate: -6 }
                    : { opacity: 0, scale: reduce ? 1 : 1.9, rotate: -14 }
                }
                transition={stamped ? { type: "spring", stiffness: 520, damping: 22, delay: 0.15 } : { duration: 0.25 }}
              >
                <span className="block font-display text-[clamp(22px,2.4vw,28px)] font-medium leading-[1.05] tracking-[-0.04em]">
                  Kill that search.
                </span>
                <span className="block font-display text-[clamp(26px,2.9vw,34px)] font-medium leading-[1.05] tracking-[-0.045em] text-white">
                  Just Greep it.
                </span>
              </motion.div>
            </div>
          </div>

          {/* stage */}
          <div className="relative order-1 h-[268px] overflow-hidden rounded-[20px] bg-[#1e1e21] ring-1 ring-white/[0.05] md:order-2 md:h-auto md:min-h-[300px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step >= 5 ? "greep" : step}
                className="absolute inset-0 flex flex-col p-3.5"
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.35, ease }}
              >
                {step === 0 && <DMScene />}
                {step === 1 && <LinkScene />}
                {step === 2 && <CommentsScene />}
                {step === 3 && <FriendsScene />}
                {step === 4 && <WaitScene />}
                {step >= 5 && <GreepScene pressed={stamped} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="sr-only">Kill that search. Just Greep it.</p>
      </motion.div>
    </Graphite>
  );
}

/* ------------------------------------------------------------ stage scenes */

function SceneHead({ name, hue, title, sub, expression }: { name: string; hue: number; title: string; sub: string; expression?: typeof idle }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-2.5">
      <Blobatar name={name} hue={hue} animate="always" expression={expression ?? idle} size={30} />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[13px] font-semibold">{title}</span>
        <span className="block truncate text-[11px] text-white/45">{sub}</span>
      </span>
    </div>
  );
}

function Thumb({ size = 54 }: { size?: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center overflow-hidden rounded-[12px] bg-[#f3c54c]" style={{ width: size, height: size }}>
      <span className="size-[78%]">
        <FindArt art="bag" />
      </span>
    </span>
  );
}

function DMScene() {
  return (
    <>
      <SceneHead name="finds.by.ola" hue={22} title="finds.by.ola" sub="Active 2h ago" />
      <div className="flex flex-1 flex-col items-end justify-end gap-1.5 pb-1">
        <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...spring, delay: 0.1 }} className="rounded-[16px] rounded-br-[6px] bg-[#7c6cf2] p-1">
          <Thumb size={66} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.35 }}
          className="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-[#7c6cf2] px-3 py-2 text-[13px] leading-snug"
        >
          Hi! Where can I buy this bag? How much?
        </motion.p>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }} className="flex items-center gap-1 text-[11px] text-white/45">
          <Check size={11} /> Seen
        </motion.span>
        {/* typing, then nothing */}
        <motion.span
          className="mr-auto flex items-center gap-1 rounded-full bg-white/[0.08] px-3 py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.1, delay: 1.1, times: [0, 0.15, 0.8, 1] }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-1.5 rounded-full bg-white/60" style={{ animation: `feel-bounce 0.9s ${i * 0.15}s infinite` }} />
          ))}
        </motion.span>
      </div>
      <style>{`@keyframes feel-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-3px);opacity:1}}`}</style>
    </>
  );
}

function LinkScene() {
  const reduce = useReducedMotion();
  return (
    <>
      <SceneHead name="lagos.street.fits" hue={262} title="lagos.street.fits" sub="Fits and finds. Shop below" />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3">
        <motion.span
          className="relative flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#0a0a0a]"
          animate={reduce ? {} : { scale: [1, 1, 0.92, 1] }}
          transition={{ duration: 0.6, delay: 0.3, times: [0, 0.4, 0.6, 1] }}
        >
          <Link2 size={14} /> my.links/shop
          {!reduce && (
            <motion.span
              className="absolute -bottom-2 -right-1 size-6 rounded-full border-2 border-white/80 bg-white/30"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1, 1.6], opacity: [0, 1, 0] }}
              transition={{ duration: 0.7, delay: 0.35 }}
            />
          )}
        </motion.span>

        <motion.div
          className="w-full overflow-hidden rounded-[14px] bg-[#26262a] ring-1 ring-white/[0.06]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4, ease }}
        >
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2 font-mono text-[11px] text-white/55">
            <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.5 }} className="absolute">
              <span className="block size-3 rounded-full border-2 border-white/25 border-t-white" style={{ animation: "feel-spin .7s linear infinite" }} />
            </motion.span>
            <span className="pl-5">my.links/shop</span>
          </div>
          <div className="relative h-[70px]">
            <motion.span className="absolute left-0 top-0 h-[2px] bg-sky" initial={{ width: "0%" }} animate={{ width: ["0%", "72%", "72%"] }} transition={{ duration: 0.85, delay: 0.7 }} />
            <motion.div className="absolute inset-0 flex items-center gap-2.5 px-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.55 }}>
              <span className="grid size-8 place-items-center rounded-[10px] bg-[#e3574a]/15 text-[#ff6b5e]">
                <Link2Off size={15} />
              </span>
              <span className="leading-tight">
                <span className="block text-[13px] font-semibold">Page not found</span>
                <span className="block text-[11px] text-white/45">This link no longer works</span>
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes feel-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

const COMMENTS = [
  ["tolu.k", 150, "price?? 👀"],
  ["ife_xo", 330, "where is this from"],
  ["seyi.b", 40, "link pls 🙏"],
  ["mo.vibes", 210, "need this!!"],
  ["dayo", 280, "price??"],
  ["kemi.t", 95, "DM'd you, no reply"],
  ["zainab", 180, "is it still available?"],
  ["bisi", 10, "price?? 👀"],
] as const;

function CommentsScene() {
  const reduce = useReducedMotion();
  const list = [...COMMENTS, ...COMMENTS];
  return (
    <>
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <span className="text-[13px] font-semibold">1,204 comments</span>
        <span className="font-mono text-[11px] text-white/40">Newest</span>
      </div>
      <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]">
        <div className="flex flex-col gap-2.5 pt-2" style={{ animation: reduce ? "none" : "feel-scroll 5.5s linear infinite" }}>
          {list.map(([n, h, t], i) => (
            <div key={i} className="flex items-start gap-2">
              <Blobatar name={n} hue={h} size={22} expression={idle} />
              <span className="min-w-0 leading-tight">
                <span className="block text-[11px] text-white/45">{n}</span>
                <span className="block text-[13px]">{t}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes feel-scroll{to{transform:translateY(-50%)}}`}</style>
    </>
  );
}

function FriendsScene() {
  const replies = [
    { n: "Tolu", h: 150, t: "no idea 😭" },
    { n: "Ife", h: 330, t: "omg I want it too" },
    { n: "Seyi", h: 40, t: "no clue, sorry" },
  ];
  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-2.5">
        <span className="flex -space-x-2">
          {replies.map((r) => (
            <span key={r.n} className="rounded-full ring-2 ring-[#1e1e21]">
              <Blobatar name={r.n} hue={r.h} size={24} expression={idle} />
            </span>
          ))}
        </span>
        <span className="leading-tight">
          <span className="block text-[13px] font-semibold">The group chat</span>
          <span className="block text-[11px] text-white/45">Tolu, Ife, Seyi</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-1.5 pb-1">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="ml-auto flex max-w-[88%] items-center gap-2 rounded-[16px] rounded-br-[6px] bg-green p-1 pr-3">
          <Thumb size={40} />
          <span className="text-[13px] leading-snug">anyone know where this is from?</span>
        </motion.div>
        {replies.map((r, i) => (
          <motion.div
            key={r.n}
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: 0.55 + i * 0.4 }}
            className="flex items-end gap-1.5"
          >
            <Blobatar name={r.n} hue={r.h} size={22} expression={i === 0 ? unsure : idle} />
            <span className="rounded-[14px] rounded-bl-[5px] bg-white/[0.08] px-3 py-1.5 text-[13px]">{r.t}</span>
          </motion.div>
        ))}
      </div>
    </>
  );
}

/* Beautiful UI LoadingState (MIT), adapted: fixed light ink for the graphite
 * card, Greep copy, and a fast-forward timer that starts at 3m 12s. */
const CHEVRON = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3), c = i % 3;
  return (c + Math.abs(r - 1)) * 90;
});

function PixelGrid({ size = 4, color = "#fafafa" }: { size?: number; color?: string }) {
  return (
    <span aria-hidden className="grid shrink-0 gap-[1.5px]" style={{ gridTemplateColumns: `repeat(3,${size}px)` }}>
      {CHEVRON.map((delay, i) => (
        <span
          key={i}
          className="rounded-[1px]"
          style={{ width: size, height: size, background: color, opacity: 0.15, animation: `pixel-on 650ms ease-in-out ${delay}ms infinite` }}
        />
      ))}
    </span>
  );
}

function Shimmer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`bg-clip-text font-medium text-transparent ${className}`}
      style={{
        backgroundImage: "linear-gradient(90deg, rgb(255 255 255 / 0.4) 35%, #fff 50%, rgb(255 255 255 / 0.4) 65%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-text 1.4s linear infinite",
      }}
    >
      {children}
    </span>
  );
}

function WaitScene() {
  const [secs, setSecs] = useState(192);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 110);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <SceneHead name="finds.by.ola" hue={22} title="finds.by.ola" sub="Seen 3m ago" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="relative">
          <Blobatar name="you-waiting" hue={150} animate="always" expression={sleepy} size={64} />
          <motion.span
            className="absolute -right-3 -top-2 font-mono text-[12px] text-white/50"
            animate={{ opacity: [0, 1, 0], y: [4, -6, -12] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            z
          </motion.span>
        </div>
        <div role="status" className="flex items-center gap-2.5 rounded-full bg-white/[0.06] px-3.5 py-2">
          <PixelGrid />
          <Shimmer className="text-[13px]">Waiting for a reply</Shimmer>
          <span className="font-mono text-[12px] tabular-nums text-white/45">
            {Math.floor(secs / 60)}m {secs % 60}s
          </span>
        </div>
      </div>
    </>
  );
}

function GreepScene({ pressed }: { pressed: boolean }) {
  const reduce = useReducedMotion();
  const [found, setFound] = useState(false);
  useEffect(() => {
    if (!pressed) return setFound(false);
    const t = setTimeout(() => setFound(true), 1050);
    return () => clearTimeout(t);
  }, [pressed]);
  const apps: AppKind[] = ["chat", "camera", "x", "video"];
  return (
    <>
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <span className="text-[13px] font-semibold">Share to</span>
        <span className="text-[11px] text-white/45">Tap Greep</span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-1.5">
        {apps.map((k) => (
          <span key={k} className="flex flex-col items-center gap-1 opacity-40">
            <AppTile kind={k} size={38} />
          </span>
        ))}
        <motion.span
          className="relative grid size-[38px] place-items-center rounded-[26%] bg-green shadow-[0_8px_20px_-6px_rgb(13_150_94/0.8)] ring-2 ring-lime"
          animate={reduce ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <LogoMark size={22} ink="#ffffff" />
        </motion.span>
      </div>

      {/* what you are sharing, then what Greep found */}
      <div className="relative mx-auto mt-4 h-[68px] w-full max-w-[260px]">
        <AnimatePresence mode="wait" initial={false}>
          {found ? (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={spring}
              className="flex h-full items-center gap-2.5 rounded-[16px] bg-white px-2.5 text-[#0a0a0a]"
            >
              <Blobatar name="greep-found" hue={150} animate="always" expression={happy} size={34} />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-[13.5px] font-semibold">Found it!</span>
                <span className="block truncate text-[11.5px] text-[#71717a]">6 sellers from ₦42,000</span>
              </span>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-green text-white">
                <Check size={13} strokeWidth={3} />
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ ...spring, delay: 0.1 }}
              className="flex h-full items-center gap-3 rounded-[16px] bg-white/[0.06] px-2 ring-1 ring-white/[0.06]"
            >
              <Thumb size={52} />
              <span className="min-w-0 leading-tight">
                <span className="block text-[13px] font-semibold">That bag</span>
                <span className="block truncate text-[11px] text-white/45">Pin from styled.by.temi</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative mt-auto flex flex-col items-center pb-1">
        <motion.span
          className="relative"
          animate={pressed && !reduce ? { scale: [1, 1, 0.9, 1.04, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, delay: 0.55, times: [0, 0.3, 0.5, 0.8, 1] }}
        >
          <Button variant="primary" size="md" interaction="sparkle" href="#how" icon={<LogoMark size={18} mono />} forceHover={pressed}>
            Greep it
          </Button>
          {pressed && !reduce && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-lime"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 2.4], opacity: [1, 0] }}
              transition={{ duration: 0.7, delay: 0.75 }}
            />
          )}
        </motion.span>
      </div>
    </>
  );
}
