"use client";

import { useEffect } from "react";

/*
 * Scroll-in transitions for every <Section> and <PageHeader>, driven by one
 * IntersectionObserver for the whole page. Mounted once in the root layout.
 *
 * Inside each [data-reveal-root] it finds, without page-by-page tags:
 * - section labels ([data-reveal-label]): text scramble, then the rule draws in;
 * - card grids and lists (2+ siblings of the same kind): items fade up, staggered;
 * - everything else (headings, paragraphs, buttons, logo strips): fades up.
 *
 * Opt out on any element (and its contents) with data-reveal="off".
 * Force an element to fade as one block with data-reveal="unit".
 * Hold an element back with data-reveal-delay="200" (ms, added to any stagger).
 *
 * Elements are only hidden once this script runs. The inline script in the
 * layout hides section content from the first paint so nothing flashes, and
 * gives up after a few seconds if this never loads.
 */

/** Every scroll-reveal timing lives here. Times in ms. */
export const REVEAL = {
  /** Share of an element that must be on screen before it animates. */
  threshold: 0.15,
  /** Fade-up for headings, paragraphs, buttons, logo strips and cards. */
  fadeDuration: 450,
  fadeDistance: 12,
  /** Delay between items in a card grid or list. */
  staggerStep: 70,
  /** Items after this index share its delay (index 5 = the 6th item). */
  staggerCap: 5,
  /** Section label text scramble. */
  scrambleDuration: 400,
  /** Rule line next to the label. Starts as the scramble finishes. */
  lineDelay: 350,
  lineDuration: 500,
};

/** How long the inline script waits for this component before showing everything. */
export const REVEAL_FALLBACK_MS = 3000;

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>+=";
const UNIT_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "P", "A", "BUTTON", "IMG", "SVG", "FIGURE", "TABLE"]);
const ITEM_TAGS = new Set(["LI", "ARTICLE", "DETAILS"]);

type Kind = "fade" | "item" | "label";

const hasOwnText = (el: Element) =>
  Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());

const isUnit = (el: Element) =>
  el.getAttribute("data-reveal") === "unit" ||
  UNIT_TAGS.has(el.tagName.toUpperCase()) ||
  el.children.length === 0 ||
  hasOwnText(el);

/** Two or more children that are all the same kind of card or list item. */
function isGrid(el: Element) {
  const kids = Array.from(el.children);
  if (kids.length < 2) return false;
  const tag = kids[0].tagName;
  if (!kids.every((k) => k.tagName === tag)) return false;
  if (ITEM_TAGS.has(tag)) return true;
  const cls = kids[0].className;
  return tag === "DIV" && typeof cls === "string" && cls !== "" && kids.every((k) => k.className === cls);
}

