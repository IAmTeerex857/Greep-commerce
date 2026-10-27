"use client";

import { motion } from "motion/react";
import { LayoutGrid, Route, Store } from "lucide-react";
import { BrandGlyph } from "@/components/ui/Icons";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { Logo } from "@/components/ui/Logo";

const SIGNS: { label: string; href: string; bg: string; rot: number; x: number; icon: React.ReactNode; round?: boolean; ink?: string }[] = [
  { label: "How it works", href: "#how", bg: "#8fb5f5", rot: -2, x: -10, icon: <Route size={22} strokeWidth={2.4} /> },
  { label: "Sellers", href: "#merchants", bg: "#ee6f38", rot: 3, x: 26, icon: <Store size={22} strokeWidth={2.4} />, round: true, ink: "#fff" },
  { label: "Features", href: "#features", bg: "#5f9a6a", rot: -1, x: 0, icon: <LayoutGrid size={22} strokeWidth={2.4} />, ink: "#fff" },
  { label: "Instagram", href: "#", bg: "#b9abf3", rot: 2, x: 30, icon: <BrandGlyph kind="camera" size={22} />, round: true },
  { label: "Follow on X", href: "#", bg: "#f3c54c", rot: -2, x: 4, icon: <BrandGlyph kind="x" size={20} /> },
];

export function FinalCTA() {
  return (
    <section id="join" className="relative overflow-hidden pb-10 pt-14 md:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 md:grid-cols-[400px_1fr]">
        {/* signpost */}
        <div className="relative mx-auto hidden h-[560px] w-[360px] md:block">
          <span className="absolute left-1/2 top-0 -ml-[14px] size-7 rounded-full border-[5px] border-ink bg-canvas" />
          <span className="absolute bottom-6 left-1/2 top-6 -ml-[7px] w-[14px] rounded-full bg-ink" />
          <span className="absolute bottom-0 left-1/2 h-6 w-56 -translate-x-1/2 rounded-[50%] bg-ink" />
          <Cloud className="left-[-40px] top-[150px]" />
          <Cloud className="right-[-50px] top-[330px] scale-90" delay={1.2} />
          <div className="absolute inset-x-0 top-12 flex flex-col items-center gap-4">
            {SIGNS.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                initial={{ opacity: 0, x: i % 2 ? 80 : -80, rotate: s.rot * 4 }}
                whileInView={{ opacity: 1, x: s.x, rotate: s.rot }}
                viewport={{ once: true }}
                whileHover={{ rotate: 0, scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 12 } }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: i * 0.08 }}
                className={`relative flex h-[72px] w-[300px] items-center justify-center gap-3 font-display text-[28px] font-extrabold tracking-[-0.04em] ${s.round ? "rounded-full" : "rounded-lg"}`}
                style={{ background: s.bg, color: s.ink ?? "#0a0a0a", boxShadow: "0 6px 0 rgba(0,0,0,.22)" }}
              >
                <span className="flex">{s.icon}</span>
                {s.label}
              </motion.a>
            ))}
          </div>
        </div>

        {/* bubbles */}
        <div className="flex flex-col gap-6">
          <Bubble className="bg-lilac text-[#0a0a0a]" pattern="rings" tail="left">
            <h2 className="display text-[clamp(40px,5.6vw,76px)]">
              Ready to get paid?
            </h2>
          </Bubble>
          <Bubble className="ml-auto w-[92%] bg-[#5f9a6a] text-white" pattern="squiggle" tail="right" delay={0.1}>
            <p className="max-w-md text-xl font-medium leading-snug">Join the early list. It&apos;s free.</p>
          </Bubble>
          <Bubble className="ml-auto w-full bg-orange md:w-[88%]" pattern="stripes" tail="left" delay={0.2}>
            <WaitlistForm compact />
          </Bubble>
        </div>
      </div>

      <footer className="relative mx-auto mt-12 max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-line pt-8 md:flex-row md:items-center">
          <Logo />
          <nav className="flex flex-wrap gap-6 text-[14px] text-muted">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#merchants" className="hover:text-ink">Sellers</a>
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#join" className="hover:text-ink">Contact</a>
          </nav>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">© 2026 Greep</p>
        </div>
      </footer>
    </section>
  );
}

function Bubble({
  children,
  className = "",
  pattern,
  tail,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  pattern: "rings" | "squiggle" | "stripes";
  tail: "left" | "right";
  delay?: number;
}) {
  const bg =
    pattern === "stripes"
      ? "repeating-linear-gradient(-55deg, rgba(243,197,76,.85) 0 14px, transparent 14px 34px)"
      : pattern === "rings"
        ? "repeating-radial-gradient(circle at 0% 0%, transparent 0 22px, rgba(124,108,242,.55) 22px 25px)"
        : "none";
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ type: "spring", stiffness: 160, damping: 18, delay }}
      className={`relative rounded-[28px] p-8 md:p-10 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[28px]" style={{ backgroundImage: bg }} />
      {pattern === "squiggle" && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" viewBox="0 0 400 120" fill="none" aria-hidden>
          <path d="M0 40c60-40 100 60 160 20s80-50 140 0 60 50 100 10M60 0c10 60 60 80 40 120M300 0c-30 50 20 80 10 120" stroke="#b9abf3" strokeWidth="2" />
        </svg>
      )}
      <span
        className={`absolute -bottom-4 size-8 ${tail === "left" ? "left-10" : "right-10"}`}
        style={{ background: "inherit", clipPath: tail === "left" ? "polygon(0 0,100% 0,0 100%)" : "polygon(0 0,100% 0,100% 100%)" }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function Cloud({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg
      width="120"
      height="50"
      viewBox="0 0 120 50"
      className={`absolute text-ink ${className}`}
      animate={{ x: [0, 14, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
      aria-hidden
    >
      <path d="M14 50a14 14 0 0 1 0-28h8a22 22 0 0 1 42-6 18 18 0 0 1 30 10h12a12 12 0 0 1 0 24z" fill="currentColor" />
    </motion.svg>
  );
}
