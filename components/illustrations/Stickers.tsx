"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { AppTile, type AppKind } from "@/components/ui/Icons";

/*
 * Inline 2D stickers for headlines: flat illustrations with an ink outline,
 * a thick white sticker border and a slight tilt. They pop in and wiggle on hover.
 */

const INK = "#0a0a0a";

export function Sticker({ children, rotate = -6, delay = 0, className = "" }: { children: ReactNode; rotate?: number; delay?: number; className?: string }) {
  return (
    <motion.span
      className={`relative mx-[0.08em] inline-grid size-[0.86em] place-items-center align-[-0.1em] ${className}`}
      initial={{ scale: 0, rotate: rotate - 30 }}
      animate={{ scale: 1, rotate }}
      whileHover={{ rotate: [rotate, rotate + 10, rotate - 8, rotate], scale: 1.08 }}
      transition={{ type: "spring", stiffness: 300, damping: 14, delay }}
    >
      <span className="absolute inset-0 rounded-[24%] bg-white shadow-[0_0.04em_0.12em_rgba(0,0,0,.18),0_0_0_1px_rgba(0,0,0,.06)]" />
      <span className="relative grid size-[82%] place-items-center">{children}</span>
    </motion.span>
  );
}

export function AppSticker({ kind, rotate, delay }: { kind: AppKind; rotate?: number; delay?: number }) {
  return (
    <Sticker rotate={rotate} delay={delay}>
      <AppTile kind={kind} size="100%" className="!shadow-none" />
    </Sticker>
  );
}

/** Stack of naira notes with a coin: "paid". */
export function CashArt() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round">
        <rect x="9" y="20" width="44" height="26" rx="4" fill="#8fd6ad" transform="rotate(-10 31 33)" />
        <rect x="11" y="24" width="44" height="26" rx="4" fill="#0d965e" />
        <circle cx="33" cy="37" r="7" fill="#c6f36d" />
        <path d="M30 33v8M36 33v8M30 33l6 8M28.5 36h9M28.5 38.5h9" fill="none" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="49" cy="47" r="9" fill="#f3c54c" />
        <circle cx="49" cy="47" r="5" fill="none" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

/** Shopping bag with a heart tag: the thing you found. */
export function BagArt() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
        <path d="M24 24v-4a8 8 0 0 1 16 0v4" fill="none" />
        <path d="M14 24h36l-3 28H17z" fill="#ee6f38" />
        <path d="M14 24h36l-1 8H15z" fill="#f3c54c" />
        <path d="M32 47c-6-4-8-7-6-10s5-1 6 1c1-2 4-4 6-1s0 6-6 10z" fill="#fbfaf6" strokeWidth="2" />
      </g>
    </svg>
  );
}

/** Padlock: money held safe. */
export function LockArt() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
        <path d="M22 28v-6a10 10 0 0 1 20 0v6" fill="none" />
        <rect x="14" y="28" width="36" height="26" rx="6" fill="#b9abf3" />
        <circle cx="32" cy="39" r="4" fill="#fbfaf6" />
        <path d="M32 43v4" />
      </g>
    </svg>
  );
}
