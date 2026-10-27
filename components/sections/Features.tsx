"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BorderBeam } from "border-beam";
import { Blobatar } from "@blobatar/react";
import { happy, idle, thinking } from "blobatar/expression";
import { ImageLoader } from "generative-loaders";
import { Check, Lock, MessageSquareLock, Package, Send, Tag } from "lucide-react";
import { Eyebrow, Reveal, SplitWords } from "@/components/ui/Reveal";
import { AppTile } from "@/components/ui/Icons";
import { LogoMark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useLoop } from "@/components/ui/useLoop";
import { useTheme } from "@/components/ui/theme";

const spring = { type: "spring", stiffness: 420, damping: 28 } as const;
const ease = [0.16, 1, 0.3, 1] as const;

export function Features() {
  return (
    <section id="features" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-3xl">
          <Eyebrow index="04">Features</Eyebrow>
          <h2 className="display mt-5 text-[clamp(40px,6.4vw,84px)]">
            <SplitWords text="Built for how" />
            <br />
            <SplitWords text="Africa buys." delay={0.1} className="text-green" />
          </h2>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Tile className="md:col-span-2" title="Escrow on every order" line="Sellers get paid when you're happy." delay={0}>
            <EscrowScene />
          </Tile>
          <Tile title="Price requests" line="No more “DM for price”." delay={0.05}>
            <PriceScene />
          </Tile>
          <Tile title="Instant stores" line="One share sets up the store." delay={0.1}>
            <StoreScene />
          </Tile>
          <Tile title="Get paid anywhere" line="Buyers pay in dollars. You cash out at home." delay={0.15}>
            <CurrencyScene />
          </Tile>
          <Tile title="Order chat" line="Messages live with the order." delay={0.2}>
            <ChatScene />
          </Tile>
          <BuyersTile />
        </div>
      </div>
    </section>
  );
}

/* ---------- shell ---------- */

