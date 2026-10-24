import Link from "next/link";
import MetMark from "./MetMark";
import EmailLink from "./EmailLink";
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
          <EmailLink variant="address" className={styles.small} />
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
          <a href={site.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          <a href={site.instagram} target="_blank" rel="noopener">Instagram</a>
          <a href={site.github} target="_blank" rel="noopener">GitHub</a>
          <EmailLink variant="mail">Email</EmailLink>
        </div>
      </div>
      <div className={styles.legal}>
        © 2026 {site.name}
      </div>
    </footer>
  );
}
