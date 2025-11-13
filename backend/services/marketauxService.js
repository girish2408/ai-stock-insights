// Load environment variables first
import 'dotenv/config';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { summarizeText } from '../utils/summarize.js';

// Load .env from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * MarketAux News API
 *
 * Docs: https://www.marketaux.com/documentation
 * - Latest News: GET /v1/news/all
 *   Params: symbols (comma-separated tickers), api_token, language, published_after, filter_entities
 *
 * News articles may include sentiment metadata; we provide optional AI summarization per article.
 */

const { MARKET_AUX_KEY } = process.env;

if (!MARKET_AUX_KEY) {
  console.warn('[MarketAuxService] ⚠️  MARKET_AUX_KEY is not set - news features will not work');
}

const client = axios.create({
  baseURL: 'https://api.marketaux.com/v1',
  timeout: 30000 // Increased timeout to 30s to avoid timeout errors
});

const withKey = (params = {}) => {
  if (!MARKET_AUX_KEY) {
    throw new Error('MARKET_AUX_KEY is not set');
  }
  return { api_token: MARKET_AUX_KEY, ...params };
};

function sevenDaysAgoIso() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  // MarketAux expects YYYY-MM-DD format, not full ISO string
  return date.toISOString().split('T')[0];
}

export async function getLatestNews(symbol) {
  const url = '/news/all';
  const params = {
    symbols: symbol.toUpperCase(),
    filter_entities: true,
    published_after: sevenDaysAgoIso(),
    language: 'en'
  };
  console.log(`[MarketAuxService] Calling API: ${url} for symbol: ${symbol}`);
  console.log(`[MarketAuxService] API Params:`, params);
  try {
    const response = await client.get(url, {
      params: withKey(params)
    });
    console.log(`[MarketAuxService] News API Response Status: ${response.status}`);
    console.log(`[MarketAuxService] News API Response Data keys:`, Object.keys(response.data || {}));
    console.log(`[MarketAuxService] News articles count:`, response.data?.data?.length || 0);
    if (response.data?.data?.length > 0) {
      console.log(`[MarketAuxService] First article:`, JSON.stringify(response.data.data[0], null, 2));
    }

    const articles = response.data?.data ?? [];

  const summarizedArticles = await Promise.all(
    articles.slice(0, 8).map(async (article) => {
      const summary = await summarizeText(
        `${article.title}\n\n${article.snippet ?? ''}`
      );
      return {
        id: article.uuid,
        title: article.title,
        url: article.url,
        publishedAt: article.published_at,
        source: article.source,
        sentiment: article.sentiment,
        summary
      };
    })
  );

    return summarizedArticles;
  } catch (err) {
    console.error(`[MarketAuxService] News API Error:`, err.message);
    console.error(`[MarketAuxService] News API Error Details:`, err.response?.data || err.message);
    throw err;
  }
}