function Tile({
  title,
  line,
  tag,
  children,
  className = "",
  delay = 0,
  wide,
  aside,
}: {
  aside?: React.ReactNode;
  title: string;
  line: string;
  tag?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  wide?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const theme = useTheme();
  return (
    <Reveal delay={delay} className={`min-w-0 ${className}`}>
      <BorderBeam colorVariant="forest" theme={theme} size="md" active={hover} strength={hover ? 0.85 : 0} className="h-full">
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={`card flex h-full flex-col gap-6 p-3 pb-6 ${wide ? "md:flex-row-reverse md:items-stretch md:gap-8 md:pb-3" : ""}`}
        >
          <div className={`min-w-0 ${wide ? "md:w-[62%]" : ""}`}>{children}</div>
          <div className={`px-4 ${wide ? "md:flex md:flex-1 md:flex-col md:justify-between md:gap-6 md:py-5 md:pl-5" : ""}`}>
            {aside && <div className="mb-6 md:mb-0">{aside}</div>}
            <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[20px] font-semibold tracking-[-0.035em]">{title}</h3>
              {tag && (
                <span className="whitespace-nowrap rounded-full bg-mint px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-green-ink">
                  {tag}
                </span>
              )}
            </div>
            <p className="mt-1 text-[15px] text-muted">{line}</p>
            </div>
          </div>
        </div>
      </BorderBeam>
    </Reveal>
  );
}

/** The framed area every scene draws into. */
function Stage({ children, className = "", innerRef }: { children: React.ReactNode; className?: string; innerRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={innerRef}
      className={`dot-grid relative h-[220px] overflow-hidden rounded-[18px] border border-line bg-sunken/60 ${className}`}
    >
      {children}
    </div>
  );
}

function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-paper px-2.5 py-1 text-[12px] font-medium text-ink shadow-[var(--shadow-card)] ${className}`}>
      {children}
    </span>
  );
}

function Cursor({ className = "", pressed }: { className?: string; pressed?: boolean }) {
  return (
    <motion.svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      animate={{ scale: pressed ? 0.82 : 1 }}
      transition={{ type: "spring", stiffness: 700, damping: 20 }}
      className={`drop-shadow-[0_3px_6px_rgb(0_0_0/0.3)] ${className}`}
      aria-hidden
    >
      <path d="M5 3l14 7.5-6.2 1.6L10 18.5z" fill="#fff" stroke="#0a0a0a" strokeWidth="1.6" strokeLinejoin="round" />
    </motion.svg>
  );
}

/* ---------- 1. Escrow ---------- */

const ESCROW = [900, 1100, 1100, 1200, 1100, 1500];
const ESCROW_LABEL = ["Buyer checks out", "Paid ₦45,000", "Held safe", "Delivered", "Released", "Seller paid"];

function EscrowScene() {
  const { ref, step } = useLoop(ESCROW);
  const atVault = step >= 1 && step <= 3;
  const atSeller = step >= 4;
  const locked = step === 2 || step === 3;
  const left = atSeller ? "86%" : atVault ? "50%" : "14%";
  const flying = step === 1 || step === 4;

  return (
    <Stage innerRef={ref}>
      {/* tracks */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
        {[
          { d: "M14 50 Q 32 8 50 50", on: step >= 1 },
          { d: "M50 50 Q 68 8 86 50", on: step >= 4 },
        ].map((p, i) => (
          <g key={i}>
            <path d={p.d} stroke="var(--color-line-strong)" strokeWidth="1.5" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
            <motion.path
              d={p.d}
              stroke="#0d965e"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              initial={false}
              animate={{ pathLength: p.on ? 1 : 0, opacity: p.on ? 1 : 0 }}
              transition={{ duration: 0.9, ease }}
            />
          </g>
        ))}
      </svg>

      {/* buyer */}
      <Person left="14%" label="Buyer">
        <Blobatar name="buyer-ada" hue={262} animate="always" expression={step === 5 ? happy : idle} size={56} />
      </Person>

      {/* vault */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ scale: locked ? 1.06 : 1 }}
          transition={spring}
          className={`relative grid size-[76px] place-items-center rounded-[22px] border transition-colors duration-500 ${
            locked ? "border-green/40 bg-mint" : "border-line bg-paper"
          } shadow-[var(--shadow-card)]`}
        >
          {locked && (
            <motion.span
              className="absolute inset-0 rounded-[22px] ring-2 ring-green/40"
              animate={{ scale: [1, 1.25], opacity: [0.7, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
          <svg width="34" height="38" viewBox="0 0 40 44" fill="none" aria-hidden>
            <motion.path
              d="M11 20v-7a9 9 0 0 1 18 0v7"
              stroke="currentColor"
              className="text-ink"
              strokeWidth="4"
              strokeLinecap="round"
              animate={{ y: locked ? 0 : -6 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
            />
            <rect x="4" y="19" width="32" height="23" rx="7" className={locked ? "fill-green" : "fill-faint"} style={{ transition: "fill .4s" }} />
            <circle cx="20" cy="30" r="3.5" fill="#fff" />
          </svg>
          <AnimatePresence>
            {step === 3 && (
              <motion.span
                initial={{ scale: 0, y: 6 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 16 }}
                className="absolute -right-3 -top-3 grid size-8 place-items-center rounded-full bg-orange text-white shadow-md"
              >
                <Package size={15} strokeWidth={2.4} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* seller */}
      <Person left="86%" label="Seller">
        <Blobatar name="seller-kemi" hue={22} animate="always" expression={step === 5 ? happy : step >= 2 ? thinking : idle} size={56} />
      </Person>

      {/* coin */}
      <motion.div
        className="absolute z-10 -ml-[15px] -mt-[15px]"
        initial={false}
        animate={{
          left,
          top: flying ? ["50%", "16%", "50%"] : "50%",
          scale: step === 0 ? 0 : atSeller && step === 5 ? 0 : locked ? 0.7 : 1,
          opacity: locked ? 0.0 : 1,
        }}
        transition={{ duration: flying ? 0.95 : 0.4, ease: "easeInOut" }}
      >
        <span className="grid size-[30px] place-items-center rounded-full bg-green text-[13px] font-bold text-white shadow-[inset_0_-3px_0_rgb(0_0_0/0.22),0_6px_14px_-4px_rgb(13_150_94/0.7)]">
          $
        </span>
      </motion.div>

      <AnimatePresence>
        {step === 5 && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: -6 }}
            exit={{ opacity: 0 }}
            className="absolute left-[86%] top-[16%] -translate-x-1/2 font-display text-[15px] font-bold tracking-tight text-green"
          >
            +₦45,000
          </motion.span>
        )}
      </AnimatePresence>

      {/* status */}
      <div className="absolute inset-x-0 bottom-3 flex justify-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={step}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease }}
          >
            <Chip>
              {locked ? <Lock size={12} className="text-green" /> : step === 5 ? <Check size={12} className="text-orange" /> : null}
              {ESCROW_LABEL[step]}
              {step === 2 && <span className="text-muted">· releases on delivery</span>}
            </Chip>
          </motion.span>
        </AnimatePresence>
      </div>
    </Stage>
  );
}

function Person({ left, label, children }: { left: string; label: string; children: React.ReactNode }) {
  return (
    <div className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5" style={{ left }}>
      <span className="grid size-[68px] place-items-center rounded-[22px] border border-line bg-paper shadow-[var(--shadow-card)]">{children}</span>
      <span className="text-[11px] font-medium text-muted">{label}</span>
    </div>
  );
}

/* ---------- 2. Price requests ---------- */

const PRICE = [1000, 900, 1300, 1100, 1900];

function PriceScene() {
  const { ref, step } = useLoop(PRICE);
  return (
    <Stage innerRef={ref}>
      <div className="absolute left-4 top-4 flex items-end gap-2">
        <Blobatar name="kemi.closet" hue={22} animate="always" size={30} />
        <motion.div initial={false} animate={{ opacity: 1 }} className="rounded-2xl rounded-bl-md border border-line bg-paper px-3 py-2 text-[13.5px] shadow-[var(--shadow-card)]">
          <span className="relative">
            DM for price 👀
            <motion.span
              className="absolute left-0 top-1/2 h-[2px] w-full origin-left rounded-full bg-rose"
              initial={false}
              animate={{ scaleX: step >= 1 ? 1 : 0 }}
              transition={{ duration: 0.45, ease }}
            />
          </span>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-4">
        <Button variant="primary" size="sm" interaction="morph" icon={<Tag size={14} />} iconHover={<Send size={14} />} forceHover={step === 2}>
          Request price
        </Button>
      </div>

      {/* price */}
      <div className="absolute right-4 top-[46%] flex -translate-y-1/2 flex-col items-end gap-2">
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              key="price"
              initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 380, damping: 15 }}
              className="flex items-baseline gap-2 rounded-2xl bg-green px-3.5 py-2 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_24px_-10px_rgb(13_150_94/0.8)]"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {step === 4 && (
                  <motion.s key="old" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 0.6, x: 0 }} className="text-[12px]">
                    ₦45,000
                  </motion.s>
                )}
                <motion.span
                  key={step === 4 ? "new" : "base"}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={spring}
                  className="font-display text-[20px] font-bold tracking-[-0.04em]"
                >
                  {step === 4 ? "₦40,500" : "₦45,000"}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {step === 4 && (
            <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.15 }}>
              <Chip>
                <span className="size-1.5 rounded-full bg-green" />
                10% wait reward
              </Chip>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* cursor taps the button */}
      <motion.div
        className="absolute left-[96px] top-[176px] z-20"
        initial={false}
        animate={{
          x: step === 2 ? 0 : step > 2 ? 30 : 160,
          y: step === 2 ? 0 : step > 2 ? 40 : -40,
          opacity: step >= 2 && step <= 3 ? 1 : step < 2 ? (step === 1 ? 1 : 0) : 0,
        }}
        transition={{ duration: 0.7, ease }}
      >
        <Cursor pressed={step === 2} />
      </motion.div>
    </Stage>
  );
}

/* ---------- 3. Instant stores ---------- */

const STORE = [1000, 900, 1300, 1900];
const PRODUCTS = [
  { bg: "#ee6f38", price: "₦45k" },
  { bg: "#7c6cf2", price: "₦18k" },
  { bg: "#0d965e", price: "₦27k" },
];

function StoreScene() {
  const { ref, step } = useLoop(STORE);
  return (
    <Stage innerRef={ref} className="flex items-center justify-center">
      <div className="w-[236px] rounded-[18px] border border-line bg-paper p-3 shadow-[var(--shadow-pop)]">
        <div className="flex items-center gap-2.5">
          <div className="relative grid size-10 place-items-center">
            <AnimatePresence mode="popLayout">
              {step === 0 ? (
                <motion.span key="sk" exit={{ opacity: 0, scale: 0.6 }} className="block size-10 animate-pulse rounded-full bg-sunken" />
              ) : (
                <motion.span key="blob" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
                  <Blobatar name="kemi.closet" hue={22} animate="always" expression={step === 3 ? happy : idle} size={40} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            {step === 0 ? (
              <>
                <div className="h-2.5 w-24 animate-pulse rounded-full bg-sunken" />
                <div className="h-2 w-14 animate-pulse rounded-full bg-sunken" />
              </>
            ) : (
              <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-[13px] font-semibold leading-none">kemi.closet</p>
                <p className="mt-1 text-[11px] leading-none text-muted">Lagos · 3 items</p>
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {step === 3 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="flex items-center gap-1 rounded-full bg-mint px-2 py-1 text-[11px] font-semibold text-green-ink"
              >
                <span className="relative flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-green" />
                  <span className="relative size-1.5 rounded-full bg-green" />
                </span>
                Live
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {PRODUCTS.map((p, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-sunken">
              <AnimatePresence>
                {step < 2 && (
                  <motion.div key="ld" exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center">
                    <ImageLoader variant="tiles" size={60} radius={10} color="#0d965e" label="Loading product" />
                  </motion.div>
                )}
                {step >= 2 && (
                  <motion.div
                    key="p"
                    initial={{ y: -70, rotate: i % 2 ? 10 : -10, opacity: 0 }}
                    animate={{ y: 0, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 16, delay: i * 0.12 }}
                    className="absolute inset-0"
                    style={{ background: p.bg }}
                  >
                    <span className="absolute bottom-1 left-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">{p.price}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={spring}
            className="absolute bottom-3"
          >
            <Chip>
              <Check size={12} className="text-violet" />
              Store live
            </Chip>
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}

/* ---------- 4. Get paid anywhere ---------- */

const FX = [
  { from: "$", to: "₦", city: "Lagos" },
  { from: "£", to: "₵", city: "Accra" },
  { from: "€", to: "KSh", city: "Nairobi" },
];
const CHIP_Y = [28, 78, 128];

function CurrencyScene() {
  const { ref, step } = useLoop([1900, 1900, 1900]);
  const fx = FX[step];
  // The coin keeps the old currency until the travelling chip lands, then flips.
  const [landed, setLanded] = useState(step);
  useEffect(() => {
    const id = setTimeout(() => setLanded(step), 950);
    return () => clearTimeout(id);
  }, [step]);
  const coin = FX[landed];
  return (
    <Stage innerRef={ref} className="flex items-center justify-center">
      <div className="relative h-[180px] w-[272px]">
        <svg width="272" height="180" className="absolute inset-0" fill="none" aria-hidden>
          {CHIP_Y.map((y, i) => (
            <path
              key={i}
              d={`M44 ${y + 20} C 120 ${y - 30}, 170 ${60}, 210 90`}
              stroke={i === step ? "#0d965e" : "var(--color-line-strong)"}
              strokeWidth={i === step ? 2 : 1.5}
              strokeDasharray="4 5"
              style={{ transition: "stroke .4s", animation: i === step ? "dash 1s linear infinite" : undefined }}
            />
          ))}
        </svg>

        {FX.map((f, i) => (
          <motion.span
            key={f.from}
            className="absolute left-0 grid size-10 place-items-center rounded-full border border-line bg-paper font-display text-[16px] font-bold shadow-[var(--shadow-card)]"
            style={{ top: CHIP_Y[i] }}
            animate={{ scale: i === step ? 1.12 : 1, opacity: i === step ? 1 : 0.55 }}
            transition={spring}
          >
            {f.from}
          </motion.span>
        ))}

        {/* travelling chip */}
        <motion.span
          key={`fly-${step}`}
          className="absolute left-0 z-10 grid size-8 place-items-center rounded-full bg-ink font-display text-[13px] font-bold text-canvas"
          style={{ top: CHIP_Y[step] + 4 }}
          initial={{ x: 4, y: 0, opacity: 0, scale: 0.6 }}
          animate={{ x: [4, 110, 190], y: [0, -46 + (1 - step) * 10, 90 - CHIP_Y[step] - 20], opacity: [0, 1, 0], scale: [0.6, 1, 0.5] }}
          transition={{ duration: 1.1, ease: "easeInOut", times: [0, 0.5, 1] }}
        >
          {fx.from}
        </motion.span>

        {/* local coin */}
        <div className="absolute right-0 top-[58px] flex flex-col items-center gap-2 [perspective:400px]">
          <motion.div
            key={`coin-${landed}`}
            initial={{ rotateY: 90, scale: 0.9 }}
            animate={{ rotateY: 0, scale: [0.9, 1.14, 1] }}
            transition={{ duration: 0.45, ease }}
            className="grid size-16 place-items-center rounded-full bg-green font-display text-[20px] font-bold tracking-tight text-white shadow-[inset_0_-4px_0_rgb(0_0_0/0.22),0_12px_28px_-10px_rgb(13_150_94/0.8)]"
          >
            {coin.to}
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.span
              key={coin.city}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] font-medium text-muted"
            >
              {coin.city}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </Stage>
  );
}

/* ---------- 5. Order chat ---------- */

const CHAT = [1000, 1000, 1100, 1100, 1100, 1800];
const STATUS = ["Paid", "Shipped", "Delivered"];

function ChatScene() {
  const { ref, step } = useLoop(CHAT);
  const status = step >= 4 ? 2 : step >= 1 ? 1 : 0;
  const msgs = [
    { me: false, text: "Packing your tote 📦", at: 0 },
    { me: true, text: "Yay! When does it land?", at: 2 },
    { me: false, text: "Tomorrow by 2pm", at: 3 },
  ].filter((m) => step >= m.at);

  return (
    <Stage innerRef={ref} className="flex flex-col p-3">
      {/* order status */}
      <div className="rounded-xl border border-line bg-paper p-2.5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold">Order #2481</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={status} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.18 }} className="font-semibold text-green">
              ● {STATUS[status]}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="mt-2 flex gap-1">
          {STATUS.map((s, i) => (
            <span key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-sunken">
              <motion.span className="block h-full rounded-full bg-green" initial={false} animate={{ width: i <= status ? "100%" : "0%" }} transition={{ duration: 0.6, ease }} />
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-2 flex flex-1 flex-col justify-end gap-1.5 overflow-hidden">
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.span
              key={m.text}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={spring}
              className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-[13px] ${m.me ? "self-end rounded-br-md bg-ink text-canvas" : "self-start rounded-bl-md border border-line bg-paper"}`}
            >
              {m.text}
            </motion.span>
          ))}
          {(step === 1 || step === 2) && (
            <motion.span key="typing" layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className={`flex gap-1 rounded-2xl border border-line bg-paper px-3 py-2.5 ${step === 1 ? "self-end" : "self-start"}`}>
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="size-1.5 rounded-full bg-faint" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }} />
              ))}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 grid place-items-center bg-sunken/70 backdrop-blur-[2px]"
            >
              <motion.span initial={{ scale: 0.8, y: 8 }} animate={{ scale: 1, y: 0 }} transition={spring}>
                <Chip>
                  <MessageSquareLock size={13} className="text-green" />
                  Delivered. Chat closed.
                </Chip>
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
}

