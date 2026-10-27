"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

/*
 * How it works, drawn as a small isometric diorama on one tile.
 *
 *   phone (any post) --chute--> greep hub --rail--> vault (held safe)
 *                                   |                   |
 *                                 rail                rail (payout)
 *                                   v                   v
 *   home (you) <------ van on the road ------ market stall (seller)
 *
 * World units: x runs down-right, y runs down-left, z is up. 30 degree isometric.
 * Static art renders once; one rAF loop moves the small things through refs.
 */

type Step = 0 | 1 | 2;
type P3 = readonly [number, number, number];

const K = Math.cos(Math.PI / 6);
const P = (x: number, y: number, z = 0): [number, number] => [(x - y) * K, (x + y) / 2 - z];
const n1 = (v: number) => {
  const s = (Math.round(v * 10) / 10).toString();
  return s === "-0" ? "0" : s;
};
const pts = (list: readonly P3[]) =>
  list
    .map(([x, y, z]) => {
      const [a, b] = P(x, y, z);
      return `${n1(a)},${n1(b)}`;
    })
    .join(" ");
const line = (a: P3, b: P3) => {
  const [x1, y1] = P(...a);
  const [x2, y2] = P(...b);
  return `M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}`;
};
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

type Tone = "t" | "l" | "r" | "h" | "ac" | "acd" | "act" | "pt" | "pl" | "pr" | "tile" | "tl" | "tr" | "road" | "scr" | "glass" | "tn";

function Box({ a, b, t = "t", l = "l", r = "r" }: { a: P3; b: P3; t?: Tone; l?: Tone; r?: Tone }) {
  const [x0, y0, z0] = a;
  const [x1, y1, z1] = b;
  return (
    <>
      <polygon className={l} points={pts([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])} />
      <polygon className={r} points={pts([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])} />
      <polygon className={t} points={pts([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])} />
    </>
  );
}

/** A rectangle lying on a wall. face "x": plane x = at, u = y. face "y": plane y = at, u = x. */
function wall(face: "x" | "y", at: number, u0: number, u1: number, z0: number, z1: number): P3[] {
  return face === "x"
    ? [[at, u0, z0], [at, u1, z0], [at, u1, z1], [at, u0, z1]]
    : [[u0, at, z0], [u1, at, z0], [u1, at, z1], [u0, at, z1]];
}
const onWall = (face: "x" | "y", at: number, u: number, z: number, out = 0): P3 =>
  face === "x" ? [at + out, u, z] : [u, at + out, z];

/** A circle drawn on a wall plane, as a polygon. */
function wallCircle(face: "x" | "y", at: number, cu: number, cz: number, r: number, n = 40): P3[] {
  const out: P3[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    out.push(onWall(face, at, cu + r * Math.cos(t), cz + r * Math.sin(t)));
  }
  return out;
}

/** Opening in a wall: dark hole, a lintel line and a sill. */
function Opening({ face, at, u0, u1, z0, z1 }: { face: "x" | "y"; at: number; u0: number; u1: number; z0: number; z1: number }) {
  return <polygon className="h" points={pts(wall(face, at + 0.01, u0, u1, z0, z1))} />;
}

/** Window: frame, glass and a mullion. */
function Win({ face, at, u0, u1, z0, z1, lit }: { face: "x" | "y"; at: number; u0: number; u1: number; z0: number; z1: number; lit?: boolean }) {
  const um = (u0 + u1) / 2;
  return (
    <>
      <polygon className={lit ? "lit" : "glass"} points={pts(wall(face, at + 0.01, u0, u1, z0, z1))} />
      <path className="kf" d={line(onWall(face, at, um, z0, 0.02), onWall(face, at, um, z1, 0.02))} />
      <path className="k" d={line(onWall(face, at, u0 - 0.6, z0, 0.6), onWall(face, at, u1 + 0.6, z0, 0.6))} />
    </>
  );
}

/** Striped awning hanging off a wall. Stripes alternate accent and paper. */
function Awning({
  face,
  at,
  u0,
  u1,
  zt,
  out,
  drop,
  stripes,
  valance = 3,
}: {
  face: "x" | "y";
  at: number;
  u0: number;
  u1: number;
  zt: number;
  out: number;
  drop: number;
  stripes: number;
  valance?: number;
}) {
  const w = (u1 - u0) / stripes;
  const zl = zt - drop;
  const slope: React.ReactNode[] = [];
  const front: React.ReactNode[] = [];
  for (let i = 0; i < stripes; i++) {
    const a = u0 + i * w;
    const b = a + w;
    const cls = i % 2 === 0 ? "ac" : "t";
    const clsF = i % 2 === 0 ? "acd" : "l";
    slope.push(<polygon key={`s${i}`} className={cls} points={pts([onWall(face, at, a, zt), onWall(face, at, b, zt), onWall(face, at, b, zl, out), onWall(face, at, a, zl, out)])} />);
    // scalloped valance: each stripe ends in a shallow point
    const m = (a + b) / 2;
    front.push(
      <polygon
        key={`v${i}`}
        className={clsF}
        points={pts([onWall(face, at, a, zl, out), onWall(face, at, b, zl, out), onWall(face, at, b, zl - valance, out), onWall(face, at, m, zl - valance - 1.6, out), onWall(face, at, a, zl - valance, out)])}
      />,
    );
  }
  const cheek = pts([onWall(face, at, u1, zt), onWall(face, at, u1, zl, out), onWall(face, at, u1, zl - valance, out), onWall(face, at, u1, zt - 1.2)]);
  return (
    <g>
      {slope}
      {front}
      <polygon className="acd" points={cheek} />
    </g>
  );
}

/** Rounded rectangle profile in the (y, z) plane. */
function roundedYZ(y0: number, y1: number, z0: number, z1: number, r: number, seg = 4): [number, number][] {
  const c: [number, number, number][] = [
    [y1 - r, z1 - r, 0],
    [y0 + r, z1 - r, 90],
    [y0 + r, z0 + r, 180],
    [y1 - r, z0 + r, 270],
  ];
  const out: [number, number][] = [];
  for (const [cy, cz, start] of c) {
    for (let i = 0; i <= seg; i++) {
      const t = ((start + (90 * i) / seg) * Math.PI) / 180;
      out.push([cy + r * Math.cos(t), cz + r * Math.sin(t)]);
    }
  }
  return out;
}

