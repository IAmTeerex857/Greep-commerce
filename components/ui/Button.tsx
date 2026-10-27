"use client";

/*
 * Buttons modelled on amicro.dev/buttons (MIT): compact rounded pills with an
 * inset hairline, padding that breathes on hover, a 0.97 press, and a small
 * icon interaction per button.
 */

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useSpring } from "motion/react";
import { ArrowRight } from "lucide-react";

export type Interaction = "slide-arrow" | "sparkle" | "morph" | "ring" | "glare" | "magnetic" | "none";
type Variant = "primary" | "secondary" | "green" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const spring = { type: "spring", stiffness: 600, damping: 28 } as const;

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-ink text-canvas shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(0_0_0/0.2),0_8px_20px_-8px_rgb(0_0_0/0.45)] dark:shadow-[inset_0_-1px_0_rgb(0_0_0/0.15),0_8px_20px_-8px_rgb(255_255_255/0.15)]",
  secondary: "bg-paper text-ink border border-line shadow-[var(--ring-inset),0_1px_2px_rgb(0_0_0/0.05)]",
  green:
    "bg-green text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.15),0_10px_24px_-10px_rgb(13_150_94/0.7)]",
  ghost: "text-ink hover:bg-sunken",
  /** Stays black in both themes, e.g. under the metal ring. */
  dark: "bg-[#0a0a0a] text-white ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_8px_20px_-8px_rgb(0_0_0/0.5)]",
};

const SIZES: Record<Size, { cls: string; pad: [number, number] }> = {
  sm: { cls: "h-9 rounded-xl text-[13px]", pad: [12, 15] },
  md: { cls: "h-10 rounded-2xl text-[13.5px]", pad: [16, 20] },
  lg: { cls: "h-12 rounded-[18px] text-[15px]", pad: [20, 25] },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  interaction = "slide-arrow",
  icon,
  iconHover,
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
  forceHover,
  "aria-label": ariaLabel,
}: {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  interaction?: Interaction;
  icon?: ReactNode;
  iconHover?: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  /** Lets demos show the hover state without a real pointer. */
  forceHover?: boolean;
  "aria-label"?: string;
}) {
  const [hoverState, setHover] = useState(false);
  const hover = forceHover ?? hoverState;
  const ref = useRef<HTMLElement>(null);
  const mx = useSpring(0, { stiffness: 150, damping: 15, mass: 0.6 });
  const my = useSpring(0, { stiffness: 150, damping: 15, mass: 0.6 });
  const s = SIZES[size];

  const onMove = (e: React.PointerEvent) => {
    if (interaction !== "magnetic" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) * 0.3);
    my.set((e.clientY - r.top - r.height / 2) * 0.3);
  };
  const leave = () => {
    setHover(false);
    mx.set(0);
    my.set(0);
  };

  const props = {
    ref: ref as never,
    onPointerEnter: () => setHover(true),
    onPointerLeave: leave,
    onPointerMove: onMove,
    onFocus: () => setHover(true),
    onBlur: leave,
    onClick,
    "aria-label": ariaLabel,
    animate: { paddingLeft: children ? (hover ? s.pad[1] : s.pad[0]) : 0, paddingRight: children ? (hover ? s.pad[1] : s.pad[0]) : 0 },
    style: { x: mx, y: my },
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.97 },
    transition: { type: "spring", stiffness: 500, damping: 28 },
    className: `group/btn relative inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap font-medium tracking-[-0.01em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-60 ${
      children ? "" : "aspect-square"
    } ${s.cls} ${VARIANTS[variant]} ${className}`,
  } as const;

  const content = (
    <motion.span layout transition={spring} className="relative flex items-center justify-center">
      <Icons interaction={interaction} hover={hover} icon={icon} iconHover={iconHover} hasLabel={!!children} />
      {children && (
        <motion.span layout transition={spring}>
          {children}
        </motion.span>
      )}
      {interaction === "slide-arrow" && (
        <AnimatePresence mode="popLayout" initial={false}>
          {hover && (
            <motion.span
              key="arrow"
              layout
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={spring}
              className="ml-2 flex"
            >
              {iconHover ?? <ArrowRight size={16} strokeWidth={2.2} />}
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </motion.span>
  );

  const glare = interaction === "glare" && (
    <motion.span
      aria-hidden
      animate={{ x: hover ? ["-150%", "250%"] : "-150%" }}
      transition={{ duration: 0.85, ease: "easeInOut", repeat: hover ? Infinity : 0, repeatDelay: 0.8 }}
      className="pointer-events-none absolute inset-y-0 left-0 w-[50px] -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent"
    />
  );

  if (href) {
    return (
      <motion.a href={href} {...props}>
        {glare}
        {content}
      </motion.a>
    );
  }
  return (
    <motion.button type={type} disabled={disabled} {...props}>
      {glare}
      {content}
    </motion.button>
  );
}

function Icons({
  interaction,
  hover,
  icon,
  iconHover,
  hasLabel,
}: {
  interaction: Interaction;
  hover: boolean;
  icon?: ReactNode;
  iconHover?: ReactNode;
  hasLabel: boolean;
}) {
  if (!icon) return null;
  const gap = hasLabel ? "mr-2" : "";

  if (interaction === "slide-arrow") {
    return (
      <AnimatePresence mode="popLayout" initial={false}>
        {!hover && (
          <motion.span key="i1" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={spring} className={`flex ${gap}`}>
            {icon}
          </motion.span>
        )}
      </AnimatePresence>
    );
  }

  if (interaction === "sparkle" || interaction === "morph" || interaction === "ring") {
    const enter =
      interaction === "sparkle"
        ? { initial: { y: 15, opacity: 0, scale: 0.8 }, exit: { y: -15, opacity: 0, scale: 0.8 } }
        : interaction === "ring"
          ? { initial: { rotate: -15, scale: 0.8, opacity: 0 }, exit: { rotate: 15, scale: 0.8, opacity: 0 } }
          : { initial: { scale: 0.5, opacity: 0 }, exit: { scale: 0.5, opacity: 0 } };
    const show = hover && iconHover ? iconHover : icon;
    return (
      <span className={`relative flex size-4 items-center justify-center ${gap}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={hover ? "b" : "a"} {...enter} animate={{ y: 0, x: 0, opacity: 1, scale: 1, rotate: 0 }} transition={spring} className="absolute inset-0 flex items-center justify-center">
            {show}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence>
          {hover && interaction === "sparkle" && (
            <>
              <motion.svg key="s1" initial={{ opacity: 0, scale: 0, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0 }} transition={{ ...spring, delay: 0.05 }} className="absolute -right-2 -top-2.5 size-2.5 text-sun" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" />
              </motion.svg>
              <motion.svg key="s2" initial={{ opacity: 0, scale: 0, rotate: 45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0 }} transition={{ ...spring, delay: 0.1 }} className="absolute -left-2.5 -top-1 size-1.5 text-lime" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" />
              </motion.svg>
            </>
          )}
          {hover && interaction === "ring" && (
            <motion.span key="dot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ ...spring, delay: 0.1 }} className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-green" />
          )}
        </AnimatePresence>
      </span>
    );
  }

  return <span className={`flex ${gap}`}>{icon}</span>;
}
