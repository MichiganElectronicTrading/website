import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Section, { CtaRow, SectionLabel, numberSections } from "@/components/Section";
import { sponsorTiers, whyPartner } from "@/data/sponsors";
import { site } from "@/data/site";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Sponsors" };

export default function SponsorsPage() {
  const hasSponsors = sponsorTiers.length > 0;
  const label = numberSections([hasSponsors && "Our sponsors", "Why partner"]);

  return (
    <>
      <PageHeader
        title="Sponsors"
        text="Sponsors fund the hardware, data, and capital our desks run on. They also get inside access to how we operate and what we've been building."
      />

      {hasSponsors && (
        <Section bg="cream" pad={72}>
          <SectionLabel>{label["Our sponsors"]}</SectionLabel>
          {sponsorTiers.map((tier) => (
            <div key={tier.label} className={styles.tier}>
              <div className={`lbl ${styles.muted}`}>{tier.label}</div>
              <div className={styles.logos}>
                {tier.sponsors.map((s) => (
                  <div key={s.logo} className={`${styles.logo} ${tier.size === "large" ? styles.large : styles.small}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.logo} alt={s.name} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>
      )}

      <Section bg="offWhite" pad={72} rule={hasSponsors}>
        <SectionLabel>{label["Why partner"]}</SectionLabel>
        <div className={styles.why}>
          {whyPartner.map((w) => (
            <div key={w.n} className={styles.whyCard}>
              <span className="lbl">{w.n}</span>
              <span className={`hf ${styles.whyTitle}`}>{w.title}</span>
              <span className={styles.whyDesc}>{w.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="contact" bg="grey" pad={72} rule bare>
        <CtaRow title="Partner With Us" text="Email the board to start a conversation.">
          <a href={`mailto:${site.email}`} className="btn fill">
            Email the Board
          </a>
        </CtaRow>
      </Section>
    </>
  );
}
