import type { FirmLogo } from "@/data/logos";
import Placeholder from "./Placeholder";
import styles from "./LogoMarquee.module.css";

type Row = {
  logos: FirmLogo[];
  /** Seconds for one full loop. */
  duration: number;
  /** Scroll right instead of left. */
  reverse?: boolean;
};

type Props = {
  rows: Row[];
  label: string;
};

/**
 * Auto-scrolling logo strip. Each row is rendered twice so the loop is
 * seamless; hovering pauses every row, and reduced motion stops them.
 */
export default function LogoMarquee({ rows, label }: Props) {
  const visible = rows.filter((row) => row.logos.length > 0);
  if (visible.length === 0) return null;

  return (
    <div className={`${styles.marquee} ${visible.length > 1 ? styles.stack : ""}`} aria-label={label}>
      {visible.map((row, i) => (
        <div
          key={i}
          className={`${styles.track} ${row.reverse ? styles.rev : ""}`}
          style={{ animationDuration: `${row.duration}s` }}
        >
          {[false, true].map((copy) =>
            row.logos.map((firm, j) => (
              <div key={`${copy}-${j}`} className={styles.mq} aria-hidden={copy || undefined}>
                {firm.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={firm.logo} alt={copy ? "" : firm.name} className={styles.img} />
                ) : (
                  <Placeholder label="[FIRM LOGO]" className={styles.ph} />
                )}
              </div>
            )),
          )}
        </div>
      ))}
    </div>
  );
}
