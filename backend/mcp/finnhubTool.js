import { getEarningsCalendar, getRecommendationTrends } from '../services/finnhubService.js';

export async function getEarningsData(symbol) {
  const today = new Date();
  const from = today.toISOString().split('T')[0];
  const horizon = new Date(today);
  horizon.setDate(today.getDate() + 60);
  const to = horizon.toISOString().split('T')[0];

  return getEarningsCalendar(symbol, from, to);
}

export async function getAnalystRecommendations(symbol) {
  return getRecommendationTrends(symbol);
}

