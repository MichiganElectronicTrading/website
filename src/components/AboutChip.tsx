import type { CSSProperties } from "react";
import { M_PATH, PINS_PATH } from "./MetMark";
import styles from "./AboutChip.module.css";

/*
 * Static chip illustration from Home's About section. The 0s and 1s, arrows
 * and tickers are placed with the same seeded maths as the design file, so
 * the layout is identical on every build.
 */

const rnd = (a: number) => {
  const x = Math.sin(a * 91.17 + 7.3) * 43758.5453;
  return x - Math.floor(x);
};
const inLogo = (x: number, y: number) => x > 150 && x < 410 && y > 132 && y < 308;
const NAVY = "var(--navy)";
const UP = "var(--gold-text)";

type Glyph = { ch: string; style: CSSProperties };

function makeBits(): Glyph[] {
  const out: Glyph[] = [];
  for (let gy = 0; gy < 6; gy++) {
    for (let gx = 0; gx < 8; gx++) {
      const id = gy * 8 + gx;
      const x = 10 + gx * 68 + rnd(id) * 40;
      const y = 10 + gy * 70 + rnd(id + 50) * 34;
      if (inLogo(x + 6, y + 8) || rnd(id + 99) < 0.3) continue;
      const o = 0.16 + rnd(id + 3) * 0.28;
      const s = 11 + Math.round(rnd(id + 5) * 6);
      const color = rnd(id + 7) < 0.15 ? UP : NAVY;
      const ch = rnd(id + 13) < 0.5 ? "1" : "0";
      // Faint "ghost" copy below, then the bit itself.
      out.push({
        ch,
        style: {
          left: `${x.toFixed(0)}px`,
          top: `${(y + s * 0.6).toFixed(0)}px`,
          fontSize: s,
          opacity: rnd(id + 11) < 0.4 ? (o * 0.25).toFixed(2) : "0",
          color,
        },
      });
      out.push({
        ch,
        style: { left: `${x.toFixed(0)}px`, top: `${y.toFixed(0)}px`, fontSize: s, opacity: o.toFixed(2), color },
      });
    }
  }
  return out;
}

function makeArrows(): Glyph[] {
  const glyphs = ["▲", "▼", "↗", "↘", "→"];
  const out: Glyph[] = [];
  for (let k = 0; k < 20; k++) {
    const x = 30 + (k % 5) * 108 + rnd(k + 1000) * 50;
    const y = 40 + Math.floor(k / 5) * 100 + rnd(k + 1100) * 50;
    if (inLogo(x + 6, y + 8) || rnd(k + 1200) < 0.35) continue;
    const ch = glyphs[Math.floor(rnd(k + 1300) * glyphs.length)];
    const isUp = ch === "▲" || ch === "↗";
    out.push({
      ch,
      style: {
        left: `${x.toFixed(0)}px`,
        top: `${y.toFixed(0)}px`,
        fontSize: 12 + Math.round(rnd(k + 1400) * 6),
        opacity: 0.35,
        color: isUp ? UP : NAVY,
      },
    });
  }
  return out;
}

const TICKERS: [number, number, string, boolean][] = [
  [22, 22, "ES 5,812.25 ▲", true],
  [262, 16, "NQ ▼ 0.42%", false],
  [14, 122, "ZN 110’16 ▼", false],
  [422, 238, "AAPL 228.10 ▲", true],
  [198, 324, "CL 71.84 ▲", true],
  [430, 396, "BTC ▼ 1.2%", false],
  [236, 404, "SPY ▲ 0.8%", true],
];

function makeTickers(): Glyph[] {
  return TICKERS.flatMap(([x, y, label, isUp]) => {
    const color = isUp ? UP : NAVY;
    return [
      { ch: label, style: { left: `${x}px`, top: `${y + 9}px`, opacity: 0.14, color } },
      { ch: label, style: { left: `${x}px`, top: `${y}px`, opacity: 0.62, color } },
    ];
  });
}

const bits = makeBits();
const arrows = makeArrows();
const tickers = makeTickers();

export default function AboutChip() {
  return (
    <div aria-hidden="true" className={styles.wrap}>
      <svg viewBox="0 0 560 440" width="560" height="440" className={styles.svg}>
        <defs>
          <pattern id="dotgrid" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#0B1B33" opacity="0.10" />
          </pattern>
        </defs>
        <rect width="560" height="440" fill="url(#dotgrid)" />
        <g fill="none" stroke="#0B1B33" strokeWidth="1.6" strokeLinejoin="round" opacity="0.8">
          <path d="M172.5 161 H118 V96 H0" />
          <path d="M0 220 H146" />
          <path d="M172.5 279 H134 V346 H40" />
          <path d="M560 108 H444 V161 H406" />
          <path d="M387.5 220 H560" />
          <path d="M387.5 279 H468 V362 H516" />
          <path d="M206 0 V52 H242" />
          <path d="M338 440 V394 H388" />
          <path d="M118 440 V404 H88" />
          <path d="M500 0 V40 H530" />
        </g>
        <g fill="#F4EFE4" stroke="#0B1B33" strokeWidth="1.6" opacity="0.8">
          <circle cx="40" cy="346" r="4.5" />
          <rect x="516" y="358" width="9" height="9" />
          <circle cx="246" cy="52" r="4.5" />
          <rect x="388" y="389.5" width="9" height="9" />
          <circle cx="84" cy="404" r="4.5" />
          <circle cx="534" cy="40" r="4.5" />
        </g>
        <rect x="146" y="214.5" width="11" height="11" rx="2" fill="#0B1B33" />
        <g stroke="#C08F12" strokeWidth="1.4" strokeLinecap="round">
          <path d="M162 212 L166 207" />
          <path d="M163 220 H169" />
          <path d="M162 228 L166 233" />
        </g>
        <rect x="395" y="155.5" width="11" height="11" rx="2" fill="#0B1B33" />
        <g stroke="#C08F12" strokeWidth="1.4" strokeLinecap="round">
          <path d="M391 153 L388 148" />
          <path d="M390.5 161 H392.5" />
          <path d="M391 169 L388 174" />
        </g>
        <g fill="#C08F12">
          <polygon points="426,215 434,220 426,225" />
          <polygon points="466,215 474,220 466,225" />
          <polygon points="506,215 514,220 506,225" />
          <polygon points="74,91 66,96 74,101" />
          <polygon points="34,91 26,96 34,101" />
          <polygon points="129,308 139,308 134,316" />
          <polygon points="463,316 473,316 468,324" />
          <polygon points="201,22 211,22 206,30" />
        </g>
        <g transform="translate(280 220) scale(0.2) translate(-800 -800)">
          <path fill="#0B1B33" fillRule="evenodd" d={M_PATH} />
          <path fill="#D9A21B" d={PINS_PATH} />
        </g>
      </svg>
      <div className={styles.overlay}>
        {bits.map((b, i) => (
          <span key={`b${i}`} className={styles.bit} style={b.style}>
            {b.ch}
          </span>
        ))}
        {arrows.map((a, i) => (
          <span key={`a${i}`} className={styles.bit} style={a.style}>
            {a.ch}
          </span>
        ))}
        {tickers.map((t, i) => (
          <span key={`t${i}`} className={styles.tick} style={t.style}>
            {t.ch}
          </span>
        ))}
      </div>
    </div>
  );
}
