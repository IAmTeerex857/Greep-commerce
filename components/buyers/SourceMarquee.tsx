"use client";

import type { ReactNode } from "react";
import { Camera, Link2, ScanLine, Store } from "lucide-react";
import { BrandGlyph, type AppKind } from "@/components/ui/Icons";

/*
 * Where finds come from, in one black-and-white strip that never stops.
 * Same spirit as the sellers page AppMarquee, with plain sources mixed in.
 */

type Item = { label: string; icon: ReactNode };

const app = (kind: AppKind, label: string): Item => ({ label, icon: <BrandGlyph kind={kind} size={22} /> });
const plain = (Icon: typeof Camera, label: string): Item => ({ label, icon: <Icon size={22} strokeWidth={2.2} /> });

const ITEMS: Item[] = [
  app("pin", "Pinterest"),
  plain(ScanLine, "Screenshots"),
  app("camera", "Instagram"),
  plain(Link2, "Any link"),
  app("video", "TikTok"),
  plain(Camera, "Photos from real life"),
  app("x", "X"),
  plain(Store, "Online stores"),
  app("chat", "WhatsApp"),
];

export function SourceMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section aria-label="Where your finds come from" className="relative z-0 border-y border-line bg-canvas py-5">
      <div className="mx-auto max-w-6xl overflow-hidden px-4">
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <ul className="flex w-max animate-[marquee_44s_linear_infinite] gap-12 hover:[animation-play-state:paused]">
            {[...row, ...row].map((a, i) => (
              <li key={i} aria-hidden={i >= ITEMS.length} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-lg font-semibold tracking-[-0.02em] text-ink">
                {a.icon}
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
