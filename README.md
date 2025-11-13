# AI Stock Insights Dashboard

Full-stack dashboard that aggregates US equity intelligence in one place: upcoming earnings, SEC filings, analyst sentiment, recent performance, and curated news with optional AI summaries.

## 🔒 Security Notice

**This is a public repository. Never commit API keys, secrets, or `.env` files.**

- See [SECURITY.md](./SECURITY.md) for security guidelines
- All API keys must be set via environment variables
- Use `backend/env.sample` as a template (never commit actual `.env` files)

## 📚 Architecture Documentation

**For detailed architecture documentation**, see [`ARCHITECTURE.md`](./ARCHITECTURE.md) which includes:
- Complete MCP (Multi-Agent Communication Protocol) architecture
- Agent communication flow diagrams
- LangGraph orchestration details
- State management patterns
- Data flow visualization

The dashboard also includes an **interactive architecture diagram** component that visualizes how MCPs are exposed and how agents communicate with each other.

## Features

- Search by ticker symbol and orchestrate multiple MCP-style agents to build a Stock Intelligence Report.
- LangGraph-powered workflow fans out to earnings, filings, performance, analyst, and news agents in parallel, then reunites the results.
- Optional LangChain-based summarizer produces an "AI Analyst" briefing for each report.
- PostgreSQL-backed caching layer stores synthesized reports to conserve API usage.
- Daily cron job warms cache for tracked tickers (and can be extended to run orchestrations).
- React + Vite frontend with agent status insights, summary card, charts, tables, and sentiment-tagged headlines.
- Individual REST endpoints per data source remain available for lightweight integrations.

## Tech Stack

- **Backend**: Node.js, Express, Axios, LangGraph, LangChain, PostgreSQL, node-cron
- **Frontend**: React 18, Vite, React Router, @tanstack/react-query, Recharts
- **Database**: PostgreSQL (TTL-managed cache entries)
- **AI**: LangChain `ChatOpenAI` (with OpenAI) or Ollama fallback
- **Deployment**: Docker, Railway (recommended), or Docker Compose

## Project Structure

```
backend/
  agents/                # LangChain tools wrapped around MCP modules
  graph/
    nodes/               # LangGraph node definitions
    stockGraph.js        # Compiled Stock Intelligence workflow
  mcp/                   # Modular data-fetch tools (Finnhub, SEC, FMP, MarketAux)
  routes/
    stockReportRoute.js  # /api/stock/:symbol endpoint
  services/
    orchestratorService.js
  utils/
frontend/
  src/
    components/          # Agent status, summary card, dashboards
    pages/
    utils/api.js
```

## Local Development

1. **Install dependencies** (root uses pnpm workspaces):

   ```bash
   pnpm install
   ```

