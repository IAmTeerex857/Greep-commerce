"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { P, boxHull, pts, pts2, r2, type V2, type V3 } from "./iso";
import {
  BeltBack,
  BeltFront,
  BeltGlow,
  CHATM,
  ChatScreen,
  DOOR,
  DOOR_PTS,
  DoorLeaf,
  Doorway,
  Floor,
  HOLE_PTS,
  HouseBack,
  HouseFront,
  HubBody,
  HubMouth,
  ITEM_KINDS,
  ParcelArt,
  Legs,
  Machine,
  Porch,
  Printer,
  REVIEWS,
  ReviewsScreen,
  STATUS,
  StatusScreen,
  TunnelBack,
  TunnelLight,
  WIRES,
  Wire,
  viewBox,
} from "./art";
import { CHAT, HALF, HUB_X, PRN_X, L, N, T, TS, V, XE, SLAT, ZB, chatAt, doorAt, parcelAt, starsAt, stepAt } from "./model";
import { CSS } from "./styles";

const VB = viewBox();
const BIG = "-999,-999 999,-999 999,999 -999,999";
const STILL_T = 8.2; // reduced motion: featured order is on the way

/** Screen polyline with cumulative lengths, for pulses running along a wire. */
function track(path: V3[]) {
  const p = path.map(([x, y, z]) => P(x, y, z));
  const acc = [0];
  for (let i = 1; i < p.length; i++) acc.push(acc[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  return { p, acc, len: acc[acc.length - 1] };
}
function along(tr: ReturnType<typeof track>, s: number): V2 {
  const d = Math.max(0, Math.min(1, s)) * tr.len;
  let i = 1;
  while (i < tr.acc.length - 1 && tr.acc[i] < d) i++;
  const k = (d - tr.acc[i - 1]) / (tr.acc[i] - tr.acc[i - 1] || 1);
  const a = tr.p[i - 1];
  const b = tr.p[i];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}
const TRACKS = { status: track(WIRES.status), reviews: track(WIRES.reviews), chat: track(WIRES.chat) };

export function DoorstepFigure({ onStep }: { onStep?: (step: number) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(wrap, { amount: 0.15 });
  const reduce = useReducedMotion();
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const q = <E extends Element>(s: string) => svg.querySelector<E>(s)!;
    const qa = <E extends Element>(s: string) => Array.from(svg.querySelectorAll<E>(s));

    const slots = Array.from({ length: N }, (_, i) => ({
      belt: q<SVGGElement>(`[data-belt="${i}"]`),
      beltClip: q<SVGPolygonElement>(`#ds-cb-${i} polygon`),
      hub: q<SVGGElement>(`[data-hubin="${i}"]`),
      front: q<SVGGElement>(`[data-front="${i}"]`),
      frontClip: q<SVGPolygonElement>(`#ds-cf-${i} polygon`),
      house: q<SVGGElement>(`[data-housein="${i}"]`),
      porch: q<SVGGElement>(`[data-porch="${i}"]`),
      porchClip: q<SVGPolygonElement>(`#ds-cp-${i} polygon`),
    }));
    const slats = qa<SVGPathElement>("[data-slats]");
    const spill = q<SVGPolygonElement>("[data-spill]");
    const scan = q<SVGPolygonElement>("[data-scan]");
    const curtain = q<SVGPolygonElement>("[data-curtain]");
    const lamp = q<SVGCircleElement>("[data-hub-lamp]");
    const door = q<SVGPolygonElement>("[data-door]");
    const knob = q<SVGCircleElement>("[data-knob]");
    const pin = q<SVGGElement>("[data-pin]");
    const pill = q<SVGGElement>("[data-pill]");
    const status = q<SVGGElement>(".status");
    const chat = q<SVGGElement>(".chat");
    const reviews = q<SVGGElement>(".reviews");
    const stars = qa<SVGPathElement>(".star");
    const pulses = {
      status: q<SVGCircleElement>('[data-pulse="status"]'),
      reviews: q<SVGCircleElement>('[data-pulse="reviews"]'),
      chat: q<SVGCircleElement>('[data-pulse="chat"]'),
    };

    const show = (el: Element, on: boolean) => {
      (el as SVGElement).style.display = on ? "" : "none";
    };
    const at = (el: Element, x: number, y: number, z: number) => {
      const [a, b] = P(x, y, z);
      el.setAttribute("transform", `translate(${r2(a)} ${r2(b)})`);
    };

    let lastStep = -1;
    let stepT = -10;
    let lastChat = -1;
    let lastStars = -1;
    let lastPill = false;

    const render = (t: number, live: boolean) => {
      let glow = 0;
      let lampOn = false;
      let doorDeg = 0;
      let pillAt: number | null = null;

      for (let i = 0; i < N; i++) {
        const tau = (((t + i * T) % L) + L) % L;
        const s = slots[i];
        const p = parcelAt(tau);
        const isBox = p.phase !== "belt" || p.x >= 0;

        // belt, before the hub: the receipt or card
        const onBelt = p.phase === "belt" && p.x < 0 && p.x + 10 > PRN_X;
        show(s.belt, onBelt);
        if (onBelt) {
          at(s.belt.firstElementChild!, p.x, p.y, p.z);
          s.beltClip.setAttribute("points", p.x - 10 < PRN_X ? pts2(boxHull(PRN_X, p.y - 10, p.z, p.x + 10, p.y + 10, p.z + 2)) : BIG);
          if (p.x > -44 && p.x < -26) lampOn = true;
        }

        // inside the tunnel, seen through the mouth only
        const inHub = p.phase === "belt" && p.x >= 0 && p.x - HALF < HUB_X;
        show(s.hub, inHub);
        if (inHub) at(s.hub, p.x, p.y, p.z);

        // out of the mouth and down the belt; clipped while it straddles the mouth
        const front = isBox && p.phase === "belt" && p.x + HALF > HUB_X && p.x < XE + 1;
        show(s.front, front);
        if (front) {
          at(s.front.firstElementChild!, p.x, p.y, p.z);
          const rear = p.x - HALF;
          s.frontClip.setAttribute("points", rear < HUB_X ? pts2(boxHull(HUB_X, p.y - HALF, p.z, p.x + HALF, p.y + HALF, p.z + 11)) : BIG);
        }
        if (isBox && p.x > HUB_X - 8 && p.x < HUB_X + 60) {
          const k = Math.min(1, (p.x - (HUB_X - 8)) / 14) * Math.min(1, (HUB_X + 60 - p.x) / 30);
          glow = Math.max(glow, k);
        }

        // tipping off the end, landing on the porch, going in the door
        const porch = (p.phase === "belt" && p.x >= XE + 1) || p.phase === "fall" || p.phase === "porch" || (p.phase === "in" && p.y + HALF > 0);
        show(s.porch, porch);
        if (porch) {
          at(s.porch.firstElementChild!, p.x, p.y, p.z);
          const back = p.y - HALF;
          s.porchClip.setAttribute("points", back < 0 ? pts2(boxHull(p.x - HALF, 0, p.z, p.x + HALF, p.y + HALF, p.z + 11)) : BIG);
        }
        const inside = p.phase === "in" && p.y - HALF < 0;
        show(s.house, inside);
        if (inside) at(s.house, p.x, p.y, p.z);

        doorDeg = Math.max(doorDeg, doorAt(tau));
        if (tau > TS - 0.05 && tau < TS + 1.15) pillAt = tau;

        if (i === 0) {
          // featured order: the pin rides above it, status follows it
          const hidden = (p.phase === "belt" && (p.x < PRN_X + 10 || (p.x > -40 && p.x < 40))) || tau > TS - 0.2;
          const lift = p.phase === "belt" && p.x < 0 ? 3 : 13.5;
          const bob = Math.sin(t * 3.2) * 1.2;
          const [a, b] = P(p.x, p.y, p.z + lift);
          pin.setAttribute("transform", `translate(${r2(a)} ${r2(b + bob)})`);
          pin.setAttribute("data-on", hidden ? "0" : "1");
          const st = stepAt(tau);
          if (st !== lastStep) {
            lastStep = st;
            stepT = t;
            status.setAttribute("data-step", String(st));
            onStepRef.current?.(st);
          }
        }
      }

      // belt slats run at belt speed
      const off = (t * V) % SLAT;
      const [ox, oy] = P(off, 0, 0);
      for (const el of slats) el.setAttribute("transform", `translate(${r2(ox)} ${r2(oy)})`);

      // tunnel light
      spill.setAttribute("opacity", r2(0.25 + 0.75 * glow));
      scan.setAttribute("opacity", r2(0.35 + 0.65 * glow));
      curtain.setAttribute("opacity", r2(0.4 + 0.6 * glow));
      lamp.setAttribute("data-on", lampOn ? "1" : "0");

      // door leaf swings in about its left hinge
      const th = (doorDeg * Math.PI) / 180;
      const w = DOOR.x1 - DOOR.x0;
      const fx = DOOR.x0 + w * Math.cos(th);
      const fy = -w * Math.sin(th);
      door.setAttribute(
        "points",
        pts([
          [DOOR.x0, 0, DOOR.z0],
          [fx, fy, DOOR.z0],
          [fx, fy, DOOR.z1],
          [DOOR.x0, 0, DOOR.z1],
        ]),
      );
      door.setAttribute("data-open", doorDeg > 40 ? "1" : "0");
      const kx = DOOR.x0 + (w - 2.4) * Math.cos(th);
      const ky = -(w - 2.4) * Math.sin(th);
      const [ka, kb] = P(kx, ky + 0.6, (DOOR.z0 + DOOR.z1) / 2);
      knob.setAttribute("cx", r2(ka));
      knob.setAttribute("cy", r2(kb));

      // delivered pill
      const pillOn = pillAt !== null;
      if (pillOn !== lastPill) {
        lastPill = pillOn;
        pill.setAttribute("data-on", pillOn ? "1" : "0");
      }

      // chat and reviews screens cycle on their own clocks
      const c = chatAt(((t % CHAT) + CHAT) % CHAT);
      if (c !== lastChat) {
        lastChat = c;
        chat.setAttribute("data-c", String(c));
      }
      const r = ((t % L) + L) % L;
      const n = starsAt(r);
      if (n !== lastStars) {
        lastStars = n;
        reviews.setAttribute("data-r", String(n));
        stars.forEach((el, i) => el.setAttribute("data-on", i < n ? "1" : "0"));
      }

      // pulses run from the hub out to each machine
      const pulse = (el: SVGCircleElement, tr: ReturnType<typeof track>, s: number) => {
        const on = live && s >= 0 && s <= 1;
        el.setAttribute("opacity", on ? r2(Math.min(1, s * 6, (1 - s) * 6)) : "0");
        if (on) {
          const [a, b] = along(tr, s);
          el.setAttribute("cx", r2(a));
          el.setAttribute("cy", r2(b));
        }
      };
      pulse(pulses.status, TRACKS.status, (t - stepT) / 0.9);
      pulse(pulses.chat, TRACKS.chat, ((((t % CHAT) + CHAT) % CHAT) - 0.55) / 0.8);
      pulse(pulses.reviews, TRACKS.reviews, (r - 0.15) / 0.75);
    };

    let raf = 0;
    let last = 0;
    let clock = 0.6;
    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      clock += dt;
      render(clock, true);
      raf = requestAnimationFrame(frame);
    };

    svg.setAttribute("data-run", inView && !reduce ? "1" : "0");
    if (reduce) {
      render(STILL_T, false);
      return;
    }
    render(clock, true);
    if (inView) raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [inView, reduce]);

  return (
    <div ref={wrap} className="relative">
      <svg
        ref={svgRef}
        className="ds block h-auto w-full select-none"
        viewBox={`${r2(VB.x)} ${r2(VB.y)} ${r2(VB.w)} ${r2(VB.h)}`}
        role="img"
        aria-label="Orders ride a belt into a Greep hub, come out as taped parcels and land on a doorstep. Side screens show the order status, a chat with the seller, and reviews."
      >
        <style>{CSS}</style>
        <defs>
          <radialGradient id="ds-floor-fade" cx="50%" cy="52%" r="55%">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset=".7" stopColor="#fff" stopOpacity=".35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="ds-floor-mask" maskContentUnits="userSpaceOnUse">
            <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="url(#ds-floor-fade)" />
          </mask>
          <clipPath id="ds-hole">
            <polygon points={HOLE_PTS} />
          </clipPath>
          <clipPath id="ds-doorway">
            <polygon points={DOOR_PTS} />
          </clipPath>
          {Array.from({ length: N }, (_, i) => (
            <g key={i}>
              <clipPath id={`ds-cf-${i}`}>
                <polygon points={BIG} />
              </clipPath>
              <clipPath id={`ds-cb-${i}`}>
                <polygon points={BIG} />
              </clipPath>
              <clipPath id={`ds-cp-${i}`}>
                <polygon points={BIG} />
              </clipPath>
            </g>
          ))}
          <linearGradient id="ds-tshade" gradientUnits="userSpaceOnUse" x1={r2(P(HUB_X, 12, 32)[0])} y1={r2(P(HUB_X, 12, 32)[1])} x2={r2(P(HUB_X, 12, ZB)[0])} y2={r2(P(HUB_X, 12, ZB)[1])}>
            <stop offset="0" stopColor="#000" stopOpacity=".45" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <filter id="ds-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        <Floor />

        {/* back row: status and reviews */}
        <Machine m={STATUS} accent="var(--color-green)" port={{ face: "y", at: STATUS.x + 22 }} knob>
          <StatusScreen />
        </Machine>
        <Machine m={REVIEWS} accent="var(--color-sun)" port={{ face: "y", at: 40 }}>
          <ReviewsScreen />
        </Machine>

        {/* left belt, behind the hub */}
        <Legs side="left" />
        <Printer />
        <BeltBack xa={PRN_X} xb={HUB_X - 48} id="l" />
        <g>
          {Array.from({ length: N }, (_, i) => (
            <g key={i} data-belt={i} clipPath={`url(#ds-cb-${i})`} style={{ display: "none" }}>
              <g>{ITEM_KINDS[i]}</g>
            </g>
          ))}
        </g>
        <BeltFront xa={PRN_X} xb={HUB_X - 48} drums={[PRN_X + 3.5]} />

        {/* the hub, with the tunnel seen through its mouth */}
        <HubBody />
        <g clipPath="url(#ds-hole)">
          <TunnelBack />
          <BeltBack xa={HUB_X - 48} xb={HUB_X} id="m" />
          <TunnelLight />
          {Array.from({ length: N }, (_, i) => (
            <g key={i} data-hubin={i} style={{ display: "none" }}>
              <ParcelArt />
            </g>
          ))}
          <BeltFront xa={HUB_X - 48} xb={HUB_X} />
          <polygon className="tunnel-shade ns" points={HOLE_PTS} />
        </g>
        <HubMouth />

        {/* wires to the side machines */}
        <Wire path={WIRES.status} id="status" />
        <Wire path={WIRES.reviews} id="reviews" />
        <Wire path={WIRES.chat} id="chat" />

        {/* right belt, after the hub */}
        <Legs side="right" />
        <BeltBack xa={HUB_X} xb={XE} id="r" end="end" />
        <BeltGlow />
        <g>
          {Array.from({ length: N }, (_, i) => (
            <g key={i} data-front={i} clipPath={`url(#ds-cf-${i})`} style={{ display: "none" }}>
              <g>
                <ParcelArt />
              </g>
            </g>
          ))}
        </g>
        <BeltFront xa={HUB_X} xb={XE} drums={[XE - 3]} />

        {/* front: seller chat */}
        <Machine m={CHATM} accent="var(--color-violet)" port={{ face: "x", at: CHATM.y + 14 }}>
          <ChatScreen />
        </Machine>
        <Wire path={WIRES.chat.slice(-2)} id="chat-end" ends="end" />

        {/* the house */}
        <HouseBack />
        <g clipPath="url(#ds-doorway)">
          <Doorway />
          {Array.from({ length: N }, (_, i) => (
            <g key={i} data-housein={i} style={{ display: "none" }}>
              <ParcelArt />
            </g>
          ))}
          <DoorLeaf />
        </g>
        <HouseFront />
        <Porch />
        <g>
          {Array.from({ length: N }, (_, i) => (
            <g key={i} data-porch={i} clipPath={`url(#ds-cp-${i})`} style={{ display: "none" }}>
              <g>
                <ParcelArt />
              </g>
            </g>
          ))}
        </g>

        {/* pulses, the featured order's pin, the delivered pill */}
        <circle data-pulse="status" r={1.7} className="pulse" opacity={0} />
        <circle data-pulse="reviews" r={1.7} className="pulse sun" opacity={0} />
        <circle data-pulse="chat" r={1.7} className="pulse violet" opacity={0} />

        <g data-pin data-on="0">
          <ellipse cx={0} cy={1} rx={3} ry={1.1} className="pin-shadow" />
          <path className="pin" d="M0 0C-1.2-2.6-5-5.4-5-9.4a5 5 0 0 1 10 0C5-5.4 1.2-2.6 0 0Z" />
          <circle cx={0} cy={-9.4} r={2} className="pin-dot" />
        </g>

        <g data-pill data-on="0" transform={`translate(${r2(P(DOOR.x0 + 1, 20, 33)[0])} ${r2(P(DOOR.x0 + 1, 20, 33)[1])})`}>
          <g className="pill">
            <rect x={-20} y={-6} width={40} height={12} rx={6} className="pill-bg" />
            <circle cx={-13.6} cy={0} r={3.6} className="pill-dot" />
            <path className="pill-check" d="M-15.3 0l1.2 1.2 2.3-2.4" />
            <text x={-8.4} y={1.7} className="pill-t">
              Delivered
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
