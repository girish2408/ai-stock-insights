import pkg from 'pg';
const { Pool } = pkg;

let pool = null;

export function getPool() {
  if (!pool) {
    const { DATABASE_URL, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, NODE_ENV } = process.env;
    
    if (DATABASE_URL) {
      // In production (Railway, etc.), use DATABASE_URL as-is
      // In local development, check if we need to fix macOS Homebrew PostgreSQL
      const isProduction = NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
      
      if (isProduction) {
        // Production: Use DATABASE_URL as-is (Railway provides complete connection string)
        pool = new Pool({ connectionString: DATABASE_URL });
      } else {
        // Local development: Try to fix macOS Homebrew PostgreSQL issues
        try {
          const url = new URL(DATABASE_URL);
          // Only modify if password is empty and username is 'postgres' (macOS Homebrew case)
          if (url.username === 'postgres' && (!url.password || url.password === '')) {
            const currentUser = process.env.USER || 'postgres';
            url.username = currentUser;
            url.password = '';
            pool = new Pool({ connectionString: url.toString() });
          } else {
            // Use DATABASE_URL as-is if it has a password or different username
            pool = new Pool({ connectionString: DATABASE_URL });
          }
        } catch (err) {
          // If URL parsing fails, try as-is
          pool = new Pool({ connectionString: DATABASE_URL });
        }
      }
    } else if (POSTGRES_HOST) {
      // Use individual connection parameters
      pool = new Pool({
        host: POSTGRES_HOST,
        port: parseInt(POSTGRES_PORT || '5432'),
        database: POSTGRES_DB || 'ai_stock_insights',
        user: POSTGRES_USER || 'postgres',
        password: POSTGRES_PASSWORD || ''
      });
    }
  }
  return pool;
}

export async function initDatabase() {
  const pool = getPool();
  if (!pool) {
    console.warn('No PostgreSQL configuration found. Caching will be disabled.');
    return false;
  }

  try {
    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cache_entries (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        data JSONB NOT NULL,
        type VARCHAR(50) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cache_key ON cache_entries(key)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cache_symbol ON cache_entries(symbol)
    `);

    // Clean up expired entries
    await pool.query(`
      DELETE FROM cache_entries WHERE expires_at < NOW()
    `);

    console.log('PostgreSQL database initialized');
    return true;
  } catch (err) {
    console.error('Failed to initialize PostgreSQL:', err.message);
    return false;
  }
}

export function isDatabaseEnabled() {
  return getPool() !== null;
}

