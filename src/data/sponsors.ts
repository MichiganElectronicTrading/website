import { type FirmLogo, withoutPlaceholdersInProduction } from "./logos";

export type Sponsor = FirmLogo & {
  /** Sponsor's website; the /sponsors tile links here in a new tab. */
  url?: string;
};

export type SponsorTier = {
  key: "desk" | "sponsor";
  /** Shown as the small label above the tier's logos. */
  label: string;
  sponsors: Sponsor[];
};

const tiers: SponsorTier[] = [
  {
    key: "desk",
    label: "Desk Sponsors",
    sponsors: [],
  },
  {
    key: "sponsor",
    label: "Sponsors",
    sponsors: [{ name: "Tradermath", logo: "/logos/tradermath.svg", url: "https://www.tradermath.org" }],
  },
];

/** Tiers with at least one sponsor. Empty tiers are not shown. */
export const sponsorTiers: SponsorTier[] = tiers
  .map((tier) => ({ ...tier, sponsors: withoutPlaceholdersInProduction(tier.sponsors) }))
  .filter((tier) => tier.sponsors.length > 0);

/** Every sponsor in tier order, used by the Home sponsor strip. */
export const allSponsors: Sponsor[] = sponsorTiers.flatMap((tier) => tier.sponsors);

export const whyPartner = [
  { n: "01", title: "Sponsored Desks", desc: "Back a desk and work with its members on a problem your firm cares about." },
  { n: "02", title: "Recruiting", desc: "Meet students who have built and run trading systems on both the software and hardware side." },
  { n: "03", title: "Events", desc: "Host technical talks, workshops, and recruiting events with our members." },
];
