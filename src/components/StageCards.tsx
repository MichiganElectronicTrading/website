import { stages } from "@/data/desks";
import styles from "./StageCards.module.css";

/** Proposal → Research → Execution cards. Home uses the short copy, Desks the long copy. */
export default function StageCards({ variant }: { variant: "home" | "desks" }) {
  return (
    <ol className={styles.list}>
      {stages.map((s) => (
        <li key={s.n} className={variant === "home" ? styles.home : styles.desks}>
          <span className="lbl">{s.n} →</span>
          <span className={`hf ${styles.name}`}>{s.name}</span>
          <span className={styles.desc}>{variant === "home" ? s.summary : s.description}</span>
        </li>
      ))}
    </ol>
  );
}
