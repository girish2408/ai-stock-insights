// Load environment variables first
import 'dotenv/config';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load .env from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Finnhub API client
 *
 * Docs: https://finnhub.io/docs/api/overview
 * - Earnings Calendar: GET /calendar/earnings
 *   Params: symbol (ticker), from (YYYY-MM-DD), to (YYYY-MM-DD), token
 * - Analyst Recommendation Trends: GET /stock/recommendation
 *   Params: symbol (ticker), token
 *
 * Free tier allows 60 requests/minute. Authentication via ?token=.
 */

const { FINNHUB_API_KEY } = process.env;

if (!FINNHUB_API_KEY) {
  console.warn('[FinnhubService] ⚠️  FINNHUB_API_KEY is not set - earnings and analyst features will not work');
}

const client = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  timeout: 10000
});

const withToken = (params = {}) => {
  if (!FINNHUB_API_KEY) {
    throw new Error('FINNHUB_API_KEY is not set');
  }
  return { token: FINNHUB_API_KEY, ...params };
};

export async function getEarningsCalendar(symbol, from, to) {
  const url = '/calendar/earnings';
  const params = { symbol: symbol.toUpperCase(), from, to };
  console.log(`[FinnhubService] Calling API: ${url} for symbol: ${symbol}, from: ${from}, to: ${to}`);
  try {
    const response = await client.get(url, {
      params: withToken(params)
    });
    console.log(`[FinnhubService] Earnings API Response Status: ${response.status}`);
    console.log(`[FinnhubService] Earnings API Response Data:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (err) {
    console.error(`[FinnhubService] Earnings API Error:`, err.message);
    console.error(`[FinnhubService] Earnings API Error Details:`, err.response?.data || err.message);
    throw err;
  }
}

export async function getRecommendationTrends(symbol) {
  const url = '/stock/recommendation';
  console.log(`[FinnhubService] Calling API: ${url} for symbol: ${symbol}`);
  try {
    const response = await client.get(url, {
      params: withToken({ symbol: symbol.toUpperCase() })
    });
    console.log(`[FinnhubService] Recommendations API Response Status: ${response.status}`);
    console.log(`[FinnhubService] Recommendations API Response Data:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (err) {
    console.error(`[FinnhubService] Recommendations API Error:`, err.message);
    console.error(`[FinnhubService] Recommendations API Error Details:`, err.response?.data || err.message);
    throw err;
  }
}