/** A slab whose profile lies in the (y, z) plane, extruded along x from x0 to x1. Convex profile. */
function PrismX({ x0, x1, prof, front = "r" }: { x0: number; x1: number; prof: [number, number][]; front?: Tone }) {
  const sides: React.ReactNode[] = [];
  const n = prof.length;
  // profile runs counter-clockwise in (y, z): outward normal of edge (a -> b) is (dz, -dy)
  for (let i = 0; i < n; i++) {
    const [ya, za] = prof[i]!;
    const [yb, zb] = prof[(i + 1) % n]!;
    const ny = zb - za;
    const nz = -(yb - ya);
    if (ny + nz <= 1e-6) continue;
    const cls = nz > Math.abs(ny) ? "t" : "l";
    sides.push(<polygon key={i} className={cls} points={pts([[x0, ya, za], [x1, ya, za], [x1, yb, zb], [x0, yb, zb]])} />);
  }
  return (
    <>
      {sides}
      <polygon className={front} points={pts(prof.map(([y, z]) => [x1, y, z] as P3))} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Moving pieces, drawn at the world origin and translated each frame  */
/* ------------------------------------------------------------------ */

function Coin({ z = 0, r = 4.2, h = 1.8 }: { z?: number; r?: number; h?: number }) {
  const rx = r * Math.SQRT2 * K;
  const ry = (r * Math.SQRT2) / 2;
  const top = -(z + h);
  const bot = -z;
  return (
    <>
      <path
        className="cs"
        d={`M${n1(-rx)} ${n1(top)}L${n1(-rx)} ${n1(bot)}A${n1(rx)} ${n1(ry)} 0 0 0 ${n1(rx)} ${n1(bot)}L${n1(rx)} ${n1(top)}A${n1(rx)} ${n1(ry)} 0 0 1 ${n1(-rx)} ${n1(top)}Z`}
      />
      <ellipse className="ct" cx={0} cy={n1(top)} rx={n1(rx)} ry={n1(ry)} />
      <ellipse className="cr" cx={0} cy={n1(top)} rx={n1(rx * 0.62)} ry={n1(ry * 0.62)} />
    </>
  );
}

function CoinStack({ z = 0 }: { z?: number }) {
  return (
    <g>
      <Coin z={z} />
      <Coin z={z + 1.8} />
    </g>
  );
}

/** Flat post card lying on a surface that falls by `slope` per unit of x. */
function Card({ z = 0, slope = 0, accent }: { z?: number; slope?: number; accent: string }) {
  const zz = (x: number) => z + x * slope;
  const c = (x: number, y: number, dz = 0): P3 => [x, y, zz(x) + dz];
  const w = 6;
  const d = 5;
  const th = 1.2;
  return (
    <g style={{ ["--a" as string]: accent }}>
      <polygon className="l" points={pts([c(-w, d), c(w, d), c(w, d, th), c(-w, d, th)])} />
      <polygon className="r" points={pts([c(w, -d), c(w, d), c(w, d, th), c(w, -d, th)])} />
      <polygon className="t" points={pts([c(-w, -d, th), c(w, -d, th), c(w, d, th), c(-w, d, th)])} />
      <polygon className="ac on" points={pts([c(-4.6, 0.2, th), c(-0.6, 0.2, th), c(-0.6, 3.8, th), c(-4.6, 3.8, th)])} />
      <path className="kf" d={line(c(0.8, -3.6, th), c(0.8, 3.6, th)) + line(c(2.6, -3.6, th), c(2.6, 1.6, th)) + line(c(4.4, -3.6, th), c(4.4, 2.6, th))} />
    </g>
  );
}

function Parcel({ s = 1 }: { s?: number }) {
  const w = 3.6 * s;
  const h = 5 * s;
  return (
    <g>
      <Box a={[-w, -w, 0]} b={[w, w, h]} t="pt" l="pl" r="pr" />
      <path className="tape" d={line([0, -w, h], [0, w, h]) + line([0, w, h], [0, w, h * 0.55])} />
    </g>
  );
}

/** Small delivery van, nose toward -x. Origin at the road under its middle. */
function Van() {
  const wheel = (cx: number) => {
    const ring = wallCircle("y", 6.4, cx, 3.6, 3.6, 24);
    const hub = wallCircle("y", 6.5, cx, 3.6, 1.3, 14);
    return (
      <g key={cx}>
        <polygon className="tyre" points={pts(ring)} />
        <polygon className="t" points={pts(hub)} />
      </g>
    );
  };
  return (
    <g>
      <polygon className="shadow" points={pts([[-15, -7, 0], [16, -7, 0], [17, 8, 0], [-14, 8, 0]])} />
      <Box a={[-14, -6, 2]} b={[15, 6, 4.5]} t="r" l="r" r="r" />
      {/* cab, sloped bonnet toward -x */}
      <Box a={[-13, -6, 4.5]} b={[-3, 6, 10]} />
      <polygon className="t" points={pts([[-13, -6, 10], [-6, -6, 14.5], [-6, 6, 14.5], [-13, 6, 10]])} />
      <polygon className="l" points={pts([[-13, 6, 10], [-6, 6, 14.5], [-3, 6, 14.5], [-3, 6, 10]])} />
      <polygon className="t" points={pts([[-6, -6, 14.5], [-3, -6, 14.5], [-3, 6, 14.5], [-6, 6, 14.5]])} />
      <polygon className="glass" points={pts([[-11.4, 6.01, 10.2], [-6.3, 6.01, 13.6], [-3.8, 6.01, 13.6], [-3.8, 6.01, 10.2]])} />
      <path className="kf" d={line([-8, 6.02, 4.8], [-8, 6.02, 10])} />
      {/* cargo box */}
      <Box a={[-3, -6.4, 4.5]} b={[15, 6.4, 19]} />
      <polygon className="ac on" points={pts(wall("y", 6.41, -3, 15, 10.5, 13))} />
      <path className="kf" d={line([15.01, 0, 5], [15.01, 0, 18.5])} />
      <path className="k" d={line([15.6, -6.4, 4.5], [15.6, 6.4, 4.5])} />
      <polygon className="lamp" points={pts(wall("x", 15.02, -5.6, -3.6, 6, 8))} />
      <polygon className="lamp" points={pts(wall("x", 15.02, 3.6, 5.6, 6, 8))} />
      {wheel(-8)}
      {wheel(9)}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Scene layout                                                        */
/* ------------------------------------------------------------------ */

const TILE = { x0: 0, x1: 284, y0: 80, y1: 292 };
const ROAD = { y0: 252, y1: 274 };
const ROAD_Y = (ROAD.y0 + ROAD.y1) / 2;

// tracks: start -> end in world units, items glide along them
const TRACKS = {
  share: { a: [44, 132, 17] as P3, b: [118, 132, 9] as P3, n: 3, speed: 24 },
  hold: { a: [172, 132, 1.6] as P3, b: [206, 132, 1.6] as P3, n: 2, speed: 13 },
  order: { a: [160, 158, 1.6] as P3, b: [160, 208, 1.6] as P3, n: 2, speed: 17 },
  pay: { a: [229, 156, 1.6] as P3, b: [229, 208, 1.6] as P3, n: 2, speed: 17 },
};
type TrackId = keyof typeof TRACKS;
const ACTIVE: Record<TrackId | "see" | "van", Step[]> = {
  see: [0],
  share: [1],
  hold: [1],
  order: [2],
  pay: [2],
  van: [2],
};
const SHARE_SLOPE = (TRACKS.share.b[2] - TRACKS.share.a[2]) / (TRACKS.share.b[0] - TRACKS.share.a[0]);

const lenOf = (id: TrackId) => {
  const { a, b } = TRACKS[id];
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
};
function trackPoint(id: TrackId, s: number): [number, number] {
  const { a, b } = TRACKS[id];
  const L = lenOf(id);
  const f = s / L;
  return P(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
}
const fadeEnds = (s: number, L: number, e = 7) => clamp01(s / e) * clamp01((L - s) / e);

// van timeline over one cycle (0..1)
const VAN = { from: 205, to: 66, cycle: 4 };
function vanAt(u: number) {
  const go = clamp01((u - 0.08) / 0.62);
  const e = go < 0.5 ? 2 * go * go : 1 - Math.pow(-2 * go + 2, 2) / 2;
  const x = VAN.from + (VAN.to - VAN.from) * e;
  const alpha = clamp01(u / 0.08) * clamp01((1 - u) / 0.08);
  const parcel = clamp01((u - 0.74) / 0.06) * clamp01((1 - u) / 0.08);
  return { x, alpha, parcel };
}

// posts drifting from the phone screen to the window of the home
const SEE = { a: [41, 146, 42] as P3, c: [64, 172, 70] as P3, b: [77.5, 211, 15] as P3, n: 3, cycle: 2.7 };
function seeAt(u: number): [number, number] {
  const v = 1 - u;
  const q = (k: 0 | 1 | 2) => v * v * SEE.a[k] + 2 * v * u * SEE.c[k] + u * u * SEE.b[k];
  return P(q(0), q(1), q(2));
}

// phone feed
const FEED = { pitch: 25, count: 4, z0: 21, z1: 88, u0: 116, u1: 150, x: 40 };

/* ------------------------------------------------------------------ */
/* Static scene                                                        */
/* ------------------------------------------------------------------ */

function Ground() {
  const { x0, x1, y0, y1 } = TILE;
  return (
    <g>
      <Box a={[x0, y0, -7]} b={[x1, y1, 0]} t="tile" l="tl" r="tr" />
      {/* road with kerb and centre dashes */}
      <polygon className="road" points={pts([[6, ROAD.y0, 0], [x1 - 6, ROAD.y0, 0], [x1 - 6, ROAD.y1, 0], [6, ROAD.y1, 0]])} />
      <path className="dash" d={line([12, ROAD_Y, 0], [x1 - 12, ROAD_Y, 0])} />
      {/* rails */}
      {(["hold", "order", "pay"] as TrackId[]).map((id) => {
        const { a, b } = TRACKS[id];
        const alongX = a[1] === b[1];
        const w = 5.2;
        const p0 = alongX ? [a[0], a[1] - w] : [a[0] - w, a[1]];
        const p1 = alongX ? [b[0], b[1] + w] : [b[0] + w, b[1]];
        const strip: P3[] = alongX
          ? [[p0[0]!, p0[1]!, 0], [p1[0]!, p0[1]!, 0], [p1[0]!, p1[1]!, 0], [p0[0]!, p1[1]!, 0]]
          : [[p0[0]!, p0[1]!, 0], [p1[0]!, p0[1]!, 0], [p1[0]!, p1[1]!, 0], [p0[0]!, p1[1]!, 0]];
        const L = lenOf(id);
        let d = "";
        for (let s = 3; s < L - 1; s += 4.5) {
          if (alongX) d += line([a[0] + s, a[1] - w + 1.2, 0], [a[0] + s, a[1] + w - 1.2, 0]);
          else d += line([a[0] - w + 1.2, a[1] + s, 0], [a[0] + w - 1.2, a[1] + s, 0]);
        }
        const rails = alongX
          ? line([a[0], a[1] - w + 1.2, 0], [b[0], b[1] - w + 1.2, 0]) + line([a[0], a[1] + w - 1.2, 0], [b[0], b[1] + w - 1.2, 0])
          : line([a[0] - w + 1.2, a[1], 0], [b[0] - w + 1.2, b[1], 0]) + line([a[0] + w - 1.2, a[1], 0], [b[0] + w - 1.2, b[1], 0]);
        return (
          <g key={id} data-rail={id} className="rail">
            <polygon className="railbed" points={pts(strip)} />
            <path className="kf" d={d} />
            <path className="k" d={rails} />
          </g>
        );
      })}
    </g>
  );
}

/** Text engraved flat on the tile. dir "x" reads down-right, "-y" reads up-right. */
function GroundLabel({ at, dir, children, on }: { at: P3; dir: "x" | "-y"; children: string; on: boolean }) {
  const [X, Y] = P(...at);
  const k = n1(K);
  const m = dir === "x" ? `matrix(${k} 0.5 -${k} 0.5 ${n1(X)} ${n1(Y)})` : `matrix(${k} -0.5 ${k} 0.5 ${n1(X)} ${n1(Y)})`;
  return (
    <text className="glabel" data-on={on ? 1 : 0} transform={m}>
      {children}
    </text>
  );
}

/** Upright text painted on a wall that faces +y. */
function WallText({ x, y, z, className, children }: { x: number; y: number; z: number; className: string; children: string }) {
  const [X, Y] = P(x, y, z);
  return (
    <text className={className} transform={`matrix(${n1(K)} 0.5 0 1 ${n1(X)} ${n1(Y)})`}>
      {children}
    </text>
  );
}

function Phone({ on }: { on: boolean }) {
  const prof = roundedYZ(108, 156, 6, 96, 7);
  const scr = roundedYZ(FEED.u0 - 4, FEED.u1 + 4, 15, 91, 4).map(([y, z]) => [FEED.x + 0.02, y, z] as P3);
  return (
    <g data-on={on ? 1 : 0} style={{ ["--a" as string]: "var(--color-violet)" }}>
      {/* stand */}
      <Box a={[22, 102, 0]} b={[56, 162, 5]} />
      <path className="kf" d={line([25, 162, 2.5], [53, 162, 2.5])} />
      <PrismX x0={33} x1={40} prof={prof} />
      {/* cradle lip in front of the phone */}
      <Box a={[40, 110, 5]} b={[45, 154, 10]} />
      {/* side buttons */}
      <Box a={[35, 156, 70]} b={[38, 157.4, 80]} />
      <Box a={[35, 156, 58]} b={[38, 157.4, 64]} />
      <polygon className="scr" points={pts(scr)} />
      <path className="k" d={line([FEED.x + 0.03, 128, 93.2], [FEED.x + 0.03, 136, 93.2])} />
      <circle className="cam" cx={P(FEED.x, 140, 93.2)[0]} cy={P(FEED.x, 140, 93.2)[1]} r={0.9} />
    </g>
  );
}

/** Feed cards on the phone screen: plane x = FEED.x, u = y. Drawn at z 0..20; moved up each frame. */
function FeedCard({ accent, i }: { accent: string; i: number }) {
  const x = FEED.x + 0.04;
  const { u0, u1 } = FEED;
  const h = 20;
  return (
    <g data-feed={i} style={{ ["--a" as string]: accent }}>
      <polygon className="t" points={pts(wall("x", x, u0, u1, 0, h))} />
      <polygon className="ac" points={pts(wall("x", x + 0.01, u1 - 15, u1 - 3, 3, 17))} />
      <path className="kf" d={line([x, u0 + 3, 15], [x, u1 - 18, 15]) + line([x, u0 + 3, 11], [x, u1 - 22, 11]) + line([x, u0 + 3, 7], [x, u1 - 20, 7])} />
      <polygon className="ac pill" points={pts(wall("x", x + 0.01, u0 + 3, u0 + 9, 2.2, 4.6))} />
    </g>
  );
}

function Chute({ on }: { on: boolean }) {
  const { a, b } = TRACKS.share;
  const w = 7;
  const yb = a[1] - w;
  const yf = a[1] + w;
  const wallH = 4.5;
  const legs = [64, 96].map((x) => {
    const z = a[2] + (x - a[0]) * SHARE_SLOPE;
    return (
      <g key={x}>
        <Box a={[x - 1.4, yb + 1, 0]} b={[x + 1.4, yb + 3.8, z - 1.2]} />
        <Box a={[x - 1.4, yf - 3.8, 0]} b={[x + 1.4, yf - 1, z - 1.2]} />
      </g>
    );
  });
  return (
    <g data-on={on ? 1 : 0} style={{ ["--a" as string]: "var(--color-violet)" }}>
      {legs}
      {/* back wall inner face, then floor */}
      <polygon className="r" points={pts([[a[0], yb, a[2]], [b[0], yb, b[2]], [b[0], yb, b[2] + wallH], [a[0], yb, a[2] + wallH]])} />
      <polygon className="tn" points={pts([[a[0], yb, a[2]], [b[0], yb, b[2]], [b[0], yf, b[2]], [a[0], yf, a[2]]])} />
    </g>
  );
}

function ChuteFront() {
  const { a, b } = TRACKS.share;
  const yf = a[1] + 7;
  const wallH = 4.5;
  const under = 1.6;
  return (
    <g>
      <polygon className="l" points={pts([[a[0], yf, a[2] - under], [b[0], yf, b[2] - under], [b[0], yf, b[2] + wallH], [a[0], yf, a[2] + wallH]])} />
      <polygon className="t" points={pts([[a[0], yf, a[2] + wallH], [b[0], yf, b[2] + wallH], [b[0], yf + 1.4, b[2] + wallH], [a[0], yf + 1.4, a[2] + wallH]])} />
      <polygon className="l" points={pts([[a[0], yf + 1.4, a[2] + wallH], [b[0], yf + 1.4, b[2] + wallH], [b[0], yf + 1.4, b[2] - under], [a[0], yf + 1.4, a[2] - under]])} />
      {[58, 78, 98].map((x) => {
        const z = a[2] + (x - a[0]) * SHARE_SLOPE;
        return <path key={x} className="kf" d={line([x, yf + 1.42, z - under], [x, yf + 1.42, z + wallH])} />;
      })}
    </g>
  );
}

function Hub({ on }: { on: boolean }) {
  const x0 = 118;
  const x1 = 172;
  const y0 = 105;
  const y1 = 159;
  const zt = 36;
  return (
    <g data-on={on ? 1 : 0} style={{ ["--a" as string]: "var(--color-green)" }}>
      <Box a={[x0 - 3, y0 - 3, 0]} b={[x1 + 3, y1 + 3, 3]} t="tn" />
      <Box a={[x0, y0, 3]} b={[x1, y1, zt]} />
      {/* cornice */}
      <Box a={[x0 - 1.2, y0 - 1.2, zt]} b={[x1 + 1.2, y1 + 1.2, zt + 2.4]} />
      <polygon className="roofin" points={pts([[x0 + 3, y0 + 3, zt + 2.4], [x1 - 3, y0 + 3, zt + 2.4], [x1 - 3, y1 - 3, zt + 2.4], [x0 + 3, y1 - 3, zt + 2.4]])} />
      {/* roof: vent stack at the back, sign and skylights */}
      <Box a={[x0 + 7, y0 + 7, zt + 2.4]} b={[x0 + 16, y0 + 16, zt + 14]} />
      <Box a={[x0 + 6, y0 + 6, zt + 14]} b={[x0 + 17, y0 + 17, zt + 16]} />
      {[
        [x0 + 30, y0 + 9],
        [x0 + 30, y0 + 25],
        [x0 + 14, y0 + 28],
      ].map(([sx, sy]) => (
        <g key={`${sx}-${sy}`}>
          <Box a={[sx!, sy!, zt + 2.4]} b={[sx! + 11, sy! + 11, zt + 4.6]} t="glass" />
          <path className="kf" d={line([sx! + 5.5, sy!, zt + 4.6], [sx! + 5.5, sy! + 11, zt + 4.6])} />
        </g>
      ))}
      {/* green sign standing on the roof, facing +y */}
      <Box a={[x0 + 14, y1 - 12, zt + 2.4]} b={[x0 + 15.4, y1 - 10.6, zt + 6]} />
      <Box a={[x0 + 38, y1 - 12, zt + 2.4]} b={[x0 + 39.4, y1 - 10.6, zt + 6]} />
      <Box a={[x0 + 11, y1 - 13, zt + 6]} b={[x0 + 43, y1 - 10, zt + 17]} t="act" l="ac" r="acd" />
      <WallText x={x0 + 15.5} y={y1 - 9.96} z={zt + 8.6} className="signtext">
        greep
      </WallText>
      {/* +y face: door, awning, windows, outlet for orders */}
      <Opening face="y" at={y1} u0={x0 + 10} u1={x0 + 24} z0={3} z1={20} />
      <path className="kf" d={line([x0 + 17, y1 + 0.02, 3], [x0 + 17, y1 + 0.02, 20])} />
      <Box a={[x0 + 8, y1, 0]} b={[x0 + 26, y1 + 5, 3]} />
      <Awning face="y" at={y1} u0={x0 + 6} u1={x0 + 28} zt={25} out={7} drop={3.5} stripes={5} />
      <Win face="y" at={y1} u0={x0 + 32} u1={x0 + 40} z0={22} z1={30} />
      <Win face="y" at={y1} u0={x0 + 44} u1={x0 + 50} z0={22} z1={30} />
      <Opening face="y" at={y1} u0={TRACKS.order.a[0] - 6} u1={TRACKS.order.a[0] + 6} z0={3} z1={13} />
      {/* +x face: outlet to the vault, windows */}
      <Opening face="x" at={x1} u0={TRACKS.hold.a[1] - 6} u1={TRACKS.hold.a[1] + 6} z0={3} z1={13} />
      <Win face="x" at={x1} u0={y0 + 6} u1={y0 + 14} z0={22} z1={30} />
      <Win face="x" at={x1} u0={y0 + 18} u1={y0 + 26} z0={22} z1={30} />
      <Win face="x" at={x1} u0={y0 + 30} u1={y0 + 38} z0={22} z1={30} />
      <Win face="x" at={x1} u0={y0 + 42} u1={y0 + 50} z0={22} z1={30} />
    </g>
  );
}

const VAULT = { x0: 206, x1: 248, y0: 106, y1: 156, z0: 4, z1: 38 };
const DOOR = { u: 134, z: 21, r: 11.5 };

function Vault({ on, locked }: { on: boolean; locked: boolean }) {
  const still = useReducedMotion();
  const { x0, x1, y0, y1, z0, z1 } = VAULT;
  const ring = wallCircle("x", x1 + 0.02, DOOR.u, DOOR.z, DOOR.r);
  const disc = wallCircle("x", x1 + 1.2, DOOR.u, DOOR.z, DOOR.r - 2.2);
  const bolts = Array.from({ length: 8 }, (_, i) => {
    const t = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const [cx, cy] = P(x1 + 0.03, DOOR.u + (DOOR.r - 1.1) * Math.cos(t), DOOR.z + (DOOR.r - 1.1) * Math.sin(t));
    return <circle key={i} className="bolt" cx={n1(cx)} cy={n1(cy)} r={0.55} />;
  });
  // the padlock hangs on a hasp between the door and the corner
  const hu = y0 + 7;
  return (
    <g data-on={on ? 1 : 0} style={{ ["--a" as string]: "var(--color-green)" }}>
      {/* feet */}
      {[
        [x0 + 2, y1 - 6],
        [x1 - 6, y1 - 6],
        [x1 - 6, y0 + 2],
      ].map(([fx, fy]) => (
        <Box key={`${fx}-${fy}`} a={[fx!, fy!, 0]} b={[fx! + 4, fy! + 4, z0]} />
      ))}
      <Box a={[x0, y0, z0]} b={[x1, y1, z1]} />
      <Box a={[x0 - 1.4, y0 - 1.4, z1]} b={[x1 + 1.4, y1 + 1.4, z1 + 2.6]} />
      <Box a={[x0 + 4, y0 + 4, z1 + 2.6]} b={[x1 - 4, y1 - 4, z1 + 4.4]} />
      <polygon className="h" points={pts([[x0 + 16, y0 + 18, z1 + 4.42], [x0 + 26, y0 + 18, z1 + 4.42], [x0 + 26, y0 + 19.6, z1 + 4.42], [x0 + 16, y0 + 19.6, z1 + 4.42]])} />
      {/* seams */}
      <path className="kf" d={line([x1 + 0.02, y0, z0 + 4], [x1 + 0.02, y1, z0 + 4]) + line([x0, y1 + 0.02, z0 + 4], [x1, y1 + 0.02, z0 + 4])} />
      {/* door: recess ring, thick disc, bolts */}
      <polygon className="h" points={pts(ring)} />
      <PrismDisc face={x1} />
      <polygon className="r" points={pts(disc)} />
      {bolts}
      {/* hinges on the far side of the door */}
      <Box a={[x1, DOOR.u + DOOR.r - 1, DOOR.z + 4]} b={[x1 + 1.6, DOOR.u + DOOR.r + 2, DOOR.z + 8]} />
      <Box a={[x1, DOOR.u + DOOR.r - 1, DOOR.z - 8]} b={[x1 + 1.6, DOOR.u + DOOR.r + 2, DOOR.z - 4]} />
      <g data-handle="1">
        <path className="handle" d="" />
      </g>
      {/* hasp */}
      <Box a={[x1, hu - 1.5, 22]} b={[x1 + 1.4, hu + 6, 25]} />
      <motion.g initial={false} animate={{ y: locked ? 0 : -3.2 }} transition={still ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 18 }}>
        <path className="shackle" d={shacklePath(x1 + 2.6, hu, 22)} />
      </motion.g>
      <g className="lock" data-on={locked || on ? 1 : 0}>
        <Box a={[x1 + 0.8, hu - 4.4, 12.5]} b={[x1 + 4.4, hu + 4.4, 20]} t="act" l="ac" r="acd" />
        <polygon className="h" points={pts(wall("x", x1 + 4.42, hu - 0.7, hu + 0.7, 14.6, 17.4))} />
      </g>
      {/* +y face: payout outlet and a small plate */}
      <Opening face="y" at={y1} u0={TRACKS.pay.a[0] - 6} u1={TRACKS.pay.a[0] + 6} z0={z0} z1={z0 + 10} />
      <polygon className="t" points={pts(wall("y", y1 + 0.02, x0 + 5, x0 + 15, 24, 30))} />
      <path className="kf" d={line([x0 + 6.5, y1 + 0.03, 28], [x0 + 13.5, y1 + 0.03, 28]) + line([x0 + 6.5, y1 + 0.03, 26], [x0 + 11.5, y1 + 0.03, 26])} />
    </g>
  );
}

/** The door's rim: a short cylinder along x seen as a band. */
function PrismDisc({ face }: { face: number }) {
  const r = DOOR.r - 2.2;
  const steps = 40;
  const front: P3[] = [];
  const band: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    front.push([face + 1.2, DOOR.u + r * Math.cos(t), DOOR.z + r * Math.sin(t)]);
  }
  // visible half of the rim: where (cos t + sin t) > 0 in (u, z) for view from +y,+z
  for (let i = 0; i < steps; i++) {
    const t0 = (i / steps) * Math.PI * 2;
    const t1 = ((i + 1) / steps) * Math.PI * 2;
    const tm = (t0 + t1) / 2;
    if (Math.cos(tm) + Math.sin(tm) <= 0) continue;
    band.push(
      pts([
        [face, DOOR.u + r * Math.cos(t0), DOOR.z + r * Math.sin(t0)],
        [face, DOOR.u + r * Math.cos(t1), DOOR.z + r * Math.sin(t1)],
        [face + 1.2, DOOR.u + r * Math.cos(t1), DOOR.z + r * Math.sin(t1)],
        [face + 1.2, DOOR.u + r * Math.cos(t0), DOOR.z + r * Math.sin(t0)],
      ]),
    );
  }
  return (
    <g className="rim">
      {band.map((p, i) => (
        <polygon key={i} className="l nostroke" points={p} />
      ))}
    </g>
  );
}

function shacklePath(x: number, u: number, z: number) {
  const r = 2.6;
  const leg = 3.2;
  const p: P3[] = [[x, u - r, z - 2.5], [x, u - r, z + leg]];
  for (let i = 1; i < 12; i++) {
    const t = Math.PI - (i / 12) * Math.PI;
    p.push([x, u + r * Math.cos(t), z + leg + r * Math.sin(t)]);
  }
  p.push([x, u + r, z + leg], [x, u + r, z - 2.5]);
  return p.map((q, i) => {
    const [a, b] = P(...q);
    return `${i ? "L" : "M"}${n1(a)} ${n1(b)}`;
  }).join("");
}

function Home({ on }: { on: boolean }) {
  const x0 = 26;
  const x1 = 76;
  const y0 = 190;
  const y1 = 232;
  const zw = 24;
  const ze = 23;
  const zr = 39;
  const ym = (y0 + y1) / 2;
  const hy = (y1 - y0) / 2 + 3;
  const zAt = (y: number) => ze + (zr - ze) * (1 - Math.abs(y - ym) / hy);
  return (
    <g data-on={on ? 1 : 0} style={{ ["--a" as string]: "var(--color-sun)" }}>
      <Box a={[x0, y0, 0]} b={[x1, y1, zw]} />
      {/* gable on the +x end */}
      <polygon className="r" points={pts([[x1, y0, zw], [x1, y1, zw], [x1, y1, zAt(y1)], [x1, ym, zr], [x1, y0, zAt(y0)]])} />
      {/* chimney on the back slope */}
      <Box a={[x0 + 8, y0 + 5, zAt(y0 + 5)]} b={[x0 + 15, y0 + 11, zr + 6]} />
      <Box a={[x0 + 7.4, y0 + 4.4, zr + 6]} b={[x0 + 15.6, y0 + 11.6, zr + 7.5]} />
      {/* roof */}
      <polygon className="t" points={pts([[x0 - 2.5, y0 - 3, ze], [x1 + 2.5, y0 - 3, ze], [x1 + 2.5, ym, zr], [x0 - 2.5, ym, zr]])} />
      <polygon className="l" points={pts([[x0 - 2.5, ym, zr], [x1 + 2.5, ym, zr], [x1 + 2.5, y1 + 3, ze], [x0 - 2.5, y1 + 3, ze]])} />
      <path className="kf" d={[0.25, 0.5, 0.75].map((f) => line([x0 - 2.5, ym + (y1 + 3 - ym) * f, zr + (ze - zr) * f], [x1 + 2.5, ym + (y1 + 3 - ym) * f, zr + (ze - zr) * f])).join("")} />
      <polygon className="r" points={pts([[x1 + 2.5, y0 - 3, ze], [x1 + 2.5, ym, zr], [x1 + 2.5, y1 + 3, ze], [x1 + 2.5, y1 + 3, ze - 1.6], [x1 + 2.5, ym, zr - 1.6], [x1 + 2.5, y0 - 3, ze - 1.6]])} />
      {/* door, step, windows */}
      <Opening face="y" at={y1} u0={x0 + 21} u1={x0 + 31} z0={0} z1={16} />
      <polygon className="t" points={pts(wall("y", y1 + 0.03, x0 + 22, x0 + 30, 0.5, 15))} />
      <circle className="bolt" cx={n1(P(x0 + 28.4, y1 + 0.05, 8)[0])} cy={n1(P(x0 + 28.4, y1 + 0.05, 8)[1])} r={0.6} />
      <Box a={[x0 + 19, y1, 0]} b={[x0 + 33, y1 + 5, 1.6]} />
      <Win face="y" at={y1} u0={x0 + 6} u1={x0 + 15} z0={9} z1={17} lit={on} />
      <Win face="y" at={y1} u0={x0 + 37} u1={x0 + 46} z0={9} z1={17} lit={on} />
      <Win face="x" at={x1} u0={y0 + 14} u1={y0 + 28} z0={10} z1={18} lit={on} />
      <path className="kf" d={line([x1 + 0.02, y0 + 21, 10], [x1 + 0.02, y0 + 21, 18])} />
      {/* letterbox post */}
      <Box a={[x1 + 6, y1 + 6, 0]} b={[x1 + 7.4, y1 + 7.4, 8]} />
      <Box a={[x1 + 4, y1 + 4.5, 8]} b={[x1 + 10, y1 + 8.9, 12]} />
    </g>
  );
}

const ST = { x0: 156, x1: 236, y0: 208, wall: 46 };

/** Back wall, shelf of goods and the far post. */
function StallBack({ on }: { on: boolean }) {
  const { x0, x1, y0, wall: zw } = ST;
  return (
    <g data-on={on ? 1 : 0} style={{ ["--a" as string]: "var(--color-orange)" }}>
      <Box a={[x0, y0, 0]} b={[x1, y0 + 5, zw]} />
      <path className="kf" d={[1, 2, 3, 4, 5, 6, 7].map((i) => line([x0 + i * 10, y0 + 5.02, 0.6], [x0 + i * 10, y0 + 5.02, 22])).join("")} />
      <Box a={[x0 + 4, y0 + 5, 24]} b={[x1 - 4, y0 + 10, 25.6]} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = x0 + 8 + i * 11.6;
        const h = 4 + ((i * 7) % 5);
        return <Box key={i} a={[x, y0 + 5.5, 25.6]} b={[x + 7, y0 + 9.5, 25.6 + h]} t="pt" l="pl" r="pr" />;
      })}
      <Box a={[x0, 231, 0]} b={[x0 + 2.6, 233.6, 38]} />
    </g>
  );
}

