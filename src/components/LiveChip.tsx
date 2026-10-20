"use client";

import { useEffect, useRef, useState } from "react";
import { createChipScene } from "./liveChipScene";
import styles from "./LiveChip.module.css";

/*
 * Animated chip illustration for Home's About section. The canvas is
 * decorative; the toggle below it pauses and resumes the motion.
 * "still" is the reduced-motion start: one frame, nothing played yet.
 */

type Mode = "running" | "paused" | "still";

const LABELS: Record<Mode, string> = {
  running: "Pause motion",
  paused: "Resume motion",
  still: "Play motion",
};

export default function LiveChip() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toggleRef = useRef<() => void>(() => {});
  const [mode, setMode] = useState<Mode>("running");

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
    // Run the loop only while unpaused, on screen and in a visible tab.
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
    if (paused) {
      setMode("still");
      scene.still();
    } else {
      scene.redraw();
    }

    toggleRef.current = () => {
      paused = !paused;
      setMode(paused ? "paused" : "running");
      sync();
    };

    const onMotionChange = () => {
      if (motion.matches && !paused) {
        paused = true;
        setMode("still");
        sync();
      }
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
      cancelAnimationFrame(raf);
      raf = 0;
      toggleRef.current = () => {};
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
    <div className={styles.wrap}>
      <div ref={stageRef} className={styles.stage}>
        <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
      </div>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={mode !== "running"}
        onClick={() => toggleRef.current()}
      >
        {LABELS[mode]}
      </button>
    </div>
  );
}