2. **Configure environment variables**:

   Copy `backend/env.sample` to `backend/.env` and fill in API keys (see below).

   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/ai-stock-insights
   FINNHUB_API_KEY=...
   FMP_API_KEY=...
   MARKET_AUX_KEY=...
   OPENAI_API_KEY=...            # optional
   OLLAMA_ENDPOINT=http://localhost:11434/api/generate  # optional
   TRACKED_SYMBOLS=AAPL,MSFT,GOOGL
   SEC_USER_AGENT=ai-stock-insights/1.0 (contact: you@example.com)
   ```

3. **Run services**:

   ```bash
   pnpm backend:dev   # starts Express server on port 4000
   pnpm frontend      # starts Vite dev server on port 3000 with proxy -> 4000
   ```

4. Visit <http://localhost:3000> and search for a ticker.

## Docker Workflow

Run the entire stack (frontend, backend, MongoDB) with Docker:

1. Ensure `backend/.env` exists (copy from `backend/env.sample` and update secrets).
2. Build and start all services:

   ```bash
   docker-compose up --build
   ```

   - Frontend served on <http://localhost:3000>
   - Backend API available on <http://localhost:4000>
   - MongoDB exposed on `localhost:27017`

3. To stop the stack:

   ```bash
   docker-compose down
   ```

   Add `-v` to remove the persisted `mongo-data` volume.

The frontend container uses Nginx to proxy `/api` requests to the backend service, so no additional client-side configuration is required. Update `frontend/nginx.conf` if you change backend ports or paths.

## API Overview

| Endpoint | Description | Upstream Source |
| --- | --- | --- |
| `GET /api/stock/:symbol[?refresh=true]` | Executes the LangGraph workflow. Dispatches specialized MCP-backed agents, merges outputs, and returns a Stock Intelligence Report with AI summary + agent telemetry. | Finnhub, FMP, SEC EDGAR, MarketAux |
| `GET /api/overview/:symbol` | Profile and quote snapshot (sector, CEO, price, sparkline) | Financial Modeling Prep `/profile`, `/quote`, `/historical-price-full` |
| `GET /api/earnings/:symbol` | 60-day forward earnings calendar | Finnhub `/calendar/earnings` |
| `GET /api/filings/:symbol` | Latest 10-K/10-Q/8-K filings with AI summary | SEC EDGAR submissions API |
| `GET /api/ratings/:symbol` | Analyst recommendation trends | Finnhub `/stock/recommendation` |
| `GET /api/news/:symbol` | Last 7-day headlines + optional summaries | MarketAux `/v1/news/all` |

### Agentic Orchestration

- **LangGraph Workflow** (`backend/graph/stockGraph.js`) defines the nodes and parallel edges that fan out to data agents and reunite at the summarizer.
- **Specialized Agents** (`backend/graph/nodes/*.js`) call LangChain tools housed in `backend/agents/*.js`, which in turn rely on MCP modules under `backend/mcp/`.
- **Summary Agent** (`backend/agents/summarizerAgent.js`) uses `ChatOpenAI` when an API key is supplied and falls back to a deterministic template otherwise.
- Agent telemetry (status, latency, errors) is embedded in each `/api/stock/:symbol` response so the frontend can surface health indicators.

### Background Sync

`node-cron` job runs at 06:00 UTC daily (`refreshService.js`) to warm caches for `TRACKED_SYMBOLS`. Extend by editing the env variable; swap in the orchestrator service to pre-generate Stock Intelligence Reports if desired.

### Caching

`CacheEntry` model sets a TTL index on `expiresAt`, pruning old records automatically. Helpers in `utils/cache.js` and `services/cacheService.js` manage report caching.

## Frontend Notes

- Query orchestration handled via React Query; API calls live in `src/utils/api.js`.
- `StockReport` component renders the full agentic report, including:
  - `AISummaryCard` for the LLM-generated analyst brief.
  - `AgentStatusPanel` to monitor success/error states of each agent.
  - Existing visual components (`StockOverviewCard`, `EarningsTable`, `RatingsChart`, `FilingsSummary`, `NewsFeed`) now consume orchestrator data.
- Styles in `src/styles.css` provide the glassmorphism dashboard aesthetic.

## Deployment

### Railway Deployment (Recommended)

**See [RAILWAY.md](./RAILWAY.md) for complete Railway deployment guide.**

Quick steps:
1. Push code to GitHub
2. Create Railway project → Connect GitHub repo
3. Add PostgreSQL database service
4. Deploy backend service (set environment variables)
5. Deploy frontend service (set `VITE_API_BASE`)
6. Generate domains for both services

### Other Deployment Options

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Docker Compose and other deployment methods.

## Deployment Checklist

- [ ] Provide production `.env` with real API keys
- [ ] Set secure `SEC_USER_AGENT` with your contact email
- [ ] Configure PostgreSQL database (Railway provides managed PostgreSQL)
- [ ] Set `VITE_API_BASE` in frontend to point to backend URL
- [ ] Configure custom domains (optional)
- [ ] Set up cron or scheduled job for `refreshService` (Railway supports cron jobs)
- [ ] Test health endpoints (`/health`)
- [ ] Verify SSL certificates (automatic with Railway)

## Testing Data Sources

- **Finnhub**: Free tier allows 60 requests/minute. Monitor usage when prewarming caches.
- **SEC EDGAR**: Respect full headers and avoid rapid polling. We only request at most 6 filings per symbol.
- **MarketAux**: Ensure plan covers number of symbols/news fetches. Summaries reuse text to avoid extra calls.
- **OpenAI/Ollama**: Summaries gracefully degrade to text snippets if no key or endpoint is configured.

## License

MIT – adjust as needed.

