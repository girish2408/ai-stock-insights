import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle.jsx';

const steps = [
  {
    id: 1,
    title: 'User Input',
    description: 'User enters a stock ticker symbol (e.g., "AAPL") in the search bar',
    icon: '🔍',
    code: `GET /api/stock/AAPL`,
    details: [
      'Frontend sends HTTP request to Express backend',
      'Route handler extracts symbol from URL params',
      'Request forwarded to orchestrator service'
    ]
  },
  {
    id: 2,
    title: 'Cache Check',
    description: 'System checks PostgreSQL cache for existing report',
    icon: '💾',
    code: `SELECT * FROM cache_entries 
WHERE key = 'stock:AAPL' 
AND expires_at > NOW()`,
    details: [
      'If cache hit: Return cached data immediately',
      'If cache miss: Proceed to graph execution',
      'Cache TTL: 24 hours by default'
    ]
  },
  {
    id: 3,
    title: 'LangGraph Orchestration',
    description: 'LangGraph workflow is invoked with the stock symbol',
    icon: '🕸️',
    code: `runStockGraph("AAPL")`,
    details: [
      'Creates initial state: { symbol: "AAPL", agentStates: [] }',
      'Graph nodes execute in sequence:',
      '  → input → aggregate → summarizer → end'
    ]
  },
  {
    id: 4,
    title: 'Input Node',
    description: 'Normalizes and validates the input symbol',
    icon: '📥',
    code: `inputNode(state) {
  return { 
    state: { 
      symbol: "AAPL",
      agentStates: [] 
    } 
  };
}`,
    details: [
      'Converts symbol to uppercase',
      'Initializes empty agentStates array',
      'Passes normalized state to next node'
    ]
  },
  {
    id: 5,
    title: 'Aggregate Node - Parallel Execution',
    description: 'Runs all 5 data-fetching agents simultaneously',
    icon: '⚡',
    code: `Promise.allSettled([
  runEarningsAgent(symbol),
  runFilingsAgent(symbol),
  runPerformanceAgent(symbol),
  runAnalystAgent(symbol),
  runNewsAgent(symbol)
])`,
    details: [
      'All agents execute in parallel for maximum speed',
      'Each agent independently fetches its data',
      'Results collected regardless of individual failures',
      'Agent execution metadata tracked (duration, status)'
    ]
  },
  {
    id: 6,
    title: 'Agent Layer',
    description: 'Each agent wraps an MCP tool to fetch specific data',
    icon: '🤖',
    code: `EarningsAgent → finnhubTool → finnhubService → Finnhub API
SECFilingsAgent → secTool → secService → SEC EDGAR API
PerformanceAgent → yahooTool → yahooService → Alpha Vantage API
AnalystAgent → analystTool → finnhubService → Finnhub API
NewsAgent → newsTool → marketauxService → MarketAux API`,
    details: [
      'Agents provide consistent interface via LangChain Tools',
      'MCP tools abstract API-specific details',
      'Services handle HTTP requests and error handling',
      'External APIs return raw data'
    ]
  },
  {
    id: 7,
    title: 'Data Aggregation',
    description: 'All agent results are collected into a single state object',
    icon: '📊',
    code: `aggregated = {
  symbol: "AAPL",
  earnings: {...},
  filings: [...],
  overview: {...},
  performance: {...},
  analystRatings: [...],
  news: [...],
  agentStates: [
    { agent: "EarningsAgent", status: "success", ... },
    ...
  ]
}`,
    details: [
      'Results merged into unified state structure',
      'Agent execution metadata preserved',
      'Null values handled gracefully',
      'State passed to summarizer node'
    ]
  },
  {
    id: 8,
    title: 'Summarizer Node',
    description: 'AI generates a comprehensive summary from all collected data',
    icon: '✨',
    code: `summarizerNode(state) {
  const summary = await runSummarizerAgent(state);
  return {
    state: {
      ...state,  // Preserve all data
      summary: "AI-generated summary...",
      generatedAt: "2025-11-13T..."
    }
  };
}`,
    details: [
      'Uses OpenAI GPT or Ollama for summarization',
      'Analyzes all collected data points',
      'Generates human-readable insights',
      'Preserves all original data fields'
    ]
  },
  {
    id: 9,
    title: 'State Reducer',
    description: 'LangGraph reducer merges state updates from all nodes',
    icon: '🔄',
    code: `value: (prev, next) => {
  return {
    ...prev,
    ...next,
    agentStates: [...prev.agentStates, ...next.agentStates]
  };
}`,
    details: [
      'Merges state updates from each node',
      'Concatenates agentStates arrays',
      'Preserves non-null values',
      'Returns final merged state'
    ]
  },
  {
    id: 10,
    title: 'Cache & Response',
    description: 'Result is cached and returned to the client',
    icon: '📤',
    code: `INSERT INTO cache_entries (key, data, expires_at)
VALUES ('stock:AAPL', {...}, NOW() + INTERVAL '24 hours')

return {
  symbol: "AAPL",
  overview: {...},
  earnings: {...},
  filings: [...],
  analystRatings: [...],
  news: [...],
  summary: "...",
  generatedAt: "...",
  agentStates: [...],
  cacheHit: false
}`,
    details: [
      'Report saved to PostgreSQL cache',
      '24-hour TTL prevents stale data',
      'JSON response sent to frontend',
      'Frontend renders dashboard with all data'
    ]
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);

  return (
    <div className="app-shell">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 auto', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Link 
                to="/" 
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ← Back to Dashboard
              </Link>
            </div>
            <span className="badge">System Architecture</span>
            <h1>How It Works</h1>
            <p className="subtext" style={{ maxWidth: '700px' }}>
              Step-by-step visualization of how the AI Stock Insights Dashboard processes your request,
              from user input to final report generation.
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            flexShrink: 0,
            marginTop: '0.5rem'
          }}>
            <div style={{ flexShrink: 0 }}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Auto-play Controls */}
      <div style={{ 
        marginBottom: '2rem',
        padding: '1rem',
        background: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          style={{
            padding: '0.5rem 1rem',
            background: autoPlay ? 'var(--accent-error)' : 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          {autoPlay ? '⏸ Stop Auto-play' : '▶ Start Auto-play'}
        </button>
        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
          {autoPlay ? 'Automatically cycling through steps...' : 'Click steps to expand details'}
        </span>
      </div>

      {/* Steps Timeline */}
      <div style={{ position: 'relative', marginTop: '2rem' }}>
        {/* Vertical Line */}
        <div style={{
          position: 'absolute',
          left: '2rem',
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'var(--border-color)',
          zIndex: 0
        }} />

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.id} style={{ position: 'relative', marginBottom: '2rem', zIndex: 1 }}>
            {/* Step Circle */}
            <div style={{
              position: 'absolute',
              left: '1.5rem',
              top: '0.5rem',
              width: '1rem',
              height: '1rem',
              borderRadius: '50%',
              background: activeStep === step.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              border: `2px solid ${activeStep === step.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 2
            }}
            onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
            >
              {step.id}
            </div>

            {/* Step Content */}
            <div 
              className="card"
              style={{
                marginLeft: '4rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderColor: activeStep === step.id ? 'var(--accent-primary)' : 'var(--border-color)',
                transform: activeStep === step.id ? 'translateX(4px)' : 'none'
              }}
              onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
              onMouseEnter={(e) => {
                if (activeStep !== step.id) {
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeStep !== step.id) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>{step.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{step.title}</h2>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--text-muted)',
                      background: 'var(--bg-tertiary)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px'
                    }}>
                      Step {step.id}/{steps.length}
                    </span>
                  </div>
                  <p className="subtext" style={{ marginBottom: '1rem' }}>
                    {step.description}
                  </p>

                  {/* Code Block */}
                  <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <pre style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      overflowX: 'auto'
                    }}>
                      {step.code}
                    </pre>
                  </div>

                  {/* Expanded Details */}
                  {activeStep === step.id && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                        Key Details:
                      </h3>
                      <ul style={{
                        margin: 0,
                        paddingLeft: '1.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.8
                      }}>
                        {step.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Flow Diagram */}
      <div className="card grid-col-12" style={{ marginTop: '3rem' }}>
        <h2>Complete Flow Diagram</h2>
        <div style={{
          padding: '2.5rem 3rem',
          background: 'var(--bg-tertiary)',
          borderRadius: '12px',
          overflowX: 'auto',
          marginTop: '1rem',
          width: '100%',
          maxWidth: '100%'
        }}>
          <pre style={{
            margin: 0,
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
            lineHeight: 1.8,
            whiteSpace: 'pre',
            minWidth: 'max-content'
          }}>
{`┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. USER INPUT: "AAPL"                                                                                                        │
│    → Frontend sends GET /api/stock/AAPL                                                                                       │
└────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────┘
                                     │ HTTP Request
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. EXPRESS ROUTE: stockReportRoute.js                                                                                        │
│    → Extracts symbol from URL params                                                                                          │
│    → Calls orchestratorService.getStockIntelligence(symbol)                                                                   │
└────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. ORCHESTRATOR: orchestratorService.js                                                                                      │
│    → Checks PostgreSQL cache: SELECT * FROM cache_entries WHERE key = 'stock:AAPL' AND expires_at > NOW()                  │
│    → If cache hit: Return cached data immediately                                                                            │
│    → If cache miss: Invoke runStockGraph("AAPL")                                                                             │
└────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. LANGGRAPH: stockGraph.js                                                                                                 │
│    ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │ Initial State: { symbol: "AAPL", agentStates: [] }                                                                 │   │
│    └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                                                                         │
│                                     ▼                                                                                         │
│    ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │ INPUT NODE: inputNode.js                                                                                            │   │
│    │ → Normalizes symbol to uppercase                                                                                    │   │
│    │ → Returns: { state: { symbol: "AAPL", agentStates: [] } }                                                          │   │
│    └────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                                                                     │
│                                         ▼                                                                                     │
│    ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │ AGGREGATE NODE: aggregateNode.js                                                                                    │   │
│    │ → Runs 5 agents in PARALLEL using Promise.allSettled([...])                                                         │   │
│    │                                                                                                                       │   │
│    │    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                        │   │
│    │    │EarningsAgent │  │SECFilings    │  │Performance   │  │AnalystAgent  │  │NewsAgent     │                        │   │
│    │    │              │  │Agent         │  │Agent         │  │              │  │              │                        │   │
│    │    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                        │   │
│    │           │                 │                  │                 │                  │                                 │   │
│    │           ▼                 ▼                  ▼                 ▼                  ▼                                 │   │
│    │    ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐                               │   │
│    │    │finnhub   │      │secTool   │      │yahooTool │      │analyst   │      │newsTool  │                               │   │
│    │    │Tool      │      │          │      │          │      │Tool      │      │          │                               │   │
│    │    └────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘                               │   │
│    │         │                │                 │                │                 │                                      │   │
│    │         ▼                ▼                 ▼                ▼                 ▼                                      │   │
│    │    ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐                               │   │
│    │    │finnhub   │      │sec       │      │yahoo     │      │finnhub   │      │marketaux │                               │   │
│    │    │Service   │      │Service   │      │Service   │      │Service   │      │Service   │                               │   │
│    │    └────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘                               │   │
│    │         │                │                 │                │                 │                                      │   │
│    │         ▼                ▼                 ▼                ▼                 ▼                                      │   │
│    │    ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐                               │   │
│    │    │Finnhub  │      │SEC EDGAR │      │Alpha     │      │Finnhub  │      │MarketAux │                               │   │
│    │    │API      │      │API       │      │Vantage   │      │API      │      │API       │                               │   │
│    │    └─────────┘      └──────────┘      └──────────┘      └──────────┘      └──────────┘                               │   │
│    │                                                                                                                       │   │
│    │ → Collects all results into aggregated state                                                                         │   │
│    │ → Returns: { state: { earnings, filings, overview, performance, analystRatings, news, agentStates } }              │   │
│    └────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                                                                     │
│                                         ▼                                                                                     │
│    ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │ SUMMARIZER NODE: summarizerNode.js                                                                                  │   │
│    │ → Receives aggregated state                                                                                         │   │
│    │ → Calls runSummarizerAgent(state) → Uses OpenAI/Ollama                                                              │   │
│    │ → Generates AI summary from all collected data                                                                      │   │
│    │ → Preserves all existing data, adds summary and generatedAt                                                         │   │
│    │ → Returns: { state: { ...allData, summary: "...", generatedAt: "..." } }                                           │   │
│    └────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                                                                     │
│                                         ▼                                                                                     │
│    ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    │ STATE REDUCER: Merges state updates from all nodes                                                                 │   │
│    │ → Concatenates agentStates arrays                                                                                   │   │
│    │ → Preserves non-null values                                                                                        │   │
│    │ → Returns final merged state                                                                                       │   │
│    └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 5. CACHE & RESPONSE:                                                                                                        │
│    → Saves report to PostgreSQL cache: INSERT INTO cache_entries (key, data, expires_at) VALUES (...)                    │
│    → Cache TTL: 24 hours                                                                                                   │
│    → Returns JSON response to frontend                                                                                      │
│    → Frontend renders dashboard with all data: overview, earnings, filings, ratings, news, summary, agentStates          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* AI Disclaimer */}
      <div style={{
        marginTop: '3rem',
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

      {/* Navigation Footer */}
      <footer className="footer" style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ color: 'var(--accent-primary)' }}>
          ← Back to Dashboard
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>
          For complete technical documentation, see{' '}
          <a 
            href="https://github.com/girish2408/ai-stock-insights/blob/main/ARCHITECTURE.md" 
            target="_blank" 
            rel="noreferrer"
            style={{ color: 'var(--accent-primary)' }}
          >
            ARCHITECTURE.md
          </a>
        </span>
      </footer>
    </div>
  );
}

