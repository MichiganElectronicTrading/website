import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Section, { SectionLabel, numberSections } from "@/components/Section";
import Placeholder from "@/components/Placeholder";
import MemberGrid from "@/components/MemberGrid";
import LogoMarquee from "@/components/LogoMarquee";
import { advisors, board, deskHeads } from "@/data/members";
import { placements, showPlacements } from "@/data/placements";
import styles from "./page.module.css";

/** Header intro, also used as the meta description. */
const intro = "MET is made up of traders and engineers from across the University of Michigan.";

export const metadata: Metadata = {
  title: "Members",
  description: intro,
  alternates: { canonical: "/members" },
};

const hasAdvisors = advisors.length > 0;
const hasPlacements = showPlacements && placements.length > 0;
const label = numberSections([
  "The Board",
  "Desk Heads",
  hasAdvisors && "Advisors",
  "General members",
  hasPlacements && "Member Placements",
]);
// Sections after Desk Heads alternate cream and off-white in the order they appear.
const membersBg = hasAdvisors ? "offWhite" : "cream";
const placementsBg = membersBg === "cream" ? "offWhite" : "cream";

/** Photo card used for desk heads and advisors. The photo links to LinkedIn when set. */
function PersonCard({ name, line, photo, linkedin }: { name: string; line: string; photo?: string; linkedin?: string }) {
  const headshot = photo ? (
    <div className={styles.headshot}>
      <Image src={photo} alt={linkedin ? `${name} on LinkedIn` : name} fill sizes="300px" className={styles.headshotImg} />
    </div>
  ) : (
    <Placeholder label="[HEADSHOT]" className={styles.square} />
  );
  return (
    <article className={styles.headCard}>
      {linkedin ? (
        <a href={linkedin} target="_blank" rel="noopener" className={styles.headshotLink}>
          {headshot}
        </a>
      ) : (
        headshot
      )}
      <div className={styles.headBody}>
        <h2>{name}</h2>
        <span className="lbl">{line}</span>
      </div>
    </article>
  );
}

export default function MembersPage() {
  return (
    <>
      <PageHeader
        title="Members"
        text={intro}
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
                  <h2>{b.name}</h2>
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
            <PersonCard key={i} name={h.name} line={h.desk} photo={h.photo} linkedin={h.linkedin} />
          ))}
        </div>
      </Section>

      {hasAdvisors && (
        <Section bg="cream" pad={72} rule>
          <SectionLabel>{label["Advisors"]}</SectionLabel>
          <div className={styles.heads}>
            {advisors.map((a, i) => (
              <PersonCard key={i} name={a.name} line="Advisor" photo={a.photo} linkedin={a.linkedin} />
            ))}
          </div>
        </Section>
      )}

      <Section bg={membersBg} pad={72} rule>
        <SectionLabel>{label["General members"]}</SectionLabel>
        <MemberGrid />
      </Section>

      {hasPlacements && (
        <Section bg={placementsBg} pad={72} rule bare>
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
