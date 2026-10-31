/*
 * Static art for the Doorstep figure: the conveyor, the Greep hub, the three
 * side machines, the house, and the order items (as reusable defs).
 * Every part sits on another part; tones come from facing (t / l / r / m).
 */
import type { ReactNode } from "react";
import { Box, Halo, P, RBox, TopScrew, dOf, onTop, onX, onY, pts, r2, seg, type V3 } from "./iso";
import { HALF, HUB_X, SLAT, YC, ZB, STEPS } from "./model";

/* ------------------------------------------------------------------ layout */

export const BELT = { y0: 0, y1: 24, rail: 3, zr0: 9, zr1: 16.5, zb0: 12 };
export const HUB = { x0: -24, x1: 24, y0: -18, y1: 38, z0: 3, z1: 44 };
export const HOLE = { y0: -4, y1: 28, z0: 8, z1: 32 };
export const LEGS = [-112, -58, 62, 118];

export const STATUS = { x: -114, y: -118, w: 52, d: 30, H: 42 };
export const REVIEWS = { x: 16, y: -126, w: 58, d: 30, H: 40 };
export const CHATM = { x: -56, y: 88, w: 62, d: 30, H: 38 };
export const PRN = { x0: -154, x1: -122, y0: -8, y1: 32, h: 30 };

export const HOUSE = { x0: 150, x1: 202, y0: -46, y1: 0, h: 36 };
export const DECK = { x0: 145, x1: 206, y0: 0, y1: 28, h: 10 };
export const DOOR = { x0: 155, x1: 173, z0: 10, z1: 32 };

export const WIRES: Record<"status" | "reviews" | "chat", V3[]> = {
  status: [
    [HUB.x1, -10, 14],
    [30, -10, 14],
    [30, -10, 0],
    [30, -72, 0],
    [STATUS.x + 22, -72, 0],
    [STATUS.x + 22, STATUS.y + STATUS.d, 0],
    [STATUS.x + 22, STATUS.y + STATUS.d, 6],
  ],
  reviews: [
    [HUB.x1, -10, 22],
    [40, -10, 22],
    [40, -10, 0],
    [40, REVIEWS.y + REVIEWS.d, 0],
    [40, REVIEWS.y + REVIEWS.d, 6],
  ],
  chat: [
    [16, HUB.y1, 12],
    [16, 46, 12],
    [16, 46, 0],
    [16, CHATM.y + 14, 0],
    [CHATM.x + CHATM.w, CHATM.y + 14, 0],
    [CHATM.x + CHATM.w, CHATM.y + 14, 6],
  ],
};

/** Screen bounds of everything, padded. */
export function viewBox() {
  const probe: V3[] = [
    [PRN.x0, PRN.y0, PRN.h + 1.2],
    [PRN.x0, PRN.y1, 0],
    [STATUS.x, STATUS.y + 4, 15 + STATUS.H],
    [STATUS.x, STATUS.y + STATUS.d, 0],
    [STATUS.x + STATUS.w, STATUS.y, 15 + STATUS.H],
    [REVIEWS.x + REVIEWS.w, REVIEWS.y + 4, 15 + REVIEWS.H],
    [REVIEWS.x, REVIEWS.y + 4, 15 + REVIEWS.H],
    [CHATM.x, CHATM.y + CHATM.d, 0],
    [CHATM.x + CHATM.w, CHATM.y + CHATM.d, 0],
    [CHATM.x, CHATM.y + 4, 15 + CHATM.H],
    [DECK.x1, DECK.y1 + 6, 0],
    [DECK.x1, DECK.y0, 0],
    [HOUSE.x1 + 3, HOUSE.y0 - 4, 34],
    [190, -38, 64],
  ];
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const [x, y, z] of probe) {
    const [a, b] = P(x, y, z);
    x0 = Math.min(x0, a);
    x1 = Math.max(x1, a);
    y0 = Math.min(y0, b);
    y1 = Math.max(y1, b);
  }
  const pad = 10;
  return { x: x0 - pad, y: y0 - pad - 6, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 + 6 };
}

/* ------------------------------------------------------------------ floor */

export function Floor() {
  const lines: string[] = [];
  for (let x = -200; x <= 260; x += 20) lines.push(seg([x, -170, 0], [x, 150, 0]));
  for (let y = -170; y <= 150; y += 20) lines.push(seg([-200, y, 0], [260, y, 0]));
  return <path className="ds-grid" d={lines.join("")} mask="url(#ds-floor-mask)" />;
}

/* ------------------------------------------------------------------ conveyor */

