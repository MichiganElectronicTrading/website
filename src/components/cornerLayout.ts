import type { PadKind, Pt } from "./chipParts";

/*
 * Random layout for the inner-page corner wiring, in a 624×304 box whose
 * bottom-right corner sits in the bottom-right of the page header.
 * Generated in the browser after mount. Retries until every rule holds,
 * and falls back to a fixed layout if it can't.
 */

export const BOX_W = 624;
export const BOX_H = 304;
const G = 16;
/** Keep clear of the heading and intro text on the left of the box. */
const MIN_X = 64;
/** The top of the box can be cut off by short headers. */
const MIN_Y = 48;
/** Half the 14px minimum gap between neighbouring wires. */
const HALF_GAP = 7;
const PAD_HALF = 5;
/** Room reserved for a quote tag; real tags are narrower. */
export const TAG_RESERVE_W = 150;
const TAG_H = 19;
/** Distance between a pad and its tag. */
export const TAG_OFFSET = 10;
const MAX_ATTEMPTS = 50;

export type Dir = "left" | "right" | "up" | "down";
export type LayoutWire = { pts: Pt[]; pad: PadKind; dir: Dir };
export type LayoutTag = { wire: number; gold: boolean; rect: Rect };
export type LayoutBit = { x: number; y: number; ch: "0" | "1"; size: number; period: number; phase: number };
export type LayoutMark = { wire: number; s: number; gold: boolean };
export type LayoutSignal = { wire: number; period: number; offset: number };
export type CornerLayout = {
  wires: LayoutWire[];
  tags: LayoutTag[];
  bits: LayoutBit[];
  marks: LayoutMark[];
  signals: LayoutSignal[];
};

