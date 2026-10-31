/*
 * Small isometric kit for the Doorstep figure (after the anatomy kit's approach).
 * World units: x runs down-right, y runs down-left, z is up. 30 degree isometric.
 * Visible faces are +x ("r"), +y ("l") and the top ("t").
 */
import type { ReactNode } from "react";

export type V3 = readonly [number, number, number];
export type V2 = [number, number];

export const K = Math.cos(Math.PI / 6);
export const P = (x: number, y: number, z = 0): V2 => [(x - y) * K, (x + y) / 2 - z];
export const r2 = (v: number) => {
  const s = (Math.round(v * 100) / 100).toString();
  return s === "-0" ? "0" : s;
};
export const pts = (list: readonly V3[]) =>
  list
    .map(([x, y, z]) => {
      const [a, b] = P(x, y, z);
      return `${r2(a)},${r2(b)}`;
    })
    .join(" ");
export const pts2 = (list: readonly V2[]) => list.map(([a, b]) => `${r2(a)},${r2(b)}`).join(" ");
export const dOf = (list: readonly V3[], close = false) =>
  list
    .map(([x, y, z], i) => {
      const [a, b] = P(x, y, z);
      return `${i ? "L" : "M"}${r2(a)} ${r2(b)}`;
    })
    .join("") + (close ? "Z" : "");
export const seg = (a: V3, b: V3) => dOf([a, b]);

/** Convex hull of screen points (monotone chain). */
export function hull(points: V2[]): V2[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: V2[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: V2[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/** Silhouette of an axis box, as screen points. */
export function boxHull(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): V2[] {
  const c: V2[] = [];
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) c.push(P(x, y, z));
  return hull(c);
}

const m = (a: number, b: number, c: number, d: number, at: V2) => `matrix(${r2(a)} ${r2(b)} ${r2(c)} ${r2(d)} ${r2(at[0])} ${r2(at[1])})`;
/** Plane y = const (faces +y). Local u runs along +x, v runs down (-z). */
export const onY = (x: number, y: number, z: number) => m(K, 0.5, 0, 1, P(x, y, z));
/** Plane x = const (faces +x). Local u runs along -y, v runs down (-z). */
export const onX = (x: number, y: number, z: number) => m(K, -0.5, 0, 1, P(x, y, z));
/** Plane z = const (top). Local u runs along +x, v along +y. */
export const onTop = (x: number, y: number, z: number) => m(K, 0.5, -K, 0.5, P(x, y, z));

/* ------------------------------------------------------------------ solids */

export type Tone = "t" | "l" | "r" | "m" | "lo" | "h" | string;

/** Axis box: +y face, +x face, top. */
export function Box({
  b,
  t = "t",
  l = "l",
  r = "r",
  top = true,
}: {
  b: readonly [number, number, number, number, number, number];
  t?: Tone;
  l?: Tone;
  r?: Tone;
  top?: boolean;
}) {
  const [x0, y0, z0, x1, y1, z1] = b;
  return (
    <>
      <polygon className={l} points={pts([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])} />
      <polygon className={r} points={pts([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])} />
      {top && <polygon className={t} points={pts([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])} />}
    </>
  );
}

/** Rounded plan ring. */
export function ringOf(x: number, y: number, w: number, d: number, r: number, steps = 5) {
  const out: [number, number][] = [];
  const cs: [number, number, number][] = [
    [x + w - r, y + r, -Math.PI / 2],
    [x + w - r, y + d - r, 0],
    [x + r, y + d - r, Math.PI / 2],
    [x + r, y + r, Math.PI],
  ];
  for (const [cx, cy, a0] of cs) {
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (i / steps) * (Math.PI / 2);
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  return out;
}

/**
 * Rounded-plan prism with facing shading (no crease lines on the round corners),
 * a silhouette outline and the top rim. Optional seam ring wraps the visible sides.
 */
export function RBox({
  x,
  y,
  w,
  d,
  r = 2,
  z,
  h,
  t = "t",
  l = "l",
  rt = "r",
  seams = [],
  children,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  r?: number;
  z: number;
  h: number;
  t?: Tone;
  l?: Tone;
  rt?: Tone;
  seams?: number[];
  children?: ReactNode;
}) {
  const ring = ringOf(x, y, w, d, r);
  const n = ring.length;
  const sides: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[(i + 1) % n];
    const nx = by - ay;
    const ny = -(bx - ax);
    if (nx + ny <= 1e-6) continue;
    const ang = Math.atan2(ny, nx); // 0 = +x, pi/2 = +y
    const cls = ang < Math.PI / 8 ? rt : ang > (3 * Math.PI) / 8 ? l : "m";
    sides.push(<polygon key={i} className={`${cls} ns`} points={pts([[ax, ay, z], [bx, by, z], [bx, by, z + h], [ax, ay, z + h]])} />);
  }
  const all: V2[] = [];
  for (const [px, py] of ring) all.push(P(px, py, z), P(px, py, z + h));
  const top = ring.map(([px, py]) => [px, py, z + h] as V3);
  // visible near half of the ring at height zz, for seams: normals between -45 and 135 degrees
  const seamD = (zz: number) => {
    const out: V3[] = [];
    const cs = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
    ring.forEach(([px, py], i) => {
      const steps = n / 4 - 1;
      const a = cs[Math.floor(i / (steps + 1))] + ((i % (steps + 1)) / steps) * (Math.PI / 2);
      if (a >= -Math.PI / 4 - 1e-6 && a <= (3 * Math.PI) / 4 + 1e-6) out.push([px, py, zz]);
    });
    return dOf(out);
  };
  return (
    <>
      {sides}
      <polygon className={`${t} ns`} points={pts(top)} />
      {seams.map((s) => (
        <path key={s} className="kf" d={seamD(s)} />
      ))}
      {children}
      <polygon className="ds-ol" points={pts2(hull(all))} />
      <polygon className="rim" points={pts(top)} />
    </>
  );
}

/** Soft floor shadow under a footprint. */
export function Halo({ x, y, w, d, grow = 3 }: { x: number; y: number; w: number; d: number; grow?: number }) {
  return <polygon className="halo" points={pts([[x - grow + 2, y - grow + 2, 0], [x + w + grow + 2, y - grow + 2, 0], [x + w + grow + 2, y + d + grow + 2, 0], [x - grow + 2, y + d + grow + 2, 0]])} />;
}

/** Screw head on a top face. */
export const TopScrew = ({ x, y, z }: { x: number; y: number; z: number }) => (
  <g transform={onTop(x, y, z)}>
    <circle r={1.1} className="screw" />
    <path d="M-.6 0H.6" className="screwslot" />
  </g>
);
