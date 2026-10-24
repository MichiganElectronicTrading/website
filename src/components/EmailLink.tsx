"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import styles from "./EmailLink.module.css";

/*
 * The club email, everywhere it appears. Always a real mailto link.
 * - "address": shows the address; a click copies it instead of opening a mail
 *   app, and the text reads "Copied ✓" for a moment.
 * - "mail" (buttons, the footer "Email" link): opens the mail app as normal,
 *   copies the address too, and shows an "Email copied" toast.
 * Without clipboard access it behaves as a plain mailto link.
 */

const COPIED_MS = 1500;
const TOAST_MS = 1800;
const MAILTO = `mailto:${site.email}`;

let liveRegion: HTMLElement | null = null;
let toast: HTMLElement | null = null;
let toastTimer = 0;

/** One polite live region and one toast for the whole page, created on first use. */
function ensureShared() {
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.className = styles.srOnly;
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(liveRegion);
  }
  if (!toast) {
    toast = document.createElement("div");
    toast.className = `lbl ${styles.toast}`;
    toast.setAttribute("aria-hidden", "true");
    toast.textContent = "Email copied";
    document.body.appendChild(toast);
  }
}

function announce(text: string) {
  if (!liveRegion) return;
  liveRegion.textContent = "";
  window.setTimeout(() => {
    if (liveRegion) liveRegion.textContent = text;
  }, 50);
}

function showToast() {
  if (!toast) return;
  toast.classList.add(styles.toastShown);
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast?.classList.remove(styles.toastShown), TOAST_MS);
}

const canCopy = () => typeof navigator !== "undefined" && !!navigator.clipboard?.writeText;

type Props = {
  variant: "address" | "mail";
  className?: string;
  /** Link text for the "mail" variant, e.g. "Email the Board". */
  children?: React.ReactNode;
};

export default function EmailLink({ variant, className, children }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    ensureShared();
    return () => window.clearTimeout(timer.current);
  }, []);

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!canCopy()) return; // Plain mailto link.
    ensureShared();
    const copy = navigator.clipboard.writeText(site.email);

    if (variant === "mail") {
      // Let the mail app open as usual; the copy is a bonus.
      copy.then(
        () => {
          showToast();
          announce("Email copied");
        },
        () => undefined,
      );
      return;
    }

    e.preventDefault();
    copy.then(
      () => {
        setCopied(true);
        announce("Copied");
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
      },
      () => {
        window.location.href = MAILTO;
      },
    );
  }

  if (variant === "mail") {
    return (
      <a href={MAILTO} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={MAILTO}
      className={`${styles.address} ${className ?? ""}`}
      onClick={onClick}
      aria-label={`${site.email}, copy email address`}
    >
      {/* Both texts share one grid cell, so the swap never changes the size. */}
      <span className={copied ? styles.hidden : undefined}>{site.email}</span>
      <span className={copied ? undefined : styles.hidden}>Copied ✓</span>
    </a>
  );
}
