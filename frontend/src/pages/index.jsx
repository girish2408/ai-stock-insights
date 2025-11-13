import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import StockReportCard from '../components/StockReportCard.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { fetchAgenticStockReport } from '../utils/api.js';

const DEFAULT_SYMBOL = 'AAPL';

export default function DashboardPage() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [inputSymbol, setInputSymbol] = useState(DEFAULT_SYMBOL);
  const [refreshToken, setRefreshToken] = useState(0);

  const {
    data,
    isFetching,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['stock-report', symbol, refreshToken],
    queryFn: ({ queryKey }) => {
      const [, activeSymbol, refreshCount] = queryKey;
      return fetchAgenticStockReport(activeSymbol, {
        forceRefresh: refreshCount > 0
      });
    },
    enabled: Boolean(symbol),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  });

  function onSubmit(event) {
    event.preventDefault();
    const trimmed = inputSymbol.trim().toUpperCase();
    if (!trimmed) return;
    if (trimmed !== symbol) {
      setSymbol(trimmed);
      setRefreshToken(0);
    } else {
      refetch();
    }
  }

  function onForceRefresh() {
    setRefreshToken((value) => value + 1);
  }

  return (
    <div className="app-shell">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 auto', minWidth: '300px' }}>
            <span className="badge">AI-powered</span>
            <h1>Stock Insights Dashboard</h1>
            <p className="subtext">
              Aggregate earnings dates, SEC filings, analyst ratings, performance, and curated news with
              optional AI summaries. Data refreshes daily and is cached to minimize API usage.
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.25rem', 
            flexShrink: 0,
            marginTop: '0.5rem'
          }}>
            <Link
              to="/how-it-works"
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'var(--bg-card)';
              }}
            >
              How It Works →
            </Link>
            <div style={{ flexShrink: 0, width: '44px', height: '44px' }}>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <form className="search-bar" onSubmit={onSubmit}>
          <input
            value={inputSymbol}
            onChange={(event) => setInputSymbol(event.target.value.toUpperCase())}
            placeholder="Enter ticker symbol — e.g. TSLA"
            aria-label="Ticker symbol"
          />
          <button type="submit" disabled={isFetching}>
            {isFetching ? 'Loading…' : 'Load'}
          </button>
          <button
            type="button"
            onClick={onForceRefresh}
            disabled={isFetching}
            style={{
              background: '#f97316',
              color: '#0f172a'
            }}
          >
            {isFetching ? 'Refreshing…' : 'Force Refresh'}
          </button>
        </form>
      </header>

      {(queryError || data?.agentStates?.some((agent) => agent.status === 'error')) && (
        <div className="error-message">
          {queryError
            ? queryError.message
            : `Some agents reported issues: ${data.agentStates
                .filter((agent) => agent.status === 'error')
                .map((agent) => agent.agent)
                .join(', ')}`}
        </div>
      )}

      <StockReportCard report={data} isLoading={isFetching} />

      {/* AI Disclaimer */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem 1.25rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        fontSize: '0.85rem',
        color: 'var(--text-tertiary)',
        lineHeight: 1.6
      }}>
        <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
          ⚠️ AI-Generated Content Disclaimer
        </strong>
        <p style={{ margin: 0 }}>
          This website uses AI (OpenAI GPT or Ollama) to generate stock summaries and insights. 
          All summaries, analyses, and recommendations are automatically generated by artificial intelligence 
          and should not be considered as professional financial advice. Always consult with qualified financial 
          advisors before making investment decisions. Data accuracy is not guaranteed, and past performance 
          does not indicate future results.
        </p>
      </div>

      <footer className="footer">
        <span>
          {symbol} report {data?.cacheHit ? 'served from cache' : 'generated fresh'} •{' '}
          {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'pending'}
        </span>
        <a
          href="https://github.com/yourname/ai-stock-insights"
          target="_blank"
          rel="noreferrer"
        >
          View project documentation
        </a>
      </footer>
    </div>
  );
}

