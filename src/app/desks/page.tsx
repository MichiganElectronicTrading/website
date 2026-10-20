import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Section, { SectionLabel, numberSections } from "@/components/Section";
import StageCards from "@/components/StageCards";
import DeskBoard from "@/components/DeskBoard";

export const metadata: Metadata = { title: "Desks" };

const label = numberSections(["How desks work", "All desks"]);

export default function DesksPage() {
  return (
    <>
      <PageHeader
        title="Desks"
        text="Every project at MET runs through a desk. Each desk is a small team of traders and engineers led by a desk head."
      />
      <Section bg="cream" pad={72}>
        <SectionLabel>{label["How desks work"]}</SectionLabel>
        <StageCards variant="desks" />
      </Section>
      <Section bg="offWhite" pad={72} rule>
        <SectionLabel>{label["All desks"]}</SectionLabel>
        <DeskBoard />
      </Section>
    </>
  );
}
