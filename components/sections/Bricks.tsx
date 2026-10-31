"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, animate as tween, motion, useAnimate, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { Eyebrow } from "@/components/ui/Reveal";

/*
 * Bottom of the stack first. Widths and offsets are in studs so every brick
 * sits on the same grid, like real LEGO. `x` is the left edge in studs.
 */
const BRICKS = [
  { label: "Post", meta: "You post anywhere", bg: "#b9abf3", ink: "#0a0a0a", studs: 5, x: 4 },
  { label: "Share", meta: "They share it to Greep", bg: "#f3c54c", ink: "#0a0a0a", studs: 6, x: 2 },
  { label: "Checkout", meta: "They order on Greep", bg: "#0d965e", ink: "#ffffff", studs: 8, x: 3 },
  { label: "Held safe", meta: "Held until it arrives", bg: "#141614", ink: "#ffffff", studs: 8, x: 1, dark: true },
  { label: "Delivered", meta: "Buyer confirms", bg: "#8fb5f5", ink: "#0a0a0a", studs: 8, x: 4 },
  { label: "Paid", meta: "Withdraw in your currency", bg: "#ee6f38", ink: "#ffffff", studs: 5, x: 2 },
  { label: "Repeat sale", meta: "They come back and buy again", bg: "#c6f36d", ink: "#0a0a0a", studs: 6, x: 5 },
];
const GRID = 13; // stack width in studs
const N = BRICKS.length;

type Dims = { P: number; H: number; SH: number };
const DESKTOP: Dims = { P: 44, H: 72, SH: 10 };
const MOBILE: Dims = { P: 26, H: 46, SH: 7 };

function useDims(): Dims {
  const small = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
  return small ? MOBILE : DESKTOP;
}

const easeIn = (t: number) => t * t * t;
const startOf = (b: number) => 0.05 + b * 0.115;
const FALL = 0.085;
const SEAT = 0.012;
const landAt = (b: number) => startOf(b) + FALL + SEAT;
// Scrolling back up, a landed brick holds its place until well before its own drop began.
const releaseAt = (b: number) => startOf(b) - 0.04;

export function Bricks() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const d = useDims();
  const [landed, setLanded] = useState(0);

  // Lands going down, releases (top first) only much further up: the stack does not vanish on a small scroll back.
  const sync = (p: number) =>
    setLanded((n) => {
      while (n < N && p >= landAt(n)) n++;
      while (n > 0 && p < releaseAt(n - 1)) n--;
      return n;
    });
  useMotionValueEvent(scrollYProgress, "change", sync);
  useEffect(() => sync(scrollYProgress.get()), [scrollYProgress]);

  const stackH = N * d.H + d.SH;

  return (
    <section ref={ref} className="relative h-[280vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4">
        <div className="relative z-0 text-center">
          <Eyebrow className="justify-center">
            How a sale comes together
          </Eyebrow>
          <h2 className="display mt-4 text-[clamp(34px,5.4vw,72px)]">
            From the scroll to the <span className="text-green">sale.</span>
          </h2>
          <p className="eyebrow mt-3 text-muted">All connected on Greep.</p>
        </div>

        <div className="relative z-10 mt-8 md:mt-10" style={{ width: GRID * d.P, height: stackH }}>
          {BRICKS.map((b, i) => (
            <Brick key={b.label} brick={b} b={i} d={d} progress={scrollYProgress} landed={i < landed} stackLanded={landed} />
          ))}
          {/* meta labels appear as each brick clicks in */}
          <div className="absolute left-full top-0 ml-6 hidden md:block" style={{ height: stackH }}>
            {BRICKS.map((b, i) => (
              <motion.span
                key={b.label}
                className="absolute whitespace-nowrap font-mono text-[11px] text-ink-2"
                style={{ top: d.SH + (N - 1 - i) * d.H + d.H / 2 - 7 }}
                initial={false}
                animate={{ opacity: i < landed ? 1 : 0, x: i < landed ? 0 : -8 }}
                transition={{ duration: 0.35 }}
              >
                0{i + 1} · {b.meta}
              </motion.span>
            ))}
          </div>
          <div className="absolute -bottom-3 left-1/2 h-3 w-[110%] -translate-x-1/2 rounded-full bg-ink/10 blur-[4px]" />
        </div>
      </div>
    </section>
  );
}

