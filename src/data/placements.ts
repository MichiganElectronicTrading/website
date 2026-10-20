import type { FirmLogo } from "./logos";

/**
 * Firms where members have interned or worked. The Members page shows them
 * in one scrolling row. Entries without a logo show as "[FIRM LOGO]" boxes.
 */
export const placements: FirmLogo[] = Array.from({ length: 12 }, () => ({ name: "[Firm]" }));
