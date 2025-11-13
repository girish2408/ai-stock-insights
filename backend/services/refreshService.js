import { warmSymbolCache } from './stockAggregator.js';

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL'];

function getTrackedSymbols() {
  const { TRACKED_SYMBOLS } = process.env;
  if (!TRACKED_SYMBOLS) return DEFAULT_SYMBOLS;
  return TRACKED_SYMBOLS.split(',').map((symbol) => symbol.trim().toUpperCase());
}

export async function refreshTrackedSymbols() {
  const symbols = getTrackedSymbols();
  for (const symbol of symbols) {
    try {
      await warmSymbolCache(symbol);
      console.log(`Refreshed cache for ${symbol}`);
    } catch (err) {
      console.error(`Failed to refresh ${symbol}`, err);
    }
  }
}

export { getTrackedSymbols };

