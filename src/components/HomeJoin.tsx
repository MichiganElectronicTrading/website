import Link from "next/link";
import Section, { SectionLabel } from "./Section";
import { recruiting } from "@/data/recruiting";
import styles from "./HomeJoin.module.css";

/** Home's Join section. Switches between closed and open with `recruiting.status`. */
export default function HomeJoin({ label, bg }: { label: string; bg: "cream" | "offWhite" }) {
  const open = recruiting.status === "open";

  return (
    <Section id="join" bg={bg} pad={96} rule gap={40}>
      <SectionLabel>{label}</SectionLabel>
      <div className={styles.row}>
        <div className={styles.copy}>
          {open ? (
            <>
              <h2>Applications Are Open</h2>
              <p>
                {recruiting.term} applications close {recruiting.closesDate}. Every applicant hears back by{" "}
                {recruiting.decisionsDate}.
              </p>
            </>
          ) : (
            <>
              <h2>Applications Are Closed</h2>
              <p>Leave your info and we&apos;ll email you when {recruiting.term} applications open.</p>
            </>
          )}
          <div className={styles.actions}>
            <a href={open ? recruiting.applyUrl : recruiting.notifyUrl} target="_blank" rel="noopener" className="btn fill">
              {open ? "Apply" : "Register Interest"}
            </a>
            <Link href="/join" className={styles.how}>
              How recruiting works →
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