/** Counter with goods, a scale, and the near post. */
function StallFront({ on }: { on: boolean }) {
  const goods: [number, number, number, number][] = [
    [167, 229, 7, 6],
    [176, 230, 6, 9],
    [211, 229, 8, 5],
    [221, 230, 6, 7],
  ];
  return (
    <g data-on={on ? 1 : 0} style={{ ["--a" as string]: "var(--color-orange)" }}>
      <Box a={[162, 225, 0]} b={[230, 240, 14]} />
      <Box a={[161, 224, 14]} b={[231, 241, 15.6]} />
      <polygon className="ac" points={pts(wall("y", 241.02, 161, 231, 4, 7))} />
      <path className="kf" d={[1, 2, 3, 4].map((i) => line([162 + i * 13.6, 240.03, 7.6], [162 + i * 13.6, 240.03, 13.4])).join("")} />
      {goods.map(([gx, gy, s, h], i) => (
        <g key={i}>
          <Box a={[gx, gy, 15.6]} b={[gx + s, gy + s, 15.6 + h]} t="pt" l="pl" r="pr" />
          <path className="tape" d={line([gx + s / 2, gy, 15.6 + h], [gx + s / 2, gy + s, 15.6 + h])} />
        </g>
      ))}
      <Box a={[192, 230, 15.6]} b={[202, 238, 17.4]} />
      <Box a={[193.5, 231.5, 17.4]} b={[200.5, 236.5, 18.2]} t="tn" />
      <Box a={[ST.x1 - 2.6, 231, 0]} b={[ST.x1, 233.6, 38]} />
    </g>
  );
}

