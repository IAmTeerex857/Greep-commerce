import { useId } from "react";

/** The demo product: a printed Ankara tote on a soft backdrop. */
export function Tote({ className = "", bg = "#f6dcc8" }: { className?: string; bg?: string }) {
  const id = useId();
  const dots = [];
  const cols = ["#f3c54c", "#7c6cf2", "#0d965e", "#fbfaf6"];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++)
      dots.push(<circle key={`${r}-${c}`} cx={36 + c * 13 + (r % 2 ? 6.5 : 0)} cy={58 + r * 11} r={3.6} fill={cols[(r + c) % 4]} stroke="#0a0a0a" strokeWidth="1.2" />);
  return (
    <svg viewBox="0 0 140 120" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect x="-200" y="-200" width="540" height="520" fill={bg} />
      <ellipse cx="70" cy="104" rx="38" ry="5" fill="rgb(0 0 0 / .08)" />
      <path d="M52 50a18 18 0 0 1 36 0" fill="none" stroke="#0a0a0a" strokeWidth="3.2" strokeLinecap="round" />
      <clipPath id={id}>
        <path d="M38 50h64l6 50H32z" />
      </clipPath>
      <path d="M38 50h64l6 50H32z" fill="#ee6f38" />
      <g clipPath={`url(#${id})`}>{dots}</g>
      <path d="M38 50h64l6 50H32z" fill="none" stroke="#0a0a0a" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}
