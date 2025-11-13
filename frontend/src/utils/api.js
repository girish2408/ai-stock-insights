import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE ?? 'http://localhost:4000/api',
  timeout: 15000
});

export async function fetchAgenticStockReport(symbol, options = {}) {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  const { forceRefresh = false } = options;
  const response = await apiClient.get(`/stock/${symbol}`, {
    params: {
      refresh: forceRefresh ? 'true' : undefined
    }
  });
  return response.data;
}

export async function fetchOverview(symbol) {
  const response = await apiClient.get(`/overview/${symbol}`);
  return response.data;
}

export async function fetchEarnings(symbol) {
  const response = await apiClient.get(`/earnings/${symbol}`);
  return response.data;
}

export async function fetchFilings(symbol) {
  const response = await apiClient.get(`/filings/${symbol}`);
  return response.data;
}

export async function fetchRatings(symbol) {
  const response = await apiClient.get(`/ratings/${symbol}`);
  return response.data;
}

export async function fetchNews(symbol) {
  const response = await apiClient.get(`/news/${symbol}`);
  return response.data;
}

