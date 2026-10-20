export type FirmLogo = {
  name: string;
  /** Path under /public. Leave out to show a "[FIRM LOGO]" box until the real logo is in. */
  logo?: string;
  /** Made-up firm used only to show the layout. Dropped from production builds. */
  placeholder?: boolean;
};

/**
 * Placeholder entries are kept in dev and preview builds so the layout is
 * visible, and removed when Vercel builds for production.
 */
export function withoutPlaceholdersInProduction<T extends FirmLogo>(list: T[]): T[] {
  if (process.env.VERCEL_ENV !== "production") return list;
  return list.filter((item) => !item.placeholder);
}