/** Inline script for <head>: hide section content from the first paint unless motion is reduced. */
export const revealBootScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('reveal-pending');setTimeout(function(){if(d.classList.contains('reveal-pending')){d.classList.remove('reveal-pending');d.setAttribute('data-reveal-skipped','')}},${REVEAL_FALLBACK_MS})}}catch(e){}`;

export default function Reveal() {
  useEffect(() => {
    const doc = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      doc.classList.remove("reveal-pending");
      return;
    }
    // The fallback already showed the page: leave what's there, but handle later pages.
    const skipInitial = doc.hasAttribute("data-reveal-skipped");

    doc.style.setProperty("--reveal-fade", `${REVEAL.fadeDuration}ms`);
    doc.style.setProperty("--reveal-distance", `${REVEAL.fadeDistance}px`);
    doc.style.setProperty("--reveal-line", `${REVEAL.lineDuration}ms`);
    doc.style.setProperty("--reveal-line-delay", `${REVEAL.lineDelay}ms`);

    const seenRoots = new WeakSet<Element>();
    const grids = new WeakSet<Element>();
    const timers = new Set<number>();
    const frames = new Set<number>();

    const clear = (el: Element) => {
      el.removeAttribute("data-reveal-state");
      el.removeAttribute("data-reveal-anim");
      (el as HTMLElement).style.removeProperty("--reveal-delay");
    };
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    function scramble(label: Element) {
      const real = label.querySelector("[data-reveal-real]");
      const out = label.querySelector("[data-reveal-scramble]");
      const text = real?.textContent ?? "";
      if (!out || !text) return;
      const lockAt = Array.from(text, (ch, i) =>
        /\s|—/.test(ch) ? 0 : ((i + 1) / text.length) * REVEAL.scrambleDuration,
      );
      const start = performance.now();
      const tick = (now: number) => {
        const t = now - start;
        out.textContent = Array.from(text, (ch, i) =>
          t >= lockAt[i] ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
        ).join("");
        if (t < REVEAL.scrambleDuration) {
          const id = requestAnimationFrame(tick);
          frames.add(id);
        } else {
          out.textContent = "";
          label.setAttribute("data-reveal-state", "done");
        }
      };
      frames.add(requestAnimationFrame(tick));
    }

    function play(el: Element, kind: Kind, delay: number) {
      if (kind === "label") {
        el.setAttribute("data-reveal-state", "in");
        scramble(el);
        later(() => clear(el), Math.max(REVEAL.scrambleDuration, REVEAL.lineDelay + REVEAL.lineDuration) + 50);
        return;
      }
      delay += Number(el.getAttribute("data-reveal-delay")) || 0;
      (el as HTMLElement).style.setProperty("--reveal-delay", `${delay}ms`);
      el.setAttribute("data-reveal-state", "in");
      later(() => clear(el), REVEAL.fadeDuration + delay + 50);
    }

    const io = new IntersectionObserver(
      (entries) => {
        const vh = window.innerHeight || 1;
        const entering = entries
          .filter(
            (e) =>
              e.isIntersecting &&
              (e.intersectionRatio >= REVEAL.threshold || e.intersectionRect.height >= vh * REVEAL.threshold),
          )
          .map((e) => e.target)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        const counts = new Map<Element | null, number>();
        for (const el of entering) {
          io.unobserve(el);
          const kind = el.getAttribute("data-reveal-anim") as Kind;
          let delay = 0;
          if (kind === "item") {
            const n = counts.get(el.parentElement) ?? 0;
            counts.set(el.parentElement, n + 1);
            delay = Math.min(n, REVEAL.staggerCap) * REVEAL.staggerStep;
          }
          play(el, kind, delay);
        }
      },
      { threshold: [0, REVEAL.threshold] },
    );

    const hide = (el: Element, kind: Kind) => {
      el.setAttribute("data-reveal-anim", kind);
      el.setAttribute("data-reveal-state", "pending");
      io.observe(el);
    };

    function walk(el: Element) {
      for (const child of Array.from(el.children)) {
        if (child.getAttribute("data-reveal") === "off") continue;
        if (child.hasAttribute("data-reveal-label")) hide(child, "label");
        else if (isUnit(child)) hide(child, "fade");
        else if (isGrid(child)) {
          grids.add(child);
          for (const item of Array.from(child.children)) {
            if (item.getAttribute("data-reveal") !== "off") hide(item, "item");
          }
        } else walk(child);
      }
    }

    function scan(node: Element, animate: boolean) {
      const roots = node.matches("[data-reveal-root]")
        ? [node]
        : Array.from(node.querySelectorAll("[data-reveal-root]"));
      for (const root of roots) {
        if (seenRoots.has(root) || root.closest('[data-reveal="off"]')) continue;
        seenRoots.add(root);
        if (animate) walk(root);
      }
    }

    scan(doc, !skipInitial);
    doc.classList.remove("reveal-pending");

    // New pages after client navigation, and cards added by filters.
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const node of Array.from(r.addedNodes)) {
          if (!(node instanceof Element)) continue;
          if (node.closest('[data-reveal="off"]')) continue;
          if (node.parentElement && grids.has(node.parentElement)) hide(node, "item");
          else scan(node, true);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      timers.forEach((id) => clearTimeout(id));
      frames.forEach((id) => cancelAnimationFrame(id));
      document.querySelectorAll("[data-reveal-state]").forEach(clear);
      document.querySelectorAll("[data-reveal-scramble]").forEach((s) => (s.textContent = ""));
    };
  }, []);

  return null;
}