function Brick({
  brick,
  b,
  d,
  progress,
  landed,
  stackLanded,
}: {
  brick: (typeof BRICKS)[number];
  b: number;
  d: Dims;
  progress: MotionValue<number>;
  landed: boolean;
  stackLanded: number;
}) {
  const start = startOf(b);
  // Gravity: ease-in fall that ends resting on top of the studs below.
  const fall = useTransform(progress, [start, start + FALL], [-(N - b) * d.H - 520, 0], { ease: easeIn });
  const tilt = useTransform(progress, [start, start + FALL], [b % 2 ? 5 : -5, 0], { ease: easeIn });
  const fade = useTransform(progress, [start - 0.005, start], [0, 1]);

  // hold = 1 while landed. On release it eases to 0: the brick lifts a little and fades
  // on its own clock, then hands back to the scroll-driven fall.
  const hold = useMotionValue(landed ? 1 : 0);
  useEffect(() => {
    if (landed) {
      hold.stop();
      hold.set(1);
    } else if (hold.get() > 0) {
      const c = tween(hold, 0, { duration: 0.7, ease: [0.4, 0, 0.2, 1] });
      return () => c.stop();
    }
  }, [landed, hold]);
  const y = useTransform(() => {
    const h = hold.get();
    return h >= 1 ? 0 : h > 0 ? -(1 - h) * 90 : fall.get();
  });
  const rotate = useTransform(() => {
    const h = hold.get();
    return h > 0 ? (1 - h) * (b % 2 ? 4 : -4) : tilt.get();
  });
  const opacity = useTransform(() => {
    const h = hold.get();
    return h > 0 ? h : fade.get();
  });
  const [scope, animate] = useAnimate();
  const prev = useRef(stackLanded);

  // A brick landing on top gives everything below a tiny nudge.
  useEffect(() => {
    if (stackLanded > prev.current && landed && b < stackLanded - 1 && scope.current) {
      animate(scope.current, { y: [0, 1.5, 0] }, { duration: 0.22, ease: "easeOut" });
    }
    prev.current = stackLanded;
  }, [stackLanded, landed, b, animate, scope]);

  const W = brick.studs * d.P;
  const studW = Math.round(d.P * 0.6);
  const edge = brick.dark ? "dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/25" : "";

  return (
    <motion.div
      className="absolute"
      style={{
        left: brick.x * d.P,
        top: d.SH + (N - 1 - b) * d.H,
        width: W,
        height: d.H,
        zIndex: 10 + b,
        y,
        rotate,
        opacity,
      }}
    >
      <div ref={scope} className="relative h-full w-full">
        {/* Rests on the studs (one stud height up) until it clicks into place. */}
        <motion.div
          className="relative h-full w-full origin-bottom"
          initial={false}
          animate={landed ? { y: 0, scaleY: [1, 0.94, 1.02, 1], scaleX: [1, 1.02, 0.995, 1] } : { y: -d.SH, scaleY: 1, scaleX: 1 }}
          transition={landed ? { y: { type: "spring", stiffness: 1600, damping: 42 }, scaleY: { duration: 0.28 }, scaleX: { duration: 0.28 } } : { duration: 0.12 }}
        >
          {/* studs */}
          {Array.from({ length: brick.studs }).map((_, s) => (
            <span
              key={s}
              className={`absolute rounded-t-[4px] ${edge}`}
              style={{
                left: s * d.P + (d.P - studW) / 2,
                top: -d.SH,
                width: studW,
                height: d.SH + 2,
                background: brick.bg,
                boxShadow: "inset 0 2px 0 rgb(255 255 255 / .35)",
              }}
            />
          ))}
          {/* body */}
          <div
            className={`relative grid h-full w-full place-items-center rounded-[6px] ${edge}`}
            style={{
              background: brick.bg,
              color: brick.ink,
              boxShadow:
                "inset 0 -6px 0 rgb(0 0 0 / .2), inset 0 2px 0 rgb(255 255 255 / .3), inset 4px 0 0 rgb(255 255 255 / .08), inset -4px 0 0 rgb(0 0 0 / .08), 0 8px 16px -10px rgb(0 0 0 / .5)",
              backgroundImage: "radial-gradient(rgb(0 0 0 / .06) 1px, transparent 1.2px)",
              backgroundSize: "5px 5px",
            }}
          >
            <span className="font-display font-semibold leading-none tracking-[-0.05em]" style={{ fontSize: d.H * 0.52, marginTop: -3 }}>
              {brick.label}
            </span>
          </div>
        </motion.div>

        {/* dust puffs on the click */}
        <AnimatePresence>
          {landed &&
            [-1, 1].map((side) => (
              <motion.span
                key={side}
                className="pointer-events-none absolute bottom-0 flex gap-1"
                style={{ [side < 0 ? "left" : "right"]: -6 } as React.CSSProperties}
                initial={{ opacity: 0.8, x: 0, y: 0 }}
                animate={{ opacity: 0, x: side * 22, y: -6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {[0, 1, 2].map((k) => (
                  <span key={k} className="rounded-full bg-ink/20" style={{ width: 6 - k * 1.5, height: 6 - k * 1.5, marginTop: k * 3 }} />
                ))}
              </motion.span>
            ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