/** Striped awning cantilevered off the back wall, held by the two posts. */
function StallAwning({ on }: { on: boolean }) {
  const x0 = ST.x0 - 3;
  const x1 = ST.x1 + 3;
  const y0 = ST.y0 + 5;
  const zt = 44;
  const zf = 38;
  const yf = 235;
  const n = 9;
  const w = (x1 - x0) / n;
  const slope: React.ReactNode[] = [];
  const val: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = x0 + i * w;
    const b = a + w;
    const m = (a + b) / 2;
    slope.push(<polygon key={`s${i}`} className={i % 2 ? "t" : "ac"} points={pts([[a, y0, zt], [b, y0, zt], [b, yf, zf], [a, yf, zf]])} />);
    val.push(<polygon key={`v${i}`} className={i % 2 ? "l" : "acd"} points={pts([[a, yf, zf], [b, yf, zf], [b, yf, zf - 3.5], [m, yf, zf - 5.4], [a, yf, zf - 3.5]])} />);
  }
  return (
    <g data-on={on ? 1 : 0} style={{ ["--a" as string]: "var(--color-orange)" }}>
      {slope}
      {val}
      <polygon className="acd" points={pts([[x1, y0, zt], [x1, yf, zf], [x1, yf, zf - 3.5], [x1, y0, zt - 1.4]])} />
    </g>
  );
}

