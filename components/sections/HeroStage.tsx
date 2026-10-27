"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useSpring } from "motion/react";
import { Blobatar } from "@blobatar/react";
import { happy, idle } from "blobatar/expression";
import { InlineLoader } from "generative-loaders";
import { Check, CreditCard, Heart, Landmark, Lock, MessageCircle, Package, Send, Smartphone } from "lucide-react";
import { Tote } from "@/components/illustrations/Tote";
import { AppTile } from "@/components/ui/Icons";
import { LogoMark } from "@/components/ui/Logo";

/*
 * The hero story, built in CSS 3D so every card stays crisp.
 * A half-phone sits in the middle with four solid tiles fanned around it.
 * Each tile always shows its own job; when its beat plays on the phone, a small
 * confirmation card lifts out of the screen, flies over and docks on the tile.
 */

export const STEP_MS = [3200, 3200, 3200, 3800];
export const STEP_LABELS = ["Share", "Pay", "Held safe", "Paid"];

const W = 720;
const H = 600;
const FLY_AT = 1500;
const FLY_MS = 950;

type Tile = { x: number; y: number; ry: number; z: number; bg: string; ink: string; title: string; side: "l" | "r" };
const TILES: Tile[] = [
  { x: -22, y: 24, ry: 26, z: -110, bg: "#7c6cf2", ink: "#ffffff", title: "From any app", side: "l" },
  { x: -8, y: 312, ry: 20, z: -50, bg: "#ee6f38", ink: "#ffffff", title: "Pay your way", side: "l" },
  { x: 516, y: 24, ry: -26, z: -110, bg: "#0d965e", ink: "#ffffff", title: "Held safe", side: "r" },
  { x: 502, y: 312, ry: -20, z: -50, bg: "#f3c54c", ink: "#0a0a0a", title: "Seller paid", side: "r" },
];
const TW = 226;
const TH = 262;
const DOCK = { w: 168, h: 62, over: 24 };
const FROM = { x: W / 2 - DOCK.w / 2, y: 300 };
const dockPos = (t: Tile) => ({ x: t.side === "l" ? -DOCK.over : TW + DOCK.over - DOCK.w, y: TH - DOCK.h + 14 });

