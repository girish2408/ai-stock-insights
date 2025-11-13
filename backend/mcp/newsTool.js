import { getLatestNews } from '../services/marketauxService.js';

export async function fetchNewsFeed(symbol) {
  return getLatestNews(symbol);
}

