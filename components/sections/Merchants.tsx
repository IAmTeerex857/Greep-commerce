"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Lock, Store } from "lucide-react";
import { Blobatar } from "@blobatar/react";
import { happy, idle, surprised } from "blobatar/expression";
import { TextLoader, InlineLoader } from "generative-loaders";
import { Eyebrow, SplitWords } from "@/components/ui/Reveal";
import { LogoMark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useLoop } from "@/components/ui/useLoop";

const TABS = [
  { id: "claim", tab: "Claim", bg: "#ee6f38", ink: "#0a0a0a", title: "No sign up. Just sales.", line: "A buyer checks out on your post. We set up your store and send you the order." },
  { id: "price", tab: "Price request", bg: "#b9abf3", ink: "#0a0a0a", title: "Goodbye, “DM for price”.", line: "Buyers ask, you set the price, they buy. A 10% wait reward keeps them around." },
  { id: "chat", tab: "Chat", bg: "#5f9a6a", ink: "#ffffff", title: "Chat that stays on topic.", line: "Every message is tied to the order. No lost DMs, no phone numbers." },
  { id: "world", tab: "Worldwide", bg: "#f3c54c", ink: "#0a0a0a", title: "Paid in London. Cashed in Lagos.", line: "Buyers abroad pay in dollars or pounds. You get Naira, Cedis or Shillings." },
] as const;
// Each folder stays open for one full run of its demo (plus the swap), then the next one opens.
const TAB_MS = [7600, 9200, 9700, 8300];

export function Merchants() {
  const { ref, step, setStep } = useLoop(TAB_MS, { amount: 0.35 });
  const tab = TABS[step];
  const active = tab.id;

  return (
    <section id="merchants" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div>
          <div>
            <Eyebrow index="03">For sellers</Eyebrow>
            <h2 className="display mt-5 max-w-3xl text-[clamp(40px,6.4vw,84px)]">
              <SplitWords text="Your first buyer" />
              <br />
              <SplitWords text="beats you here." delay={0.12} className="text-green" />
            </h2>
          </div>
        </div>

        {/* folder */}
        <div ref={ref} className="mt-9">
          <div className="relative z-10 flex gap-0 overflow-x-auto [scrollbar-width:none]" role="tablist">
            {TABS.map((t, i) => {
              const on = t.id === active;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setStep(i)}
                  className="relative -mr-3 flex h-14 shrink-0 items-center gap-2.5 pl-5 pr-10 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] transition-transform duration-300 hover:-translate-y-1 md:text-[12px]"
                  style={{
                    background: t.bg,
                    color: t.ink,
                    clipPath: "polygon(0 0, calc(100% - 34px) 0, 100% 100%, 0 100%)",
                    borderTopLeftRadius: 14,
                    zIndex: on ? 20 : 10 - i,
                    transform: on ? "translateY(0)" : "translateY(6px)",
                  }}
                >
                  <FolderIcon />
                  0{i + 1} · {t.tab}
                </button>
              );
            })}
          </div>
          <motion.div
            layout
            className="relative -mt-px overflow-hidden rounded-b-[32px] rounded-tr-[32px] transition-colors duration-500"
            style={{ background: tab.bg, color: tab.ink }}
          >
            <div className="grid min-h-[480px] grid-cols-[minmax(0,1fr)] gap-10 p-7 md:grid-cols-2 md:p-14">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col justify-between gap-8"
                >
                  <div>
                    <p className="eyebrow flex items-center gap-2 opacity-70">
                      <span className="size-1.5 rounded-full" style={{ background: tab.ink }} />
                      Greep for sellers
                    </p>
                    <h3 className="display mt-4 text-[clamp(34px,4.4vw,56px)]">{tab.title}</h3>
                    <p className="mt-5 max-w-sm text-[17px] leading-relaxed opacity-80">{tab.line}</p>
                  </div>
                  <a href="#join" className="eyebrow inline-flex w-fit items-center gap-2 border-b-2 pb-1 font-semibold" style={{ borderColor: tab.ink }}>
                    Claim your store ↗
                  </a>
                </motion.div>
              </AnimatePresence>

              <div className="relative flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, rotate: 4, y: 30 }}
                    animate={{ opacity: 1, rotate: -1.5, y: 0 }}
                    exit={{ opacity: 0, rotate: -6, y: -20 }}
                    transition={{ type: "spring", stiffness: 180, damping: 20 }}
                    className="relative w-full max-w-[400px]"
                  >
                    <Tape className="-top-3 left-8" />
                    <Tape className="-top-3 right-8 rotate-6" />
                    <div className="rounded-[24px] border-[6px] border-paper bg-paper text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)]">
                      {tab.id === "claim" && <ClaimDemo />}
                      {tab.id === "price" && <PriceDemo />}
                      {tab.id === "chat" && <ChatDemo />}
                      {tab.id === "world" && <WorldDemo />}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Tape({ className = "" }: { className?: string }) {
  return <span className={`absolute z-10 h-7 w-24 -rotate-3 bg-white/55 backdrop-blur-sm ${className}`} />;
}

