import { getPool, isDatabaseEnabled } from './db.js';

const DEFAULT_TTL_MINUTES = 60 * 24; // 24 hours

const buildCacheKey = (type, symbol, params = {}) => {
  const suffix =
    Object.keys(params).length > 0
      ? `:${Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join('|')}`
      : '';
  return `${type}:${symbol.toUpperCase()}${suffix}`;
};

export async function getCachedData(type, symbol, params = {}) {
  if (!isDatabaseEnabled()) return null;
  const pool = getPool();
  const key = buildCacheKey(type, symbol, params);
  
  try {
    const result = await pool.query(
      'SELECT data FROM cache_entries WHERE key = $1 AND expires_at > NOW()',
      [key]
    );
    if (result.rows.length > 0) {
      const data = result.rows[0].data;
      // PostgreSQL JSONB returns as object, but handle string case too
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
    return null;
  } catch (err) {
    console.error('Cache read error:', err.message);
    return null;
  }
}

export async function setCachedData(
  type,
  symbol,
  data,
  ttlMinutes = DEFAULT_TTL_MINUTES,
  params = {}
) {
  if (!data || !isDatabaseEnabled()) return;
  const pool = getPool();
  const key = buildCacheKey(type, symbol, params);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  try {
    await pool.query(
      `INSERT INTO cache_entries (key, data, type, symbol, expires_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (key) 
       DO UPDATE SET 
         data = EXCLUDED.data,
         type = EXCLUDED.type,
         symbol = EXCLUDED.symbol,
         expires_at = EXCLUDED.expires_at,
         updated_at = CURRENT_TIMESTAMP`,
      [key, JSON.stringify(data), type, symbol.toUpperCase(), expiresAt]
    );
  } catch (err) {
    console.error('Cache write error:', err.message);
  }
}

export async function invalidateSymbol(symbol) {
  if (!isDatabaseEnabled()) return;
  const pool = getPool();
  
  try {
    await pool.query('DELETE FROM cache_entries WHERE symbol = $1', [symbol.toUpperCase()]);
  } catch (err) {
    console.error('Cache invalidation error:', err.message);
  }
}

export function minutesUntilRefresh(ttlMinutes = DEFAULT_TTL_MINUTES) {
  return ttlMinutes;
}

export { DEFAULT_TTL_MINUTES };
