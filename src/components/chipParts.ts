/*
 * Drawing pieces shared by the Live Chip (Home) and the corner wiring on the
 * inner pages: wire geometry, pads, arrowheads, the dot grid, quote tags and
 * bit glyphs. All work in the caller's canvas coordinates.
 */

export type Pt = [number, number];
export type Seg = { x0: number; y0: number; x1: number; y1: number; l: number; s0: number };
/** A polyline with its segments and total length, for drawing and moving things along it. */
export type Path = { pts: Pt[]; segs: Seg[]; len: number };
export type PadKind = "circle" | "square";

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function makePath(pts: Pt[]): Path {
  const segs: Seg[] = [];
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1],
      [x1, y1] = pts[i];
    const l = Math.hypot(x1 - x0, y1 - y0);
    segs.push({ x0, y0, x1, y1, l, s0: len });
    len += l;
  }
  return { pts, segs, len };
}

/** Point and heading at distance `s` along a path. */
export function pointAt(p: Path, s: number) {
  s = clamp(s, 0, p.len);
  for (const g of p.segs) {
    if (s <= g.s0 + g.l || g === p.segs[p.segs.length - 1]) {
      const t = g.l ? (s - g.s0) / g.l : 0;
      return { x: g.x0 + (g.x1 - g.x0) * t, y: g.y0 + (g.y1 - g.y0) * t, a: Math.atan2(g.y1 - g.y0, g.x1 - g.x0) };
    }
  }
  return { x: p.pts[0][0], y: p.pts[0][1], a: 0 };
}

export function roundRectPath(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, r);
  else c.rect(x, y, w, h);
}

/** Stroke a path from its start up to distance `upto`. Uses the current stroke style. */
export function strokePath(c: CanvasRenderingContext2D, p: Path, upto = p.len) {
  c.beginPath();
  let first = true,
    done = 0;
  for (const g of p.segs) {
    if (first) {
      c.moveTo(g.x0, g.y0);
      first = false;
    }
    if (done + g.l <= upto) {
      c.lineTo(g.x1, g.y1);
      done += g.l;
    } else {
      const t = (upto - done) / g.l;
      if (t > 0) c.lineTo(g.x0 + (g.x1 - g.x0) * t, g.y0 + (g.y1 - g.y0) * t);
      break;
    }
  }
  c.stroke();
}

/** Filled triangle pointing along angle `a` (the moving packets and arrowheads). */
export function drawChevron(c: CanvasRenderingContext2D, x: number, y: number, a: number, size: number, color: string) {
  c.save();
  c.translate(x, y);
  c.rotate(a);
  c.beginPath();
  c.moveTo(-size * 0.6, -size * 0.75);
  c.lineTo(size * 0.6, 0);
  c.lineTo(-size * 0.6, size * 0.75);
  c.closePath();
  c.fillStyle = color;
  c.fill();
  c.restore();
}

/** Pad at the end of a wire. */
export function drawPad(c: CanvasRenderingContext2D, kind: PadKind, x: number, y: number, stroke: string, fill: string) {
  c.lineWidth = 1.6;
  c.strokeStyle = stroke;
  c.fillStyle = fill;
  c.beginPath();
  if (kind === "square") c.rect(x - 4.5, y - 4.5, 9, 9);
  else c.arc(x, y, 4.5, 0, Math.PI * 2);
  c.fill();
  c.stroke();
}

export const DOT_SPACING = 16;

/**
 * 2px dots every 16px, starting at `offset`. `alphaAt` scales each dot
 * (return 1 for an even grid); `rgb` is "r,g,b"; `alpha` is the full strength.
 */
export function drawDotGrid(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  rgb: string,
  alpha: number,
  offset = 2,
  alphaAt?: (x: number, y: number) => number,
) {
  if (!alphaAt) c.fillStyle = `rgba(${rgb},${alpha})`;
  for (let y = offset; y < h; y += DOT_SPACING) {
    for (let x = offset; x < w; x += DOT_SPACING) {
      if (alphaAt) {
        const a = alpha * alphaAt(x, y);
        if (a <= 0.003) continue;
        c.fillStyle = `rgba(${rgb},${a.toFixed(3)})`;
      }
      c.fillRect(x - 1, y - 1, 2, 2);
    }
  }
}

/* Quote tags */

export const fmtPrice = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** +0.42% / −0.42%, with a true minus sign. */
export const fmtPct = (v: number) => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(2) + "%";

export type TagKind = "price" | "pct";

export function tagLabel(sym: string, kind: TagKind, price: number, changePct: number) {
  const arrow = changePct >= 0 ? "▲" : "▼";
  if (kind === "pct") return sym + " " + arrow + " " + fmtPct(changePct);
  return sym + " " + fmtPrice(price) + " " + arrow;
}

export const TAG_HEIGHT = 19;
const labelFont = (mono: string) => "700 11px " + mono;
const closeFont = (mono: string) => "600 8px " + mono;

/** Width of a tag, including the small "CLOSE" mark outside market hours. */
export function measureTag(c: CanvasRenderingContext2D, label: string, closed: boolean, mono: string) {
  c.font = labelFont(mono);
  const labelW = c.measureText(label).width;
  c.font = closeFont(mono);
  const closeW = closed ? c.measureText("CLOSE").width + 6 : 0;
  return { labelW, w: labelW + closeW + 14 };
}

export type TagStyle = {
  fill: string;
  stroke: string;
  lineWidth: number;
  text: string;
  alpha: number;
  /** Faint offset outline under the tag. */
  shadow?: { y: number; color: string; alpha: number };
};

/** Quote tag: rounded box with the label and, outside market hours, a small "CLOSE" mark. Returns its width. */
export function drawTag(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  closed: boolean,
  mono: string,
  s: TagStyle,
) {
  const { labelW, w } = measureTag(c, label, closed, mono);
  const h = TAG_HEIGHT;
  c.textBaseline = "top";
  if (s.shadow) {
    c.globalAlpha = s.shadow.alpha;
    c.strokeStyle = s.shadow.color;
    c.lineWidth = 1;
    roundRectPath(c, x, s.shadow.y, w, h, 3);
    c.stroke();
  }
  c.globalAlpha = s.alpha;
  c.fillStyle = s.fill;
  roundRectPath(c, x, y, w, h, 3);
  c.fill();
  c.strokeStyle = s.stroke;
  c.lineWidth = s.lineWidth;
  roundRectPath(c, x, y, w, h, 3);
  c.stroke();
  c.fillStyle = s.text;
  c.font = labelFont(mono);
  c.fillText(label, x + 7, y + 4.5);
  if (closed) {
    c.font = closeFont(mono);
    c.globalAlpha = s.alpha * 0.7;
    c.fillText("CLOSE", x + 7 + labelW + 6, y + 6.5);
  }
  c.globalAlpha = 1;
  return w;
}

/* Bits */

/** A 0/1 or arrow glyph in the bold mono style. */
export function drawGlyph(
  c: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
  mono: string,
) {
  c.textBaseline = "top";
  c.font = "600 " + size + "px " + mono;
  c.fillStyle = color;
  c.globalAlpha = alpha;
  c.fillText(ch, x, y);
}
