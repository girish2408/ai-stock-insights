import { getRecentFilings } from '../services/secService.js';

export async function fetchRecentFilings(symbol) {
  return getRecentFilings(symbol);
}

export async function getFilingsData(symbol) {
  return getRecentFilings(symbol);
}

