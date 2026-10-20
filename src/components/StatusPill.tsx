import styles from "./StatusPill.module.css";

type Props = {
  open: boolean;
  /** "light" for cream sections, "dark" for the navy page header. */
  tone: "light" | "dark";
};

/** "Applications open/closed" tag. The open state has a pulsing gold dot. */
export default function StatusPill({ open, tone }: Props) {
  const dot = open ? `${styles.dot} ${styles.live}` : `${styles.dot} ${tone === "dark" ? styles.closedDark : styles.closedLight}`;
  return (
    <div className={`lbl ${styles.pill} ${tone === "dark" ? styles.onDark : ""}`}>
      <span className={dot} />
      {open ? "Applications open" : "Applications closed"}
    </div>
  );
}