// a coin hops up out of the stall each time a payout coin lands
const POP = { x: 229, y: 211, z: 44 };

/* ------------------------------------------------------------------ */
/* View box                                                            */
/* ------------------------------------------------------------------ */

const VB = (() => {
  const xs = [P(TILE.x0, TILE.y1)[0], P(TILE.x1, TILE.y0)[0]];
  const top = P(33, 108, 96)[1];
  const bottom = P(TILE.x1, TILE.y1, -7)[1];
  const pad = 12;
  return { x: xs[0]! - pad, y: top - pad - 4, w: xs[1]! - xs[0]! + pad * 2, h: bottom - top + pad * 2 + 4 };
})();

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const CSS = `
.gx{--gx-t:var(--color-paper);--gx-l:color-mix(in srgb,var(--color-ink) 3.5%,var(--color-paper));--gx-r:color-mix(in srgb,var(--color-ink) 8%,var(--color-paper));--gx-s:color-mix(in srgb,var(--color-ink) 40%,var(--color-paper));--gx-f:color-mix(in srgb,var(--color-ink) 17%,var(--color-paper));--gx-h:color-mix(in srgb,var(--color-ink) 15%,var(--color-paper));--gx-tile:color-mix(in srgb,var(--color-ink) 1.5%,var(--color-paper));--gx-road:color-mix(in srgb,var(--color-ink) 5%,var(--color-paper));--gx-glass:color-mix(in srgb,var(--color-sky) 16%,var(--color-paper));--gx-scr:color-mix(in srgb,var(--color-ink) 5%,var(--color-paper));--gx-tan:#e9cfa2;--gx-tan-l:#dcbc86;--gx-tan-r:#cba872;--gx-tape:#b48f58;--gx-coin:var(--color-sun);--gx-coin-s:color-mix(in srgb,var(--color-sun) 72%,#7a5200);--gx-shadow:color-mix(in srgb,var(--color-ink) 10%,var(--color-paper));--gx-dark:#000;--gx-tyre:#3f3f46;--gx-puff:var(--color-paper)}
:root[data-theme="dark"] .gx{--gx-t:color-mix(in srgb,var(--color-ink) 12%,var(--color-paper));--gx-l:color-mix(in srgb,var(--color-ink) 7%,var(--color-paper));--gx-r:color-mix(in srgb,var(--color-ink) 3%,var(--color-paper));--gx-s:color-mix(in srgb,var(--color-ink) 44%,var(--color-paper));--gx-f:color-mix(in srgb,var(--color-ink) 22%,var(--color-paper));--gx-h:var(--color-canvas);--gx-tile:color-mix(in srgb,var(--color-ink) 4%,var(--color-paper));--gx-road:color-mix(in srgb,var(--color-ink) 1%,var(--color-canvas));--gx-glass:color-mix(in srgb,var(--color-sky) 18%,var(--color-paper));--gx-scr:var(--color-canvas);--gx-tan:#b39467;--gx-tan-l:#9b7f56;--gx-tan-r:#846b47;--gx-tape:#6e5634;--gx-coin-s:color-mix(in srgb,var(--color-sun) 62%,#3a2700);--gx-shadow:var(--color-canvas);--gx-tyre:#52525b;--gx-puff:color-mix(in srgb,var(--color-ink) 22%,var(--color-paper))}
.gx polygon,.gx .o{stroke:var(--gx-s);stroke-width:.55;stroke-linejoin:round}
.gx .nostroke{stroke:none}
.gx .t{fill:var(--gx-t)}.gx .l{fill:var(--gx-l)}.gx .r{fill:var(--gx-r)}.gx .h{fill:var(--gx-h)}
.gx .tile{fill:var(--gx-tile)}.gx .tl{fill:var(--gx-l)}.gx .tr{fill:var(--gx-r)}
.gx .road{fill:var(--gx-road)}.gx .dash{fill:none;stroke:var(--gx-f);stroke-width:.8;stroke-dasharray:6 6}
.gx .railbed{fill:var(--gx-l)}
.gx .k{fill:none;stroke:var(--gx-s);stroke-width:.55;stroke-linecap:round}
.gx .kf{fill:none;stroke:var(--gx-f);stroke-width:.5;stroke-linecap:round}
.gx .glass{fill:var(--gx-glass)}.gx .scr{fill:var(--gx-scr)}
.gx .lit{fill:color-mix(in srgb,var(--color-sun) 70%,var(--gx-t));transition:fill .7s ease}
.gx .roofin{fill:none;stroke:var(--gx-f)}
.gx .pt{fill:var(--gx-tan)}.gx .pl{fill:var(--gx-tan-l)}.gx .pr{fill:var(--gx-tan-r)}
.gx .tape{fill:none;stroke:var(--gx-tape);stroke-width:.9}
.gx .ct{fill:var(--gx-coin);stroke:var(--gx-s);stroke-width:.5}.gx .cs{fill:var(--gx-coin-s);stroke:var(--gx-s);stroke-width:.5}.gx .cr{fill:none;stroke:var(--gx-coin-s);stroke-width:.5}
.gx .tyre{fill:var(--gx-tyre);stroke:none}.gx .lamp{fill:var(--color-rose);stroke:none}
.gx .shadow{fill:var(--gx-shadow);stroke:none;opacity:.7}
.gx .bolt,.gx .cam{fill:var(--gx-s)}
.gx .shackle{fill:none;stroke:var(--gx-s);stroke-width:1.5;stroke-linecap:round}
.gx .handle{fill:none;stroke:var(--gx-s);stroke-width:1.3;stroke-linecap:round}
.gx .signtext{font-family:var(--font-sans);font-weight:600;font-size:8.6px;letter-spacing:-.02em;fill:var(--gx-t);opacity:.55;transition:opacity .7s ease}
.gx [data-on="1"] .signtext{fill:#fff;opacity:1}
.gx .ac,.gx .acd,.gx .act,.gx .tn,.gx .lit{transition:fill .7s ease}
.gx .ac{fill:color-mix(in srgb,var(--a) 24%,var(--gx-l))}
.gx .act{fill:color-mix(in srgb,var(--a) 18%,var(--gx-t))}
.gx .acd{fill:color-mix(in srgb,var(--a) 24%,var(--gx-r))}
.gx .tn{fill:var(--gx-t)}
.gx [data-on="1"] .ac,.gx .ac.on{fill:var(--a)}
.gx [data-on="1"] .act{fill:color-mix(in srgb,var(--a) 82%,var(--gx-t))}
.gx [data-on="1"] .acd{fill:color-mix(in srgb,var(--a) 80%,var(--gx-dark))}
.gx [data-on="1"] .tn{fill:color-mix(in srgb,var(--a) 13%,var(--gx-t))}
.gx .glabel{font-family:var(--font-mono);font-size:9px;letter-spacing:.02em;fill:var(--color-muted);opacity:.75;transition:fill .7s ease,opacity .7s ease}
.gx .glabel[data-on="1"]{fill:var(--color-ink);opacity:1}
`;

