import Image from "next/image";
import Link from "next/link";
import Section, { SectionLabel, numberSections } from "@/components/Section";
import StageCards from "@/components/StageCards";
import LogoMarquee from "@/components/LogoMarquee";
import LiveChip from "@/components/LiveChip";
import HomeJoin from "@/components/HomeJoin";
import MetMark from "@/components/MetMark";
import { allSponsors } from "@/data/sponsors";
import { site } from "@/data/site";
import hero from "../../public/hero-law-quad.jpg";
import styles from "./page.module.css";

export default function Home() {
  const hasSponsors = allSponsors.length > 0;
  const label = numberSections(["About", "Desks", hasSponsors && "Sponsors", "Join"]);

  return (
    <>
      <section className={`dark ${styles.hero}`}>
        <div aria-hidden="true" className={styles.heroBg}>
          <Image src={hero} alt="" priority placeholder="empty" fill sizes="100vw" className={styles.heroImg} />
          <div className={styles.heroShade} />
        </div>
        <div className={styles.heroInner}>
          <MetMark width={176} height={144} label="Logo" />
          <h1>{site.name}</h1>
          <p>{site.tagline}</p>
        </div>
        <a href="#about" aria-label="Scroll to About" className={styles.scroll}>
          ↓
        </a>
      </section>

      <Section id="about" bg="cream" pad={96} gap={40}>
        <SectionLabel>{label.About}</SectionLabel>
        <div className={styles.aboutRow}>
          <div className={styles.aboutCopy}>
            <h2>
              A Community of Engineers and <span className={styles.nowrap}>Problem-Solvers<br /></span>
            </h2>
            <p>
              Michigan Electronic Trading (MET) is a team of University of Michigan students who research, build, and
              run trading strategies across software and hardware. Traders and engineers work side by side with no wall
              between the two, the same way a real trading firm runs.
            </p>
            <p>
              Work happens on desks. Each desk takes one idea from research to live execution. Whether it runs on FPGAs,
              custom AI models, or alternative data, we build our own solutions to hard market problems.
            </p>
          </div>
          <LiveChip />
        </div>
      </Section>

      <Section bg="offWhite" pad={96} rule gap={40}>
        <SectionLabel>{label.Desks}</SectionLabel>
        <div className={styles.desksIntro}>
          <h2>How Desks Work</h2>
          <p>
            A desk is a small team of traders and engineers working on one strategy or system. Members pitch new desks
            at the start of each semester.
          </p>
        </div>
        <StageCards variant="home" />
        <Link href="/desks" className={`btn fill ${styles.start}`}>
          [See our desks →]
        </Link>
      </Section>

      {hasSponsors && (
        <Section bg="grey" pad={96} rule bare>
          <div className={styles.sponsorsHead}>
            <SectionLabel>{label.Sponsors}</SectionLabel>
          </div>
          <LogoMarquee label="Sponsor logos, auto-scrolling" rows={[{ logos: allSponsors, duration: 30 }]} />
          <div className={styles.sponsorsFoot}>
            <Link href="/sponsors" className="btn">
              Become a Sponsor
            </Link>
          </div>
        </Section>
      )}

      <HomeJoin label={label.Join} />
    </>
  );
}