function Leg({ x }: { x: number }) {
  const { y0, y1, rail, zr0 } = BELT;
  return (
    <g>
      <Box b={[x - 2.5, y0 - rail - 1, 0, x + 2.5, y0 + 1, 1]} t="lot" l="lol" r="lor" />
      <Box b={[x - 1.5, y0 - rail, 1, x + 1.5, y0, zr0]} t="m" l="l" r="r" />
      <Box b={[x - 1, y0, 3, x + 1, y1, 5]} t="m" l="l" r="r" />
      <Box b={[x - 2.5, y1 - 1, 0, x + 2.5, y1 + rail + 1, 1]} t="lot" l="lol" r="lor" />
      <Box b={[x - 1.5, y1, 1, x + 1.5, y1 + rail, zr0]} t="m" l="l" r="r" />
    </g>
  );
}

export function Legs({ side }: { side: "left" | "right" }) {
  return (
    <g>
      {LEGS.filter((x) => (side === "left" ? x < 0 : x > 0)).map((x) => (
        <Leg key={x} x={x} />
      ))}
    </g>
  );
}

/** Back rail, belt and its moving slats for one stretch of the belt. */
export function BeltBack({ xa, xb, id, end }: { xa: number; xb: number; id: string; end?: "start" | "end" }) {
  const { y0, y1, rail, zr0, zr1, zb0 } = BELT;
  const slats: string[] = [];
  for (let x = xa - SLAT * 2; x <= xb + SLAT; x += SLAT) slats.push(seg([x, y0, ZB], [x, y1, ZB]));
  const top: V3[] = [
    [xa, y0, ZB],
    [xb, y0, ZB],
    [xb, y1, ZB],
    [xa, y1, ZB],
  ];
  return (
    <g>
      <Box b={[xa, y0 - rail, zr0, xb, y0, zr1]} t="t" l="l" r="r" />
      <Box b={[xa, y0, zb0, xb, y1, ZB]} t="belt" l="beltl" r="beltr" />
      <clipPath id={`ds-slat-${id}`}>
        <polygon points={pts(top)} />
      </clipPath>
      <g clipPath={`url(#ds-slat-${id})`}>
        <path data-slats className="slat" d={slats.join("")} />
      </g>
      {end === "end" && (
        // the belt rolls over the end drum
        <path className="kf" d={seg([xb, y0, ZB - 0.6], [xb, y1, ZB - 0.6])} />
      )}
    </g>
  );
}

