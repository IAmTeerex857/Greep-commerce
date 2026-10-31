"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimationFrame, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Blobatar } from "@blobatar/react";
import { happy, idle } from "blobatar/expression";
import { Check, Heart, Package } from "lucide-react";
import { AudienceToggle } from "@/components/ui/AudienceToggle";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { AppTile } from "@/components/ui/Icons";
import { useLoop } from "@/components/ui/useLoop";
import { BagArt, Sticker } from "@/components/illustrations/Stickers";
import { Tote } from "@/components/illustrations/Tote";
import { Coin, COINS } from "@/components/buyers/Currency";

/*
 * Buyers hero. A dotted globe turns under the headline with small "find" cards
 * and coins orbiting it on tilted rings. Scroll down and they peel off their
 * orbits and line up, nearest ones bigger, into a road that pours out of the
 * hero toward the next section. Scroll back and they return to orbit.
 * Everything is DOM + SVG, driven by one animation frame loop.
 */

const ease = [0.16, 1, 0.3, 1] as const;
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.9, ease, delay },
});

export function BuyerHero() {
  return (
    <section id="top" className="relative z-10 overflow-x-clip pt-28 md:pt-32">
      <style>{CSS}</style>
      <div className="relative z-20 mx-auto flex max-w-[1240px] flex-col items-center px-4 text-center">
        <motion.div {...rise(0.05)}>
          <AudienceToggle current="buyers" />
        </motion.div>
        <motion.h1 {...rise(0.15)} className="display mt-7 max-w-[11em] text-[clamp(48px,6.4vw,92px)] leading-[0.98]">
          Shop{" "}
          <Sticker rotate={-8} delay={0.75}>
            <BagArt />
          </Sticker>{" "}
          what catches <span className="whitespace-nowrap text-green">your eye.</span>
        </motion.h1>
        <motion.p {...rise(0.3)} className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-muted md:text-lg">
          Seen something you like? Greep it. We&apos;ll find it in seconds, so you can buy it right there.
        </motion.p>
        <motion.div {...rise(0.45)} className="mt-8 flex w-full justify-center">
          <WaitlistForm audience="buyer" cta="Get started with Greep" ctaShort="Start" />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease, delay: 0.35 }}>
        <GlobeScene />
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/* geometry                                                           */
/* ================================================================== */

const W = 1100;
const H = 800;
const C = { x: 550, y: 400 };
const R = 250;
const D2R = Math.PI / 180;
const TAU = Math.PI * 2;
const TILT = 20 * D2R;
const SPIN_S = 110; // seconds per turn
const LON0 = 14; // Africa faces you on load

// Coarse land mask: 5° latitude bands, each with land longitude ranges.
const LAND: [number, [number, number][]][] = [
  [82.5, [[-75, -62], [-58, -25]]],
  [77.5, [[-115, -75], [-70, -20], [12, 28], [50, 62], [95, 108]]],
  [72.5, [[-125, -75], [-56, -22], [52, 58], [68, 160]]],
  [67.5, [[-180, -172], [-165, -85], [-76, -62], [-54, -32], [-23, -14], [13, 180]]],
  [62.5, [[-165, -95], [-78, -64], [-50, -42], [5, 17], [21, 178]]],
  [57.5, [[-160, -152], [-135, -94], [-77, -61], [-7, -2], [6, 18], [21, 137], [156, 163]]],
  [52.5, [[-130, -56], [-10, -6], [-5, 1], [4, 142], [156, 160]]],
  [47.5, [[-124, -53], [-2, 140], [141, 145]]],
  [42.5, [[-124, -70], [-9, 3], [11, 16], [18, 28], [41, 47], [53, 132], [140, 143]]],
  [37.5, [[-123, -76], [-9, -1], [12, 16], [21, 24], [26, 118], [126, 129], [133, 141]]],
  [32.5, [[-118, -80], [-9, 15], [20, 122], [130, 135]]],
  [27.5, [[-114, -97], [-82, -80], [-13, 34], [35, 49], [51, 121]]],
  [22.5, [[-106, -97], [-84, -76], [-16, 36], [39, 59], [68, 88], [92, 117], [120, 121]]],
  [17.5, [[-103, -88], [-78, -68], [-16, 39], [43, 55], [73, 84], [94, 109], [120, 122]]],
  [12.5, [[-90, -83], [-72, -70], [-17, 45], [75, 80], [98, 109], [122, 125]]],
  [7.5, [[-83, -60], [-13, 48], [80, 81], [98, 100], [122, 126]]],
  [2.5, [[-80, -50], [9, 42], [96, 104], [109, 118], [120, 125]]],
  [-2.5, [[-80, -44], [10, 40], [100, 106], [110, 116], [120, 123], [132, 150]]],
  [-7.5, [[-79, -35], [12, 39], [106, 114], [138, 148]]],
  [-12.5, [[-77, -38], [13, 40], [48, 50], [130, 136], [142, 143]]],
  [-17.5, [[-71, -39], [12, 37], [44, 50], [122, 146]]],
  [-22.5, [[-70, -41], [14, 35], [43, 48], [114, 150]]],
  [-27.5, [[-71, -48], [15, 32], [114, 153]]],
  [-32.5, [[-71, -52], [18, 28], [115, 124], [135, 152]]],
  [-37.5, [[-73, -57], [140, 150], [174, 178]]],
  [-42.5, [[-73, -63], [145, 148], [171, 174]]],
  [-47.5, [[-75, -66], [167, 170]]],
  [-52.5, [[-74, -68]]],
  [-62.5, [[-62, -56]]],
  [-67.5, [[-70, -58], [40, 165]]],
  [-72.5, [[-180, 180]]],
  [-77.5, [[-180, 180]]],
  [-82.5, [[-180, 180]]],
  [-87.5, [[-180, 180]]],
];

