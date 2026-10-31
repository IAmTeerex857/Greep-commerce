"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { MetalFx } from "metal-fx";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/theme";
import { useMounted } from "@/components/ui/useMounted";

export type NavLink = { href: string; label: string };

const SELLER_LINKS: NavLink[] = [
  { href: "#how", label: "How it works" },
  { href: "#merchants", label: "Tools" },
  { href: "#features", label: "Features" },
];

export function Nav({ links = SELLER_LINKS, cta: ctaLabel = "Claim your store" }: { links?: NavLink[]; cta?: string }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const mounted = useMounted();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  const cta = (
    <Button href="#join" size="md" variant="dark" interaction="slide-arrow">
      {ctaLabel}
    </Button>
  );

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3"
    >
      <motion.nav
        layout
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={`flex w-full items-center justify-between gap-3 transition-[background-color,border-color,box-shadow] duration-500 ${
          scrolled ? "glass max-w-4xl rounded-[22px] py-2 pl-4 pr-2" : "max-w-6xl rounded-none border border-transparent px-2 py-2"
        }`}
      >
        <a href="#top" aria-label="Greep home" className="flex h-10 items-center">
          <Logo />
        </a>

        <div className="hidden items-center md:flex" onPointerLeave={() => setHovered(null)}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onPointerEnter={() => setHovered(l.href)}
              className="relative px-4 py-2 text-[14px] font-medium text-ink-2 transition-colors hover:text-ink"
            >
              {hovered === l.href && (
                <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-xl bg-sunken" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
              )}
              <span className="relative">{l.label}</span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="hidden sm:block">
            {mounted ? (
              <MetalFx preset="chromatic" theme="dark" strength={0.8} className="rounded-2xl">
                {cta}
              </MetalFx>
            ) : (
              cta
            )}
          </span>
        </div>
      </motion.nav>
    </motion.header>
  );
}
