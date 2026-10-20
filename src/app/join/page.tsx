import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Section, { CtaRow, SectionLabel, numberSections } from "@/components/Section";
import StatusPill from "@/components/StatusPill";
import { faq, recruiting, tracks } from "@/data/recruiting";
import { site } from "@/data/site";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Join" };

const label = numberSections(["Tracks", "Process", "FAQ"]);

export default function JoinPage() {
  const open = recruiting.status === "open";

  return (
    <>
      <PageHeader
        title="Join MET"
        text={`We're looking for traders and engineers who want to build real trading systems. ${recruiting.term} recruiting starts at Winterfest.`}
        before={<StatusPill open={open} tone="dark" />}
        after={
          <a
            href={open ? recruiting.applyUrl : recruiting.notifyUrl}
            target="_blank"
            rel="noopener"
            className={`btn fill ${styles.start}`}
          >
            {open ? "Apply" : "Get Notified"}
          </a>
        }
      />

      <Section bg="cream" pad={72}>
        <SectionLabel>{label.Tracks}</SectionLabel>
        <div className={styles.tracks}>
          {tracks.map((t) => (
            <div key={t.name} className={styles.track}>
              <span className="lbl">{t.label}</span>
              <h2>{t.name}</h2>
              <p>{t.summary}</p>
              <div className={`lbl ${styles.lookFor}`}>What we look for</div>
              <ul>
                {t.lookFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section bg="offWhite" pad={72} rule>
        <SectionLabel>{label.Process}</SectionLabel>
        <ol className={styles.steps}>
          {recruiting.steps.map((step, i) => (
            <li key={step.name} className={styles.step}>
              <span className="lbl">{String(i + 1).padStart(2, "0")} →</span>
              <span className={`hf ${styles.stepName}`}>{step.name}</span>
              <span className={`lbl ${styles.muted}`}>{step.date}</span>
              <span className={styles.stepDesc}>{step.description}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section bg="grey" pad={72} rule>
        <SectionLabel>{label.FAQ}</SectionLabel>
        <div className={styles.faq}>
          {faq.map((item) => (
            <details key={item.q} className={styles.item}>
              <summary className={styles.summary}>
                <span>{item.q}</span>
                <span className="lbl" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section bg="cream" pad={72} rule bare>
        <CtaRow title="Still Have Questions?" text="Email the board and we'll get back to you.">
          <a href={`mailto:${site.email}`} className="btn fill">
            Email the Board
          </a>
        </CtaRow>
      </Section>
    </>
  );
}