export function HowItWorksFigure({ step }: { step: Step }) {
  const rootRef = useRef<SVGSVGElement>(null);
  const stepRef = useRef<Step>(step);
  const drawRef = useRef<(() => void) | null>(null);
  stepRef.current = step;

  useEffect(() => {
    const svg = rootRef.current;
    if (!svg) return;
    const q = <T extends Element>(sel: string) => Array.from(svg.querySelectorAll<T>(sel));
    const items: Record<TrackId, SVGGElement[]> = {
      share: q<SVGGElement>('[data-item="share"]'),
      hold: q<SVGGElement>('[data-item="hold"]'),
      order: q<SVGGElement>('[data-item="order"]'),
      pay: q<SVGGElement>('[data-item="pay"]'),
    };
    const feed = q<SVGGElement>("[data-feed]");
    const seen = q<SVGGElement>("[data-see]");
    const van = svg.querySelector<SVGGElement>("[data-van]");
    const drop = svg.querySelector<SVGGElement>("[data-drop]");
    const pop = svg.querySelector<SVGGElement>("[data-pop]");
    const handle = svg.querySelector<SVGPathElement>("[data-handle] path");
    const puffs = q<SVGCircleElement>("[data-puff]");

    const target = (k: keyof typeof ACTIVE) => (ACTIVE[k].includes(stepRef.current) ? 1 : 0);
    const keys = ["see", "share", "hold", "order", "pay", "van"] as const;
    const lvl: Record<(typeof keys)[number], number> = { see: target("see"), share: target("share"), hold: target("hold"), order: target("order"), pay: target("pay"), van: target("van") };
    const ph: Record<string, number> = { see: 0, share: 0, hold: 0, order: 0, pay: 0, van: 0 };
    let lock = stepRef.current === 1 ? 1 : 0;
    let clock = 0;

    const render = () => {
      // feed scrolls on the phone
      const span = FEED.pitch * FEED.count;
      feed.forEach((el, i) => {
        const base = (((i * FEED.pitch + ph.see * 9) % span) + span) % span;
        el.setAttribute("transform", `translate(0 ${n1(-(base + FEED.z0 - FEED.pitch + 4))})`);
      });
      seen.forEach((el, i) => {
        const u = (((ph.see / SEE.cycle + i / SEE.n) % 1) + 1) % 1;
        const [x, y] = seeAt(u);
        const a = clamp01(u / 0.14) * clamp01((1 - u) / 0.14) * lvl.see;
        el.setAttribute("transform", `translate(${n1(x)} ${n1(y)}) scale(${n1(0.8 + 0.35 * Math.sin(Math.PI * u))})`);
        el.setAttribute("opacity", String(Math.round(a * 100) / 100));
      });
      (Object.keys(items) as TrackId[]).forEach((id) => {
        const L = lenOf(id);
        const { n } = TRACKS[id];
        items[id].forEach((el, i) => {
          const s = (((ph[id]! + (i * L) / n) % L) + L) % L;
          const [x, y] = trackPoint(id, s);
          el.setAttribute("transform", `translate(${n1(x)} ${n1(y)})`);
          el.setAttribute("opacity", String(Math.round(fadeEnds(s, L) * (0.1 + 0.9 * lvl[id]) * 100) / 100));
        });
      });
      if (van) {
        const u = ((ph.van % 1) + 1) % 1;
        const v = vanAt(u);
        const [x, y] = P(v.x, ROAD_Y, 0);
        van.setAttribute("transform", `translate(${n1(x)} ${n1(y)})`);
        van.setAttribute("opacity", String(Math.round(v.alpha * lvl.van * 100) / 100));
        drop?.setAttribute("opacity", String(Math.round(v.parcel * lvl.van * 100) / 100));
      }
      if (pop) {
        const gap = lenOf("pay") / TRACKS.pay.n;
        const f = ((((ph.pay - 4) % gap) + gap) % gap) / gap;
        const k = clamp01(f / 0.55);
        const [x, y] = P(POP.x, POP.y, POP.z + 26 * Math.sin((Math.PI / 2) * k));
        pop.setAttribute("transform", `translate(${n1(x)} ${n1(y)})`);
        pop.setAttribute("opacity", String(Math.round(Math.sin(Math.PI * k) * lvl.pay * 100) / 100));
      }
      if (handle) {
        const ang = lock * (Math.PI / 2) + Math.PI / 4;
        let d = "";
        for (let k = 0; k < 3; k++) {
          const t = ang + (k * Math.PI * 2) / 3;
          d += line([VAULT.x1 + 1.3, DOOR.u, DOOR.z], [VAULT.x1 + 2.6, DOOR.u + 6 * Math.cos(t), DOOR.z + 6 * Math.sin(t)]);
        }
        handle.setAttribute("d", d);
      }
      // greep's vent breathes while orders flow through it
      const hubLvl = Math.max(lvl.share, lvl.hold, lvl.order, lvl.pay);
      puffs.forEach((el, i) => {
        const f = (clock * 0.32 + i / puffs.length) % 1;
        const [x, y] = P(129.5 - f * 4, 116.5 - f * 6, 52 + f * 22);
        el.setAttribute("cx", n1(x));
        el.setAttribute("cy", n1(y));
        el.setAttribute("r", n1(1.2 + f * 2.6));
        el.setAttribute("opacity", String(Math.round(Math.sin(Math.PI * f) * hubLvl * 70) / 100));
      });
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = 0;
    let visible = false;

    const settleStill = () => {
      (Object.keys(lvl) as (keyof typeof lvl)[]).forEach((k) => (lvl[k] = target(k)));
      lock = stepRef.current === 1 ? 1 : 0;
      ph.van = 0.55;
      ph.see = 1.1;
      ph.share = 10;
      ph.hold = 8;
      ph.order = 12;
      ph.pay = 6;
      clock = 0.6;
      render();
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      clock += dt;
      const ease = 1 - Math.exp(-dt / 0.35);
      (Object.keys(lvl) as (keyof typeof lvl)[]).forEach((k) => {
        lvl[k] += (target(k) - lvl[k]) * ease;
      });
      lock += ((stepRef.current === 1 ? 1 : 0) - lock) * (1 - Math.exp(-dt / 0.3));
      ph.see += dt * lvl.see;
      (Object.keys(TRACKS) as TrackId[]).forEach((id) => (ph[id] = ph[id]! + dt * TRACKS[id].speed * lvl[id]));
      // the van starts each delivery at the stall
      if (lvl.van < 0.02 && target("van") === 0) ph.van = 0;
      else ph.van += (dt / VAN.cycle) * Math.max(lvl.van, target("van"));
      render();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || reduce.matches || !visible) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = !!e?.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "80px" },
    );
    io.observe(svg);

    const onReduce = () => {
      if (reduce.matches) {
        stop();
        settleStill();
      } else start();
    };
    reduce.addEventListener("change", onReduce);
    drawRef.current = () => {
      if (reduce.matches) settleStill();
    };
    if (reduce.matches) settleStill();
    else render();

    return () => {
      stop();
      io.disconnect();
      reduce.removeEventListener("change", onReduce);
      drawRef.current = null;
    };
  }, []);

  // under reduced motion, repaint the still frame when the step changes
  useEffect(() => {
    drawRef.current?.();
  }, [step]);

  const seeOn = step === 0;
  const postsOn = step === 0 || step === 1;
  const hubOn = step >= 1;
  const sellerOn = step === 2;

  const feedAccents = ["var(--color-violet)", "var(--color-sky)", "var(--color-orange)", "var(--color-sun)"];
  const screenClip = pts(roundedYZ(FEED.u0 - 4, FEED.u1 + 4, 15, 91, 4).map(([y, z]) => [FEED.x + 0.02, y, z] as P3));
  const clipId = "gx-screen-clip";

  return (
    <svg
      ref={rootRef}
      className="gx block h-auto w-full select-none"
      viewBox={`${n1(VB.x)} ${n1(VB.y)} ${n1(VB.w)} ${n1(VB.h)}`}
      role="img"
      aria-label="A buyer sees a post, shares it to Greep and pays; the money is held in a vault while the seller ships, then paid out."
      data-step={step}
    >
      <style>{CSS}</style>
      <defs>
        <clipPath id={clipId}>
          <polygon points={screenClip} />
        </clipPath>
      </defs>

      <Ground />
      <GroundLabel at={[60, 171, 0]} dir="x" on={postsOn}>
        any post
      </GroundLabel>
      <GroundLabel at={[24, 247.5, 0]} dir="x" on={seeOn || sellerOn}>
        you
      </GroundLabel>
      <GroundLabel at={[262, 160, 0]} dir="-y" on={hubOn}>
        held safe
      </GroundLabel>
      <GroundLabel at={[247, 247, 0]} dir="-y" on={sellerOn}>
        seller
      </GroundLabel>

      {/* back to front */}
      <Phone on={postsOn} />
      <g clipPath={`url(#${clipId})`} data-on={postsOn ? 1 : 0}>
        {feedAccents.map((a, i) => (
          <FeedCard key={i} i={i} accent={a} />
        ))}
      </g>

      <Chute on={step === 1} />
      {Array.from({ length: TRACKS.share.n }, (_, i) => (
        <g key={i} data-item="share" opacity={0}>
          <Card z={0.4} slope={SHARE_SLOPE} accent="var(--color-violet)" />
        </g>
      ))}
      <ChuteFront />

      <Hub on={hubOn} />
      {puffsJsx()}
      {Array.from({ length: TRACKS.hold.n }, (_, i) => (
        <g key={i} data-item="hold" opacity={0}>
          <CoinStack />
        </g>
      ))}
      {Array.from({ length: TRACKS.order.n }, (_, i) => (
        <g key={i} data-item="order" opacity={0}>
          <Card accent="var(--color-orange)" />
        </g>
      ))}

      <Vault on={hubOn} locked={step === 1} />
      {Array.from({ length: TRACKS.pay.n }, (_, i) => (
        <g key={i} data-item="pay" opacity={0}>
          <CoinStack />
        </g>
      ))}

      <Home on={seeOn || sellerOn} />
      {feedAccents.slice(0, SEE.n).map((a, i) => (
        <g key={i} data-see={i} opacity={0}>
          <Card accent={a} />
        </g>
      ))}
      <g data-drop="1" opacity={0} transform={`translate(${n1(P(64, 242, 0)[0])} ${n1(P(64, 242, 0)[1])})`}>
        <Parcel />
      </g>

      <StallBack on={sellerOn} />
      <g data-pop="1" opacity={0}>
        <Coin r={4.6} h={1.6} />
      </g>
      <StallAwning on={sellerOn} />
      <StallFront on={sellerOn} />

      <g data-van="1" opacity={0} style={{ ["--a" as string]: "var(--color-orange)" }}>
        <Van />
      </g>
    </svg>
  );
}

function puffsJsx() {
  return [0, 1, 2].map((i) => <circle key={i} data-puff={i} className="o" r={2} cx={0} cy={0} opacity={0} style={{ fill: "var(--gx-puff)" }} />);
}