type Dot = { cp: number; sp: number; cl: number; sl: number };
const DOTS: Dot[] = (() => {
  const out: Dot[] = [];
  for (let lat = -88.75; lat < 90; lat += 2.5) {
    const band = LAND.find(([c]) => lat >= c - 2.5 && lat < c + 2.5);
    if (!band) continue;
    const cp = Math.cos(lat * D2R);
    const n = Math.max(1, Math.round(144 * cp));
    for (let i = 0; i < n; i++) {
      const lon = -180 + ((i + 0.5) * 360) / n;
      if (!band[1].some(([a, b]) => lon >= a - 1.25 && lon <= b + 1.25)) continue;
      out.push({ cp, sp: Math.sin(lat * D2R), cl: Math.cos(lon * D2R), sl: Math.sin(lon * D2R) });
    }
  }
  return out;
})();

type City = { name: string; lat: number; lon: number; side: "l" | "r" };
const CITIES: City[] = [
  { name: "Lagos", lat: 6.5, lon: 3.4, side: "r" },
  { name: "Accra", lat: 5.6, lon: -0.2, side: "l" },
  { name: "Nairobi", lat: -1.3, lon: 36.8, side: "r" },
  { name: "London", lat: 51.5, lon: -0.1, side: "r" },
  { name: "New York", lat: 40.7, lon: -74, side: "l" },
];

const toVec = (lat: number, lon: number) => [Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R), Math.cos(lat * D2R) * Math.cos(lon * D2R)];

// Flight arcs between cities, pre-sampled as (lat, lon, lift).
const ARCS = [
  [4, 0],
  [3, 1],
  [0, 2],
].map(([a, b]) => {
  const p = toVec(CITIES[a].lat, CITIES[a].lon);
  const q = toVec(CITIES[b].lat, CITIES[b].lon);
  const om = Math.acos(p[0] * q[0] + p[1] * q[1] + p[2] * q[2]);
  const pts: { cp: number; sp: number; cl: number; sl: number; h: number }[] = [];
  const N = 36;
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const ka = Math.sin((1 - s) * om) / Math.sin(om);
    const kb = Math.sin(s * om) / Math.sin(om);
    const v = [ka * p[0] + kb * q[0], ka * p[1] + kb * q[1], ka * p[2] + kb * q[2]];
    const lat = Math.asin(v[1]);
    const lon = Math.atan2(v[0], v[2]);
    pts.push({ cp: Math.cos(lat), sp: Math.sin(lat), cl: Math.cos(lon), sl: Math.sin(lon), h: 1 + Math.sin(s * Math.PI) * (0.1 + om * 0.12) });
  }
  return pts;
});

/** Project a point on (or above) the sphere. Returns screen x/y and depth z (-1..1). */
function project(cp: number, sp: number, cl0: number, sl0: number, cc: number, sc: number, r = 1) {
  const cl = cl0 * cc + sl0 * sc; // cos(lon - c)
  const sl = sl0 * cc - cl0 * sc; // sin(lon - c)
  const cT = Math.cos(TILT);
  const sT = Math.sin(TILT);
  const x = cp * sl;
  const y = sp * cT - cp * cl * sT;
  const z = cp * cl * cT + sp * sT;
  return { x: C.x + R * r * x, y: C.y - R * r * y, z, rr: x * x + y * y };
}

