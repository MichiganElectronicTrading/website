import { type FirmLogo, withoutPlaceholdersInProduction } from "./logos";

/**
 * Firms where members have interned or worked. The Members page splits this
 * list into two scrolling rows: the first half scrolls right, the second left.
 */
export const placements: FirmLogo[] = withoutPlaceholdersInProduction([
  { name: "Corvane", logo: "/logos/corvane.svg", placeholder: true },
  { name: "Meridale Securities", logo: "/logos/meridale.svg", placeholder: true },
  { name: "Quillon", logo: "/logos/quillon.svg", placeholder: true },
  { name: "Fernhook", logo: "/logos/fernhook.svg", placeholder: true },
  { name: "Kelderwick", logo: "/logos/kelderwick.svg", placeholder: true },
  { name: "Novaro Labs", logo: "/logos/novaro.svg", placeholder: true },
  { name: "Vantrel Capital", logo: "/logos/vantrel.svg", placeholder: true },
  { name: "Orrin & Hale", logo: "/logos/orrin-hale.svg", placeholder: true },
  { name: "Pinewire Trading", logo: "/logos/pinewire.svg", placeholder: true },
  { name: "Lumabit", logo: "/logos/lumabit.svg", placeholder: true },
  { name: "Arclane Markets", logo: "/logos/arclane.svg", placeholder: true },
  { name: "Tessaline Systems", logo: "/logos/tessaline.svg", placeholder: true },
]);
