"use client";

import { motion } from "motion/react";

/*
 * Flat geometric characters in the style of the reference: thick ink outlines,
 * blocky bodies, flat fills from the Greep palette. Each one idles gently.
 */

const S = { stroke: "#111411", strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Seller in a tall headwrap and shades, holding a printed tote. */
export function Seller({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 260 380"
      className={className}
      aria-hidden="true"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* shoes */}
      <path {...S} d="M46 352a26 26 0 0 1 26-26h34v30H46z" fill="#7c6cf2" />
      <path {...S} d="M118 352a26 26 0 0 1 26-26h34v30h-60z" fill="#7c6cf2" />
      <path {...S} d="M46 352h60v10H46zM118 352h60v10h-60z" fill="#c6f36d" />
      {/* legs */}
      <rect {...S} x="70" y="290" width="22" height="38" fill="#dcf2e4" />
      <rect {...S} x="140" y="290" width="22" height="38" fill="#dcf2e4" />
      {/* body */}
      <path {...S} d="M54 196a20 20 0 0 1 20-20h88a20 20 0 0 1 20 20v100H54z" fill="#0d965e" />
      <path {...S} d="M54 222h128" />
      <path {...S} d="M118 176v120" />
      <path {...S} d="M98 244l20 18" />
      {/* face */}
      <motion.g animate={{ rotate: [0, -3, 0, 2, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "118px", originY: "170px" }}>
        <path {...S} d="M74 150a44 44 0 0 0 88 0z" fill="#8a5a3c" />
        <path d="M108 164a12 12 0 0 0 20 0" stroke="#fbfaf6" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* tall headwrap */}
        <path {...S} d="M70 150 76 40a14 14 0 0 1 15-13l66 5a14 14 0 0 1 13 15l-6 103z" fill="#ee6f38" />
        <g fill="#f3c54c" stroke="#111411" strokeWidth="2">
          <circle cx="100" cy="64" r="7" />
          <circle cx="136" cy="72" r="7" />
          <circle cx="112" cy="100" r="7" />
          <circle cx="146" cy="110" r="7" />
          <circle cx="92" cy="128" r="7" />
        </g>
        {/* shades */}
        <rect {...S} x="64" y="134" width="50" height="30" rx="8" fill="#c6f36d" />
        <rect {...S} x="122" y="134" width="50" height="30" rx="8" fill="#c6f36d" />
        <rect x="71" y="140" width="36" height="18" rx="5" fill="#111411" />
        <rect x="129" y="140" width="36" height="18" rx="5" fill="#111411" />
        <path {...S} d="M114 147h8" />
      </motion.g>
      {/* tote */}
      <motion.g animate={{ rotate: [-4, 3, -4] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "186px", originY: "200px" }}>
        <path {...S} d="M170 236c0-40 10-58 26-58s26 18 26 58" fill="none" strokeWidth="6" />
        <path {...S} d="M150 236h96l10 92H140z" fill="#7c6cf2" />
        <path {...S} d="M164 236h68v34a34 34 0 0 1-68 0z" fill="#f3c54c" />
        <path {...S} d="M168 304h44" />
      </motion.g>
    </motion.svg>
  );
}

/** Buyer with an afro puff, scrolling a phone. */
export function Buyer({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 240 380"
      className={className}
      aria-hidden="true"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
    >
      <path {...S} d="M38 352a26 26 0 0 1 26-26h34v30H38z" fill="#111411" />
      <path {...S} d="M112 352a26 26 0 0 1 26-26h34v30h-60z" fill="#111411" />
      <path {...S} d="M38 352h60v10H38zM112 352h60v10h-60z" fill="#fbfaf6" />
      <rect {...S} x="62" y="286" width="22" height="42" fill="#8fb5f5" />
      <rect {...S} x="134" y="286" width="22" height="42" fill="#8fb5f5" />
      <path {...S} d="M46 200a20 20 0 0 1 20-20h86a20 20 0 0 1 20 20v92H46z" fill="#b9abf3" />
      <path {...S} d="M46 240h126" />
      {/* arm holding phone */}
      <path {...S} d="M150 230c18 0 30-14 30-34" fill="none" strokeWidth="14" stroke="#111411" />
      <path d="M150 230c18 0 30-14 30-34" fill="none" strokeWidth="8" stroke="#b9abf3" strokeLinecap="round" />
      <motion.g animate={{ rotate: [0, 6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "182px", originY: "196px" }}>
        <rect {...S} x="166" y="150" width="34" height="58" rx="8" fill="#111411" />
        <rect x="171" y="157" width="24" height="40" rx="4" fill="#0d965e" />
        <path d="M177 176l5 5 9-10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      {/* head */}
      <circle {...S} cx="110" cy="72" r="44" fill="#111411" />
      <circle {...S} cx="78" cy="96" r="22" fill="#111411" />
      <circle {...S} cx="142" cy="96" r="22" fill="#111411" />
      <path {...S} d="M70 140a40 40 0 0 0 80 0v-24H70z" fill="#c68a5e" />
      <motion.g animate={{ scaleY: [1, 1, 0.1, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.46, 0.5, 0.54, 1] }} style={{ originY: "132px" }}>
        <circle cx="96" cy="132" r="4" fill="#111411" />
        <circle cx="124" cy="132" r="4" fill="#111411" />
      </motion.g>
      <path d="M100 150a12 10 0 0 0 20 0" stroke="#111411" strokeWidth="3" fill="#fbfaf6" strokeLinecap="round" />
      {/* sparkles */}
      <motion.path
        d="M210 120l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"
        fill="#f3c54c"
        stroke="#111411"
        strokeWidth="2"
        animate={{ scale: [0.6, 1.1, 0.6], rotate: [0, 45, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ originX: "214px", originY: "134px" }}
      />
    </motion.svg>
  );
}