export function BeltFront({ xa, xb, drums = [] }: { xa: number; xb: number; drums?: number[] }) {
  const { y1, rail, zr0, zr1 } = BELT;
  const bolts: ReactNode[] = [];
  const first = Math.ceil((xa + 4) / 14) * 14;
  for (let x = first; x <= xb - 4; x += 14) {
    bolts.push(
      <g key={x} transform={onY(x, y1 + rail, (zr0 + zr1) / 2)}>
        <circle r={0.75} className="bolt" />
      </g>,
    );
  }
  return (
    <g>
      <Box b={[xa, y1, zr0, xb, y1 + rail, zr1]} t="t" l="l" r="r" />
      <path className="kf" d={seg([xa, y1 + rail, zr0 + 2.2], [xb, y1 + rail, zr0 + 2.2])} />
      {bolts}
      {drums.map((x) => (
        <g key={`d${x}`} transform={onY(x, y1 + rail, (zr0 + zr1) / 2)}>
          <circle r={2.6} className="drum" />
          <circle r={0.9} className="bolt" />
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ checkout terminal */

export const SLOT = { y0: -4, y1: 28, z0: 9, z1: 21 };

/** Where orders start: a checkout terminal that feeds receipts and cards onto the belt. */
export function Printer() {
  const { x0, x1, y0, y1, h } = PRN;
  const w = x1 - x0;
  const d = y1 - y0;
  const keys: ReactNode[] = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      keys.push(<rect key={`${r}${c}`} x={4 + c * 4.2} y={27 + r * 3.4} width={3.2} height={2.3} rx={0.8} className={r === 2 && c === 2 ? "key-go" : "key"} />);
  return (
    <g>
      <Halo x={x0} y={y0} w={w} d={d} grow={4} />
      <RBox x={x0} y={y0} w={w} d={d} r={3.5} z={0} h={h} seams={[4, h - 5]} />
      {/* top: payment screen and keypad */}
      <RBox x={x0 + 3} y={y0 + 3} w={w - 6} d={20} r={2} z={h} h={1} t="bezel" l="lol" rt="lor" />
      <g transform={onTop(x0, y0, h + 1)}>
        <rect x={5} y={5} width={w - 10} height={16} rx={1.4} className="ds-glass" />
        <circle cx={10.4} cy={13} r={3.3} className="pay-ok" />
        <path className="pay-check" d="M8.9 13l1.1 1.1 2-2.2" />
        <text x={15.6} y={12.4} className="pay-t">
          Paid
        </text>
        <text x={15.6} y={15.8} className="mono">
          $48.00
        </text>
      </g>
      <g transform={onTop(x0, y0, h)}>{keys}</g>
      {/* +y face: lamp and badge; +x face: the slot orders come out of */}
      <g transform={onY(x0 + w / 2, y1, h - 9)}>
        <circle cx={-8} cy={0} r={1.1} className="acc-lamp" style={{ ["--acc" as string]: "var(--color-green)" }} />
        <rect x={-4} y={-1.6} width={13} height={3.2} rx={1.6} className="vent" />
      </g>
      <polygon
        className="h"
        points={pts([
          [x1, SLOT.y0, SLOT.z0],
          [x1, SLOT.y1, SLOT.z0],
          [x1, SLOT.y1, SLOT.z1],
          [x1, SLOT.y0, SLOT.z1],
        ])}
      />
      <Box b={[x1, SLOT.y0 - 2, SLOT.z1, x1 + 3, SLOT.y1 + 2, SLOT.z1 + 2]} t="t" l="l" r="r" />
    </g>
  );
}

/* ------------------------------------------------------------------ hub */

/** Greep bag-face mark (components/ui/Logo.tsx), drawn flat in local units. */
function GreepMark({ s }: { s: number }) {
  return (
    <g transform={`scale(${s}) translate(-254 -261)`}>
      <path
        fillRule="evenodd"
        className="logo-bag"
        d="M332.036 269.731C376.56 269.731 412.653 305.825 412.653 350.348V355.494L412.652 356.016C412.371 400.299 376.386 436.112 332.036 436.112H176.607C132.083 436.112 95.9896 400.018 95.9896 355.494V350.348C95.9896 305.825 132.083 269.731 176.607 269.731H332.036ZM176.607 314.988C157.078 314.988 141.246 330.819 141.246 350.348V355.494C141.246 375.023 157.078 390.855 176.607 390.855H332.036C351.565 390.855 367.397 375.023 367.397 355.494V350.348C367.397 330.819 351.565 314.988 332.036 314.988H176.607Z"
      />
      <path
        className="logo-ink"
        d="M251.881 86C288.932 86 324.635 99.1019 352.786 122.742L382.719 90.552L400.713 110.605L370.548 140.244C395.113 168.638 408.761 205.022 408.761 242.815H359.81C359.81 214.211 348.442 186.777 328.203 166.548C307.963 146.318 280.509 134.951 251.881 134.951C223.252 134.951 195.798 146.318 175.558 166.548C155.319 186.777 143.951 214.211 143.951 242.815H95C95 201.221 111.531 161.333 140.953 131.926L141.299 131.582C170.687 102.39 210.44 86 251.881 86Z"
      />
      <path className="logo-ink" d="M208.405 206.002C214.745 206.002 219.884 211.142 219.884 217.481V242.815H196.926V217.481C196.926 211.142 202.066 206.002 208.405 206.002Z" />
      <path className="logo-ink" d="M299.314 206.002C305.654 206.002 310.793 211.142 310.793 217.481V242.815H287.835V217.481C287.835 211.142 292.974 206.002 299.314 206.002Z" />
    </g>
  );
}

const holeQuad: V3[] = [
  [HUB_X, HOLE.y0, HOLE.z0],
  [HUB_X, HOLE.y1, HOLE.z0],
  [HUB_X, HOLE.y1, HOLE.z1],
  [HUB_X, HOLE.y0, HOLE.z1],
];
export const HOLE_PTS = pts(holeQuad);

/** The hub body up to (not including) the tunnel contents. */
export function HubBody() {
  const { x0, x1, y0, y1, z0, z1 } = HUB;
  const w = x1 - x0;
  const d = y1 - y0;
  const lidZ = z1;
  return (
    <g>
      <Halo x={x0 - 2} y={y0 - 2} w={w + 4} d={d + 4} grow={5} />
      {/* plinth and feet */}
      <RBox x={x0 - 2} y={y0 - 2} w={w + 4} d={d + 4} r={4.5} z={0} h={z0} t="lot" l="lol" rt="lor" />
      {/* body */}
      <RBox x={x0} y={y0} w={w} d={d} r={4} z={z0} h={lidZ - z0} seams={[z0 + 4]} />
      {/* lid */}
      <RBox x={x0 - 1} y={y0 - 1} w={w + 2} d={d + 2} r={4.6} z={lidZ} h={4} />
      {/* lid top: screws, badge with the mark, status lamp */}
      <TopScrew x={x0 + 3} y={y0 + 3} z={lidZ + 4} />
      <TopScrew x={x1 - 3} y={y0 + 3} z={lidZ + 4} />
      <TopScrew x={x1 - 3} y={y1 - 3} z={lidZ + 4} />
      <TopScrew x={x0 + 3} y={y1 - 3} z={lidZ + 4} />
      <RBox x={-14} y={-5} w={28} d={28} r={5} z={lidZ + 4} h={1} t="badge" l="badgel" rt="badger" />
      <g transform={onTop(0, 9, lidZ + 5)}>
        <GreepMark s={0.058} />
      </g>
      <g transform={onTop(x1 - 7, y0 + 9, lidZ + 4)}>
        <circle r={2.2} className="lamp-ring" />
        <circle r={1.3} className="lamp" data-hub-lamp />
      </g>
      {/* +y face: vents, label plate, chat port */}
      <g transform={onY(0, y1, lidZ)}>
        {[6, 9.5, 13].map((v) => (
          <rect key={v} x={-19} y={v} width={15} height={1.6} rx={0.8} className="vent" />
        ))}
        <rect x={1} y={5} width={17} height={10} rx={1} className="plate" />
        <path className="kf" d="M3.5 8.2H14M3.5 10.6H11M3.5 13H12.5" />
        <circle cx={16} cy={8.2} r={0.7} className="plate-dot" />
        <circle cx={16} cy={lidZ - 12} r={2.3} className="port" />
        <circle cx={16} cy={lidZ - 12} r={1.1} className="port-in" />
      </g>
      {/* +x face: hole frame and two cable ports */}
      <polygon className="h" points={HOLE_PTS} />
      <g transform={onX(x1, 0, lidZ)}>
        {[lidZ - 14, lidZ - 22].map((v) => (
          <g key={v}>
            <circle cx={10} cy={v} r={2.3} className="port" />
            <circle cx={10} cy={v} r={1.1} className="port-in" />
          </g>
        ))}
      </g>
    </g>
  );
}

/** Light spill, frame and visor at the tunnel mouth (drawn over the tunnel). */
export function HubMouth() {
  const { z0, z1 } = HOLE;
  return (
    <g>
      <polygon className="mouth" points={HOLE_PTS} />
      {/* visor over the mouth with its scan light */}
      <Box b={[HUB_X, HOLE.y0 - 3, z1, HUB_X + 5, HOLE.y1 + 3, z1 + 2.6]} t="t" l="l" r="r" />
      <polygon className="scan" data-scan points={pts([[HUB_X + 5, HOLE.y0 - 3, z1 + 0.7], [HUB_X + 5, HOLE.y1 + 3, z1 + 0.7], [HUB_X + 5, HOLE.y1 + 3, z1 + 1.7], [HUB_X + 5, HOLE.y0 - 3, z1 + 1.7]])} />
      <path className="k" d={seg([HUB_X, HOLE.y1, z0], [HUB_X, HOLE.y1, z1])} />
    </g>
  );
}

/** What you see inside the tunnel: dark walls, a light curtain. */
export function TunnelBack() {
  const { y0, y1, z0, z1 } = HOLE;
  return (
    <g>
      <polygon className="h" points={HOLE_PTS} />
      <polygon className="hin" points={pts([[HUB_X - 30, y0, z0], [HUB_X, y0, z0], [HUB_X, y0, z1], [HUB_X - 30, y0, z1]])} />
    </g>
  );
}
export function TunnelLight() {
  const { y0, y1, z1 } = HOLE;
  return <polygon className="curtain" data-curtain points={pts([[HUB_X - 3, y0, ZB], [HUB_X - 3, y1, ZB], [HUB_X - 3, y1, z1], [HUB_X - 3, y0, z1]])} />;
}

/** Green spill on the belt just outside the mouth. */
export function BeltGlow() {
  const a = P(HUB_X, YC, ZB);
  const b = P(HUB_X + 44, YC, ZB);
  return (
    <g>
      <linearGradient id="ds-spill" gradientUnits="userSpaceOnUse" x1={r2(a[0])} y1={r2(a[1])} x2={r2(b[0])} y2={r2(b[1])}>
        <stop offset="0" stopColor="var(--color-lime)" stopOpacity=".75" />
        <stop offset="1" stopColor="var(--color-lime)" stopOpacity="0" />
      </linearGradient>
      <polygon data-spill className="spill" points={pts([[HUB_X, BELT.y0, ZB + 0.05], [HUB_X + 44, BELT.y0, ZB + 0.05], [HUB_X + 44, BELT.y1, ZB + 0.05], [HUB_X, BELT.y1, ZB + 0.05]])} fill="url(#ds-spill)" />
    </g>
  );
}

/* ------------------------------------------------------------------ wires */

export function Wire({ path, id, ends = "both" }: { path: V3[]; id: string; ends?: "both" | "end" }) {
  const a = P(...path[0]);
  const b = P(...path[path.length - 1]);
  return (
    <g>
      <path className="wire-shadow" d={dOf(path)} />
      <path className="wire" d={dOf(path)} data-wire={id} />
      {ends === "both" && <circle cx={r2(a[0])} cy={r2(a[1])} r={1} className="term" />}
      <circle cx={r2(b[0])} cy={r2(b[1])} r={1} className="term" />
    </g>
  );
}

/* ------------------------------------------------------------------ side machines */

/**
 * A small bench instrument: base on four feet, a neck, and an upright monitor
 * facing +y. Screen content is drawn in the monitor plane.
 */
export function Machine({
  m,
  accent,
  children,
  port,
  knob,
}: {
  m: { x: number; y: number; w: number; d: number; H: number };
  accent: string;
  children: ReactNode;
  port: { face: "x" | "y"; at: number };
  knob?: boolean;
}) {
  const { x, y, w, d, H } = m;
  const zb = 1.4;
  const hb = 10;
  const ztop = zb + hb;
  const my0 = y + 4;
  const my1 = y + 7;
  const mz0 = 15;
  const gw = w - 8;
  const gh = H - 7;
  return (
    <g style={{ ["--acc" as string]: accent }}>
      <Halo x={x} y={y} w={w} d={d} grow={4} />
      {/* feet */}
      {[
        [x + 4, y + 4],
        [x + w - 4, y + 4],
        [x + 4, y + d - 4],
        [x + w - 4, y + d - 4],
      ].map(([fx, fy]) => (
        <Box key={`${fx},${fy}`} b={[fx - 2, fy - 2, 0, fx + 2, fy + 2, zb]} t="lot" l="lol" r="lor" />
      ))}
      <RBox x={x} y={y} w={w} d={d} r={3} z={zb} h={hb} seams={[zb + 3.5]} />
      {/* top: vents behind the neck, lamp and knob in front */}
      <g transform={onTop(x, y, ztop)}>
        <rect x={w - 14} y={d - 9} width={8} height={2.6} rx={1.3} className="key" />
        <circle cx={7} cy={d - 6} r={1.4} className="acc-lamp" />
      </g>
      {knob && (
        <g>
          <RBox x={x + w - 26} y={y + d - 9} w={6} d={6} r={3} z={ztop} h={2} t="t" l="l" rt="r" />
          <path className="k" d={seg([x + w - 23, y + d - 6, ztop + 2], [x + w - 21, y + d - 6, ztop + 2])} />
        </g>
      )}
      {/* port on a visible face */}
      {port.face === "x" ? (
        <g transform={onX(x + w, port.at, 6)}>
          <circle r={2} className="port" />
          <circle r={0.9} className="port-in" />
        </g>
      ) : (
        <g transform={onY(port.at, y + d, 6)}>
          <circle r={2} className="port" />
          <circle r={0.9} className="port-in" />
        </g>
      )}
      {/* neck and monitor */}
      <Box b={[x + w / 2 - 5, my0 + 0.5, ztop, x + w / 2 + 5, my1 - 0.5, mz0 + 1]} t="m" l="l" r="r" />
      <RBox x={x + 2} y={my0} w={w - 4} d={my1 - my0} r={1.2} z={mz0} h={H} />
      <g transform={onY(x + 4, my1, mz0 + H - 2.5)}>
        <rect width={gw} height={gh} rx={2.2} className="ds-glass" />
        <g>{children}</g>
        <rect width={gw} height={gh} rx={2.2} className="glass-edge" />
      </g>
      {/* little camera dot on the bezel */}
      <g transform={onY(x + w / 2, my1, mz0 + 1.6)}>
        <circle r={0.6} className="bolt" />
      </g>
    </g>
  );
}

const Check = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path className="check" d={`M${x - 1.1 * s} ${y}l${0.8 * s} ${0.85 * s}l${1.5 * s} -${1.7 * s}`} />
);

export function StatusScreen() {
  const rows = [14.5, 21.5, 28.5, 35.5];
  const times = ["9:41", "11:02", "2:15", "4:30"];
  return (
    <g className="status" data-step={0}>
      <text x={3} y={6.2} className="mono">
        ORDER
      </text>
      <text x={12.4} y={6.3} className="sc-strong">
        #GR-2041
      </text>
      <circle cx={40} cy={5} r={1.1} className="live" />
      <path className="sc-rule" d="M3 9H41" />
      <path className="track" d={`M6 ${rows[0]}V${rows[3]}`} />
      <path className="track-on" d={`M6 ${rows[0]}V${rows[3]}`} pathLength={3} />
      {rows.map((v, i) => (
        <g key={i} className="row" data-i={i}>
          <circle cx={6} cy={v} r={2.3} className="dot" />
          <circle cx={6} cy={v} r={3.6} className="halo-ring" />
          <Check x={6} y={v} s={0.95} />
          <text x={11} y={v + 1.4} className="label">
            {STEPS[i]}
          </text>
          <text x={41} y={v + 1.1} className="time" textAnchor="end">
            {times[i]}
          </text>
        </g>
      ))}
    </g>
  );
}

export function ChatScreen() {
  return (
    <g className="chat" data-c={0}>
      <circle cx={5.2} cy={5} r={3} className="avatar" />
      <text x={5.2} y={6.2} className="avatar-t" textAnchor="middle">
        A
      </text>
      <text x={10.4} y={4.6} className="sc-strong">
        Ada&apos;s Store
      </text>
      <circle cx={11} cy={7.4} r={0.7} className="live" />
      <text x={12.6} y={8.2} className="mono">
        online
      </text>
      <path className="sc-rule" d="M3 10.5H51" />
      <g className="typing">
        <rect x={3} y={13} width={13} height={6.4} rx={3.2} className="bub-in" />
        {[6.6, 9.5, 12.4].map((cx, i) => (
          <circle key={cx} cx={cx} cy={16.2} r={0.8} className="tdot" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </g>
      <g className="b1">
        <rect x={3} y={13} width={35} height={7} rx={3.5} className="bub-in" />
        <text x={6} y={17.7} className="bub-t">
          Sending it today!
        </text>
      </g>
      <g className="b2">
        <rect x={25} y={23} width={26} height={7} rx={3.5} className="bub-out" />
        <text x={28} y={27.7} className="bub-t out">
          Thank you 🙏
        </text>
      </g>
      <text x={51} y={33.5} className="mono seen" textAnchor="end">
        Seen
      </text>
      <rect x={3} y={34.6} width={42} height={4} rx={2} className="composer" />
      <circle cx={48.6} cy={36.6} r={2} className="send" />
    </g>
  );
}

const STAR = "M0 -1.9L.56 -.6L1.9 -.6L.82 .24L1.18 1.6L0 .8L-1.18 1.6L-.82 .24L-1.9 -.6L-.56 -.6Z";
export function ReviewsScreen() {
  const bars = [0.86, 0.09, 0.03, 0.01, 0.01];
  return (
    <g className="reviews" data-r={0}>
      <text x={3} y={13} className="score">
        4.9
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${5 + i * 4.5} 17.6) scale(1.05)`}>
          <path d={STAR} className="star-bg" />
          <path d={STAR} className="star" data-i={i} />
        </g>
      ))}
      <text x={3} y={24} className="mono">
        312 reviews
      </text>
      {bars.map((b, i) => (
        <g key={i}>
          <text x={28} y={5.8 + i * 4.2} className="mono">
            {5 - i}
          </text>
          <rect x={31} y={4.2 + i * 4.2} width={17} height={1.8} rx={0.9} className="bar-bg" />
          <rect x={31} y={4.2 + i * 4.2} width={Math.max(17 * b, 1.8)} height={1.8} rx={0.9} className="bar" style={{ transitionDelay: `${i * 0.08}s` }} />
        </g>
      ))}
      <path className="sc-rule" d="M3 27.5H48" />
      <g className="quote">
        <circle cx={5} cy={30.6} r={1.6} className="q-av" />
        <text x={8} y={31.8} className="q-t">
          Great quality, came fast!
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ house */

export function HouseBack() {
  const { x0, x1, y0, y1, h } = HOUSE;
  const siding: string[] = [];
  for (let z = 4; z < h; z += 4) {
    siding.push(seg([x1, y0, z], [x1, y1, z]));
    siding.push(seg([x0, y1, z], [x1, y1, z]));
  }
  return (
    <g>
      <Halo x={x0 - 2} y={y0 - 2} w={x1 - x0 + 4} d={y1 - y0 + 4} grow={6} />
      <Box b={[x0, y0, 0, x1, y1, h]} t="t" l="wall-l" r="wall-r" top={false} />
      <path className="siding" d={siding.join("")} />
      {/* base trim */}
      <Box b={[x0 - 0.6, y0 - 0.6, 0, x1 + 0.6, y1 + 0.6, 2.4]} t="lot" l="lol" r="lor" top={false} />
    </g>
  );
}

const DOOR_QUAD: V3[] = [
  [DOOR.x0, 0, DOOR.z0],
  [DOOR.x1, 0, DOOR.z0],
  [DOOR.x1, 0, DOOR.z1],
  [DOOR.x0, 0, DOOR.z1],
];
export const DOOR_PTS = pts(DOOR_QUAD);

export function Doorway() {
  return (
    <g>
      <polygon className="h ns" points={DOOR_PTS} />
      {/* floor inside, catching the porch light */}
      <polygon className="inside-floor ns" points={pts([[DOOR.x0, -14, DOOR.z0], [DOOR.x1, -14, DOOR.z0], [DOOR.x1, 0, DOOR.z0], [DOOR.x0, 0, DOOR.z0]])} />
    </g>
  );
}

/** The swinging door leaf, as a polygon the live loop rewrites. */
export function DoorLeaf() {
  return (
    <g>
      <polygon data-door className="door" points={DOOR_PTS} />
      <circle data-knob r={0.9} className="knob" cx={0} cy={0} />
    </g>
  );
}

export function HouseFront() {
  const { x0, x1, y0, y1, h } = HOUSE;
  const eave = 4;
  const ridgeY = (y0 + y1) / 2;
  const ridgeZ = h + 20;
  const rx0 = x0 - 3;
  const rx1 = x1 + 3;
  const shingles: string[] = [];
  for (let k = 1; k < 6; k++) {
    const s = k / 6;
    const y = y1 + eave + (ridgeY - (y1 + eave)) * s;
    const z = h - 2 + (ridgeZ - (h - 2)) * s;
    shingles.push(seg([rx0, y, z], [rx1, y, z]));
  }
  // chimney rising from the back slope
  const cy0 = -38;
  const cy1 = -30;
  const backZ = (y: number) => h - 2 + (ridgeZ - (h - 2)) * ((y - (y0 - eave)) / (ridgeY - (y0 - eave)));
  return (
    <g>
      {/* door frame */}
      <path className="trim" d={dOf([[DOOR.x0 - 1.2, 0, DOOR.z0], [DOOR.x0 - 1.2, 0, DOOR.z1 + 1.2], [DOOR.x1 + 1.2, 0, DOOR.z1 + 1.2], [DOOR.x1 + 1.2, 0, DOOR.z0]])} />
      {/* front window */}
      <g transform={onY(180, 0, 30)}>
        <rect width={16} height={12} className="win" />
        <path className="win-bar" d="M8 0V12M0 6H16" />
        <rect width={16} height={12} className="win-frame" />
      </g>
      <Box b={[179, 0, 17, 197, 1.6, 18]} t="t" l="l" r="r" />
      {/* side window and porch lamp */}
      <g transform={onX(x1, -14, 30)}>
        <rect width={18} height={12} className="win" />
        <path className="win-bar" d="M9 0V12M0 6H18" />
        <rect width={18} height={12} className="win-frame" />
      </g>
      <g transform={onY(176.5, 0, 28)}>
        <rect x={-1.2} y={0} width={2.4} height={3.4} rx={0.6} className="lampbox" />
        <circle cx={0} cy={1.7} r={0.8} className="porchlamp" />
      </g>
      {/* gable */}
      <polygon className="wall-r" points={pts([[x1, y0, h], [x1, y1, h], [x1, ridgeY, ridgeZ - 1.5]])} />
      <path className="siding" d={seg([x1, y0 + 12, h + 4], [x1, y1 - 12, h + 4])} />
      <g transform={onX(x1, ridgeY, h + 10)}>
        <circle r={2.4} className="win" />
        <circle r={2.4} className="win-frame" />
      </g>
      {/* roof: back slope, chimney, front slope, ridge */}
      <polygon className="roof-b" points={pts([[rx0, ridgeY, ridgeZ], [rx1, ridgeY, ridgeZ], [rx1, y0 - eave, h - 2], [rx0, y0 - eave, h - 2]])} />
      <polygon className="roof-r" points={pts([[rx1, ridgeY, ridgeZ], [rx1, y0 - eave, h - 2], [rx1, y0 - eave, h - 4], [rx1, ridgeY, ridgeZ - 2]])} />
      <polygon className="brick-l" points={pts([[186, cy1, backZ(cy1)], [194, cy1, backZ(cy1)], [194, cy1, 64], [186, cy1, 64]])} />
      <polygon className="brick-r" points={pts([[194, cy0, backZ(cy0)], [194, cy1, backZ(cy1)], [194, cy1, 64], [194, cy0, 64]])} />
      <Box b={[185, cy0 - 1, 64, 195, cy1 + 1, 66]} t="t" l="l" r="r" />
      <polygon className="roof-f" points={pts([[rx0, y1 + eave, h - 2], [rx1, y1 + eave, h - 2], [rx1, ridgeY, ridgeZ], [rx0, ridgeY, ridgeZ]])} />
      <path className="shingle" d={shingles.join("")} />
      <polygon className="roof-r" points={pts([[rx1, y1 + eave, h - 2], [rx1, ridgeY, ridgeZ], [rx1, ridgeY, ridgeZ - 2], [rx1, y1 + eave, h - 4]])} />
      <polygon className="roof-l" points={pts([[rx0, y1 + eave, h - 2], [rx1, y1 + eave, h - 2], [rx1, y1 + eave, h - 4], [rx0, y1 + eave, h - 4]])} />
      <Box b={[rx0 - 0.4, ridgeY - 1.2, ridgeZ - 0.4, rx1 + 0.4, ridgeY + 1.2, ridgeZ + 1]} t="ridge" l="ridge-l" r="ridge-r" />
    </g>
  );
}

export function Porch() {
  const { x0, x1, y0, y1, h } = DECK;
  const planks: string[] = [];
  for (let x = x0 + 6; x < x1; x += 6) planks.push(seg([x, y0, h], [x, y1, h]));
  return (
    <g>
      <Halo x={x0} y={y0} w={x1 - x0} d={y1 - y0 + 6} grow={3} />
      <Box b={[x0, y0, 0, x1, y1, h]} t="deck" l="deck-l" r="deck-r" />
      <path className="plank" d={planks.join("")} />
      {/* steps */}
      <Box b={[154, y1, 0, 176, y1 + 6, h / 2]} t="deck" l="deck-l" r="deck-r" />
      {/* welcome mat */}
      <polygon className="mat ns" points={pts([[153, 2, h + 0.05], [175, 2, h + 0.05], [175, 22, h + 0.05], [153, 22, h + 0.05]])} />
      <polygon className="mat-in ns" points={pts([[155, 4, h + 0.06], [173, 4, h + 0.06], [173, 20, h + 0.06], [155, 20, h + 0.06]])} />
      {/* planter */}
      <Box b={[194, 16, h, 202, 24, h + 6]} t="pot-t" l="pot-l" r="pot-r" />
      <polygon className="soil ns" points={pts([[195, 17, h + 6.01], [201, 17, h + 6.01], [201, 23, h + 6.01], [195, 23, h + 6.01]])} />
      {[
        [196.5, 19, 9, -3],
        [199.5, 18.5, 11, 2],
        [198, 21.5, 8, 0],
      ].map(([lx, ly, lh, lean], i) => {
        const [a, b] = P(lx, ly, h + 6);
        return <ellipse key={i} className="leaf" cx={r2(a + lean)} cy={r2(b - lh / 2)} rx={2.4} ry={lh / 2} transform={`rotate(${lean * 4} ${r2(a)} ${r2(b)})`} />;
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ order items (defs) */

const KRAFT = (
  <>
    <Box b={[-HALF, -HALF, 0, HALF, HALF, 11]} t="pt" l="pl" r="pr" />
    {/* green Greep tape across the top and down the +x face */}
    <polygon className="tape ns" points={pts([[-HALF, -1.7, 11.02], [HALF, -1.7, 11.02], [HALF, 1.7, 11.02], [-HALF, 1.7, 11.02]])} />
    <polygon className="tape-s ns" points={pts([[HALF + 0.02, -1.7, 0], [HALF + 0.02, 1.7, 0], [HALF + 0.02, 1.7, 11], [HALF + 0.02, -1.7, 11]])} />
    <path className="crease" d={seg([-HALF, HALF, 11], [HALF, HALF, 11])} />
    {/* shipping label */}
    <g transform={onTop(-HALF, -HALF, 11)}>
      <rect x={9.4} y={3} width={5.4} height={4.2} rx={0.5} className="label-t" />
      <path className="label-l" d="M10.4 4.4H13.6M10.4 5.8H12.6" />
    </g>
    <g transform={onY(-HALF, HALF, 11)}>
      <path className="label-l" d="M2 3.2l1.2 1.2 1.2-1.2M3.2 4.4V6.4" />
    </g>
  </>
);

function Receipt({ band }: { band?: string }) {
  const teeth: [number, number][] = [];
  for (let i = 0; i <= 8; i++) teeth.push([7 - i * 1.75, i % 2 ? 7.9 : 9]);
  const top: V3[] = [[-7, -9, 0.7], [7, -9, 0.7], ...teeth.map(([x, y]) => [x, y, 0.7] as V3)];
  const side: V3[] = [...teeth.map(([x, y]) => [x, y, 0.7] as V3), ...[...teeth].reverse().map(([x, y]) => [x, y, 0] as V3)];
  return (
    <g>
      <polygon className="paper-l" points={pts(side)} />
      <polygon className="paper-r" points={pts([[7, -9, 0], [7, 9, 0], [7, 9, 0.7], [7, -9, 0.7]])} />
      <polygon className="paper" points={pts(top)} />
      <g transform={onTop(-7, -9, 0.7)}>
        {band && <rect x={0} y={0} width={14} height={3} className="band" style={{ fill: band }} />}
        <path className="ink-l" d="M2.2 5.6H8.6M2.2 7.6H10.4M2.2 9.6H7.4" />
        <path className="ink-d" d="M2.2 11.6H11.8" />
        <path className="ink-b" d="M2.2 13.6H5.4" />
        <path className="ink-g" d="M8.4 13.6H11.8" />
      </g>
    </g>
  );
}

function Card({ c }: { c: string }) {
  return (
    <g style={{ ["--card" as string]: c }}>
      <Box b={[-9, -6, 0, 9, 6, 1.3]} t="card-t" l="card-l" r="card-r" />
      <g transform={onTop(-9, -6, 1.3)}>
        <rect x={2.4} y={3} width={4} height={3} rx={0.6} className="chip" />
        <path className="card-ink" d="M2.4 8.6H5.2M6.6 8.6H9.4M10.8 8.6H13.6" />
        <path className="card-ink" d="M13 3.2a2.2 2.2 0 0 1 0 2.6M14.4 2.6a3.4 3.4 0 0 1 0 3.8" />
      </g>
    </g>
  );
}

export const ITEM_KINDS = [
  <Receipt key="0" band="var(--color-orange)" />,
  <Card key="1" c="var(--color-violet)" />,
  <Receipt key="2" />,
  <Card key="3" c="var(--color-green)" />,
  <Receipt key="4" band="var(--color-sky)" />,
];

export const ParcelArt = () => KRAFT;

