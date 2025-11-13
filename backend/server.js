// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: join(__dirname, '.env') });

// Verify environment variables are loaded (without logging keys)
const requiredEnvVars = {
  'FINNHUB_API_KEY': process.env.FINNHUB_API_KEY,
  'ALPHA_VANTAGE_API_KEY': process.env.ALPHA_VANTAGE_API_KEY,
  'MARKET_AUX_KEY': process.env.MARKET_AUX_KEY
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn('[Server] ⚠️  Missing required environment variables:', missingVars.join(', '));
  console.warn('[Server] Some features may not work correctly.');
} else {
  console.log('[Server] ✅ All required environment variables are set');
}

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';

import earningsRouter from './routes/earnings.js';
import filingsRouter from './routes/filings.js';
import overviewRouter from './routes/overview.js';
import ratingsRouter from './routes/ratings.js';
import newsRouter from './routes/news.js';
import stockReportRouter from './routes/stockReportRoute.js';
import { refreshTrackedSymbols } from './services/refreshService.js';
import { initDatabase } from './utils/db.js';

const app = express();

app.use(cors());
app.use(express.json());

// Railway sets PORT automatically, fallback to 4000 for local dev
const PORT = process.env.PORT || 4000;

// Log port information for debugging
console.log(`[Server] PORT from environment: ${process.env.PORT || 'NOT SET (using default 4000)'}`);
console.log(`[Server] Using PORT: ${PORT}`);

async function connectToDatabase() {
  try {
    await initDatabase();
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
}

connectToDatabase();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/earnings', earningsRouter);
app.use('/api/filings', filingsRouter);
app.use('/api/overview', overviewRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/news', newsRouter);
app.use('/api/stock', stockReportRouter);

// Bind to 0.0.0.0 to allow Railway to route traffic
// Railway requires binding to 0.0.0.0, not just listening on a port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on 0.0.0.0:${PORT}`);
});

cron.schedule('0 6 * * *', async () => {
  try {
    await refreshTrackedSymbols();
  } catch (err) {
    console.error('Daily refresh failed', err);
  }
});

