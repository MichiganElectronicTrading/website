"use client";

import { useEffect, useRef } from "react";
import {
  clamp,
  drawChevron,
  drawDotGrid,
  drawGlyph,
  drawPad,
  drawTag,
  makePath,
  measureTag,
  pointAt,
  strokePath,
  tagLabel,
  type Path,
} from "./chipParts";
import { BOX_H, BOX_W, TAG_OFFSET, generateCornerLayout, tagRect } from "./cornerLayout";
import { subscribeQuotes } from "./quotesFeed";
import { CHIP_TICKERS, CURSOR_TICKERS, type Quote } from "@/data/quotes";
import styles from "./CornerWiring.module.css";

/*
 * Live-chip wiring spilling into the bottom-right of the inner-page header:
 * traces, pads, quote tags and bits, recoloured for navy. The layout is
 * random on every load, generated after mount so server and client HTML match.
 * Decorative only: aria-hidden, no pointer events, hidden below 768px.
 */

const NAVY = "#0B1B33";
const GOLD = "#D9A21B";
const WIRE = "rgba(255,255,255,0.32)";
const PAD_OUTLINE = "rgba(255,255,255,0.6)";
const TAG_TEXT = "rgba(255,255,255,0.82)";
const SYMBOLS = Array.from(new Set([...CHIP_TICKERS.map((t) => t.symbol), ...CURSOR_TICKERS]));
/** Dots fade out over this distance from the corner. */
const GRID_FADE = 520;
const SIGNAL_LENGTH = 18;

/** Stroke the part of a path between two distances along it. */
function strokeRange(c: CanvasRenderingContext2D, p: Path, from: number, to: number) {
  from = clamp(from, 0, p.len);
  to = clamp(to, 0, p.len);
  if (to <= from) return;
  const a = pointAt(p, from);
  c.beginPath();
  c.moveTo(a.x, a.y);
  for (const g of p.segs) {
    const end = g.s0 + g.l;
    if (end > from && end < to) c.lineTo(g.x1, g.y1);
  }
  const b = pointAt(p, to);
  c.lineTo(b.x, b.y);
  c.stroke();
}

export default function CornerWiring() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const c = ctx;
    const mono =
      getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() ||
      "ui-monospace, Menlo, monospace";

    const layout = generateCornerLayout();
    const paths = layout.wires.map((w) => makePath(w.pts));
    /** Symbol shown on each tag, picked once real quotes arrive. No repeats. */
    let tagSymbols: (string | null)[] = layout.tags.map(() => null);
    let quotes = new Map<string, Quote>();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = 1;
    let raf = 0;
    let start = 0;
    let onScreen = false;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv!.width = BOX_W * dpr;
      cv!.height = BOX_H * dpr;
    }

    function draw(t: number) {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, BOX_W, BOX_H);

      drawDotGrid(c, BOX_W, BOX_H, "255,255,255", 0.14, 0, (x, y) =>
        clamp(1 - Math.hypot(BOX_W - x, BOX_H - y) / GRID_FADE, 0, 1),
      );

      c.lineJoin = "round";
      c.lineCap = "round";
      c.globalAlpha = 1;
      c.strokeStyle = WIRE;
      c.lineWidth = 1.5;
      for (const p of paths) strokePath(c, p);

      if (!reduced) {
        c.strokeStyle = GOLD;
        c.lineWidth = 1.5;
        for (const s of layout.signals) {
          const p = paths[s.wire];
          const head = (((t + s.offset) % s.period) / s.period) * (p.len + SIGNAL_LENGTH);
          strokeRange(c, p, head - SIGNAL_LENGTH, head);
        }
      }

      for (const m of layout.marks) {
        const q = pointAt(paths[m.wire], m.s);
        drawChevron(c, q.x, q.y, q.a, m.gold ? 6 : 4, m.gold ? GOLD : "rgba(255,255,255,0.5)");
      }

      layout.wires.forEach((w) => {
        const [x, y] = w.pts[w.pts.length - 1];
        drawPad(c, w.pad, x, y, PAD_OUTLINE, NAVY);
      });

      for (const b of layout.bits) {
        const fade = reduced ? 1 : 0.5 - 0.5 * Math.cos((t / b.period) * Math.PI * 2 + b.phase);
        drawGlyph(c, b.ch, b.x, b.y, b.size, GOLD, 0.18 * fade, mono);
      }
      c.globalAlpha = 1;

      layout.tags.forEach((tag, i) => {
        const sym = tagSymbols[i];
        const q = sym ? quotes.get(sym) : undefined;
        if (!sym || !q) return;
        const wire = layout.wires[tag.wire];
        const label = tagLabel(sym, "pct", q.price, q.changePct);
        const closed = !q.marketOpen;
        const { w } = measureTag(c, label, closed, mono);
        // Same anchor as the reserved space, sized to the real label.
        const r = tagRect(wire, w);
        const stroke = tag.gold ? GOLD : WIRE;
        drawTag(c, r.x, r.y, label, closed, mono, {
          fill: NAVY,
          stroke,
          lineWidth: 1,
          text: tag.gold ? GOLD : TAG_TEXT,
          alpha: 1,
          shadow: { y: r.y + TAG_OFFSET * 0.7, color: stroke, alpha: 0.35 },
        });
      });
    }

    const frame = (now: number) => {
      if (!start) start = now;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };
    // Animate only while visible on screen and motion is allowed.
    const sync = () => {
      const run = !reduced && onScreen && !document.hidden;
      if (run && !raf) raf = requestAnimationFrame(frame);
      else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const redraw = () => {
      if (!raf) draw(start ? (performance.now() - start) / 1000 : 0);
    };

    resize();
    redraw();

    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      sync();
    });
    io.observe(cv);
    document.addEventListener("visibilitychange", sync);

    let alive = true;
    document.fonts
      .load(`700 11px ${mono}`)
      .catch(() => undefined)
      .then(() => {
        if (alive) redraw();
      });

    const stopQuotes = subscribeQuotes((list) => {
      quotes = new Map((list ?? []).map((q) => [q.symbol, q]));
      // Keep each tag's symbol across refreshes; fill any empty tag from symbols not yet used.
      const available = SYMBOLS.filter((s) => quotes.has(s));
      tagSymbols = tagSymbols.map((s) => (s && quotes.has(s) ? s : null));
      for (let i = 0; i < tagSymbols.length; i++) {
        if (tagSymbols[i]) continue;
        const free = available.filter((a) => !tagSymbols.includes(a));
        tagSymbols[i] = free.length ? free[Math.floor(Math.random() * free.length)] : null;
      }
      redraw();
    });

    const onResize = () => {
      resize();
      redraw();
    };
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      stopQuotes();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={styles.corner} aria-hidden="true" data-reveal="off">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
