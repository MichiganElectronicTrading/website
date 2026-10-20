import Link from "next/link";
import MetMark from "./MetMark";
import { site } from "@/data/site";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className="dark">
      <div className={styles.inner}>
        <div className={styles.about}>
          <MetMark width={68} height={56} label="Logo" />
          <div className={`hf ${styles.name}`}>{site.name}</div>
          <div className={styles.tagline}>{site.tagline}</div>
          <a href={`mailto:${site.email}`} className={styles.small}>
            {site.email}
          </a>
        </div>
        <div className={styles.col}>
          <div className="lbl">Pages</div>
          <Link href="/desks">Desks</Link>
          <Link href="/sponsors">Sponsors</Link>
          <Link href="/members">Members</Link>
          <Link href="/join">Join</Link>
        </div>
        <div className={styles.col}>
          <div className="lbl">Connect</div>
          <a href={site.linkedin}>LinkedIn</a>
          <a href={site.instagram}>Instagram</a>
          <a href={site.github}>GitHub</a>
          <a href={`mailto:${site.email}`}>Email</a>
        </div>
      </div>
      <div className={styles.legal}>
        © 2026 {site.name} · [Independent student organization disclaimer]
      </div>
    </footer>
  );
}