function FolderIcon() {
  return (
    <svg width="16" height="13" viewBox="0 0 16 13" fill="currentColor" aria-hidden>
      <path d="M0 2a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z" />
    </svg>
  );
}

/* ---------- demos (each loops on its own while in view) ---------- */

/** A pointer that glides between spots inside a demo and "clicks". */
function FakeCursor({ x, y, click }: { x: string; y: string; click: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute z-20"
      initial={false}
      animate={{ left: x, top: y }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <motion.svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        animate={{ scale: click ? [1, 0.82, 1] : 1 }}
        transition={{ duration: 0.3 }}
        className="drop-shadow-[0_2px_4px_rgb(0_0_0/0.35)]"
      >
        <path d="M5 3l14 7.5-6.2 1.6L10 18.5z" fill="#0a0a0a" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </motion.svg>
      <AnimatePresence>
        {click && (
          <motion.span
            key="ring"
            className="absolute -left-2 -top-2 size-7 rounded-full border-2 border-green"
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ClaimDemo() {
  // 0 idle · 1 notified · 2 cursor to button · 3 building · 4 claimed
  const { ref, step } = useLoop([700, 1400, 900, 1700, 2400], { amount: 0.4 });
  const notified = step >= 1;
  const busy = step === 3;
  const claimed = step === 4;
  return (
    <div ref={ref} className="relative min-h-[300px] p-5">
      <div className="h-[62px]">
        <AnimatePresence>
          {notified && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="flex items-center gap-3 rounded-2xl bg-sunken p-3"
            >
              <LogoMark size={26} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-muted">Greep · now</p>
                <p className="truncate text-[14px] font-semibold">Someone wants your Ankara tote</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <Blobatar name="kemi.closet" animate="always" expression={claimed ? happy : notified ? surprised : idle} hue={22} size={64} />
        <div>
          <p className="font-display text-3xl font-bold tracking-[-0.05em]">₦45,000</p>
          <AnimatePresence mode="wait">
            <motion.p key={claimed ? "c" : "w"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className={`text-[13px] ${claimed ? "font-semibold text-green" : "text-muted"}`}>
              {claimed ? "Store live. Order confirmed." : "Waiting for you. 47:59 left"}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <motion.div className="mt-6" animate={{ scale: busy ? [1, 0.97, 1] : 1 }} transition={{ duration: 0.25 }}>
        <Button
          variant={claimed ? "green" : "primary"}
          size="lg"
          interaction={busy || claimed ? "none" : "morph"}
          icon={claimed ? <Check size={16} strokeWidth={2.4} /> : busy ? undefined : <Store size={16} />}
          iconHover={<Check size={16} strokeWidth={2.4} />}
          forceHover={step === 2}
          className="w-full"
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <InlineLoader variant="domino" size={16} color="currentColor" label="Setting up" />
              <TextLoader text="Building your store" variant="cascade" color="currentColor" />
            </span>
          ) : claimed ? (
            "Claimed"
          ) : (
            "Claim your sale"
          )}
        </Button>
      </motion.div>
      <FakeCursor x={step === 2 || step === 3 ? "58%" : "86%"} y={step === 2 || step === 3 ? "70%" : "46%"} click={step === 3} />
    </div>
  );
}

function Bubble({ me, children }: { me?: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[14px] ${me ? "self-end rounded-br-md bg-ink text-canvas" : "self-start rounded-bl-md bg-sunken"}`}
    >
      {children}
    </motion.div>
  );
}

function Typing() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-sunken px-3.5 py-3">
      {[0, 1, 2].map((k) => (
        <motion.span key={k} className="size-1.5 rounded-full bg-muted" animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: k * 0.15 }} />
      ))}
    </motion.div>
  );
}

function PriceDemo() {
  // 0 idle · 1 ask · 2 switch shows · 3 cursor to switch · 4 switch on · 5 typing · 6 price · 7 discount
  const { ref, step } = useLoop([600, 1100, 800, 700, 900, 1300, 900, 2400], { amount: 0.4 });
  const wait = step >= 4;
  return (
    <div ref={ref} className="relative flex min-h-[320px] flex-col gap-2.5 p-5">
      <p className="eyebrow text-muted">Price request</p>
      {step >= 1 && <Bubble me>How much is the tote?</Bubble>}
      {step >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-3 text-[13px]"
        >
          <span>
            <span className="block font-semibold">Wait for the price</span>
            <span className="text-muted">Get 10% off</span>
          </span>
          <span role="switch" aria-checked={wait} className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${wait ? "bg-green" : "bg-faint/60"}`}>
            <motion.span
              className="absolute top-1 size-5 rounded-full bg-white shadow"
              initial={false}
              animate={{ left: wait ? 24 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </span>
        </motion.div>
      )}
      {step === 5 && <Typing />}
      {step >= 6 && <Bubble>₦45,000. Ready to ship.</Bubble>}
      {step >= 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="mt-auto flex items-center justify-between rounded-2xl bg-mint p-3"
        >
          <span className="text-[13px] font-semibold text-green-ink">Your price</span>
          <span className="font-display text-xl font-bold tracking-[-0.04em] text-green-ink">
            <s className="mr-2 text-sm font-medium opacity-50">₦45,000</s>₦40,500
          </span>
        </motion.div>
      )}
      {step >= 2 && step <= 4 && <FakeCursor x={step >= 3 ? "84%" : "70%"} y={step >= 3 ? "43%" : "80%"} click={step === 4} />}
    </div>
  );
}

function ChatDemo() {
  // 0 header · 1 seller · 2 buyer · 3 typing · 4 typed reply · 5 delivered, chat closes
  const { ref, step } = useLoop([700, 1200, 1200, 1100, 2600, 2400], { amount: 0.4 });
  const delivered = step === 5;
  return (
    <div ref={ref} className="flex min-h-[320px] flex-col gap-2.5 p-5">
      <div className="mb-1 flex items-center justify-between rounded-xl bg-sunken px-3 py-2 text-[12px]">
        <span className="font-semibold">Order #2481 · Ankara tote</span>
        <AnimatePresence mode="wait">
          <motion.span key={delivered ? "d" : "s"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="font-medium text-green">
            {delivered ? "✓ Delivered" : "● Shipped"}
          </motion.span>
        </AnimatePresence>
      </div>
      {step >= 1 && <Bubble>Your tote is on the way 🚚</Bubble>}
      {step >= 2 && <Bubble me>Yay! When will it land?</Bubble>}
      {step === 3 && <Typing />}
      {step >= 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start rounded-2xl rounded-bl-md bg-sunken px-3.5 py-2 text-[14px]">
          <TextLoader text="Tomorrow by 2pm. Rider is Musa." variant="typewriter" color="currentColor" />
        </motion.div>
      )}
      {delivered && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-auto flex items-center justify-center gap-1.5 text-[12px] text-muted">
          <Lock size={12} /> Delivery confirmed. Chat closed.
        </motion.p>
      )}
    </div>
  );
}

const CITIES = [
  { from: "London", fx: "£30", to: "Lagos", local: "Naira" },
  { from: "Toronto", fx: "$50", to: "Accra", local: "Cedis" },
  { from: "Houston", fx: "$40", to: "Nairobi", local: "Shillings" },
];
const ARC = "M40 110 C 110 10, 210 10, 280 110";

function WorldDemo() {
  const { ref, step: k } = useLoop([2600, 2600, 2600], { amount: 0.4 });
  const c = CITIES[k];
  return (
    <div ref={ref} className="p-5">
      <p className="eyebrow text-muted">Cross-border order</p>
      <div className="relative mx-auto mt-5 h-[150px] w-[320px] max-w-full">
        <svg width="320" height="150" className="absolute inset-0 text-ink/15" fill="none" aria-hidden>
          <path d={ARC} stroke="currentColor" strokeWidth="2" strokeDasharray="5 6" style={{ animation: "dash 1.4s linear infinite" }} />
        </svg>
        <motion.span
          key={`dot-${k}`}
          className="absolute left-0 top-0 -ml-2 -mt-2 size-4 rounded-full bg-green ring-4 ring-mint"
          initial={{ offsetDistance: "0%", scale: 0.6 }}
          animate={{ offsetDistance: "100%", scale: [0.6, 1.1, 1] }}
          transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
          style={{ offsetPath: `path("${ARC}")`, offsetRotate: "0deg" }}
        />
        <AnimatePresence mode="wait">
          <motion.div key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            <motion.span initial={{ y: 8 }} animate={{ y: 0 }} className="absolute bottom-0 left-0 rounded-full bg-ink px-3 py-1.5 text-[13px] font-semibold text-canvas">
              {c.from} · {c.fx}
            </motion.span>
            <motion.span
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.7, type: "spring", stiffness: 400, damping: 20 }}
              className="absolute bottom-0 right-0 rounded-full bg-green px-3 py-1.5 text-[13px] font-semibold text-white"
            >
              {c.to} · {c.local}
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {["NGN", "GHS", "KES", "MWK"].map((x, i) => (
          <motion.span
            key={x}
            animate={{ backgroundColor: i === k ? "var(--color-mint)" : "rgba(0,0,0,0)", borderColor: i === k ? "var(--color-green)" : "var(--color-line)" }}
            className="rounded-full border px-3 py-1 font-mono text-[12px] text-ink-2"
          >
            {x}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
