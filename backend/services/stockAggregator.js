import { getCompanyProfile, getQuote, getHistoricalPrice } from './yahooService.js';
import { getEarningsCalendar, getRecommendationTrends } from './finnhubService.js';
import { getRecentFilings } from './secService.js';
import { getLatestNews } from './marketauxService.js';
import {
  getCachedData,
  setCachedData,
  DEFAULT_TTL_MINUTES
} from '../utils/cache.js';

/**
 * High-level aggregation helpers that:
 * 1. Pull data from vendor-specific services.
 * 2. Apply cross-service caching to reduce API usage.
 * 3. Normalize outputs into a single bundle consumed by the dashboard.
 */

const ONE_HOUR = 60;
const SIX_HOURS = 60 * 6;

async function fetchOverview(symbol) {
  const cached = await getCachedData('overview', symbol);
  if (cached) return cached;

  const [profile, quote, historical] = await Promise.all([
    getCompanyProfile(symbol),
    getQuote(symbol),
    getHistoricalPrice(symbol, 30)
  ]);

  const overview = {
    symbol: symbol.toUpperCase(),
    companyName: profile?.companyName,
    description: profile?.description,
    industry: profile?.industry,
    sector: profile?.sector,
    ceo: profile?.ceo,
    website: profile?.website,
    exchange: profile?.exchangeShortName,
    price: quote?.price,
    change: quote?.change,
    changesPercentage: quote?.changesPercentage,
    volume: quote?.volume,
    marketCap: quote?.marketCap,
    currency: quote?.currency,
    historical
  };

  await setCachedData('overview', symbol, overview, ONE_HOUR);
  return overview;
}

async function fetchEarnings(symbol) {
  const cached = await getCachedData('earnings', symbol);
  if (cached) return cached;

  const today = new Date();
  const from = today.toISOString().split('T')[0];
  const toDate = new Date();
  toDate.setDate(today.getDate() + 60);
  const to = toDate.toISOString().split('T')[0];

  const earnings = await getEarningsCalendar(symbol, from, to);

  await setCachedData('earnings', symbol, earnings, SIX_HOURS);
  return earnings;
}

async function fetchFilings(symbol) {
  const cached = await getCachedData('filings', symbol);
  if (cached) return cached;

  const filings = await getRecentFilings(symbol);
  await setCachedData('filings', symbol, filings, DEFAULT_TTL_MINUTES);
  return filings;
}

async function fetchRatings(symbol) {
  const cached = await getCachedData('ratings', symbol);
  if (cached) return cached;

  const ratings = await getRecommendationTrends(symbol);
  await setCachedData('ratings', symbol, ratings, SIX_HOURS);
  return ratings;
}

async function fetchNews(symbol) {
  const cached = await getCachedData('news', symbol);
  if (cached) return cached;

  const news = await getLatestNews(symbol);
  await setCachedData('news', symbol, news, ONE_HOUR);
  return news;
}

export async function fetchStockBundle(symbol) {
  const [overview, earnings, filings, ratings, news] = await Promise.all([
    fetchOverview(symbol).catch((err) => ({
      error: err.message,
      source: 'overview'
    })),
    fetchEarnings(symbol).catch((err) => ({
      error: err.message,
      source: 'earnings'
    })),
    fetchFilings(symbol).catch((err) => ({
      error: err.message,
      source: 'filings'
    })),
    fetchRatings(symbol).catch((err) => ({
      error: err.message,
      source: 'ratings'
    })),
    fetchNews(symbol).catch((err) => ({
      error: err.message,
      source: 'news'
    }))
  ]);

  return {
    symbol: symbol.toUpperCase(),
    overview,
    earnings,
    filings,
    ratings,
    news,
    updatedAt: new Date().toISOString()
  };
}

export async function warmSymbolCache(symbol) {
  await Promise.all([
    fetchOverview(symbol),
    fetchEarnings(symbol),
    fetchFilings(symbol),
    fetchRatings(symbol),
    fetchNews(symbol)
  ]);
}

export const getOverview = fetchOverview;
export const getEarnings = fetchEarnings;
export const getFilings = fetchFilings;
export const getRatings = fetchRatings;
export const getNews = fetchNews;

