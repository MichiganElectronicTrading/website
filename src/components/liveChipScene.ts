import { M_PATH, PINS_PATH } from "./MetMark";
import { CHIP_TICKERS, CURSOR_TICKERS, type Quote } from "@/data/quotes";

/*
 * Canvas drawing and animation for Home's About chip, ported from
 * design/reference/met-live-chip.html. The scene works in a fixed 560×440
 * space and is scaled to the canvas size. Browser-only: call from an effect.
 */

export const W = 560;
export const H = 440;

const C = { cream: "#F4EFE4", navy: "#0B1B33", gold: "#D9A21B", goldInk: "#B8860B", goldHi: "#F6C453" };

type Pt = [number, number];
type Seg = { x0: number; y0: number; x1: number; y1: number; l: number; s0: number };
type Packet = { s: number; dir: number };
type NodeKind = "circle" | "square";
type Wire = {
  pts: Pt[];
  segs: Seg[];
  len: number;
  heat: number;
  gap: number;
  state: "on" | "unplug" | "off" | "plug";
  timer: number;
  packets: Packet[];
  spawn: number;
  dir: number;
  pin?: { side: "L" | "R"; i: number };
  node?: NodeKind;
  endNode?: NodeKind;
  born?: number;
  life?: number;
};
type Part = {
  kind: "bit" | "arrow";
  ambient: boolean;
  x: number;
  y: number;
  ch: string;
  vx: number;
  vy: number;
  size: number;
  base: number;
  gold: boolean;
  ph: number;
  bw: number;
  amp: number;
  ghost: boolean;
  age: number;
  life: number;
};
type Ticker = {
  sym: string;
  kind: "price" | "pct";
  /** Real quote values from /api/quotes. */
  price: number;
  changePct: number;
  marketOpen: boolean;
  ax: number;
  ay: number;
  flash: number;
  ph: number;
  bw: number;
  age: number;
  life: number;
  alpha: number;
};

export type ChipScene = {
  /** Match the backing store to the canvas's CSS size. */
  resize(): void;
  /** Advance the simulation by dt seconds and draw it. */
  step(dt: number): void;
  /** Redraw the current state without advancing it. */
  redraw(): void;
  /** Settle the scene once and draw a still frame (reduced motion). */
  still(): void;
  /** Feed in real quotes. `null` hides every ticker chip. */
  setQuotes(quotes: Quote[] | null): void;
  /** Pointer handlers, attached by the caller. Mouse and pen only. */
  pointerMove(e: PointerEvent): void;
  pointerLeave(): void;
  pointerUp(e: PointerEvent): void;
};

