import { type FirmLogo, withoutPlaceholdersInProduction } from "./logos";

export type SponsorTier = {
  label: string;
  /** "large" = two per row (Tier 1), "small" = four per row (Tier 2). */
  size: "large" | "small";
  sponsors: FirmLogo[];
};

const tiers: SponsorTier[] = [
  {
    label: "[Tier 1]",
    size: "large",
    sponsors: [
      { name: "Vantrel Capital", logo: "/logos/vantrel.svg", placeholder: true },
      { name: "Orrin & Hale", logo: "/logos/orrin-hale.svg", placeholder: true },
    ],
  },
  {
    label: "[Tier 2]",
    size: "small",
    sponsors: [
      { name: "Pinewire Trading", logo: "/logos/pinewire.svg", placeholder: true },
      { name: "Lumabit", logo: "/logos/lumabit.svg", placeholder: true },
      { name: "Arclane Markets", logo: "/logos/arclane.svg", placeholder: true },
      { name: "Tessaline Systems", logo: "/logos/tessaline.svg", placeholder: true },
    ],
  },
];

/** Tiers with at least one sponsor. Empty tiers are not shown. */
export const sponsorTiers: SponsorTier[] = tiers
  .map((tier) => ({ ...tier, sponsors: withoutPlaceholdersInProduction(tier.sponsors) }))
  .filter((tier) => tier.sponsors.length > 0);

/** Every sponsor in tier order, used by the Home sponsor strip. */
export const allSponsors: FirmLogo[] = sponsorTiers.flatMap((tier) => tier.sponsors);

export const whyPartner = [
  { n: "01", title: "Sponsored Desks", desc: "Back a desk and work with its members on a problem your firm cares about." },
  { n: "02", title: "Recruiting", desc: "Meet students who have built and run trading systems on both the software and hardware side." },
  { n: "03", title: "Events", desc: "Host technical talks, workshops, and recruiting events with our members." },
];
