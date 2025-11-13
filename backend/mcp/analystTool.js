import { getAnalystRecommendations } from './finnhubTool.js';

export async function fetchAnalystRecommendations(symbol) {
  return getAnalystRecommendations(symbol);
}

