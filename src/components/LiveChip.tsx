"use client";

import { useEffect, useRef } from "react";
import { createChipScene } from "./liveChipScene";
import type { Quote } from "@/data/quotes";
import styles from "./LiveChip.module.css";

const QUOTES_REFRESH_MS = 60_000;
/** After failed refreshes, real quotes older than this are hidden. */
const QUOTES_STALE_MS = 5 * 60_000;

/*
 * Animated chip illustration for Home's About section. The canvas is
 * decorative. Under reduced motion it draws one still frame.
 */

export default function LiveChip() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const cv = canvasRef.current;
    if (!stage || !cv) return;
    const mono =
      getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() ||
      "ui-monospace, Menlo, monospace";
    const scene = createChipScene(cv, mono);
    if (!scene) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let paused = motion.matches;
    let onScreen = false;
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      scene.step(dt);
      raf = requestAnimationFrame(frame);
    };
    // Run the loop only without reduced motion, on screen and in a visible tab.
    const sync = () => {
      const run = !paused && onScreen && !document.hidden;
      if (run && !raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    scene.resize();
    if (paused) scene.still();
    else scene.redraw();

    const onMotionChange = () => {
      paused = motion.matches;
      sync();
    };
    motion.addEventListener("change", onMotionChange);

    const resizeObserver = new ResizeObserver(() => {
      scene.resize();
      if (!raf) scene.redraw();
    });
    resizeObserver.observe(cv);

    const intersectionObserver = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      sync();
    });
    intersectionObserver.observe(stage);

    document.addEventListener("visibilitychange", sync);

    // The canvas only picks up the web font once it has loaded.
    let alive = true;
    Promise.all([document.fonts.load(`600 12px ${mono}`), document.fonts.load(`700 11px ${mono}`)])
      .catch(() => undefined)
      .then(() => {
        if (alive && !raf) scene.redraw();
      });

    // Real quotes for the ticker chips. Without any, the chips stay hidden.
    let lastGood = 0;
    const loadQuotes = async () => {
      if (document.hidden && lastGood) return;
      try {
        const res = await fetch("/api/quotes");
        if (!res.ok) throw new Error(String(res.status));
        const data: unknown = await res.json();
        if (!alive) return;
        const list = Array.isArray(data) ? (data as Quote[]) : [];
        scene.setQuotes(list);
        if (list.length) lastGood = Date.now();
      } catch {
        // A missed refresh keeps the last real quotes for a few minutes, then hides them.
        if (alive && Date.now() - lastGood > QUOTES_STALE_MS) scene.setQuotes(null);
      }
      if (alive && !raf) scene.redraw();
    };
    loadQuotes();
    const quotesTimer = window.setInterval(loadQuotes, QUOTES_REFRESH_MS);

    const onMove = (e: PointerEvent) => scene.pointerMove(e);
    const onLeave = () => scene.pointerLeave();
    const onUp = (e: PointerEvent) => scene.pointerUp(e);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerdown", onMove);
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("pointercancel", onLeave);
    cv.addEventListener("pointerup", onUp);

    return () => {
      alive = false;
      window.clearInterval(quotesTimer);
      cancelAnimationFrame(raf);
      raf = 0;
      motion.removeEventListener("change", onMotionChange);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerdown", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("pointercancel", onLeave);
      cv.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className={styles.wrap} data-reveal="off">
      <div ref={stageRef} className={styles.stage}>
        <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
      </div>
    </div>
  );
}