/* ---------- 6. Know your buyers ---------- */

type Src = "video" | "camera" | "chat" | "greep";
const SOURCES: { id: Src; name: string; color: string }[] = [
  { id: "video", name: "TikTok", color: "bg-ink" },
  { id: "camera", name: "Instagram", color: "bg-violet" },
  { id: "chat", name: "WhatsApp", color: "bg-[#25c06a]" },
  { id: "greep", name: "Greep feed", color: "bg-green" },
];
const SNAPSHOTS: Record<Src, number>[] = [
  { video: 82, camera: 64, chat: 41, greep: 27 },
  { video: 70, camera: 78, chat: 46, greep: 33 },
  { video: 74, camera: 61, chat: 69, greep: 38 },
];
const TOASTS = [
  { src: "video" as Src, text: "New buyer from TikTok", sub: "Lagos" },
  { src: "camera" as Src, text: "Repeat buyer from Instagram", sub: "Abuja" },
  { src: "chat" as Src, text: "New buyer from WhatsApp", sub: "London" },
];

function SourceIcon({ id, size = 24 }: { id: Src; size?: number }) {
  if (id === "greep")
    return (
      <span className="grid place-items-center rounded-[28%] bg-paper ring-1 ring-line" style={{ width: size, height: size }}>
        <LogoMark size={size * 0.62} />
      </span>
    );
  return <AppTile kind={id} size={size} />;
}

