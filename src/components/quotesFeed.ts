import type { Quote } from "@/data/quotes";

/*
 * Polls /api/quotes for the chip tickers. Browser-only: call from an effect.
 * `onQuotes` gets the latest real quotes, or null when there are none to show.
 */

const REFRESH_MS = 60_000;
/** After failed refreshes, real quotes older than this are hidden. */
const STALE_MS = 5 * 60_000;

export function subscribeQuotes(onQuotes: (quotes: Quote[] | null) => void): () => void {
  let alive = true;
  let lastGood = 0;

  const load = async () => {
    if (document.hidden && lastGood) return;
    try {
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error(String(res.status));
      const data: unknown = await res.json();
      if (!alive) return;
      const list = Array.isArray(data) ? (data as Quote[]) : [];
      if (list.length) lastGood = Date.now();
      onQuotes(list.length ? list : null);
    } catch {
      // A missed refresh keeps the last real quotes for a few minutes, then hides them.
      if (alive && Date.now() - lastGood > STALE_MS) onQuotes(null);
    }
  };

  load();
  const timer = window.setInterval(load, REFRESH_MS);
  return () => {
    alive = false;
    window.clearInterval(timer);
  };
}
