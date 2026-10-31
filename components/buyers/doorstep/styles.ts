/* Tones and screen states for the Doorstep figure. Prefixed ds- / .ds to stay local. */

const mix = (pct: number, base = "var(--color-paper)") => `color-mix(in srgb,var(--color-ink) ${pct}%,${base})`;

const statusRows = () => {
  let out = "";
  for (let step = 0; step < 4; step++) {
    for (let i = 0; i < 4; i++) {
      const sel = `.ds .status[data-step="${step}"] .row[data-i="${i}"]`;
      if (i < step || (i === 3 && step === 3)) out += `${sel}{--row:done}${sel} .dot{fill:var(--color-green);stroke:var(--color-green)}${sel} .check{opacity:1}${sel} .label{fill:var(--color-ink)}${sel} .time{opacity:1}`;
      else if (i === step) out += `${sel} .dot{fill:var(--ds-glass);stroke:var(--color-orange);stroke-width:1.1}${sel} .label{fill:var(--color-ink);font-weight:600}${sel} .halo-ring{opacity:1;animation:ds-ring 1.6s ease-out infinite}`;
    }
    out += `.ds .status[data-step="${step}"] .track-on{stroke-dashoffset:${3 - step}}`;
  }
  return out;
};

export const CSS = `
.ds{
  --ds-t:var(--color-paper);--ds-l:${mix(4.5)};--ds-m:${mix(7)};--ds-r:${mix(10)};
  --ds-lot:${mix(8)};--ds-lol:${mix(13)};--ds-lor:${mix(18)};
  --ds-s:${mix(36)};--ds-f:${mix(15)};--ds-h:${mix(62)};--ds-hin:${mix(48)};
  --ds-belt:${mix(13)};--ds-beltl:${mix(19)};--ds-beltr:${mix(24)};--ds-slat:${mix(22)};
  --ds-grid:${mix(7)};--ds-shadow:${mix(9)};
  --ds-glass:var(--color-paper);--ds-glass-edge:${mix(16)};
  --ds-wall-l:${mix(3)};--ds-wall-r:${mix(8)};
  --ds-roof:color-mix(in srgb,var(--color-orange) 78%,#fff);--ds-roof-b:color-mix(in srgb,var(--color-orange) 92%,#000);--ds-roof-r:color-mix(in srgb,var(--color-orange) 70%,#3a1500);
  --ds-deck:#ecdcbf;--ds-deck-l:#dec8a3;--ds-deck-r:#cdb187;--ds-plank:#c8ab80;
  --ds-pt:#ebd0a3;--ds-pl:#dcbc86;--ds-pr:#caa771;--ds-crease:#b79060;
  --ds-paper:#fff;--ds-paper-l:${mix(8, "#fff")};--ds-paper-r:${mix(14, "#fff")};
  --ds-brick-l:#d27a5d;--ds-brick-r:#b9644a;
  --ds-win:color-mix(in srgb,var(--color-sky) 30%,var(--color-paper));
  --ds-inside:${mix(40)};
}
:root[data-theme="dark"] .ds{
  --ds-t:${mix(14)};--ds-l:${mix(9)};--ds-m:${mix(7)};--ds-r:${mix(5)};
  --ds-lot:${mix(7)};--ds-lol:${mix(4.5)};--ds-lor:${mix(3)};
  --ds-s:${mix(38)};--ds-f:${mix(21)};--ds-h:var(--color-canvas);--ds-hin:${mix(3, "var(--color-canvas)")};
  --ds-belt:${mix(5, "var(--color-canvas)")};--ds-beltl:${mix(3, "var(--color-canvas)")};--ds-beltr:${mix(1.5, "var(--color-canvas)")};--ds-slat:${mix(16)};
  --ds-grid:${mix(6)};--ds-shadow:#000;
  --ds-glass:var(--color-canvas);--ds-glass-edge:${mix(22)};
  --ds-wall-l:${mix(9)};--ds-wall-r:${mix(5)};
  --ds-roof:color-mix(in srgb,var(--color-orange) 72%,#111);--ds-roof-b:color-mix(in srgb,var(--color-orange) 52%,#000);--ds-roof-r:color-mix(in srgb,var(--color-orange) 40%,#000);
  --ds-deck:#6f5c42;--ds-deck-l:#5c4b36;--ds-deck-r:#4b3d2c;--ds-plank:#4a3c2b;
  --ds-pt:#b99a6b;--ds-pl:#9f8259;--ds-pr:#876c49;--ds-crease:#6e5634;
  --ds-paper:#e9e9ec;--ds-paper-l:#bdbdc3;--ds-paper-r:#a1a1aa;
  --ds-brick-l:#9a4f3b;--ds-brick-r:#7f402f;
  --ds-win:color-mix(in srgb,var(--color-sun) 55%,#2a2000);
  --ds-inside:#000;
}
.ds polygon{stroke:var(--ds-s);stroke-width:.5;stroke-linejoin:round}
.ds .ns{stroke:none}
.ds .t{fill:var(--ds-t)}.ds .l{fill:var(--ds-l)}.ds .r{fill:var(--ds-r)}.ds .m{fill:var(--ds-m)}
.ds .lot{fill:var(--ds-lot)}.ds .lol{fill:var(--ds-lol)}.ds .lor{fill:var(--ds-lor)}
.ds .h{fill:var(--ds-h)}.ds .hin{fill:var(--ds-hin);stroke:none}
.ds .belt{fill:var(--ds-belt)}.ds .beltl{fill:var(--ds-beltl)}.ds .beltr{fill:var(--ds-beltr)}
.ds .ds-ol{fill:none;stroke:var(--ds-s);stroke-width:.6}
.ds .rim{fill:none;stroke:var(--ds-s);stroke-width:.45}
.ds .k{fill:none;stroke:var(--ds-s);stroke-width:.5;stroke-linecap:round}
.ds .kf{fill:none;stroke:var(--ds-f);stroke-width:.45;stroke-linecap:round}
.ds .ds-grid{fill:none;stroke:var(--ds-grid);stroke-width:.5}
.ds .halo{fill:var(--ds-shadow);stroke:none;opacity:.55;filter:url(#ds-blur)}
.ds .slat{fill:none;stroke:var(--ds-slat);stroke-width:.55}
.ds .screw{fill:var(--ds-m);stroke:var(--ds-s);stroke-width:.3}
.ds .screwslot{stroke:var(--ds-s);stroke-width:.3}
.ds .bolt{fill:var(--ds-s)}
.ds .drum{fill:var(--ds-m);stroke:var(--ds-s);stroke-width:.45}
.ds .vent{fill:var(--ds-r);stroke:var(--ds-s);stroke-width:.35}
.ds .plate{fill:var(--ds-t);stroke:var(--ds-s);stroke-width:.4}
.ds .plate-dot{fill:var(--color-green)}
.ds .port{fill:var(--ds-m);stroke:var(--ds-s);stroke-width:.45}
.ds .port-in{fill:var(--ds-h)}
.ds .term{fill:var(--ds-s)}
.ds .wire{fill:none;stroke:var(--ds-s);stroke-width:.7;stroke-linejoin:round;stroke-linecap:round}
.ds .wire-shadow{fill:none;stroke:var(--ds-shadow);stroke-width:2.2;opacity:.35;stroke-linejoin:round}
.ds .pulse{fill:var(--color-green);filter:drop-shadow(0 0 2px var(--color-green))}
.ds .pulse.sun{fill:var(--color-sun);filter:drop-shadow(0 0 2px var(--color-sun))}
.ds .pulse.violet{fill:var(--color-violet);filter:drop-shadow(0 0 2px var(--color-violet))}
.ds .badge{fill:var(--color-mint)}.ds .badgel{fill:color-mix(in srgb,var(--color-green) 22%,var(--ds-l))}.ds .badger{fill:color-mix(in srgb,var(--color-green) 26%,var(--ds-r))}
.ds .logo-bag{fill:var(--color-green)}.ds .logo-ink{fill:var(--color-ink)}
.ds .lamp-ring{fill:var(--ds-r);stroke:var(--ds-s);stroke-width:.35}
.ds .lamp{fill:color-mix(in srgb,var(--color-green) 45%,var(--ds-r));transition:fill .25s}
.ds .lamp[data-on="1"]{fill:var(--color-lime);filter:drop-shadow(0 0 1.6px var(--color-lime))}
.ds .mouth{fill:none;stroke:var(--ds-s);stroke-width:.6}
.ds .scan{fill:var(--color-lime);stroke:none;filter:drop-shadow(0 0 1.5px var(--color-lime))}
.ds .curtain{fill:color-mix(in srgb,var(--color-lime) 30%,transparent);stroke:var(--color-lime);stroke-width:.5}
.ds .spill{stroke:none}
.ds .tunnel-shade{fill:url(#ds-tshade)}
.ds .ds-glass{fill:var(--ds-glass);stroke:none}
.ds .glass-edge{fill:none;stroke:var(--ds-glass-edge);stroke-width:.4}
.ds .key{fill:var(--ds-r);stroke:var(--ds-s);stroke-width:.35}
.ds .bezel{fill:var(--ds-lot)}.ds .key-go{fill:var(--color-green)}.ds .pay-ok{fill:var(--color-green)}.ds .pay-check{fill:none;stroke:#fff;stroke-width:.8;stroke-linecap:round;stroke-linejoin:round}.ds .pay-t{font-size:3.4px;font-weight:600;fill:var(--color-ink)}
.ds .acc-lamp{fill:var(--acc);filter:drop-shadow(0 0 1.2px var(--acc))}
.ds text{font-family:var(--font-sans)}
.ds .mono{font-family:var(--font-mono);font-size:2.6px;letter-spacing:.06em;fill:var(--color-muted)}
.ds .sc-strong{font-size:3.4px;font-weight:600;fill:var(--color-ink);letter-spacing:-.01em}
.ds .sc-rule{stroke:var(--ds-glass-edge);stroke-width:.35}
.ds .live{fill:var(--color-green);animation:ds-blink 1.6s ease-in-out infinite}
.ds .track{stroke:var(--ds-glass-edge);stroke-width:.7}
.ds .track-on{stroke:var(--color-green);stroke-width:.7;stroke-dasharray:3 3;stroke-dashoffset:3;transition:stroke-dashoffset .6s cubic-bezier(.16,1,.3,1)}
.ds .dot{fill:var(--ds-glass);stroke:var(--ds-glass-edge);stroke-width:.6;transition:fill .35s,stroke .35s}
.ds .halo-ring{fill:none;stroke:var(--color-orange);stroke-width:.5;opacity:0;transform-box:fill-box;transform-origin:center}
.ds .check{fill:none;stroke:#fff;stroke-width:.75;stroke-linecap:round;stroke-linejoin:round;opacity:0;transition:opacity .3s .1s}
.ds .label{font-size:3.7px;fill:var(--color-faint);transition:fill .3s;letter-spacing:-.01em}
.ds .time{font-family:var(--font-mono);font-size:2.5px;fill:var(--color-muted);opacity:0;transition:opacity .3s}
${statusRows()}
.ds .avatar{fill:var(--color-violet)}
.ds .avatar-t{font-size:3.4px;font-weight:700;fill:#fff}
.ds .bub-in{fill:${mix(6)}}
:root[data-theme="dark"] .ds .bub-in{fill:${mix(12, "var(--color-canvas)")}}
.ds .bub-out{fill:var(--color-green)}
.ds .bub-t{font-size:3.5px;fill:var(--color-ink);letter-spacing:-.01em}
.ds .bub-t.out{fill:#fff}
.ds .tdot{fill:var(--color-muted);animation:ds-typing 1s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.ds .composer{fill:none;stroke:var(--ds-glass-edge);stroke-width:.4}
.ds .send{fill:var(--color-green)}
.ds .chat .typing,.ds .chat .b1,.ds .chat .b2,.ds .chat .seen{opacity:0;transform-box:fill-box;transition:opacity .3s,transform .45s cubic-bezier(.34,1.56,.64,1);transform:translateY(2px) scale(.8)}
.ds .chat .b1,.ds .chat .typing{transform-origin:left bottom}.ds .chat .b2{transform-origin:right bottom}
.ds .chat[data-c="1"] .typing,.ds .chat[data-c="2"] .b1,.ds .chat[data-c="3"] .b1,.ds .chat[data-c="4"] .b1,.ds .chat[data-c="3"] .b2,.ds .chat[data-c="4"] .b2,.ds .chat[data-c="4"] .seen{opacity:1;transform:none}
.ds .score{font-family:var(--font-display);font-size:10px;font-weight:700;letter-spacing:-.05em;fill:var(--color-ink)}
.ds .star-bg{fill:var(--ds-glass-edge)}
.ds .star{fill:var(--color-sun);opacity:0;transform:scale(.3);transform-box:fill-box;transform-origin:center;transition:opacity .2s,transform .45s cubic-bezier(.34,1.56,.64,1)}
.ds .star[data-on="1"]{opacity:1;transform:none}
.ds .bar-bg{fill:var(--ds-glass-edge)}
.ds .bar{fill:var(--color-sun);transform-box:fill-box;transform-origin:left center;transition:transform .7s cubic-bezier(.16,1,.3,1)}
.ds .reviews[data-r="0"] .bar{transform:scaleX(0)}
.ds .quote{opacity:0;transition:opacity .5s}
.ds .reviews[data-r="5"] .quote{opacity:1}
.ds .q-av{fill:var(--color-orange)}
.ds .q-t{font-size:3px;fill:var(--color-muted);font-style:italic}
.ds .wall-l{fill:var(--ds-wall-l)}.ds .wall-r{fill:var(--ds-wall-r)}
.ds .siding{fill:none;stroke:var(--ds-f);stroke-width:.4}
.ds .roof-f{fill:var(--ds-roof)}.ds .roof-b{fill:var(--ds-roof-b)}.ds .roof-r,.ds .roof-l{fill:var(--ds-roof-r)}
.ds .shingle{fill:none;stroke:color-mix(in srgb,var(--ds-roof-r) 60%,transparent);stroke-width:.45}
.ds .ridge{fill:var(--ds-roof-b)}.ds .ridge-l,.ds .ridge-r{fill:var(--ds-roof-r)}
.ds .brick-l{fill:var(--ds-brick-l)}.ds .brick-r{fill:var(--ds-brick-r)}
.ds .win{fill:var(--ds-win);stroke:none}
.ds .win-bar{stroke:var(--ds-s);stroke-width:.4;fill:none}
.ds .win-frame{fill:none;stroke:var(--ds-s);stroke-width:.6}
.ds .trim{fill:none;stroke:var(--ds-s);stroke-width:.6;stroke-linejoin:round}
.ds .door{fill:var(--color-green);transition:fill .3s}
.ds .knob{fill:var(--color-sun);stroke:var(--ds-s);stroke-width:.3}
.ds .inside-floor{fill:color-mix(in srgb,var(--color-sun) 30%,var(--ds-inside))}
.ds .lampbox{fill:var(--ds-m);stroke:var(--ds-s);stroke-width:.3}
.ds .porchlamp{fill:var(--color-sun);filter:drop-shadow(0 0 1.6px var(--color-sun))}
.ds .deck{fill:var(--ds-deck)}.ds .deck-l{fill:var(--ds-deck-l)}.ds .deck-r{fill:var(--ds-deck-r)}
.ds .plank{fill:none;stroke:var(--ds-plank);stroke-width:.45}
.ds .mat{fill:color-mix(in srgb,var(--color-green) 80%,#000)}.ds .mat-in{fill:none;stroke:color-mix(in srgb,var(--color-lime) 70%,transparent);stroke-width:.5}
.ds .pot-t{fill:#e9967a}.ds .pot-l{fill:#d97f62}.ds .pot-r{fill:#c06b50}
.ds .soil{fill:#5b4330}
.ds .leaf{fill:var(--color-green);stroke:color-mix(in srgb,var(--color-green) 70%,#000);stroke-width:.4}
.ds .pt{fill:var(--ds-pt)}.ds .pl{fill:var(--ds-pl)}.ds .pr{fill:var(--ds-pr)}
.ds .tape{fill:color-mix(in srgb,var(--color-green) 85%,#fff)}.ds .tape-s{fill:color-mix(in srgb,var(--color-green) 80%,#000)}
.ds .crease{stroke:var(--ds-crease);stroke-width:.35}
.ds .label-t{fill:#fff;stroke:var(--ds-crease);stroke-width:.25}
.ds .label-l{fill:none;stroke:var(--ds-crease);stroke-width:.35;stroke-linecap:round}
.ds .paper{fill:var(--ds-paper)}.ds .paper-l{fill:var(--ds-paper-l)}.ds .paper-r{fill:var(--ds-paper-r)}
.ds .ink-l{stroke:${mix(30, "#fff")};stroke-width:.55;stroke-linecap:round}
.ds .ink-d{stroke:${mix(25, "#fff")};stroke-width:.4;stroke-dasharray:.8 .6}
.ds .ink-b{stroke:#3f3f46;stroke-width:.8;stroke-linecap:round}
.ds .ink-g{stroke:var(--color-green);stroke-width:.9;stroke-linecap:round}
.ds .band{stroke:none}
.ds .card-t{fill:var(--card)}.ds .card-l{fill:color-mix(in srgb,var(--card) 80%,#000)}.ds .card-r{fill:color-mix(in srgb,var(--card) 65%,#000)}
.ds .chip{fill:var(--color-sun);stroke:color-mix(in srgb,var(--color-sun) 60%,#000);stroke-width:.25}
.ds .card-ink{fill:none;stroke:rgb(255 255 255 / .75);stroke-width:.5;stroke-linecap:round}
.ds .pin{fill:var(--color-orange);stroke:color-mix(in srgb,var(--color-orange) 70%,#000);stroke-width:.4}
.ds .pin-dot{fill:#fff}
.ds [data-pin]{opacity:0;transition:opacity .35s}.ds [data-pin][data-on="1"]{opacity:1}
.ds .pin-shadow{fill:var(--ds-shadow);opacity:.5}
.ds .pill{opacity:0;transform:translateY(5px) scale(.6);transform-box:fill-box;transform-origin:center bottom;transition:opacity .25s,transform .55s cubic-bezier(.34,1.56,.64,1)}
.ds [data-pill][data-on="1"] .pill{opacity:1;transform:none}
.ds .pill-bg{fill:var(--color-green);filter:drop-shadow(0 2px 3px rgb(0 0 0 / .18))}
.ds .pill-dot{fill:#fff}
.ds .pill-check{fill:none;stroke:var(--color-green);stroke-width:.9;stroke-linecap:round;stroke-linejoin:round}
.ds .pill-t{font-size:4.6px;font-weight:600;fill:#fff;letter-spacing:-.01em}
.ds[data-run="0"] *{animation-play-state:paused!important}
@keyframes ds-blink{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes ds-typing{0%,60%,100%{transform:none;opacity:.5}30%{transform:translateY(-.8px);opacity:1}}
@keyframes ds-ring{0%{transform:scale(.7);opacity:.9}100%{transform:scale(1.5);opacity:0}}
`;