type Rect = { x: number; y: number; w: number; h: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const shuffle = <T,>(xs: T[]) => {
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const grow = (r: Rect, m: number): Rect => ({ x: r.x - m, y: r.y - m, w: r.w + 2 * m, h: r.h + 2 * m });
const hits = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inside = (r: Rect, minX: number, minY: number, maxX: number, maxY: number) =>
  r.x >= minX && r.y >= minY && r.x + r.w <= maxX && r.y + r.h <= maxY;

/** Each segment of a wire as a rectangle widened by half the minimum gap. */
const segRects = (w: LayoutWire) =>
  w.pts.slice(1).map(([x1, y1], i) => {
    const [x0, y0] = w.pts[i];
    return grow({ x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) }, HALF_GAP);
  });
const padRect = (w: LayoutWire) => {
  const [x, y] = w.pts[w.pts.length - 1];
  return grow({ x: x - PAD_HALF, y: y - PAD_HALF, w: PAD_HALF * 2, h: PAD_HALF * 2 }, HALF_GAP);
};
const wireRects = (w: LayoutWire) => [...segRects(w), padRect(w)];

function dirOf(a: Pt, b: Pt): Dir {
  if (b[0] < a[0]) return "left";
  if (b[0] > a[0]) return "right";
  return b[1] < a[1] ? "up" : "down";
}

/** A wire entering from the right or bottom edge with one or two right-angle turns, all on the 16px grid. */
function randomWire(): LayoutWire | null {
  const turns = Math.random() < 0.5 ? 1 : 2;
  const pts: Pt[] = [];
  if (Math.random() < 0.6) {
    // From the right edge, heading left.
    const y0 = G * randInt(MIN_Y / G + 1, BOX_H / G - 1);
    const x1 = BOX_W - G * randInt(2, 9);
    const y2 = y0 + (Math.random() < 0.5 ? -1 : 1) * G * randInt(2, 6);
    pts.push([BOX_W, y0], [x1, y0], [x1, y2]);
    if (turns === 2) pts.push([x1 - G * randInt(2, 9), y2]);
  } else {
    // From the bottom edge, heading up.
    const x0 = G * randInt(MIN_X / G + 3, BOX_W / G - 2);
    const y1 = BOX_H - G * randInt(2, 6);
    const x2 = x0 + (Math.random() < 0.6 ? -1 : 1) * G * randInt(2, 9);
    pts.push([x0, BOX_H], [x0, y1], [x2, y1]);
    if (turns === 2) pts.push([x2, y1 - G * randInt(2, 6)]);
  }
  const end = pts[pts.length - 1];
  const inBox = pts.every(([x, y]) => x >= MIN_X && x <= BOX_W && y >= MIN_Y && y <= BOX_H);
  if (!inBox || end[0] > BOX_W - G || end[1] > BOX_H - G) return null;
  return { pts, pad: Math.random() < 0.5 ? "circle" : "square", dir: dirOf(pts[pts.length - 2], end) };
}

function wiresClash(a: LayoutWire, b: LayoutWire) {
  const ra = wireRects(a),
    rb = wireRects(b);
  return ra.some((x) => rb.some((y) => hits(x, y)));
}

/** Non-adjacent segments of the same wire must not touch either. */
function selfClash(w: LayoutWire) {
  const r = wireRects(w);
  for (let i = 0; i < r.length; i++) for (let j = i + 2; j < r.length; j++) if (hits(r[i], r[j])) return true;
  return false;
}

/** Tag rectangle just past the pad, in the direction the wire was heading. */
export function tagRect(w: LayoutWire, width = TAG_RESERVE_W): Rect {
  const [px, py] = w.pts[w.pts.length - 1];
  switch (w.dir) {
    case "left":
      return { x: px - TAG_OFFSET - width, y: py - TAG_H / 2, w: width, h: TAG_H };
    case "right":
      return { x: px + TAG_OFFSET, y: py - TAG_H / 2, w: width, h: TAG_H };
    case "up":
      return { x: px - width / 2, y: py - TAG_OFFSET - TAG_H, w: width, h: TAG_H };
    default:
      return { x: px - width / 2, y: py + TAG_OFFSET, w: width, h: TAG_H };
  }
}

function placeTags(wires: LayoutWire[], count: number): LayoutTag[] | null {
  const tags: LayoutTag[] = [];
  for (const i of shuffle(wires.map((_, i) => i))) {
    if (tags.length === count) break;
    const r = tagRect(wires[i]);
    if (!inside(r, MIN_X, MIN_Y, BOX_W - 4, BOX_H - 4)) continue;
    // Clear of every wire and pad except its own pad, which it hangs off.
    const blocked = wires.flatMap((w, j) => (j === i ? segRects(w) : wireRects(w)));
    if (blocked.some((b) => hits(r, b)) || tags.some((t) => hits(grow(r, 6), t.rect))) continue;
    tags.push({ wire: i, gold: false, rect: r });
  }
  if (tags.length < 2) return null;
  pick(tags).gold = true;
  return tags;
}

function placeBits(wires: LayoutWire[], tags: LayoutTag[], count: number): LayoutBit[] | null {
  const blocked = [...wires.flatMap(wireRects), ...tags.map((t) => grow(t.rect, 6))];
  const bits: LayoutBit[] = [];
  const used = new Set<string>();
  for (let tries = 0; tries < 600 && bits.length < count; tries++) {
    const x = G * randInt(MIN_X / G, BOX_W / G - 2) + 4;
    const y = G * randInt(MIN_Y / G, BOX_H / G - 2) + 2;
    const key = `${x},${y}`;
    const size = randInt(11, 14);
    const r = { x, y, w: size * 0.65, h: size };
    if (used.has(key) || blocked.some((b) => hits(r, b))) continue;
    used.add(key);
    bits.push({ x, y, ch: Math.random() < 0.5 ? "0" : "1", size, period: rand(2.5, 5.5), phase: rand(0, Math.PI * 2) });
  }
  return bits.length >= count ? bits : null;
}

/** A spot along a wire, away from its corners and ends. */
function placeMark(wires: LayoutWire[], taken: LayoutMark[], gold: boolean): LayoutMark | null {
  for (let tries = 0; tries < 40; tries++) {
    const wire = randInt(0, wires.length - 1);
    const pts = wires[wire].pts;
    const seg = randInt(0, pts.length - 2);
    const [x0, y0] = pts[seg],
      [x1, y1] = pts[seg + 1];
    const l = Math.hypot(x1 - x0, y1 - y0);
    if (l < 48) continue;
    const before = pts.slice(0, seg).reduce((sum, p, i) => sum + Math.hypot(pts[i + 1][0] - p[0], pts[i + 1][1] - p[1]), 0);
    const s = before + rand(16, l - 16);
    if (taken.some((m) => m.wire === wire && Math.abs(m.s - s) < 24)) continue;
    return { wire, s, gold };
  }
  return null;
}

function tryLayout(): CornerLayout | null {
  const target = randInt(3, 5);
  const wires: LayoutWire[] = [];
  for (let tries = 0; tries < 60 && wires.length < target; tries++) {
    const w = randomWire();
    if (w && !selfClash(w) && !wires.some((o) => wiresClash(o, w))) wires.push(w);
  }
  if (wires.length < 3) return null;
  return decorate(wires);
}

function decorate(wires: LayoutWire[]): CornerLayout | null {
  const tags = placeTags(wires, Math.min(wires.length, randInt(2, 3)));
  if (!tags) return null;
  const bits = placeBits(wires, tags, randInt(20, 25));
  if (!bits) return null;
  const marks: LayoutMark[] = [];
  for (let i = randInt(1, 3); i > 0; i--) {
    const m = placeMark(wires, marks, false);
    if (m) marks.push(m);
  }
  for (let i = randInt(1, 2); i > 0; i--) {
    const m = placeMark(wires, marks, true);
    if (m) marks.push(m);
  }
  const signals = shuffle(wires.map((_, i) => i))
    .slice(0, Math.min(wires.length, randInt(2, 3)))
    .map((wire) => {
      const period = rand(2, 3.5);
      return { wire, period, offset: rand(0, period) };
    });
  return { wires, tags, bits, marks, signals };
}

/** Hand-checked layout used when random generation keeps failing. */
const FALLBACK_WIRES: LayoutWire[] = [
  { pts: [[624, 64], [512, 64], [512, 128]], pad: "circle", dir: "down" },
  { pts: [[624, 224], [576, 224], [576, 176], [416, 176]], pad: "square", dir: "left" },
  { pts: [[336, 304], [336, 256], [208, 256]], pad: "circle", dir: "left" },
];

export function generateCornerLayout(): CornerLayout {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const layout = tryLayout();
    if (layout) return layout;
  }
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const layout = decorate(FALLBACK_WIRES);
    if (layout) return layout;
  }
  return { wires: FALLBACK_WIRES, tags: [], bits: [], marks: [], signals: [] };
}
