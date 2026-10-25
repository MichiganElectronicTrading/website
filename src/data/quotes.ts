/** One row from /api/quotes. */
export type Quote = {
  symbol: string;
  price: number;
  /** Percent change on the day (24h for crypto). */
  changePct: number;
  /** ISO time of the quote. */
  asOf: string;
  marketOpen: boolean;
};

/*
 * Live futures data isn't free, so each future is shown through the ETF that
 * tracks it, and the chip is labelled with the ETF symbol.
 */
export const FUTURES_PROXY = {
  ES: "SPY",
  NQ: "QQQ",
  ZN: "IEF",
  CL: "USO",
  RTY: "IWM",
  GC: "GLD",
} as const;

type ChipKind = "price" | "pct";

/** The fixed chips on the Live Chip, in the prototype's positions (560×440 space). */
export const CHIP_TICKERS: { symbol: string; kind: ChipKind; ax: number; ay: number }[] = [
  { symbol: FUTURES_PROXY.ES, kind: "price", ax: 22, ay: 22 },
  { symbol: FUTURES_PROXY.NQ, kind: "pct", ax: 262, ay: 16 },
  { symbol: FUTURES_PROXY.ZN, kind: "price", ax: 14, ay: 122 },
  { symbol: "AAPL", kind: "price", ax: 422, ay: 238 },
  { symbol: FUTURES_PROXY.CL, kind: "price", ax: 198, ay: 324 },
  { symbol: "BTC", kind: "pct", ax: 430, ay: 396 },
  { symbol: "SPY", kind: "pct", ax: 236, ay: 404 },
];

/** Symbols for the short-lived chips that appear near the cursor. */
export const CURSOR_TICKERS = ["NVDA", "TSLA", "MSFT", "META", "AMD", "GOOGL", FUTURES_PROXY.RTY, FUTURES_PROXY.GC];

/** Crypto comes from Coinbase; everything else from Finnhub. */
export const CRYPTO_SYMBOLS = ["BTC"];

export const STOCK_SYMBOLS = Array.from(
  new Set([...CHIP_TICKERS.map((t) => t.symbol), ...CURSOR_TICKERS].filter((s) => !CRYPTO_SYMBOLS.includes(s))),
);
