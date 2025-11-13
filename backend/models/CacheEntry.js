// PostgreSQL cache entry model using raw SQL
// Table schema:
// CREATE TABLE cache_entries (
//   id SERIAL PRIMARY KEY,
//   key VARCHAR(255) UNIQUE NOT NULL,
//   data JSONB NOT NULL,
//   type VARCHAR(50) NOT NULL,
//   symbol VARCHAR(10) NOT NULL,
//   expires_at TIMESTAMP NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
// CREATE INDEX idx_cache_key ON cache_entries(key);
// CREATE INDEX idx_cache_expires ON cache_entries(expires_at);
// CREATE INDEX idx_cache_symbol ON cache_entries(symbol);

export default {
  tableName: 'cache_entries'
};