export function HeroStage({ onStep }: { onStep?: (i: number) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, { amount: 0.2 });
  const [scale, setScale] = useState(1);
  const [step, setStep] = useState(0);
  const [flying, setFlying] = useState(false);
  const [filled, setFilled] = useState(0);

  const rx = useSpring(0, { stiffness: 80, damping: 20 });
  const ry = useSpring(0, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Beat timeline: play on phone, fly at FLY_AT, dock, advance.
  useEffect(() => {
    if (!inView) return;
    onStep?.(step);
    if (step === 0) setFilled(0);
    const t1 = setTimeout(() => setFlying(true), FLY_AT);
    const t2 = setTimeout(() => {
      setFlying(false);
      setFilled(step + 1);
    }, FLY_AT + FLY_MS);
    const t3 = setTimeout(() => setStep((s) => (s + 1) % 4), STEP_MS[step]);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [step, inView, onStep]);

  const onPointer = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 5);
  };

  const target = TILES[step];
  const dock = dockPos(target);
  const to = { x: target.x + dock.x - FROM.x, y: target.y + dock.y - FROM.y };

  return (
    <div
      ref={wrap}
      onPointerMove={onPointer}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      className="relative w-full overflow-hidden border-b border-line"
      style={{ height: H * scale }}
    >
      <div className="absolute left-1/2 top-0 origin-top" style={{ width: W, height: H, transform: `translateX(-50%) scale(${scale})`, perspective: 1600 }}>
        <motion.div className="absolute inset-0" style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
          {TILES.map((t, i) => (
            <TileView key={i} tile={t} index={i} done={i < filled} active={i === step} />
          ))}

          <Phone step={step} />

          <AnimatePresence>
            {flying && (
              <motion.div
                key={`fly-${step}`}
                className="absolute"
                style={{ left: FROM.x, top: FROM.y, width: DOCK.w, height: DOCK.h, transformStyle: "preserve-3d" }}
                initial={{ x: 0, y: 0, z: 120, rotateY: 0, scale: 0.7, opacity: 0 }}
                animate={{
                  x: [0, to.x * 0.4, to.x],
                  y: [0, Math.min(to.y, 0) - 120, to.y],
                  z: [120, 240, target.z + 40],
                  rotateY: [0, target.ry * 0.3, target.ry],
                  rotateZ: [0, target.side === "l" ? -10 : 10, 0],
                  scale: [0.7, 1.1, 1],
                  opacity: [0, 1, 1],
                }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: FLY_MS / 1000, ease: [0.45, 0, 0.2, 1], times: [0, 0.45, 1] }}
              >
                <DockCard i={step} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- tiles: each one always shows its job ---------- */

function TileView({ tile, index, done, active }: { tile: Tile; index: number; done: boolean; active: boolean }) {
  const d = dockPos(tile);
  const onInk = tile.ink === "#ffffff";
  const soft = onInk ? "bg-white/15" : "bg-black/[0.07]";
  return (
    <motion.div
      className="absolute rounded-[28px] shadow-[0_30px_60px_-30px_rgba(0,0,0,.4)]"
      style={{ left: tile.x, top: tile.y, width: TW, height: TH, background: tile.bg, color: tile.ink, transformStyle: "preserve-3d" }}
      animate={{ z: tile.z + (active ? 40 : 0), rotateY: tile.ry * (active ? 0.8 : 1), y: active ? -6 : 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <div className={`absolute inset-0 overflow-hidden rounded-[28px] py-4 ${tile.side === "r" ? "pl-6 pr-4" : "pl-4 pr-6"}`}>
        <span className={`inline-flex items-center gap-1.5 rounded-full ${soft} px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]`}>
          <span className={`size-1.5 rounded-full ${active ? "animate-pulse" : "opacity-50"}`} style={{ background: tile.ink }} />
          0{index + 1} · {STEP_LABELS[index]}
        </span>
        <p className="mt-3 font-display text-[24px] font-bold leading-none tracking-[-0.045em]">{tile.title}</p>
        <div className="mt-4">{index === 0 ? <ShareBody done={done} soft={soft} /> : index === 1 ? <PayBody done={done} soft={soft} /> : index === 2 ? <HeldBody done={done} soft={soft} /> : <PaidBody done={done} />}</div>
      </div>

      {/* docked confirmation, floating off the tile edge */}
      <AnimatePresence>
        {done && (
          <motion.div
            className="absolute"
            style={{ left: d.x, top: d.y, width: DOCK.w, height: DOCK.h, transform: "translateZ(40px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: tile.side === "l" ? -4 : 4 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ duration: 0.15 }}
          >
            <DockCard i={index} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ShareBody({ done, soft }: { done: boolean; soft: string }) {
  const kinds = ["video", "camera", "chat", "x"] as const;
  return (
    <div className="grid grid-cols-2 gap-2">
      {kinds.map((k) => {
        const picked = done && k === "camera";
        return (
          <motion.div
            key={k}
            animate={{ opacity: done && !picked ? 0.45 : 1, scale: picked ? 1.06 : 1 }}
            className={`grid h-[58px] place-items-center rounded-2xl ${picked ? "bg-white" : soft}`}
          >
            <AppTile kind={k} size={34} />
          </motion.div>
        );
      })}
    </div>
  );
}

function PayBody({ done, soft }: { done: boolean; soft: string }) {
  const rows = [
    { icon: <CreditCard size={14} />, label: "Card" },
    { icon: <Landmark size={14} />, label: "Bank transfer" },
    { icon: <Smartphone size={14} />, label: "Mobile money" },
  ];
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => {
        const on = done && i === 0;
        return (
          <motion.div key={r.label} animate={{ opacity: done && !on ? 0.5 : 1 }} className={`flex h-9 items-center gap-2 rounded-xl px-3 text-[12px] font-semibold ${on ? "bg-white text-[#0a0a0a]" : soft}`}>
            {r.icon}
            <span className="flex-1">{r.label}</span>
            <span className={`grid size-4 place-items-center rounded-full border-2 ${on ? "border-[#7c6cf2] bg-[#7c6cf2] text-white" : "border-current opacity-60"}`}>{on && <Check size={9} strokeWidth={4} />}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function HeldBody({ done, soft }: { done: boolean; soft: string }) {
  return (
    <div className="flex items-center gap-4">
      <motion.span animate={{ backgroundColor: done ? "#ffffff" : "rgba(255,255,255,0.15)", color: done ? "#0d965e" : "#ffffff" }} className="grid size-[72px] place-items-center rounded-3xl">
        <motion.span animate={{ y: done ? 0 : -3 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}>
          <Lock size={32} strokeWidth={2.4} />
        </motion.span>
      </motion.span>
      <div className={`flex-1 space-y-1.5 rounded-2xl ${soft} p-2.5 text-[11px] font-semibold`}>
        {["Paid", "Shipped", "Delivered"].map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${done && i === 0 ? "bg-white" : "bg-white/35"}`} />
            <span className={done && i === 0 ? "" : "opacity-70"}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaidBody({ done }: { done: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-black/[0.07] p-3">
      <Blobatar name="kemi.closet" animate="always" expression={done ? happy : idle} hue={22} size={44} />
      <div>
        <p className="text-[11px] font-semibold opacity-70">kemi.closet</p>
        <AnimatePresence mode="wait">
          <motion.p key={done ? "y" : "n"} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="font-display text-[22px] font-bold tracking-[-0.05em]">
            {done ? "₦45,000" : "Pending"}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** The small card each beat sends from the phone to its tile. Always light. */
function DockCard({ i }: { i: number }) {
  const rows = [
    { icon: <AppTile kind="camera" size={30} />, t: "Ankara tote", s: "Shared to Greep" },
    { icon: <Badge className="bg-[#ee6f38] text-white"><Check size={15} strokeWidth={3} /></Badge>, t: "Paid", s: "₦45,000 · Card" },
    { icon: <Badge className="bg-[#e8f7ef] text-[#0d965e]"><Lock size={14} strokeWidth={2.6} /></Badge>, t: "In escrow", s: "₦45,000 held" },
    { icon: <Badge className="bg-[#7c6cf2] text-white"><Check size={15} strokeWidth={3} /></Badge>, t: "+₦45,000", s: "Paid to bank" },
  ][i];
  return (
    <div className="flex h-full items-center gap-2.5 rounded-[18px] bg-white px-3 text-[#0a0a0a] shadow-[0_18px_40px_-14px_rgba(0,0,0,.45)] ring-1 ring-black/5">
      {rows.icon}
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[13px] font-semibold tracking-tight">{rows.t}</p>
        <p className="truncate text-[11px] text-[#71717a]">{rows.s}</p>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`grid size-[30px] shrink-0 place-items-center rounded-full ${className}`}>{children}</span>;
}

/* ---------- the phone ---------- */

function Phone({ step }: { step: number }) {
  return (
    <div
      className="absolute rounded-[54px] bg-sunken p-[9px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.45),inset_0_0_0_1px_var(--color-line-strong)]"
      style={{ left: W / 2 - 140, top: 36, width: 280, height: 620, transform: "translateZ(70px)" }}
    >
      <div className="relative h-full overflow-hidden rounded-[46px] bg-paper ring-1 ring-line">
        <div className="flex items-center justify-between px-7 pt-4 text-[13px] font-semibold text-ink">
          <span>9:41</span>
          <span className="h-[26px] w-[88px] rounded-full bg-[#0a0a0a]" />
          <span className="flex items-center gap-1">
            <span className="flex items-end gap-[2px]">
              {[4, 6, 8, 10].map((h) => (
                <span key={h} className="w-[3px] rounded-sm bg-ink" style={{ height: h }} />
              ))}
            </span>
            <span className="ml-1 h-[10px] w-[20px] rounded-[3px] border border-ink/60 p-[1px]">
              <span className="block h-full w-3/4 rounded-[1px] bg-ink" />
            </span>
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 px-5">
          <LogoMark size={22} />
          <div className="flex flex-1 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-line-strong">
                <motion.span
                  className="block h-full rounded-full bg-ink"
                  initial={false}
                  animate={{ width: i < step ? "100%" : i === step ? ["0%", "100%"] : "0%" }}
                  transition={i === step ? { duration: STEP_MS[step] / 1000, ease: "linear" } : { duration: 0.3 }}
                />
              </span>
            ))}
          </div>
          <Blobatar name="ada-buyer" animate="always" expression={step === 3 ? happy : idle} hue={262} size={26} />
        </div>

        <div className="relative mt-4 h-[520px] px-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }}
              className="absolute inset-x-4 top-0"
            >
              {step === 0 && <ScreenShare />}
              {step === 1 && <ScreenPay />}
              {step === 2 && <ScreenHeld />}
              {step === 3 && <ScreenPaid />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Tap({ delay, className }: { delay: number; className: string }) {
  return (
    <motion.span
      className={`pointer-events-none absolute size-9 rounded-full border-2 border-green bg-green/20 ${className}`}
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: [0.2, 1, 1.5], opacity: [0, 1, 0] }}
      transition={{ duration: 0.7, delay, times: [0, 0.4, 1] }}
    />
  );
}

function ScreenShare() {
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="size-8 rounded-full bg-orange" />
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-ink">kemi.closet</p>
          <p className="text-[11px] text-muted">Lagos</p>
        </div>
      </div>
      <Tote className="mt-3 h-[168px] w-full rounded-2xl" />
      <div className="mt-3 flex items-center gap-4 text-ink">
        <Heart size={20} />
        <MessageCircle size={20} />
        <motion.span className="relative text-green" animate={{ scale: [1, 1, 1.3, 1] }} transition={{ duration: 0.8, delay: 0.3, times: [0, 0.4, 0.7, 1] }}>
          <Send size={20} />
          <Tap delay={0.35} className="-left-2 -top-2" />
        </motion.span>
      </div>
      <p className="mt-2 truncate text-[13px] text-ink-2">Ankara tote. DM for price 👀</p>

      {/* share sheet */}
      <motion.div
        className="glass absolute inset-x-[-6px] top-[290px] rounded-[26px] p-4"
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.7 }}
      >
        <p className="text-[12px] font-semibold text-muted">Share to</p>
        <div className="mt-3 flex justify-between">
          {(["chat", "camera", "x"] as const).map((k) => (
            <div key={k} className="flex flex-col items-center gap-1 opacity-60">
              <AppTile kind={k} size={40} />
              <span className="text-[10px] text-muted">{k === "chat" ? "WhatsApp" : k === "camera" ? "Instagram" : "X"}</span>
            </div>
          ))}
          <motion.div className="relative flex flex-col items-center gap-1" animate={{ scale: [1, 1, 1.12, 1] }} transition={{ duration: 0.6, delay: 1.05, times: [0, 0.3, 0.6, 1] }}>
            <span className="grid size-10 place-items-center rounded-[28%] bg-paper shadow-[var(--shadow-card)] ring-2 ring-green">
              <LogoMark size={24} />
            </span>
            <span className="text-[10px] font-semibold text-green">Greep</span>
            <Tap delay={1.1} className="left-0.5 top-0.5" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function ScreenPay() {
  const [paid, setPaid] = useState(0);
  useEffect(() => {
    const a = setTimeout(() => setPaid(1), 700);
    const b = setTimeout(() => setPaid(2), 1250);
    return () => [a, b].forEach(clearTimeout);
  }, []);
  return (
    <div>
      <p className="font-display text-[22px] font-bold tracking-[-0.04em] text-ink">Checkout</p>
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-paper p-2.5">
        <Tote className="size-14 rounded-xl" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-ink">Ankara tote</p>
          <p className="text-[11px] text-muted">kemi.closet</p>
        </div>
        <p className="font-display text-[16px] font-bold tracking-tight text-ink">₦45,000</p>
      </div>
      <div className="mt-3 space-y-2 text-[12px]">
        {[
          ["Delivery", "2 to 3 days"],
          ["Pay with", "Card •• 4821"],
          ["Your money", "Held safe"],
        ].map(([a, b], i) => (
          <div key={a} className="flex justify-between">
            <span className="text-muted">{a}</span>
            <span className={`font-semibold ${i === 2 ? "text-green" : "text-ink"}`}>{b}</span>
          </div>
        ))}
      </div>
      <motion.div
        className="relative mt-5 flex h-12 items-center justify-center rounded-2xl text-[15px] font-semibold text-white"
        animate={{ backgroundColor: paid === 2 ? "#0a0a0a" : "#0d965e", scale: paid === 1 ? 0.97 : 1 }}
      >
        {paid === 0 && "Pay ₦45,000"}
        {paid === 1 && <InlineLoader variant="orbit" size={18} color="#fff" label="Paying" />}
        {paid === 2 && (
          <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1.5">
            <Check size={17} strokeWidth={3} /> Paid
          </motion.span>
        )}
        <Tap delay={0.55} className="right-10 top-1.5" />
      </motion.div>
    </div>
  );
}

function ScreenHeld() {
  const R = 54;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex flex-col items-center pt-4 text-center">
      <div className="relative grid size-[136px] place-items-center">
        <svg width="136" height="136" className="absolute -rotate-90">
          <circle cx="68" cy="68" r={R} stroke="var(--color-line-strong)" strokeWidth="8" fill="none" />
          <motion.circle cx="68" cy="68" r={R} stroke="#0d965e" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * 0.08 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
        </svg>
        <motion.span initial={{ y: -8 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 500, damping: 12, delay: 0.9 }} className="grid size-16 place-items-center rounded-2xl bg-mint text-green">
          <Lock size={30} strokeWidth={2.4} />
        </motion.span>
      </div>
      <p className="mt-5 font-display text-[26px] font-bold tracking-[-0.05em] text-ink">₦45,000 held safe</p>
      <p className="mt-1 text-[13px] text-muted">The seller gets it when it arrives.</p>
      <div className="mt-5 flex w-full justify-between rounded-2xl bg-sunken p-3 text-[11px] font-semibold">
        <span className="flex items-center gap-1 text-orange">
          <Check size={12} strokeWidth={3} /> Paid
        </span>
        <span className="flex items-center gap-1 text-ink">
          <motion.span className="size-2 rounded-full bg-orange" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} /> Shipped
        </span>
        <span className="text-faint">Delivered</span>
      </div>
    </div>
  );
}

function ScreenPaid() {
  return (
    <div className="flex flex-col items-center pt-4 text-center">
      <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 12 }} className="grid size-20 place-items-center rounded-3xl bg-sun/30 text-orange">
        <Package size={38} strokeWidth={2} />
      </motion.span>
      <p className="mt-4 font-display text-[26px] font-bold tracking-[-0.05em] text-ink">Delivered</p>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-line bg-paper p-3 text-left">
        <Blobatar name="kemi.closet" animate="always" expression={happy} hue={22} size={40} />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-ink">kemi.closet got paid</p>
          <p className="text-[11px] text-muted">₦45,000 sent to bank</p>
        </div>
        <span className="grid size-6 place-items-center rounded-full bg-violet text-white">
          <Check size={13} strokeWidth={3} />
        </span>
      </motion.div>
      <Confetti />
    </div>
  );
}

function Confetti() {
  const bits = Array.from({ length: 18 }, (_, i) => i);
  const cols = ["#0d965e", "#c6f36d", "#7c6cf2", "#ee6f38", "#f3c54c", "#8fb5f5"];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
      {bits.map((i) => {
        const a = (i / bits.length) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute h-2 w-1.5 rounded-[2px]"
            style={{ background: cols[i % cols.length] }}
            initial={{ x: 0, y: 30, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(a) * (70 + (i % 3) * 25), y: [30, Math.sin(a) * 60 - 30, 160], opacity: [1, 1, 0], rotate: 360 + i * 40 }}
            transition={{ duration: 1.6, delay: 0.25, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
