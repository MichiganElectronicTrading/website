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

/** Short rows repeat until they have this many tiles, so the loop fills wide screens. */
const MIN_TILES = 8;

type Props = {
  rows: Row[];
  label: string;
  /** Size each tile to its logo so the logo fills it edge to edge. */
  fill?: boolean;
};

/**
 * Auto-scrolling logo strip. Each row is rendered twice so the loop is
 * seamless; hovering pauses every row, and reduced motion stops them.
 * Repeated tiles are hidden from screen readers.
 */
export default function LogoMarquee({ rows, label, fill }: Props) {
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
            Array.from({ length: Math.max(1, Math.ceil(MIN_TILES / row.logos.length)) }, () => row.logos)
              .flat()
              .map((firm, j) => {
                const repeat = copy || j >= row.logos.length;
                return (
                  <div
                    key={`${copy}-${j}`}
                    className={`${styles.mq} ${fill && firm.logo ? styles.fit : ""}`}
                    aria-hidden={repeat || undefined}
                  >
                    {firm.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={firm.logo} alt={repeat ? "" : firm.name} className={styles.img} />
                    ) : (
                      <Placeholder label="[FIRM LOGO]" className={styles.ph} />
                    )}
                  </div>
                );
              }),
          )}
        </div>
      ))}
    </div>
  );
}