export function createChipScene(cv: HTMLCanvasElement, monoFamily: string): ChipScene | null {
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  const MONO = monoFamily;
  const LOGO_M = new Path2D(M_PATH);
  const LOGO_P = new Path2D(PINS_PATH);

  let scale = 1,
    dpr = 1,
    clock = 0;

  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a: string, b: string, t: number) => {
    const A = hex(a),
      B = hex(b);
    return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",") + ")";
  };
  const inLogo = (x: number, y: number) => x > 160 && x < 400 && y > 134 && y < 306;

  /* pointer */
  const ptr = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, inside: false, p: 0 };
  let mGlow = 0;
  function setPtr(e: PointerEvent) {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    ptr.tx = ((e.clientX - r.left) / r.width) * W;
    ptr.ty = ((e.clientY - r.top) / r.height) * H;
    if (!ptr.inside) {
      ptr.x = ptr.tx;
      ptr.y = ptr.ty;
    }
    ptr.inside = true;
  }

  /* wires */
  function mkWire(pts: Pt[], opts: Partial<Wire>): Wire {
    const segs: Seg[] = [];
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1],
        [x1, y1] = pts[i];
      const l = Math.hypot(x1 - x0, y1 - y0);
      segs.push({ x0, y0, x1, y1, l, s0: len });
      len += l;
    }
    return Object.assign(
      {
        pts,
        segs,
        len,
        heat: 0,
        gap: 0,
        state: "on" as const,
        timer: rand(2, 6),
        packets: [] as Packet[],
        spawn: rand(0.2, 1.4),
        dir: Math.random() < 0.5 ? 1 : -1,
      },
      opts,
    );
  }
  function pointAt(w: Wire, s: number) {
    s = clamp(s, 0, w.len);
    for (const g of w.segs) {
      if (s <= g.s0 + g.l || g === w.segs[w.segs.length - 1]) {
        const t = g.l ? (s - g.s0) / g.l : 0;
        return { x: g.x0 + (g.x1 - g.x0) * t, y: g.y0 + (g.y1 - g.y0) * t, a: Math.atan2(g.y1 - g.y0, g.x1 - g.x0) };
      }
    }
    return { x: w.pts[0][0], y: w.pts[0][1], a: 0 };
  }
  function distTo(w: Wire, x: number, y: number) {
    let d = Infinity;
    for (const g of w.segs) {
      const dx = g.x1 - g.x0,
        dy = g.y1 - g.y0;
      const t = clamp(((x - g.x0) * dx + (y - g.y0) * dy) / (dx * dx + dy * dy || 1), 0, 1);
      d = Math.min(d, Math.hypot(x - (g.x0 + dx * t), y - (g.y0 + dy * t)));
    }
    return d;
  }
  const wires: Wire[] = [
    mkWire([[0, 96], [118, 96], [118, 161], [172.5, 161]], { pin: { side: "L", i: 0 } }),
    mkWire([[0, 220], [172.5, 220]], { pin: { side: "L", i: 1 }, state: "off", gap: 15, timer: rand(1, 2.5) }),
    mkWire([[40, 346], [134, 346], [134, 279], [172.5, 279]], { pin: { side: "L", i: 2 }, node: "circle" }),
    mkWire([[560, 108], [444, 108], [444, 161], [387.5, 161]], { pin: { side: "R", i: 0 }, state: "off", gap: 15, timer: rand(1.5, 3) }),
    mkWire([[560, 220], [387.5, 220]], { pin: { side: "R", i: 1 } }),
    mkWire([[516, 362], [468, 362], [468, 279], [387.5, 279]], { pin: { side: "R", i: 2 }, node: "square" }),
    mkWire([[206, 0], [206, 52], [242, 52]], { endNode: "circle" }),
    mkWire([[338, 440], [338, 394], [388, 394]], { endNode: "square" }),
    mkWire([[118, 440], [118, 404], [88, 404]], { endNode: "circle" }),
    mkWire([[500, 0], [500, 40], [530, 40]], { endNode: "circle" }),
  ];

  /* sprouts near the cursor */
  const sprouts: Wire[] = [];
  let sproutClock = 0;
  const snap = (v: number) => Math.round(v / 8) * 8;
  function addSprout() {
    for (let tries = 0; tries < 6; tries++) {
      const x = snap(ptr.x + rand(-80, 80)),
        y = snap(ptr.y + rand(-64, 64));
      if (x < 8 || x > W - 8 || y < 8 || y > H - 8 || inLogo(x, y)) continue;
      const hx = x + (Math.random() < 0.5 ? -1 : 1) * snap(rand(18, 48));
      const vy = y + (Math.random() < 0.5 ? -1 : 1) * snap(rand(16, 40));
      if (inLogo(hx, y) || inLogo(hx, vy)) continue;
      sprouts.push(
        mkWire(
          [
            [x, y],
            [hx, y],
            [hx, vy],
          ],
          { born: 0, life: rand(1.1, 1.8), endNode: Math.random() < 0.5 ? "circle" : "square" },
        ),
      );
      return;
    }
  }

  /* bits and arrows */
  const GLYPHS = ["▲", "▼", "↗", "↘", "→"];
  const isUpGlyph = (g: string) => g === "▲" || g === "↗";
  const parts: Part[] = [];
  function freeSpot(): Pt {
    for (let i = 0; i < 20; i++) {
      const x = rand(8, W - 20),
        y = rand(10, H - 20);
      if (!inLogo(x + 6, y + 6)) return [x, y];
    }
    return [20, 20];
  }
  function mkPart(kind: Part["kind"], ambient: boolean, x?: number, y?: number): Part {
    if (x === undefined || y === undefined) [x, y] = freeSpot();
    const ch = kind === "bit" ? (Math.random() < 0.5 ? "0" : "1") : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    return {
      kind,
      ambient,
      x,
      y,
      ch,
      vx: rand(-7, 7),
      vy: rand(-5, 5),
      size: kind === "bit" ? Math.round(rand(11, 17)) : Math.round(rand(12, 18)),
      base: ambient ? rand(0.16, 0.42) : rand(0.6, 1),
      gold: kind === "bit" ? Math.random() < (ambient ? 0.14 : 0.42) : isUpGlyph(ch),
      ph: rand(0, Math.PI * 2),
      bw: rand(2.2, 4.2),
      amp: rand(3, 8),
      ghost: Math.random() < 0.55,
      age: 0,
      life: ambient ? Infinity : rand(1.2, 2.4),
    };
  }
  for (let i = 0; i < 42; i++) parts.push(mkPart("bit", true));
  for (let i = 0; i < 14; i++) parts.push(mkPart("arrow", true));
  let partClock = 0;

  /* tickers: real quotes only, nothing shown until /api/quotes answers */
  const fmtPrice = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (v: number) => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(2) + "%";
  const isUp = (t: Ticker) => t.changePct >= 0;
  function mkTicker(sym: string, kind: Ticker["kind"], q: Quote, ax: number, ay: number, extra?: Partial<Ticker>): Ticker {
    return Object.assign(
      {
        sym,
        kind,
        price: q.price,
        changePct: q.changePct,
        marketOpen: q.marketOpen,
        ax,
        ay,
        flash: 0,
        ph: rand(0, 6.28),
        bw: rand(1.6, 2.6),
        age: 0,
        life: Infinity,
        alpha: 1,
      },
      extra,
    );
  }
  function tickLabel(t: Ticker) {
    const arrow = isUp(t) ? "▲" : "▼";
    if (t.kind === "pct") return t.sym + " " + arrow + " " + fmtPct(t.changePct);
    return t.sym + " " + fmtPrice(t.price) + " " + arrow;
  }
  let quotes = new Map<string, Quote>();
  /** One slot per fixed chip; empty when that symbol has no quote. */
  const fixed: (Ticker | null)[] = CHIP_TICKERS.map(() => null);
  let cursorTickers: Ticker[] = [];
  const allTickers = () => [...fixed.filter((t): t is Ticker => t !== null), ...cursorTickers];

  /** Copy a fresh quote into a chip, flashing it only if a shown value changed. */
  function applyQuote(t: Ticker, q: Quote) {
    if (q.price !== t.price || q.changePct !== t.changePct) t.flash = 0.3;
    t.price = q.price;
    t.changePct = q.changePct;
    t.marketOpen = q.marketOpen;
  }
  function setQuotes(list: Quote[] | null) {
    if (!list || list.length === 0) {
      quotes = new Map();
      fixed.fill(null);
      cursorTickers = [];
      return;
    }
    quotes = new Map(list.map((q) => [q.symbol, q]));
    CHIP_TICKERS.forEach((slot, i) => {
      const q = quotes.get(slot.symbol);
      const t = fixed[i];
      if (!q) fixed[i] = null;
      else if (t) applyQuote(t, q);
      else fixed[i] = mkTicker(slot.symbol, slot.kind, q, slot.ax, slot.ay);
    });
    cursorTickers = cursorTickers.filter((t) => {
      const q = quotes.get(t.sym);
      if (q) applyQuote(t, q);
      return !!q;
    });
  }

  let tickClock = 0;
  function addCursorTicker() {
    if (cursorTickers.length >= 3) return;
    const pool = CURSOR_TICKERS.filter((s) => quotes.has(s));
    if (pool.length === 0) return;
    for (let i = 0; i < 8; i++) {
      const x = ptr.x + rand(-120, 60),
        y = ptr.y + rand(-90, 80);
      if (x < 6 || x > W - 120 || y < 6 || y > H - 26 || inLogo(x + 50, y + 9) || inLogo(x, y) || inLogo(x + 100, y + 18))
        continue;
      const sym = pool[Math.floor(Math.random() * pool.length)];
      cursorTickers.push(mkTicker(sym, "pct", quotes.get(sym)!, x, y, { life: rand(2, 3), alpha: 0 }));
      return;
    }
  }

  /* update */
  function update(dt: number) {
    ptr.p += ((ptr.inside ? 1 : 0) - ptr.p) * Math.min(1, dt * 5);
    ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 14);
    ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 14);
    const nearM = clamp(1 - Math.hypot(ptr.x - 280, ptr.y - 220) / 190, 0, 1);
    mGlow += ((ptr.inside ? nearM * nearM * (3 - 2 * nearM) : 0) - mGlow) * Math.min(1, dt * 6);

    for (const w of wires) {
      const near = clamp(1 - distTo(w, ptr.x, ptr.y) / 120, 0, 1) * ptr.p;
      w.heat += (near - w.heat) * Math.min(1, dt * 6);
      if (w.pin) {
        const hot = w.heat > 0.5;
        w.timer -= dt;
        if (w.state === "on") {
          if (hot) w.timer = Math.max(w.timer, 1.5);
          if (w.timer <= 0) w.state = "unplug";
        } else if (w.state === "unplug") {
          w.gap += dt * 45;
          if (hot) w.state = "plug";
          else if (w.gap >= 15) {
            w.gap = 15;
            w.state = "off";
            w.timer = rand(1.2, 3);
          }
        } else if (w.state === "off") {
          if (hot || w.timer <= 0) w.state = "plug";
        } else if (w.state === "plug") {
          w.gap -= dt * (hot ? 90 : 45);
          if (w.gap <= 0) {
            w.gap = 0;
            w.state = "on";
            w.timer = rand(3, 8);
          }
        }
      }
      const live = !w.pin || w.state === "on" || w.state === "unplug";
      w.spawn -= dt * (1 + w.heat * 3);
      if (w.spawn <= 0 && live) {
        w.spawn = rand(0.9, 2.2);
        if (w.pin) w.packets.push({ s: w.dir > 0 ? 0 : w.len - w.gap, dir: w.dir });
        else w.packets.push({ s: w.dir > 0 ? 0 : w.len, dir: w.dir });
      }
      const speed = 60 + w.heat * 90;
      for (const p of w.packets) p.s += p.dir * speed * dt;
      const end = w.len - w.gap;
      w.packets = w.packets.filter((p) => p.s >= -2 && p.s <= end + 2);
    }

    sproutClock -= dt;
    if (ptr.p > 0.5 && sproutClock <= 0) {
      addSprout();
      sproutClock = 0.28;
    }
    for (const s of sprouts) {
      s.born! += dt;
      const near = clamp(1 - distTo(s, ptr.x, ptr.y) / 140, 0, 1);
      s.heat = Math.max(0.6, near);
      s.spawn -= dt * 2;
      if (s.spawn <= 0 && s.born! > 0.3) {
        s.spawn = rand(0.4, 0.9);
        s.packets.push({ s: 0, dir: 1 });
      }
      for (const p of s.packets) p.s += 90 * dt;
      s.packets = s.packets.filter((p) => p.s <= s.len);
    }
    for (let i = sprouts.length - 1; i >= 0; i--) if (sprouts[i].born! > sprouts[i].life!) sprouts.splice(i, 1);

    partClock -= dt;
    if (ptr.p > 0.5 && partClock <= 0) {
      partClock = 0.05;
      const a = rand(0, Math.PI * 2),
        r = rand(18, 110);
      const x = ptr.x + Math.cos(a) * r,
        y = ptr.y + Math.sin(a) * r;
      if (x > 4 && x < W - 16 && y > 4 && y < H - 18 && !inLogo(x + 6, y + 6)) {
        const p = mkPart(Math.random() < 0.72 ? "bit" : "arrow", false, x, y);
        p.vx = Math.cos(a) * rand(8, 26);
        p.vy = Math.sin(a) * rand(8, 26);
        parts.push(p);
      }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === "bit" && Math.random() < dt * 0.7) p.ch = p.ch === "0" ? "1" : "0";
      if (p.ambient) {
        if (p.x < -10) p.x = W;
        if (p.x > W + 10) p.x = -6;
        if (p.y < -10) p.y = H;
        if (p.y > H + 10) p.y = -6;
        if (inLogo(p.x + 6, p.y + 6)) {
          p.vx = -p.vx;
          p.vy = -p.vy;
          p.x += p.vx * dt * 3;
          p.y += p.vy * dt * 3;
        }
      } else if (p.age > p.life || inLogo(p.x + 6, p.y + 6)) {
        parts.splice(i, 1);
      }
    }

    tickClock -= dt;
    if (ptr.p > 0.6 && tickClock <= 0) {
      addCursorTicker();
      tickClock = 1.1;
    }
    for (const k of allTickers()) {
      k.age += dt;
      k.flash = Math.max(0, k.flash - dt);
      if (k.life !== Infinity) k.alpha = Math.min(1, k.age / 0.3, Math.max(0, (k.life - k.age) / 0.4));
    }
    cursorTickers = cursorTickers.filter((k) => k.age <= k.life);
  }

  /* draw */
  const c = ctx;
  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, r);
    else c.rect(x, y, w, h);
  }
  function drawPolyline(w: Wire, upto: number) {
    c.beginPath();
    let first = true,
      done = 0;
    for (const g of w.segs) {
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
  function chevron(x: number, y: number, a: number, size: number, color: string) {
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
  function node(kind: NodeKind, x: number, y: number, color: string, fill: string) {
    c.lineWidth = 1.6;
    c.strokeStyle = color;
    c.fillStyle = fill;
    if (kind === "square") {
      c.beginPath();
      c.rect(x - 4.5, y - 4.5, 9, 9);
    } else {
      c.beginPath();
      c.arc(x, y, 4.5, 0, Math.PI * 2);
    }
    c.fill();
    c.stroke();
  }
  function pinRect(side: "L" | "R", i: number): [number, number, number, number] {
    const y0 = [155, 213.6, 272.4][i];
    return side === "L" ? [172.6, y0, 19.4, 12.6] : [368, y0, 19.4, 12.6];
  }

  function draw(t: number) {
    c.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    c.fillStyle = C.cream;
    c.fillRect(0, 0, W, H);

    c.fillStyle = "rgba(11,27,51,0.10)";
    for (let y = 2; y < H; y += 16) for (let x = 2; x < W; x += 16) c.fillRect(x - 1, y - 1, 2, 2);

    if (ptr.p > 0.01) {
      const g = c.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 130);
      g.addColorStop(0, "rgba(217,162,27," + (0.3 * ptr.p).toFixed(3) + ")");
      g.addColorStop(1, "rgba(217,162,27,0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(ptr.x, ptr.y, 130, 0, Math.PI * 2);
      c.fill();
      c.save();
      c.setLineDash([3, 5]);
      c.lineDashOffset = -t * 18;
      c.strokeStyle = "rgba(192,143,18," + (0.5 * ptr.p).toFixed(3) + ")";
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(ptr.x, ptr.y, 64, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }

    c.lineJoin = "round";
    c.lineCap = "round";
    for (const w of wires.concat(sprouts)) {
      const isSprout = w.born !== undefined;
      let grow = 1,
        fade = 1;
      if (isSprout) {
        grow = Math.min(1, w.born! / 0.3);
        fade = clamp((w.life! - w.born!) / 0.5, 0, 1);
      }
      c.globalAlpha = (isSprout ? 1 : 0.8 + 0.2 * w.heat) * fade;
      c.strokeStyle = isSprout ? C.gold : mix("#0B1B33", "#D9A21B", w.heat);
      c.lineWidth = isSprout ? 1.8 : 1.6 + w.heat * 1.2;
      drawPolyline(w, (w.len - (w.gap || 0)) * grow);
      if (w.pin && w.gap > 0.5) {
        const e = pointAt(w, w.len - w.gap);
        c.fillStyle = C.navy;
        roundRect(e.x - 5.5, e.y - 5.5, 11, 11, 2);
        c.fill();
        const pinX = w.pin.side === "L" ? 172.5 : 387.5;
        const midX = (e.x + pinX) / 2,
          y = e.y;
        if (w.state === "off" || w.state === "unplug") {
          c.strokeStyle = C.goldInk;
          c.lineWidth = 1.4;
          c.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 22 + w.len));
          c.beginPath();
          c.moveTo(midX - 2, y - 7);
          c.lineTo(midX + 2, y - 12);
          c.moveTo(midX - 3, y);
          c.lineTo(midX + 3, y);
          c.moveTo(midX - 2, y + 7);
          c.lineTo(midX + 2, y + 12);
          c.stroke();
          c.globalAlpha = 1;
        }
      }
      if (isSprout && grow >= 1) node(w.endNode!, w.pts[2][0], w.pts[2][1], C.gold, C.gold);
      c.globalAlpha = fade;
      for (const p of w.packets) {
        const q = pointAt(w, p.s);
        chevron(q.x, q.y, q.a + (p.dir < 0 ? Math.PI : 0), 4.5 + w.heat * 1.5, w.heat > 0.5 || isSprout ? C.navy : C.goldInk);
      }
      c.globalAlpha = 1;
      if (w.node) node(w.node, w.pts[0][0], w.pts[0][1], mix("#0B1B33", "#D9A21B", w.heat), C.cream);
      if (w.endNode && !isSprout) {
        const e = w.pts[w.pts.length - 1];
        node(w.endNode, e[0], e[1], mix("#0B1B33", "#D9A21B", w.heat), C.cream);
      }
    }

    if (mGlow > 0.01) {
      const bg = c.createRadialGradient(280, 220, 0, 280, 220, 150);
      bg.addColorStop(0, "rgba(58,128,230," + (0.12 * mGlow).toFixed(3) + ")");
      bg.addColorStop(1, "rgba(58,128,230,0)");
      c.fillStyle = bg;
      c.beginPath();
      c.arc(280, 220, 150, 0, Math.PI * 2);
      c.fill();
    }
    c.save();
    c.translate(280, 220);
    c.scale(0.2, 0.2);
    c.translate(-800, -800);
    if (mGlow > 0.01) {
      c.shadowColor = "rgba(58,128,230," + (0.5 * mGlow).toFixed(3) + ")";
      c.shadowBlur = 20 * mGlow * dpr * scale;
    }
    c.fillStyle = mix("#0B1B33", "#1E4F94", mGlow * 0.35);
    c.fill(LOGO_M, "evenodd");
    c.shadowBlur = 0;
    c.shadowColor = "rgba(0,0,0,0)";
    c.fillStyle = C.gold;
    c.fill(LOGO_P);
    c.restore();
    for (const w of wires) {
      if (!w.pin || w.heat < 0.04) continue;
      const [x, y, rw, rh] = pinRect(w.pin.side, w.pin.i);
      c.globalAlpha = w.heat * 0.4;
      c.fillStyle = C.goldHi;
      roundRect(x - 6, y - 6, rw + 12, rh + 12, 4);
      c.fill();
      c.globalAlpha = w.heat;
      c.fillRect(x, y, rw, rh);
      c.globalAlpha = 1;
    }

    c.textBaseline = "top";
    for (const p of parts) {
      const d = Math.hypot(p.x - ptr.x, p.y - ptr.y);
      const prox = clamp(1 - d / 120, 0, 1) * ptr.p;
      let a = p.ambient ? p.base + (0.92 - p.base) * prox : p.base;
      if (!p.ambient) a *= Math.min(1, p.age / 0.25, Math.max(0, (p.life - p.age) / 0.5));
      const gold = p.gold || (p.ambient && p.kind === "bit" && prox > 0.55 && p.ph > 3.6);
      const color = p.kind === "arrow" ? (isUpGlyph(p.ch) ? C.goldInk : C.navy) : gold ? C.goldInk : C.navy;
      const bounce = (tt: number) => -Math.abs(Math.sin(tt * p.bw + p.ph)) * p.amp;
      c.font = "600 " + p.size + "px " + MONO;
      c.fillStyle = color;
      if (p.ghost) {
        c.globalAlpha = a * 0.22;
        c.fillText(p.ch, p.x, p.y + bounce(t - 0.14));
      }
      c.globalAlpha = a;
      c.fillText(p.ch, p.x, p.y + bounce(t));
    }
    c.globalAlpha = 1;

    const LABEL_FONT = "700 11px " + MONO;
    const TAG_FONT = "600 8px " + MONO;
    for (const k of allTickers()) {
      const label = tickLabel(k);
      const up = isUp(k);
      const x = k.ax + Math.sin(t * 0.6 + k.ph) * 4;
      const by = -Math.abs(Math.sin(t * k.bw + k.ph)) * 4;
      const y = k.ay + by;
      c.font = LABEL_FONT;
      const labelW = c.measureText(label).width;
      // Outside market hours the chip keeps the last price and day change, tagged "close".
      c.font = TAG_FONT;
      const tagW = k.marketOpen ? 0 : c.measureText("CLOSE").width + 6;
      const w = labelW + tagW + 14,
        h = 19;
      const d = Math.hypot(x + w / 2 - ptr.x, y + h / 2 - ptr.y);
      const hot = clamp(1 - d / 150, 0, 1) * ptr.p;
      const color = up ? C.goldInk : C.navy;
      const base = (k.life === Infinity ? 0.62 + 0.38 * hot : 1) * k.alpha;
      c.globalAlpha = base * 0.16;
      c.strokeStyle = color;
      c.lineWidth = 1;
      roundRect(x, k.ay + 9 + by * 0.4, w, h, 3);
      c.stroke();
      c.globalAlpha = base;
      c.fillStyle = k.flash > 0 ? (up ? "#FBF0D2" : "#E4E8EF") : C.cream;
      roundRect(x, y, w, h, 3);
      c.fill();
      c.strokeStyle = hot > 0.3 || k.life !== Infinity ? C.gold : color;
      c.lineWidth = hot > 0.3 ? 1.5 : 1;
      roundRect(x, y, w, h, 3);
      c.stroke();
      c.fillStyle = color;
      c.font = LABEL_FONT;
      c.fillText(label, x + 7, y + 4.5);
      if (!k.marketOpen) {
        c.font = TAG_FONT;
        c.globalAlpha = base * 0.7;
        c.fillText("CLOSE", x + 7 + labelW + 6, y + 6.5);
      }
    }
    c.globalAlpha = 1;
  }

  return {
    resize() {
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      scale = r.width / W;
    },
    step(dt) {
      clock += dt;
      update(dt);
      draw(clock);
    },
    redraw() {
      draw(clock);
    },
    still() {
      update(0.016);
      draw(clock);
    },
    setQuotes,
    pointerMove(e) {
      if (e.pointerType === "touch") return;
      setPtr(e);
    },
    pointerLeave() {
      ptr.inside = false;
    },
    pointerUp(e) {
      if (e.pointerType !== "mouse") ptr.inside = false;
    },
  };
}
