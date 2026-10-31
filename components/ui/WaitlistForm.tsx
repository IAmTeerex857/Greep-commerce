"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BorderBeam } from "border-beam";
import { Liquid } from "liquid-gooey";
import { TextLoader } from "generative-loaders";
import { Blobatar } from "@blobatar/react";
import { useGaze } from "@blobatar/react/gaze";
import { happy, idle, thinking, wink } from "blobatar/expression";
import { Button } from "@/components/ui/Button";

export type Role = "buyer" | "seller";
type Status = "idle" | "loading" | "done" | "error";

const ROLES: { id: Role; label: string }[] = [
  { id: "buyer", label: "I buy" },
  { id: "seller", label: "I sell" },
];
const looksValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/**
 * Email capture. The blob beside the input is generated from what you type,
 * so it morphs with every keystroke and becomes "your" blob once you join.
 */
export function WaitlistForm({
  compact = false,
  align = "center",
  onJoined,
  audience,
  cta = "Get early access",
  ctaShort = "Join",
}: {
  compact?: boolean;
  align?: "center" | "start";
  onJoined?: (email: string) => void;
  /** Set by pages that already know who they're talking to; hides the role switch. */
  audience?: Role;
  cta?: string;
  ctaShort?: string;
}) {
  const [role, setRole] = useState<Role>(audience ?? "buyer");
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const { ref: eyes } = useGaze({ travel: 3.5, lookAt: "pointer" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      await new Promise((r) => setTimeout(r, 900));
      if (res.ok) {
        setStatus("done");
        onJoined?.(email);
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const expression = status === "loading" ? thinking : looksValid(email) ? happy : focused && email ? wink : idle;
  const id = compact ? "email-2" : "email";

  return (
    <div className={`w-full ${compact ? "max-w-md" : "max-w-[480px]"}`}>
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="card flex items-center gap-4 p-4 pr-6 text-left"
          >
            <motion.span initial={{ rotate: -20, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 12 }}>
              <Blobatar name={email} animate="always" expression={happy} size={56} />
            </motion.span>
            <div>
              <p className="font-display text-lg font-bold tracking-[-0.03em]">You&apos;re on the list.</p>
              <p className="text-sm text-muted">This blob is yours now. We&apos;ll email you first.</p>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, scale: 0.97 }} className={`flex flex-col gap-3 ${align === "start" ? "items-start" : "items-center"}`}>
            {!audience && <RoleToggle role={role} onChange={setRole} />}
            <BorderBeam size="line" colorVariant="forest" theme="auto" strength={0.8} active={status !== "loading"} className="w-full">
              <div className="flex w-full items-center gap-2 rounded-[22px] border border-line-strong bg-paper p-1.5 pl-2 shadow-[var(--shadow-card)]">
                <motion.span
                  key={email.slice(0, 1) || "empty"}
                  initial={{ scale: 0.7, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  className="grid size-10 shrink-0 place-items-center rounded-2xl bg-sunken"
                  title="Your blob changes as you type"
                >
                  <Blobatar ref={eyes} name={email || "greep-you"} animate="always" expression={expression} size={32} />
                </motion.span>
                <label htmlFor={id} className="sr-only">
                  Email
                </label>
                <input
                  id={id}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="you@email.com"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
                />
                <Button type="submit" variant="green" size="md" interaction="slide-arrow" disabled={status === "loading"}>
                  {status === "loading" ? (
                    <TextLoader text="Joining" variant="decode" color="#ffffff" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">{cta}</span>
                      <span className="sm:hidden">{ctaShort}</span>
                    </>
                  )}
                </Button>
              </div>
            </BorderBeam>
            {status === "error" ? (
              <p className="text-sm text-rose">That didn&apos;t work. Try again?</p>
            ) : compact ? null : (
              <p className="text-[13px] text-muted">
                Type your email and watch your blob change.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Buyer / seller switch. The pill is a liquid-gooey "move" blob that stretches as it slides. */
function RoleToggle({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const index = ROLES.findIndex((r) => r.id === role);
  return (
    <div className="relative inline-flex rounded-2xl border border-line bg-sunken p-1" role="radiogroup" aria-label="I am a">
      <div className="pointer-events-none absolute left-1 top-1 h-8 w-[168px]">
        <Liquid fill="var(--color-paper)" blur={5} contrast={20} shadow="0 1px 3px rgba(0,0,0,.12)">
          <Liquid.Item effect="move">
            <div
              className="h-8 w-[84px] rounded-xl transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]"
              style={{ transform: `translateX(${index * 84}px)` }}
            />
          </Liquid.Item>
        </Liquid>
      </div>
      {ROLES.map((r) => (
        <button
          key={r.id}
          type="button"
          role="radio"
          aria-checked={role === r.id}
          onClick={() => onChange(r.id)}
          className={`relative z-10 h-8 w-[84px] rounded-xl text-[13px] font-semibold transition-colors duration-300 ${
            role === r.id ? "text-ink" : "text-muted hover:text-ink"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
