import type { FirmLogo } from "./logos";

/** Set to true to show the Member Placements ticker on the Members page. */
export const showPlacements: boolean = false;

/**
 * Firms where members have interned or worked. The Members page shows them
 * in one scrolling row. Entries without a logo show as "[FIRM LOGO]" boxes.
 */
export const placements: FirmLogo[] = [
  { name: "Goldman Sachs", logo: "/logos/goldman-sachs.svg" },
  { name: "IMC", logo: "/logos/imc.svg" },
  { name: "Glenbrook Trading", logo: "/logos/glenbrook-trading.png" },
];