// Static latitude lines (rotation around the pole leaves them in place).
const LAT_LINES = (() => {
  let d = "";
  for (const lat of [-45, -22.5, 0, 22.5, 45, 67.5]) {
    let pen = false;
    for (let lon = -180; lon <= 180; lon += 4) {
      const p = project(Math.cos(lat * D2R), Math.sin(lat * D2R), Math.cos(lon * D2R), Math.sin(lon * D2R), 1, 0);
      if (p.z > 0) {
        d += `${pen ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
        pen = true;
      } else pen = false;
    }
  }
  return d;
})();

/* ---------- orbits and items ---------- */

type Orbit = { a: number; b: number; tilt: number; period: number; dir: 1 | -1 };
const ORBITS: Orbit[] = [
  { a: 485, b: 118, tilt: -13, period: 64, dir: 1 },
  { a: 400, b: 160, tilt: 15, period: 78, dir: -1 },
  { a: 320, b: 64, tilt: -24, period: 38, dir: 1 },
];

type CardId = "find" | "sellers" | "paid" | "delivered" | "saved" | "tiktok";
type Item = { key: string; card?: CardId; coin?: string; orbit: number; phase: number; lane: number };

// Order = position on the road (cards and coins interleaved).
const ITEMS: Item[] = [
  { key: "find", card: "find", orbit: 0, phase: 0.04, lane: -1 },
  { key: "c-ngn", coin: "NGN", orbit: 2, phase: 0.0, lane: 1 },
  { key: "sellers", card: "sellers", orbit: 1, phase: 0.62, lane: 1 },
  { key: "c-usd", coin: "USD", orbit: 2, phase: 0.2, lane: -1 },
  { key: "paid", card: "paid", orbit: 1, phase: 0.98, lane: -1 },
  { key: "c-gbp", coin: "GBP", orbit: 2, phase: 0.4, lane: 1 },
  { key: "delivered", card: "delivered", orbit: 0, phase: 0.5, lane: 1 },
  { key: "c-ghs", coin: "GHS", orbit: 2, phase: 0.6, lane: -1 },
  { key: "saved", card: "saved", orbit: 1, phase: 0.3, lane: -1 },
  { key: "c-kes", coin: "KES", orbit: 2, phase: 0.8, lane: 1 },
  { key: "tiktok", card: "tiktok", orbit: 0, phase: 0.8, lane: 1 },
];
const N = ITEMS.length;

// The road: a cubic Bézier from the globe's face, swinging left then sweeping
// down and out past the bottom of the hero. Width grows toward you.
const RB = [
  { x: 550, y: 455 },
  { x: 250, y: 560 },
  { x: 930, y: 650 },
  { x: 700, y: 940 },
];
const ROAD_W = (t: number) => 14 + 450 * Math.pow(t, 1.45);
const ROAD_S = 26; // seconds for an item to travel the whole road
const ROAD_POW = 1.3;
// The road dissolves along its own direction at the near end.
const END_D = (() => {
  const dx = RB[3].x - RB[2].x, dy = RB[3].y - RB[2].y;
  const l = Math.hypot(dx, dy);
  return { x: dx / l, y: dy / l };
})();
const END_B = { x: RB[3].x + END_D.x * 10, y: RB[3].y + END_D.y * 10 };
const END_A = { x: END_B.x - END_D.x * 230, y: END_B.y - END_D.y * 230 };

function bez(t: number) {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return { x: a * RB[0].x + b * RB[1].x + c * RB[2].x + d * RB[3].x, y: a * RB[0].y + b * RB[1].y + c * RB[2].y + d * RB[3].y };
}
function bezN(t: number) {
  const u = 1 - t;
  const dx = 3 * u * u * (RB[1].x - RB[0].x) + 6 * u * t * (RB[2].x - RB[1].x) + 3 * t * t * (RB[3].x - RB[2].x);
  const dy = 3 * u * u * (RB[1].y - RB[0].y) + 6 * u * t * (RB[2].y - RB[1].y) + 3 * t * t * (RB[3].y - RB[2].y);
  const l = Math.hypot(dx, dy) || 1;
  return { x: -dy / l, y: dx / l, a: Math.atan2(dy, dx) };
}
function ribbon(to: number, extra = 0, k = 0.5, steps = 56) {
  if (to <= 0.001) return "";
  const L: string[] = [];
  const Rr: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (to * i) / steps;
    const p = bez(t);
    const n = bezN(t);
    const w = (ROAD_W(t) + extra * (0.3 + t)) * k;
    L.push(`${(p.x + n.x * w).toFixed(1)} ${(p.y + n.y * w).toFixed(1)}`);
    Rr.unshift(`${(p.x - n.x * w).toFixed(1)} ${(p.y - n.y * w).toFixed(1)}`);
  }
  return `M${L.join("L")}L${Rr.join("L")}Z`;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const wrap180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

function ringPath(o: Orbit, k: number, front: boolean) {
  const ct = Math.cos(o.tilt * D2R);
  const st = Math.sin(o.tilt * D2R);
  let d = "";
  const from = front ? 0 : Math.PI;
  for (let i = 0; i <= 60; i++) {
    const th = from + (Math.PI * i) / 60;
    const ex = o.a * k * Math.cos(th);
    const ey = o.b * Math.sin(th);
    d += `${i ? "L" : "M"}${(C.x + ex * ct - ey * st).toFixed(1)} ${(C.y + ex * st + ey * ct).toFixed(1)}`;
  }
  return d;
}

/* ================================================================== */
/* the scene                                                          */
/* ================================================================== */

const TOAST_CARDS: CardId[] = ["find", "saved", "tiktok", "sellers"];

function GlobeScene() {
  const reduce = useReducedMotion();
  const { ref: wrap, step: toastStep, inView } = useLoop([2900, 2900, 2900, 2900], { amount: 0.05 });
  const [toastOn, setToastOn] = useState(false);
  const [box, setBox] = useState({ scale: 1, narrow: false });
  const narrowRef = useRef(false);

  const outer = useRef<(HTMLDivElement | null)[]>([]);
  const inner = useRef<(HTMLDivElement | null)[]>([]);
  const cities = useRef<(HTMLDivElement | null)[]>([]);
  const dots = useRef<(SVGPathElement | null)[]>([]);
  const meridians = useRef<SVGPathElement>(null);
  const arcs = useRef<(SVGPathElement | null)[]>([]);
  const globeG = useRef<SVGGElement>(null);
  const rings = useRef<(SVGGElement | null)[]>([]);
  const road = useRef<SVGPathElement>(null);
  const curb = useRef<SVGPathElement>(null);
  const marks = useRef<SVGPathElement>(null);
  const roadG = useRef<SVGGElement>(null);
  const clock = useRef(0);
  const last = useRef({ t: -1, m: -1, k: 0 });

  // Scroll: 0 = everything in orbit, 1 = everything on the road.
  const { scrollY } = useScroll();
  const raw = useTransform(scrollY, (v) => clamp01((v - 30) / (narrowRef.current ? 400 : 470)));
  const sprung = useSpring(raw, { stiffness: 90, damping: 22, restDelta: 0.0005 });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      const narrow = w < 700;
      narrowRef.current = narrow;
      setBox({ scale: Math.min(1, Math.max(narrow ? 0.6 : 0.7, w / W)), narrow });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [wrap]);

  useEffect(() => {
    if (!inView || reduce) return;
    setToastOn(true);
    const id = setTimeout(() => setToastOn(false), 1800);
    return () => clearTimeout(id);
  }, [toastStep, inView, reduce]);

  const k = box.narrow ? 0.66 : 1; // squeeze orbits on phones
  const ringD = useMemo(() => ORBITS.map((o) => ({ back: ringPath(o, k, false), front: ringPath(o, k, true) })), [k]);

  useAnimationFrame((_, delta) => {
    if (!inView && last.current.t >= 0) return;
    if (!reduce) clock.current += Math.min(delta, 60) / 1000;
    const t = clock.current;
    const m = reduce ? raw.get() : sprung.get();
    if (t === last.current.t && Math.abs(m - last.current.m) < 0.0004 && last.current.k === k) return;
    const mChanged = Math.abs(m - last.current.m) >= 0.0004 || last.current.k !== k;
    last.current = { t, m, k };

    /* globe: shrink and lift a little as the road takes over */
    const gm = smooth(m);
    const gs = 1 - 0.2 * gm;
    const gy = -36 * gm;
    globeG.current?.setAttribute("transform", `translate(${C.x} ${C.y + gy}) scale(${gs.toFixed(4)}) translate(${-C.x} ${-C.y})`);

    const c = (LON0 - (t * 360) / SPIN_S) * D2R;
    const cc = Math.cos(c);
    const sc = Math.sin(c);
    const cT = Math.cos(TILT);
    const sT = Math.sin(TILT);

    let d0 = "", d1 = "", d2 = "";
    for (let i = 0; i < DOTS.length; i++) {
      const p = DOTS[i];
      const cl = p.cl * cc + p.sl * sc;
      const z = p.cp * cl * cT + p.sp * sT;
      if (z < 0.04) continue;
      const sl = p.sl * cc - p.cl * sc;
      const x = C.x + R * p.cp * sl;
      const y = C.y - R * (p.sp * cT - p.cp * cl * sT);
      const seg = `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
      if (z > 0.6) d2 += seg;
      else if (z > 0.28) d1 += seg;
      else d0 += seg;
    }
    dots.current[0]?.setAttribute("d", d0);
    dots.current[1]?.setAttribute("d", d1);
    dots.current[2]?.setAttribute("d", d2);

    // meridians turn with the globe
    let md = "";
    for (let lon = -180; lon < 180; lon += 30) {
      const cl0 = Math.cos(lon * D2R), sl0 = Math.sin(lon * D2R);
      let pen = false;
      for (let lat = -84; lat <= 84; lat += 6) {
        const p = project(Math.cos(lat * D2R), Math.sin(lat * D2R), cl0, sl0, cc, sc);
        if (p.z > 0) {
          md += `${pen ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          pen = true;
        } else pen = false;
      }
    }
    meridians.current?.setAttribute("d", md);

    // flight arcs, hidden where the globe covers them
    ARCS.forEach((pts, ai) => {
      let d = "";
      let pen = false;
      for (const q of pts) {
        const p = project(q.cp, q.sp, q.cl, q.sl, cc, sc, q.h);
        const vis = p.z > 0 || p.rr * q.h * q.h > 1.0;
        if (vis) {
          d += `${pen ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          pen = true;
        } else pen = false;
      }
      arcs.current[ai]?.setAttribute("d", d);
      arcs.current[ai + ARCS.length]?.setAttribute("d", d);
    });

    // city hotspots (HTML, so they follow the globe transform by hand)
    CITIES.forEach((city, ci) => {
      const el = cities.current[ci];
      if (!el) return;
      const p = project(Math.cos(city.lat * D2R), Math.sin(city.lat * D2R), Math.cos(city.lon * D2R), Math.sin(city.lon * D2R), cc, sc);
      const x = C.x + (p.x - C.x) * gs;
      const y = C.y + gy + (p.y - C.y) * gs;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      el.style.opacity = (smooth((p.z - 0.08) * 4) * (1 - smooth(m * 1.8))).toFixed(3);
    });

    /* orbit rings fade as the road forms */
    rings.current.forEach((g) => g?.setAttribute("opacity", (1 - smooth(m * 1.6)).toFixed(3)));

    /* the road */
    if (mChanged) {
      const reveal = smooth(m * 1.25);
      road.current?.setAttribute("d", ribbon(reveal));
      curb.current?.setAttribute("d", ribbon(reveal, 26));
      roadG.current?.setAttribute("opacity", smooth(m * 4).toFixed(3));
    }
    if (m > 0.01) {
      let d = "";
      const reveal = smooth(m * 1.25);
      for (let j = 0; j < 18; j++) {
        const u = (j / 18 + t / ROAD_S) % 1;
        const ta = Math.pow(u, ROAD_POW);
        const tb = Math.pow(Math.min(1, u + 0.02), ROAD_POW);
        if (tb > reveal) continue;
        const a = bez(ta), b = bez(tb), na = bezN(ta), nb = bezN(tb);
        const wa = ROAD_W(ta) * 0.011, wb = ROAD_W(tb) * 0.011;
        d += `M${(a.x + na.x * wa).toFixed(1)} ${(a.y + na.y * wa).toFixed(1)}L${(b.x + nb.x * wb).toFixed(1)} ${(b.y + nb.y * wb).toFixed(1)}L${(b.x - nb.x * wb).toFixed(1)} ${(b.y - nb.y * wb).toFixed(1)}L${(a.x - na.x * wa).toFixed(1)} ${(a.y - na.y * wa).toFixed(1)}Z`;
      }
      marks.current?.setAttribute("d", d);
    }

    /* items: blend orbit position into road position */
    const narrow = k < 1;
    for (let i = 0; i < N; i++) {
      const el = outer.current[i];
      const inn = inner.current[i];
      if (!el || !inn) continue;
      const it = ITEMS[i];
      const isCoin = !!it.coin;
      const o = ORBITS[it.orbit];

      // orbit
      const th = (it.phase + (o.dir * t) / o.period) * TAU;
      const ct = Math.cos(o.tilt * D2R), st = Math.sin(o.tilt * D2R);
      const ex = o.a * k * Math.cos(th), ey = o.b * Math.sin(th);
      const ox = C.x + ex * ct - ey * st;
      const oy = C.y + ex * st + ey * ct;
      const depth = Math.sin(th);
      const base = isCoin ? 0.5 : narrow ? 1.3 : 1.12;
      const oS = base * (0.86 + 0.14 * depth);
      const oOp = depth < 0 ? 0.5 + 0.5 * (1 + depth) : 1;
      const oZ = depth < 0 ? 10 + Math.round((1 + depth) * 30) : 60 + Math.round(depth * 30);

      // road
      const u = (i / N + t / ROAD_S) % 1;
      const tt = Math.pow(u, ROAD_POW);
      const p = bez(tt);
      const n = bezN(tt);
      const w = ROAD_W(tt);
      const rx = p.x + n.x * it.lane * w * 0.25;
      const ry = p.y + n.y * it.lane * w * 0.25;
      const rS = (w / ROAD_W(1)) * (isCoin ? 1.45 : 1.22) + 0.05;
      const rOp = smooth(u / 0.06) * (1 - smooth((u - 0.78) / 0.12));
      const rZ = 100 + Math.round(u * 100);

      // per-item stagger: the far end of the road fills first
      const e = smooth((m - (i / N) * 0.32) / 0.6);
      const lift = Math.sin(e * Math.PI) * 70;
      const x = lerp(ox, rx, e);
      const y = lerp(oy, ry, e) - lift;
      const s = lerp(oS, rS, e);
      const op = lerp(oOp, rOp, e);
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale(${s.toFixed(3)})`;
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = String(e > 0.5 ? rZ : oZ);

      const roadAng = (n.a * 180) / Math.PI - 90;
      if (isCoin) {
        const spin = wrap180(t * 70 + it.phase * 360) * (1 - e);
        const rxDeg = lerp(12, 58, e);
        inn.style.transform = `perspective(700px) rotateX(${rxDeg.toFixed(1)}deg) rotateY(${spin.toFixed(1)}deg) rotateZ(${(roadAng * 0.2 * e).toFixed(1)}deg)`;
      } else {
        const ryDeg = -Math.cos(th) * 26 * (1 - e);
        const rxDeg = lerp(depth * 6, 30, e);
        const rz = lerp(o.tilt * 0.45, roadAng * 0.1 + it.lane * 3, e);
        inn.style.transform = `perspective(900px) rotateX(${rxDeg.toFixed(1)}deg) rotateY(${ryDeg.toFixed(1)}deg) rotateZ(${rz.toFixed(1)}deg)`;
      }
    }
  });

  const toastCard = toastOn ? TOAST_CARDS[toastStep % TOAST_CARDS.length] : null;
  const { scale } = box;

  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none relative w-full overflow-x-clip" style={{ height: H * scale, marginTop: -110 * scale }}>
      <div className="bh-stage absolute left-1/2 top-0 origin-top" style={{ width: W, height: H, transform: `translateX(-50%) scale(${scale})` }}>
        {/* soft backdrop */}
        <div className="absolute left-1/2 top-[70px] size-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--bh-halo),transparent)]" />
        <div className="dot-grid absolute inset-x-0 top-[40px] h-[720px] [mask-image:radial-gradient(closest-side,black,transparent)] opacity-70" />

        {/* back halves of the orbit rings */}
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" style={{ zIndex: 5 }}>
          {ringD.map((r, i) => (
            <g key={i} ref={(el) => { rings.current[i] = el; }}>
              <path d={r.back} className="bh-ring" strokeDasharray={i === 2 ? "2 7" : undefined} />
            </g>
          ))}
        </svg>

        {/* the globe */}
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" style={{ zIndex: 50 }}>
          <defs>
            <radialGradient id="bh-sea" cx="0.38" cy="0.3" r="0.8">
              <stop offset="0" style={{ stopColor: "var(--bh-sea-hi)" }} />
              <stop offset="0.55" style={{ stopColor: "var(--bh-sea-mid)" }} />
              <stop offset="1" style={{ stopColor: "var(--bh-sea-lo)" }} />
            </radialGradient>
            <radialGradient id="bh-rim" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.72" stopColor="#c6f36d" stopOpacity="0" />
              <stop offset="0.97" style={{ stopColor: "var(--bh-rim)" }} />
              <stop offset="1" stopColor="#c6f36d" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bh-shade" cx="0.7" cy="0.78" r="0.75">
              <stop offset="0" style={{ stopColor: "var(--bh-shade)" }} />
              <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <filter id="bh-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="18" />
            </filter>
          </defs>
          <g ref={globeG}>
            <ellipse cx={C.x} cy={C.y + R + 26} rx={R * 0.8} ry={22} className="bh-floor" filter="url(#bh-blur)" />
            <circle cx={C.x} cy={C.y} r={R + 10} className="bh-atmo" filter="url(#bh-blur)" />
            <circle cx={C.x} cy={C.y} r={R} fill="url(#bh-sea)" />
            <path d={LAT_LINES} className="bh-grid" />
            <path ref={meridians} className="bh-grid" />
            <path ref={(el) => { dots.current[0] = el; }} className="bh-dot" strokeWidth="2.6" opacity="0.32" />
            <path ref={(el) => { dots.current[1] = el; }} className="bh-dot" strokeWidth="3.2" opacity="0.62" />
            <path ref={(el) => { dots.current[2] = el; }} className="bh-dot" strokeWidth="3.6" opacity="0.92" />
            <circle cx={C.x} cy={C.y} r={R} fill="url(#bh-shade)" />
            <circle cx={C.x} cy={C.y} r={R} fill="url(#bh-rim)" />
            {ARCS.map((_, i) => (
              <g key={i}>
                <path ref={(el) => { arcs.current[i] = el; }} className="bh-arc-glow" />
              </g>
            ))}
            {ARCS.map((_, i) => (
              <path key={i} ref={(el) => { if (el) arcs.current[i + ARCS.length] = el; }} className="bh-arc" style={{ animationDelay: `${-i * 0.4}s` }} />
            ))}
          </g>
        </svg>

        {/* city hotspots */}
        <div className="absolute inset-0" style={{ zIndex: 51 }}>
          {CITIES.map((city, i) => (
            <div key={city.name} ref={(el) => { cities.current[i] = el; }} className="absolute left-0 top-0" style={{ opacity: 0 }}>
              <span className="bh-ping absolute -left-[11px] -top-[11px] size-[22px] rounded-full" style={{ animationDelay: `${i * 0.45}s` }} />
              <span className="absolute -left-[5px] -top-[5px] size-[10px] rounded-full border-2 border-white bg-green shadow-[0_0_0_3px_rgb(13_150_94/.25),0_0_14px_rgb(13_150_94/.8)] dark:bg-lime" />
              <span
                className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-paper/90 px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-2 shadow-[var(--shadow-card)] ring-1 ring-line backdrop-blur ${city.side === "r" ? "left-3" : "right-3"}`}
              >
                {city.name}
              </span>
            </div>
          ))}
        </div>

        {/* front halves of the rings + the road */}
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" style={{ zIndex: 55 }}>
          <defs>
            <linearGradient id="bh-road" gradientUnits="userSpaceOnUse" x1={RB[0].x} y1={RB[0].y} x2={RB[3].x} y2={RB[3].y}>
              <stop offset="0" stopColor="#0d965e" stopOpacity="0" />
              <stop offset="0.12" stopColor="#0d965e" />
              <stop offset="0.5" stopColor="#0a6b43" />
              <stop offset="1" stopColor="#063a25" />
            </linearGradient>
            <linearGradient id="bh-curb" gradientUnits="userSpaceOnUse" x1={RB[0].x} y1={RB[0].y} x2={RB[3].x} y2={RB[3].y}>
              <stop offset="0" stopColor="#c6f36d" stopOpacity="0" />
              <stop offset="0.15" stopColor="#c6f36d" stopOpacity="0.95" />
              <stop offset="1" stopColor="#9be7bd" />
            </linearGradient>
            <linearGradient id="bh-end" gradientUnits="userSpaceOnUse" x1={END_A.x} y1={END_A.y} x2={END_B.x} y2={END_B.y}>
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="bh-road-mask" maskUnits="userSpaceOnUse" x="-600" y="-600" width="2400" height="2400">
              <rect x="-600" y="-600" width="2400" height="2400" fill="url(#bh-end)" />
            </mask>
          </defs>
          {ringD.map((r, i) => (
            <g key={i} ref={(el) => { rings.current[i + 3] = el; }}>
              <path d={r.front} className="bh-ring bh-ring-front" strokeDasharray={i === 2 ? "2 7" : undefined} />
            </g>
          ))}
          <g ref={roadG} opacity="0" mask="url(#bh-road-mask)">
            <path ref={curb} fill="url(#bh-curb)" />
            <path ref={road} fill="url(#bh-road)" />
            <path ref={marks} fill="#c6f36d" opacity="0.6" />
          </g>
        </svg>

        {/* orbiting cards and coins */}
        {ITEMS.map((it, i) => (
          <div
            key={it.key}
            ref={(el) => { outer.current[i] = el; }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ opacity: 0 }}
          >
            <div ref={(el) => { inner.current[i] = el; }} style={{ transformStyle: "preserve-3d" }}>
              {it.coin ? <Coin spec={COINS[it.coin]} size={110} /> : <CardView id={it.card!} toast={toastCard === it.card} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* cards                                                              */
/* ================================================================== */

function Shell({ children, className = "", toast }: { children: ReactNode; className?: string; toast?: ReactNode }) {
  return (
    <div className={`relative rounded-[18px] bg-paper text-left shadow-[0_1px_2px_rgb(9_9_11/.06),0_22px_44px_-18px_rgb(9_9_11/.32)] ring-1 ring-line dark:shadow-[0_1px_2px_rgb(0_0_0/.5),0_22px_44px_-18px_rgb(0_0_0/.9)] dark:ring-white/10 ${className}`}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 520, damping: 22 }}
            className="absolute -top-4 right-3 z-10 origin-bottom-right"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toast({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink pl-1 pr-2.5 text-[11.5px] font-semibold text-canvas shadow-[0_8px_20px_-6px_rgb(0_0_0/.45)]">
      <span className="grid size-5 place-items-center rounded-full bg-lime text-[#0a3b27]">{icon}</span>
      {label}
    </span>
  );
}

const foundToast = <Toast icon={<Check size={11} strokeWidth={3.5} />} label="Found it" />;
const savedToast = <Toast icon={<Heart size={10} strokeWidth={3} fill="currentColor" />} label="Saved" />;

function CardView({ id, toast }: { id: CardId; toast: boolean }) {
  switch (id) {
    case "find":
      return (
        <Shell className="w-[236px] p-2.5" toast={toast ? foundToast : null}>
          <div className="flex gap-2.5">
            <div className="relative size-[60px] shrink-0 overflow-hidden rounded-[12px]">
              <Tote className="size-full" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5 leading-tight">
              <p className="truncate text-[13px] font-semibold tracking-tight text-ink">Ankara tote</p>
              <p className="mt-0.5 font-display text-[18px] font-bold tracking-[-0.045em] text-ink">₦45,000</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-medium text-muted">
                <AppTile kind="pin" size={15} className="!shadow-none" /> Found on Pinterest
              </p>
            </div>
          </div>
        </Shell>
      );
    case "tiktok":
      return (
        <Shell className="w-[236px] p-2.5" toast={toast ? foundToast : null}>
          <div className="flex gap-2.5">
            <div className="relative size-[60px] shrink-0 overflow-hidden rounded-[12px]">
              <Sneaker />
            </div>
            <div className="min-w-0 flex-1 pt-0.5 leading-tight">
              <p className="truncate text-[13px] font-semibold tracking-tight text-ink">Court sneakers</p>
              <p className="mt-0.5 font-display text-[18px] font-bold tracking-[-0.045em] text-ink">KSh 8,200</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-medium text-muted">
                <AppTile kind="video" size={15} className="!shadow-none" /> Found on TikTok
              </p>
            </div>
          </div>
        </Shell>
      );
    case "sellers":
      return (
        <Shell className="w-[206px] p-3" toast={toast ? savedToast : null}>
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {[
                ["kemi.closet", 22],
                ["ada.finds", 262],
                ["tobi.store", 150],
              ].map(([n, h], i) => (
                <span key={n} className="grid rounded-full bg-paper p-[2px]" style={{ zIndex: 3 - i }}>
                  <Blobatar name={n as string} hue={h as number} size={24} expression={i === 0 ? happy : idle} />
                </span>
              ))}
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold tracking-tight text-ink">3 sellers found</p>
              <p className="mt-0.5 text-[10.5px] text-muted">Best price picked</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between rounded-[10px] bg-sunken px-2.5 py-1.5 text-[11px]">
            <span className="text-muted">From</span>
            <span className="font-semibold text-green">₦39,500</span>
          </div>
        </Shell>
      );
    case "paid":
      return (
        <Shell className="w-[196px] p-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-green text-white shadow-[0_6px_14px_-6px_rgb(13_150_94/.9)]">
              <Check size={17} strokeWidth={3} />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold tracking-tight text-ink">Paid in GH₵</p>
              <p className="mt-0.5 font-display text-[16px] font-bold tracking-[-0.04em] text-ink">GH₵ 350.00</p>
            </div>
          </div>
          <p className="mt-2 text-[10.5px] font-medium text-green">No need to convert</p>
        </Shell>
      );
    case "delivered":
      return (
        <Shell className="w-[204px] p-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-orange-tint text-orange">
              <Package size={18} strokeWidth={2.2} />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold tracking-tight text-ink">Delivered today</p>
              <p className="mt-0.5 text-[10.5px] text-muted">Lagos, 2:14 pm</p>
            </div>
          </div>
          <div className="mt-2.5 flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1 flex-1 rounded-full bg-green" />
            ))}
          </div>
        </Shell>
      );
    case "saved":
      return (
        <Shell className="w-auto py-1.5 pl-1.5 pr-3.5" toast={toast ? savedToast : null}>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-red-tint text-rose">
              <Heart size={16} strokeWidth={2.4} fill="currentColor" className="bh-beat" />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold tracking-tight text-ink">Saved</p>
              <p className="text-[10.5px] text-muted">12 finds</p>
            </div>
          </div>
        </Shell>
      );
  }
}

/** A flat court sneaker, drawn in the same sticker style as the tote. */
function Sneaker() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
      <rect width="64" height="64" fill="#e4defb" />
      <ellipse cx="33" cy="47.5" rx="24" ry="2.4" fill="rgb(0 0 0 / .1)" />
      <g stroke="#0a0a0a" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M8 40c0-7 1.5-12 4-15h8c2.5 4 7 6.5 13 7.5l14 2.5c5 1 8 3.5 8 6v1H8z" fill="#fbfaf6" />
        <path d="M8 41h47v2.5a2.5 2.5 0 0 1-2.5 2.5h-42A2.5 2.5 0 0 1 8 43.5z" fill="#c6f36d" />
        <path d="M12 25h8c1 2 2 3 3.5 4" fill="none" />
        <path d="M24 30.5l2.5-3M28 32l2.5-3M32 33l2.5-3" fill="none" strokeWidth="1.5" />
        <path d="M36 35.5c5 .5 10 2 13 5.5" fill="none" stroke="#7c6cf2" strokeWidth="3.2" />
        <path d="M8 36h7" fill="none" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

/* ================================================================== */
/* scoped styles                                                      */
/* ================================================================== */

const CSS = `
.bh-stage{
  --bh-sea-hi:#ffffff; --bh-sea-mid:#f7fcf9; --bh-sea-lo:#dbeee4;
  --bh-dot:#0d965e; --bh-grid:rgb(13 150 94 / .14); --bh-rim:rgb(13 150 94 / .2);
  --bh-shade:rgb(10 59 39 / .1); --bh-atmo:rgb(13 150 94 / .13); --bh-floor:rgb(10 59 39 / .22);
  --bh-ring:rgb(9 9 11 / .16); --bh-arc:#0d965e; --bh-halo:rgb(13 150 94 / .07);
}
[data-theme="dark"] .bh-stage{
  --bh-sea-hi:#1c3b2c; --bh-sea-mid:#0e2219; --bh-sea-lo:#06100b;
  --bh-dot:#6fe7a7; --bh-grid:rgb(155 231 189 / .09); --bh-rim:rgb(111 231 167 / .32);
  --bh-shade:rgb(0 0 0 / .45); --bh-atmo:rgb(13 150 94 / .38); --bh-floor:rgb(0 0 0 / .6);
  --bh-ring:rgb(255 255 255 / .16); --bh-arc:#c6f36d; --bh-halo:rgb(13 150 94 / .16);
}
.bh-stage .bh-dot{fill:none;stroke:var(--bh-dot);stroke-linecap:round}
.bh-stage .bh-grid{fill:none;stroke:var(--bh-grid);stroke-width:1}
.bh-stage .bh-atmo{fill:var(--bh-atmo)}
.bh-stage .bh-floor{fill:var(--bh-floor)}
.bh-stage .bh-ring{fill:none;stroke:var(--bh-ring);stroke-width:1.2}
.bh-stage .bh-arc{fill:none;stroke:var(--bh-arc);stroke-width:1.8;stroke-linecap:round;stroke-dasharray:3 6;animation:bh-dash 1.1s linear infinite}
.bh-stage .bh-arc-glow{fill:none;stroke:var(--bh-arc);stroke-width:5;stroke-linecap:round;opacity:.12}
.bh-stage .bh-ping{background:rgb(13 150 94 / .35);animation:bh-ping 2.4s cubic-bezier(.16,1,.3,1) infinite}
[data-theme="dark"] .bh-stage .bh-ping{background:rgb(198 243 109 / .35)}
.bh-stage .bh-beat{animation:bh-beat 1.6s ease-in-out infinite;transform-origin:center}
@keyframes bh-dash{to{stroke-dashoffset:-18}}
@keyframes bh-ping{0%{transform:scale(.4);opacity:1}100%{transform:scale(2.6);opacity:0}}
@keyframes bh-beat{0%,60%,100%{transform:scale(1)}15%{transform:scale(1.25)}30%{transform:scale(.95)}45%{transform:scale(1.12)}}
`;
