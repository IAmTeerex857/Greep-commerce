"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";

type Theme = "light" | "dark";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

/** Current theme, read from <html data-theme>. "light" on the server. */
export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    () => "light",
  );
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem("greep-theme", t);
  } catch {}
}

const spring = { type: "spring", stiffness: 600, damping: 28 } as const;

/** Sun/moon morph toggle in the amicro "Theme" style. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <motion.button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative grid size-10 place-items-center overflow-hidden rounded-2xl border border-line bg-paper text-ink shadow-[var(--ring-inset),0_1px_2px_rgb(0_0_0/0.05)] ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.svg
          key={theme}
          initial={{ rotate: -90, scale: 0.4, opacity: 0, y: 12 }}
          animate={{ rotate: 0, scale: 1, opacity: 1, y: 0 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0, y: -12 }}
          transition={spring}
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {dark ? (
            <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </>
          )}
        </motion.svg>
      </AnimatePresence>
    </motion.button>
  );
}
