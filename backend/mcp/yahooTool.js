import { getCompanyProfile, getQuote, getHistoricalPrice } from '../services/yahooService.js';

export async function fetchPerformanceBundle(symbol) {
  const [profile, quote, historical] = await Promise.all([
    getCompanyProfile(symbol),
    getQuote(symbol),
    getHistoricalPrice(symbol, 30)
  ]);

  return {
    profile,
    quote,
    historical
  };
}

