import {
  getCachedData,
  setCachedData,
  invalidateSymbol,
  DEFAULT_TTL_MINUTES
} from '../utils/cache.js';

const REPORT_TTL_MINUTES = 60; // 1 hour for synthesized reports

export async function getCachedReport(symbol) {
  return getCachedData('report', symbol);
}

export async function setCachedReport(symbol, report, ttl = REPORT_TTL_MINUTES) {
  return setCachedData('report', symbol, report, ttl);
}

export async function clearSymbolCache(symbol) {
  return invalidateSymbol(symbol);
}

export { DEFAULT_TTL_MINUTES, REPORT_TTL_MINUTES };

