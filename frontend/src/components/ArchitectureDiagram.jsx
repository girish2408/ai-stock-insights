import { useState } from 'react';
import PropTypes from 'prop-types';

export default function ArchitectureDiagram() {
  const [activeLayer, setActiveLayer] = useState(null);

  const layers = [
    {
      id: 'client',
      name: 'Client Layer',
      color: 'var(--accent-primary)',
      components: ['React Dashboard', 'HTTP Request', 'UI Components']
    },
    {
      id: 'api',
      name: 'API Layer',
      color: 'var(--accent-secondary)',
      components: ['Express Server', 'Route Handler', 'Request Validation']
    },
    {
      id: 'orchestrator',
      name: 'Orchestrator',
      color: 'var(--accent-success)',
      components: ['Cache Check', 'Graph Invocation', 'Result Aggregation']
    },
    {
      id: 'graph',
      name: 'LangGraph',
      color: 'var(--accent-warning)',
      components: ['Input Node', 'Aggregate Node', 'Summarizer Node']
    },
    {
      id: 'agents',
      name: 'Agents',
      color: '#8b5cf6',
      components: ['EarningsAgent', 'SECFilingsAgent', 'PerformanceAgent', 'AnalystAgent', 'NewsAgent']
    },
    {
      id: 'mcp',
      name: 'MCP Tools',
      color: '#ec4899',
      components: ['finnhubTool', 'secTool', 'yahooTool', 'newsTool', 'analystTool']
    },
    {
      id: 'services',
      name: 'Services',
      color: '#14b8a6',
      components: ['finnhubService', 'secService', 'yahooService', 'marketauxService']
    },
    {
      id: 'apis',
      name: 'External APIs',
      color: 'var(--accent-error)',
      components: ['Finnhub API', 'SEC EDGAR', 'Alpha Vantage', 'MarketAux']
    }
  ];

  return (
    <div className="card grid-col-12">
      <h2>System Architecture</h2>
      <p className="subtext" style={{ marginBottom: '1.5rem' }}>
        Interactive diagram showing how MCPs are exposed and how agents communicate
      </p>

      {/* Architecture Flow */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        padding: '1.5rem',
        background: 'var(--bg-tertiary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        {layers.map((layer, index) => (
          <div key={layer.id}>
            <div
              onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
              style={{
                padding: '1rem',
                background: activeLayer === layer.id ? layer.color : 'var(--bg-card)',
                border: `2px solid ${layer.color}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                if (activeLayer !== layer.id) {
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeLayer !== layer.id) {
                  e.currentTarget.style.background = 'var(--bg-card)';
                }
              }}
            >
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1rem', 
                  color: activeLayer === layer.id ? 'white' : 'var(--text-primary)',
                  fontWeight: 600
                }}>
                  {index + 1}. {layer.name}
                </h3>
                {activeLayer === layer.id && (
                  <div style={{ 
                    marginTop: '0.75rem', 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem' 
                  }}>
                    {layer.components.map((comp) => (
                      <span
                        key={comp}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: 'white'
                        }}
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                color: activeLayer === layer.id ? 'white' : layer.color,
                transition: 'transform 0.2s ease'
              }}>
                {activeLayer === layer.id ? '▼' : '▶'}
              </div>
            </div>
            {index < layers.length - 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '0.5rem 0'
              }}>
                <div style={{
                  width: '2px',
                  height: '1rem',
                  background: 'var(--border-color)'
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detailed Flow Diagram */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Detailed Communication Flow
        </h3>
        <div style={{
          padding: '1.5rem',
          background: 'var(--bg-tertiary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          overflowX: 'auto'
        }}>
          <pre style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
{`┌─────────────────────────────────────────────────────────┐
│ 1. CLIENT: User enters "AAPL"                          │
│    → GET /api/stock/AAPL                                │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. API LAYER: stockReportRoute.js                      │
│    → Extracts symbol, calls orchestratorService        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. ORCHESTRATOR: orchestratorService.js                 │
│    → Checks PostgreSQL cache                           │
│    → If miss: invokes runStockGraph("AAPL")            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. LANGGRAPH: stockGraph.js                            │
│    ┌──────────┐                                         │
│    │ inputNode│ → Normalizes symbol                    │
│    └────┬─────┘                                         │
│         │                                               │
│         ▼                                               │
│    ┌──────────────┐                                     │
│    │aggregateNode │ → Runs 5 agents in PARALLEL      │
│    └────┬─────────┘                                     │
│         │                                               │
│         ▼                                               │
│    ┌──────────────┐                                     │
│    │summarizerNode│ → Generates AI summary             │
│    └──────────────┘                                     │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│Earnings    │ │Filings     │ │Performance │
│Agent       │ │Agent       │ │Agent       │
└─────┬──────┘ └─────┬──────┘ └─────┬──────┘
      │              │              │
      ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│finnhubTool │ │secTool     │ │yahooTool   │
└─────┬──────┘ └─────┬──────┘ └─────┬──────┘
      │              │              │
      ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│finnhubSvc  │ │secService  │ │yahooService│
└─────┬──────┘ └─────┬──────┘ └─────┬──────┘
      │              │              │
      ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│Finnhub API│ │SEC EDGAR   │ │Alpha Vant. │
└────────────┘ └────────────┘ └────────────┘`}
          </pre>
        </div>
      </div>

      {/* MCP Tool Details */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          MCP Tool Exposure
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {[
            { name: 'finnhubTool', purpose: 'Earnings & Analyst Data', api: 'Finnhub' },
            { name: 'secTool', purpose: 'SEC Filings', api: 'SEC EDGAR' },
            { name: 'yahooTool', purpose: 'Profile & Prices', api: 'Alpha Vantage' },
            { name: 'newsTool', purpose: 'News Headlines', api: 'MarketAux' },
            { name: 'analystTool', purpose: 'Recommendations', api: 'Finnhub' }
          ].map((tool) => (
            <div
              key={tool.name}
              style={{
                padding: '1rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {tool.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                {tool.purpose}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                API: {tool.api}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Communication */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Agent Communication Pattern
        </h3>
        <div style={{
          padding: '1.5rem',
          background: 'var(--bg-tertiary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>1. Agent Definition:</strong>
            <pre style={{ 
              marginTop: '0.5rem', 
              padding: '1rem', 
              background: 'var(--bg-card)', 
              borderRadius: '8px',
              fontSize: '0.8rem',
              overflowX: 'auto'
            }}>
{`export const earningsAgentTool = new Tool({
  name: 'EarningsAgent',
  description: 'Fetch earnings data',
  func: async (symbol) => {
    const result = await getEarningsData(symbol);
    return JSON.stringify(result);
  }
});`}
            </pre>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>2. Agent Execution:</strong>
            <pre style={{ 
              marginTop: '0.5rem', 
              padding: '1rem', 
              background: 'var(--bg-card)', 
              borderRadius: '8px',
              fontSize: '0.8rem',
              overflowX: 'auto'
            }}>
{`export async function runEarningsAgent(symbol) {
  try {
    const result = await getEarningsData(symbol);
    return result ?? null;
  } catch (err) {
    return null;
  }
}`}
            </pre>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>3. Parallel Execution:</strong>
            <pre style={{ 
              marginTop: '0.5rem', 
              padding: '1rem', 
              background: 'var(--bg-card)', 
              borderRadius: '8px',
              fontSize: '0.8rem',
              overflowX: 'auto'
            }}>
{`const results = await Promise.allSettled([
  runEarningsAgent(symbol),
  runFilingsAgent(symbol),
  runPerformanceAgent(symbol),
  runAnalystAgent(symbol),
  runNewsAgent(symbol)
]);`}
            </pre>
          </div>
        </div>
      </div>

      {/* Link to Full Documentation */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: 'var(--bg-tertiary)', 
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          For complete architecture documentation, see{' '}
          <a 
            href="https://github.com/yourname/ai-stock-insights/blob/main/ARCHITECTURE.md" 
            target="_blank" 
            rel="noreferrer"
            style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}
          >
            ARCHITECTURE.md
          </a>
        </p>
      </div>
    </div>
  );
}

ArchitectureDiagram.propTypes = {};

