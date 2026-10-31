"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

/*
 * "I'm buying | I'm selling" switch above each hero. The pill glides over
 * first, then the route changes, so the switch feels like one motion.
 */

const OPTIONS = [
  { id: "buyers", label: "I'm buying", href: "/" },
  { id: "sellers", label: "I'm selling", href: "/sellers" },
] as const;

export type Audience = (typeof OPTIONS)[number]["id"];

export function AudienceToggle({ current, className = "" }: { current: Audience; className?: string }) {
  const router = useRouter();
  const [active, setActive] = useState<Audience>(current);

  return (
    <div role="tablist" aria-label="Choose your side" className={`inline-flex rounded-full border border-line bg-sunken p-[3px] ${className}`}>
      {OPTIONS.map((o) => {
        const on = active === o.id;
        return (
          <a
            key={o.id}
            role="tab"
            aria-selected={on}
            href={o.href}
            onMouseEnter={() => router.prefetch(o.href)}
            onClick={(e) => {
              e.preventDefault();
              if (o.id === current) return;
              setActive(o.id);
              setTimeout(() => router.push(o.href), 260);
            }}
            className="relative flex h-8 items-center rounded-full px-4 text-[13.5px] font-medium"
          >
            {on && (
              <motion.span
                layoutId="audience-pill"
                className="absolute inset-0 rounded-full bg-paper shadow-[var(--ring-inset),0_1px_3px_rgb(0_0_0/0.1)]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative transition-colors ${on ? "text-ink" : "text-muted hover:text-ink"}`}>{o.label}</span>
          </a>
        );
      })}
    </div>
  );
}
