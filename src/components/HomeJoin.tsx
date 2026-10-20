import Link from "next/link";
import Section, { SectionLabel } from "./Section";
import StatusPill from "./StatusPill";
import { recruiting } from "@/data/recruiting";
import styles from "./HomeJoin.module.css";

/** Home's Join section. Switches between closed and open with `recruiting.status`. */
export default function HomeJoin({ label }: { label: string }) {
  const open = recruiting.status === "open";

  return (
    <Section id="join" bg="cream" pad={96} rule gap={40}>
      <SectionLabel>{label}</SectionLabel>
      <div className={styles.row}>
        <div className={styles.copy}>
          <StatusPill open={open} tone="light" />
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
        <div className={styles.timeline}>
          <span className={`lbl ${styles.muted}`}>{recruiting.term} recruiting</span>
          <ol className={styles.steps}>
            {recruiting.steps.map((step, i) => {
              const n = String(i + 1).padStart(2, "0");
              if (!open) {
                return (
                  <li key={step.name} className={styles.step}>
                    <span className="lbl">{n}</span>
                    <span className={styles.stepName}>{step.name}</span>
                    <span className={`lbl ${styles.muted}`}>TBA</span>
                  </li>
                );
              }
              const now = i === recruiting.currentStep;
              const past = i < recruiting.currentStep;
              return (
                <li
                  key={step.name}
                  className={`${styles.step} ${now ? styles.now : past ? styles.past : ""}`}
                  aria-current={now ? "step" : undefined}
                >
                  <span className={`lbl ${now ? styles.nowN : ""}`}>{now ? `${n} · Now` : n}</span>
                  <span className={styles.stepName}>{step.name}</span>
                  <span className={`lbl ${now ? styles.nowDate : styles.muted}`}>
                    {step.due ? `Due ${step.date}` : step.date}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Section>
  );
}