const RECENT = [
  { name: "Ada", city: "Lagos", src: "video" as Src, amount: "₦45,000" },
  { name: "Tunde", city: "Abuja", src: "camera" as Src, amount: "₦18,000" },
  { name: "Esi", city: "London", src: "chat" as Src, amount: "£24" },
  { name: "Wanjiru", city: "Nairobi", src: "greep" as Src, amount: "KSh 3,200" },
];

function BuyersTile() {
  const { ref, step } = useLoop([2600, 2600, 2600]);
  // newest buyer first; one more joins the list each beat
  const list = [0, 1, 2].map((k) => RECENT[(step + 3 - k) % RECENT.length]);
  return (
    <Tile
      className="md:col-span-3"
      title="Know your buyers"
      line="See who buys, what they bought and where they found you."
      delay={0.1}
      wide
      aside={
        <div className="space-y-2">
          <p className="eyebrow text-muted">Recent buyers</p>
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((b, i) => (
              <motion.div
                key={b.name}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1 - i * 0.22, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={spring}
                className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-2 pr-3 shadow-[var(--shadow-card)]"
              >
                <Blobatar name={`buyer-${b.name}`} animate="hover" size={34} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[13px] font-semibold">{b.name}</span>
                  <span className="block text-[11px] text-muted">{b.city}</span>
                </span>
                <SourceIcon id={b.src} size={22} />
                <span className="w-[72px] text-right font-mono text-[12px] tabular-nums">{b.amount}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      }
    >
      <BuyersScene step={step} innerRef={ref} />
    </Tile>
  );
}

function BuyersScene({ step, innerRef }: { step: number; innerRef: React.Ref<HTMLDivElement> }) {
  const ref = innerRef;
  const snap = SNAPSHOTS[step];
  const sorted = [...SOURCES].sort((a, b) => snap[b.id] - snap[a.id]);
  const total = Object.values(snap).reduce((a, b) => a + b, 0);
  const toast = TOASTS[step];

  return (
    <Stage innerRef={ref} className="h-[260px] p-5">
      <div className="flex items-center justify-between text-[12px] text-muted">
        <span className="font-semibold text-ink">Sales by app</span>
        <span>Sample store · 30 days</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <motion.span key={total} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-[26px] font-bold tracking-[-0.04em]">
          {total * 3} orders
        </motion.span>
      </div>

      <div className="mt-3 space-y-2.5">
        {sorted.map((s) => (
          <motion.div key={s.id} layout transition={spring} className="flex items-center gap-3">
            <SourceIcon id={s.id} />
            <span className="w-[86px] shrink-0 text-[13px] font-medium">{s.name}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper ring-1 ring-line">
              <motion.div className={`h-full rounded-full ${s.color}`} initial={{ width: 0 }} animate={{ width: `${snap[s.id]}%` }} transition={{ duration: 1, ease }} />
            </div>
            <span className="w-9 text-right font-mono text-[11px] tabular-nums text-muted">{snap[s.id]}</span>
          </motion.div>
        ))}
      </div>

      <div className="absolute right-4 top-4">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.5 }}
            className="hidden items-center gap-2.5 rounded-2xl border border-line bg-paper/90 py-2 pl-2 pr-3.5 shadow-[var(--shadow-pop)] backdrop-blur sm:flex"
          >
            <SourceIcon id={toast.src} size={28} />
            <span className="leading-tight">
              <span className="block text-[12.5px] font-semibold">{toast.text}</span>
              <span className="block text-[11px] text-muted">{toast.sub} · just now</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </Stage>
  );
}
