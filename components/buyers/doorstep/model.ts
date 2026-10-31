/*
 * The order line, as one pure timing model. Everything the figure shows
 * (belt, parcels, door, status screen, readout) is read from here.
 *
 * Five orders ride the belt, one every T seconds, so the whole picture
 * repeats every L = N * T seconds with no seam.
 */

export const V = 28; // belt speed, world units per second
export const T = 2.6; // seconds between orders
export const N = 5; // orders on the line
export const L = N * T; // loop length (13 s)

export const X0 = -134; // orders start inside the checkout terminal
export const PRN_X = -122; // terminal face
export const XE = 140; // belt end
export const XF = 144; // parcel tips off here
export const YC = 12; // lane centre (across the belt)
export const ZB = 15; // belt top
export const ZD = 10; // porch deck top
export const HUB_X = 24; // hub exit face
export const DOOR_Y = 0; // house front wall
export const XD = 164; // parcel stops in front of the door
export const HALF = 8; // half a parcel
export const SLAT = 7; // belt slat pitch

export const TF = (XF - X0) / V; // leaves the belt
export const FALL = 0.25;
export const TL = TF + FALL; // lands on the porch
export const XL = XF + V * FALL;
export const SLIDE = (2 * (XD - XL)) / V; // decelerates to a stop at the door
export const TS = TL + SLIDE; // settled
export const IN0 = TS + 0.5; // starts going inside
export const IN1 = TS + 1.05; // fully inside

export const tAtX = (x: number) => (x - X0) / V;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (v: number) => {
  const s = clamp01(v);
  return s * s * (3 - 2 * s);
};
const inOut = (v: number) => {
  const s = clamp01(v);
  return s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;
};

export type Phase = "belt" | "fall" | "porch" | "in" | "gone";
export interface Parcel {
  phase: Phase;
  x: number;
  y: number;
  z: number;
  a: number; // opacity
}

/** Where order i is, tau seconds into its own life. */
export function parcelAt(tau: number): Parcel {
  if (tau < TF) {
    const x = X0 + V * tau;
    return { phase: "belt", x, y: YC, z: ZB, a: 1 };
  }
  if (tau < TL) {
    const s = (tau - TF) / FALL;
    return { phase: "fall", x: XF + V * (tau - TF), y: YC, z: ZB - (ZB - ZD) * s * s, a: 1 };
  }
  if (tau < TS) {
    const s = tau - TL;
    const x = XL + V * s - 0.5 * (V / SLIDE) * s * s;
    const hop = s < 0.42 ? 1.5 * Math.abs(Math.sin((s / 0.21) * Math.PI)) * Math.exp(-s * 7) : 0;
    return { phase: "porch", x, y: YC, z: ZD + hop, a: 1 };
  }
  if (tau < IN0) return { phase: "porch", x: XD, y: YC, z: ZD, a: 1 };
  if (tau < IN1) {
    const s = inOut((tau - IN0) / (IN1 - IN0));
    return { phase: "in", x: XD, y: YC - 34 * s, z: ZD, a: 1 };
  }
  return { phase: "gone", x: XD, y: YC - 34, z: ZD, a: 0 };
}

/** Door swing in degrees for one order's life (0 shut, ~84 open). */
export function doorAt(tau: number) {
  return 84 * smooth((tau - TS - 0.1) / 0.36) * (1 - smooth((tau - IN1 + 0.02) / 0.32));
}

/** Featured order's status step: 0 Paid, 1 Packed, 2 On the way, 3 Delivered. */
export const STEP_AT = [0, tAtX(0), tAtX(78), TL];
export function stepAt(tau: number) {
  if (tau >= STEP_AT[3]) return 3;
  if (tau >= STEP_AT[2]) return 2;
  if (tau >= STEP_AT[1]) return 1;
  return 0;
}

export const STEPS = ["Paid", "Packed", "On the way", "Delivered"] as const;

/** Chat screen stage over a 6.5 s cycle. */
export const CHAT = 6.5;
export function chatAt(c: number) {
  if (c < 0.35) return 0; // empty
  if (c < 1.35) return 1; // seller typing
  if (c < 2.75) return 2; // "Sending it today!"
  if (c < 3.4) return 3; // "Thank you"
  if (c < 6.0) return 4; // seen
  return 5; // clearing
}

/** Reviews screen over the full loop: stars fill, then rest, then clear. */
export function starsAt(r: number) {
  if (r > 11.7) return 0;
  let n = 0;
  for (let k = 0; k < 5; k++) if (r > 0.9 + k * 0.32) n++;
  return n;
}
