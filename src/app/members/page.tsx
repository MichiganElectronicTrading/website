import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Section, { SectionLabel, numberSections } from "@/components/Section";
import Placeholder from "@/components/Placeholder";
import MemberGrid from "@/components/MemberGrid";
import LogoMarquee from "@/components/LogoMarquee";
import { board, deskHeads } from "@/data/members";
import { placements, showPlacements } from "@/data/placements";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Members" };

const hasPlacements = showPlacements && placements.length > 0;
const label = numberSections(["The Board", "Desk Heads", "General members", hasPlacements && "Member Placements"]);

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
                  {b.deskHead && <span className={`lbl ${styles.muted}`}>Desk Head · {b.deskHead}</span>}
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
              {h.linkedin ? (
                <a href={h.linkedin} target="_blank" rel="noopener" className={styles.headshotLink}>
                  {h.photo ? (
                    <div className={styles.headshot}>
                      <Image src={h.photo} alt={`${h.name} on LinkedIn`} fill sizes="300px" className={styles.headshotImg} />
                    </div>
                  ) : (
                    <Placeholder label="[HEADSHOT]" className={styles.square} />
                  )}
                </a>
              ) : h.photo ? (
                <div className={styles.headshot}>
                  <Image src={h.photo} alt={h.name} fill sizes="300px" className={styles.headshotImg} />
                </div>
              ) : (
                <Placeholder label="[HEADSHOT]" className={styles.square} />
              )}
              <div className={styles.headBody}>
                <h3>{h.name}</h3>
                <span className="lbl">{h.desk}</span>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section bg="cream" pad={72} rule>
        <SectionLabel>{label["General members"]}</SectionLabel>
        <MemberGrid />
      </Section>

      {hasPlacements && (
        <Section bg="offWhite" pad={72} rule bare>
          <div className={styles.placementsHead}>
            <SectionLabel>{label["Member Placements"]}</SectionLabel>
          </div>
          <LogoMarquee
            label="Firms where members have interned or worked, auto-scrolling"
            rows={[{ logos: placements, duration: 45 }]}
            fill
          />
        </Section>
      )}
    </>
  );
}
