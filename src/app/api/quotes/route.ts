import { STOCK_SYMBOLS, type Quote } from "@/data/quotes";

/*
 * Real quotes for the Live Chip tickers. Cached for 60 seconds so every
 * visitor shares one round of upstream requests.
 * - Stocks and ETFs: Finnhub /quote (needs FINNHUB_API_KEY on the server).
 * - BTC: Coinbase public spot price, change from the 24h open.
 * Any symbol that fails is left out. An empty list means nothing worked.
 */

export const revalidate = 60;

const CACHE_SECONDS = 60;
const FINNHUB = "https://finnhub.io/api/v1";
/** If market status is unavailable, a quote this fresh counts as the market being open. */
const FRESH_QUOTE_SECONDS = 15 * 60;

async function getJson(url: string, headers?: Record<string, string>) {
  const res = await fetch(url, { headers, next: { revalidate: CACHE_SECONDS } });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
  return res.json();
}

async function usMarketOpen(token: string): Promise<boolean | null> {
  try {
    const status = await getJson(`${FINNHUB}/stock/market-status?exchange=US`, { "X-Finnhub-Token": token });
    return typeof status?.isOpen === "boolean" ? status.isOpen : null;
  } catch {
    return null;
  }
}

async function stockQuote(symbol: string, token: string, open: boolean | null): Promise<Quote | null> {
  try {
    const q = await getJson(`${FINNHUB}/quote?symbol=${encodeURIComponent(symbol)}`, { "X-Finnhub-Token": token });
    // Finnhub answers unknown symbols with zeros rather than an error.
    if (typeof q?.c !== "number" || q.c <= 0 || typeof q?.dp !== "number" || typeof q?.t !== "number") return null;
    return {
      symbol,
      price: q.c,
      changePct: q.dp,
      asOf: new Date(q.t * 1000).toISOString(),
      marketOpen: open ?? Date.now() / 1000 - q.t < FRESH_QUOTE_SECONDS,
    };
  } catch {
    return null;
  }
}

async function btcQuote(): Promise<Quote | null> {
  try {
    const headers = { "User-Agent": "met-website" };
    const [spot, stats] = await Promise.all([
      getJson("https://api.coinbase.com/v2/prices/BTC-USD/spot", headers),
      getJson("https://api.exchange.coinbase.com/products/BTC-USD/stats", headers),
    ]);
    const price = Number(spot?.data?.amount);
    const open = Number(stats?.open);
    if (!(price > 0) || !(open > 0)) return null;
    return {
      symbol: "BTC",
      price,
      changePct: ((price - open) / open) * 100,
      asOf: new Date().toISOString(),
      marketOpen: true,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const token = process.env.FINNHUB_API_KEY;
  const open = token ? await usMarketOpen(token) : null;
  const results = await Promise.all([
    ...(token ? STOCK_SYMBOLS.map((symbol) => stockQuote(symbol, token, open)) : []),
    btcQuote(),
  ]);
  return Response.json(results.filter((q): q is Quote => q !== null));
}
