import styles from "./Section.module.css";

type Props = {
  bg: "cream" | "offWhite" | "grey";
  /** Vertical padding: 96px on Home, 72px on inner pages. */
  pad: 96 | 72;
  /** Every section after the first has a 1.5px top rule. */
  rule?: boolean;
  /** Gap between children of the column container. */
  gap?: 40 | 32;
  id?: string;
  /** Render children directly instead of inside the 1200px column container. */
  bare?: boolean;
  children: React.ReactNode;
};

export default function Section({ bg, pad, rule, gap = 32, id, bare, children }: Props) {
  const cls = [styles.section, styles[bg], pad === 96 ? styles.pad96 : styles.pad72, rule && styles.rule]
    .filter(Boolean)
    .join(" ");
  return (
    <section id={id} className={cls} data-reveal-root="">
      {bare ? children : <div className={`${styles.container} ${gap === 40 ? styles.gap40 : styles.gap32}`}>{children}</div>}
    </section>
  );
}

/** "01 — About" label followed by a rule that fills the row. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.label} data-reveal-label="">
      <span className={`lbl ${styles.sec}`} data-reveal-text="">
        <span data-reveal-real="">{children}</span>
        <span aria-hidden="true" data-reveal-scramble="" />
      </span>
      <div className={styles.line} data-reveal-line="" />
    </div>
  );
}

/** Closing call-to-action row: heading and text on the left, button on the right. */
export function CtaRow({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className={styles.cta}>
      <div className={styles.ctaText}>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {children}
    </div>
  );
}

/**
 * Numbers section labels in the order they render. Pass `false` for a section
 * that is hidden so later sections move up: ["About", hasX && "X", "Join"].
 */
export function numberSections<T extends string>(titles: (T | false)[]): Record<T, string> {
  const labels = {} as Record<T, string>;
  titles
    .filter((t): t is T => t !== false)
    .forEach((t, i) => {
      labels[t] = `${String(i + 1).padStart(2, "0")} — ${t}`;
    });
  return labels;
}
