"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Blobatar } from "@blobatar/react";
import { Eyebrow, Reveal, SplitWords } from "@/components/ui/Reveal";
import { LogoMark } from "@/components/ui/Logo";

const NODES = [
  { label: "Sees your post", name: "flywheel-buyer", hue: 262 },
  { label: "Buys from you", name: "flywheel-store", hue: 150 },
  { label: "Earns rewards", name: "flywheel-seller", hue: 22 },
  { label: "Comes back", name: "flywheel-fans", hue: 210 },
];
const POINTS = [
  { t: "Know who buys.", d: "Customer insights and purchase history." },
  { t: "Reward them.", d: "Built-in loyalty gives them more reasons to choose you." },
  { t: "Grow repeat sales.", d: "Happy customers come back and buy again." },
];

const R = 190;

export function Flywheel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const spin = useTransform(scrollYProgress, [0, 1], [-60, 120]);
  const counter = useTransform(spin, (r) => -r);

  return (
    <section ref={ref} className="relative overflow-hidden py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 md:grid-cols-2">
        <div>
          <Eyebrow index="06">Loyalty</Eyebrow>
          <h2 className="display mt-5 text-[clamp(38px,5.4vw,72px)]">
            <SplitWords text="Know your customers." />{" "}
            <SplitWords text="Keep them coming back." delay={0.2} className="text-muted/70" />
          </h2>
          <ul className="mt-10 space-y-5">
            {POINTS.map((p, i) => (
              <Reveal key={p.t} delay={0.1 * i} as="div" className="flex gap-4 border-t border-line pt-5">
                <span className="font-mono text-sm text-green">0{i + 1}</span>
                <p>
                  <span className="font-semibold">{p.t}</span> <span className="text-muted">{p.d}</span>
                </p>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative grid size-28 place-items-center rounded-[32px] border border-line bg-paper shadow-[0_24px_50px_-24px_rgba(17,20,17,.5)]">
              <LogoMark size={56} />
            </div>
          </div>

          <motion.div style={{ rotate: spin }} className="absolute inset-0">
            <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
              <circle cx="260" cy="260" r={R} stroke="currentColor" className="text-ink" strokeOpacity=".25" strokeWidth="2" strokeDasharray="7 9" style={{ animation: "dash 1.2s linear infinite" }} />
              {[0, 1, 2, 3].map((i) => {
                const a = (i * Math.PI) / 2 + Math.PI / 4;
                const x = 260 + Math.cos(a) * R;
                const y = 260 + Math.sin(a) * R;
                return <path key={i} d={`M${x - 7} ${y - 7}l7 7-7 7`} stroke="#0d965e" strokeWidth="3" strokeLinecap="round" transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} />;
              })}
            </svg>
            {/* runner */}
            <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
              <span className="absolute left-1/2 top-[13.5%] -ml-2.5 -mt-2.5 size-5 rounded-full bg-green shadow-[0_0_0_6px_rgba(13,150,94,.18),0_0_24px_#0d965e]" />
            </motion.div>

            {NODES.map((n, i) => {
              const a = (i * Math.PI) / 2 - Math.PI / 2;
              return (
                <div
                  key={n.label}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${50 + (Math.cos(a) * R * 100) / 520}%`, top: `${50 + (Math.sin(a) * R * 100) / 520}%` }}
                >
                  <motion.div style={{ rotate: counter }} className="flex flex-col items-center gap-2">
                    <span className="grid size-[68px] place-items-center rounded-[22px] border border-line bg-paper shadow-[0_16px_30px_-18px_rgba(17,20,17,.5)]">
                      <Blobatar name={n.name} hue={n.hue} animate="hover" size={50} />
                    </span>
                    <span className="whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[12px] font-semibold text-canvas">{n.label}</span>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
