import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Section, { SectionLabel, numberSections } from "@/components/Section";
import Placeholder from "@/components/Placeholder";
import MemberGrid from "@/components/MemberGrid";
import LogoMarquee from "@/components/LogoMarquee";
import { board, deskHeads } from "@/data/members";
import { placements } from "@/data/placements";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Members" };

const label = numberSections(["The Board", "Desk Heads", "All members", placements.length > 0 && "Member Placements"]);

export default function MembersPage() {
  return (
    <>
      <PageHeader
        title="Members"
        text="MET is made up of traders and engineers from across the University of Michigan."
      />

      <Section bg="cream" pad={72}>
        <SectionLabel>{label["The Board"]}</SectionLabel>
        <div className={styles.board}>
          {board.map((b, i) => {
            const external = b.linkedin.href !== "#";
            return (
              <article key={i} className={styles.boardCard}>
                {b.photo ? (
                  <div className={styles.headshot}>
                    <Image src={b.photo} alt={b.name} fill sizes="(min-width: 1200px) 384px, 100vw" className={styles.headshotImg} />
                  </div>
                ) : (
                  <Placeholder label="[HEADSHOT]" className={styles.square} />
                )}
                <div className={styles.boardBody}>
                  <h3>{b.name}</h3>
                  <span className={styles.role}>{b.role}</span>
                  <span className={`lbl ${styles.muted}`}>{b.title}</span>
                  <span className={styles.edu}>{b.education}</span>
                  <a
                    href={b.linkedin.href}
                    className={styles.link}
                    {...(external ? { target: "_blank", rel: "noopener" } : {})}
                  >
                    {b.linkedin.label}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section bg="offWhite" pad={72} rule>
        <SectionLabel>{label["Desk Heads"]}</SectionLabel>
        <div className={styles.heads}>
          {deskHeads.map((h, i) => (
            <article key={i} className={styles.headCard}>
              {h.photo ? (
                <div className={styles.headshot}>
                  <Image src={h.photo} alt={h.name} fill sizes="300px" className={styles.headshotImg} />
                </div>
              ) : (
                <Placeholder label="[HEADSHOT]" className={styles.square} />
              )}
              <div className={styles.headBody}>
                <h3>{h.name}</h3>
                <span className="lbl">{h.desk} · Head</span>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section bg="grey" pad={72} rule>
        <SectionLabel>{label["All members"]}</SectionLabel>
        <MemberGrid />
      </Section>

      {placements.length > 0 && (
        <Section bg="cream" pad={72} rule bare>
          <div className={styles.placementsHead}>
            <SectionLabel>{label["Member Placements"]}</SectionLabel>
          </div>
          <LogoMarquee
            label="Firms where members have interned or worked, auto-scrolling"
            rows={[{ logos: placements, duration: 60 }]}
          />
        </Section>
      )}
    </>
  );
}
