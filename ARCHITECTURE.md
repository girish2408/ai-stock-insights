# AI Stock Insights Dashboard - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [MCP (Multi-Agent Communication Protocol) Architecture](#mcp-architecture)
3. [Agent Communication Flow](#agent-communication-flow)
4. [LangGraph Orchestration](#langgraph-orchestration)
5. [Data Flow Diagram](#data-flow-diagram)
6. [Component Details](#component-details)
7. [State Management](#state-management)

---

## System Overview

This system implements a **Multi-Agent AI Orchestration** architecture using:
- **LangGraph**: Workflow orchestration engine
- **LangChain**: Agent framework and tool abstraction
- **MCP Tools**: Modular data-fetching modules
- **Express.js**: REST API layer
- **React**: Frontend dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User enters stock symbol (e.g., "AAPL")                 │  │
│  │  → Calls: GET /api/stock/:symbol                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Port 4000)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Route: /api/stock/:symbol                                │  │
│  │  Handler: stockReportRoute.js                             │  │
│  └───────────────────────────┬──────────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              ORCHESTRATOR SERVICE (orchestratorService.js)       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Check cache (PostgreSQL)                             │  │
│  │  2. If cache miss → Invoke LangGraph workflow            │  │
│  │  3. Return aggregated report                             │  │
│  └───────────────────────────┬──────────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              LANGGRAPH WORKFLOW (stockGraph.js)                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  StateGraph with nodes:                                  │  │
│  │  • input → aggregate → summarizer → __end__             │  │
│  └───────────────────────────┬──────────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              AGGREGATE NODE (aggregateNode.js)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Runs 5 agents in PARALLEL using Promise.allSettled:    │  │
│  │  • EarningsAgent                                          │  │
│  │  • SECFilingsAgent                                        │  │
│  │  • PerformanceAgent                                       │  │
│  │  • AnalystAgent                                          │  │
│  │  • NewsAgent                                              │  │
│  └───────────────────────────┬──────────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌───────────┐   ┌───────────┐   ┌───────────┐
        │  Agents   │   │  Agents   │   │  Agents   │
        │  (5x)     │   │  (5x)     │   │  (5x)     │
        └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  MCP Tools      │
                    │  (5 modules)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Services       │
                    │  (API Clients)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  External APIs  │
                    │  • Finnhub      │
                    │  • SEC EDGAR    │
                    │  • Alpha Vantage│
                    │  • MarketAux    │
                    └─────────────────┘
```

---

## MCP Architecture

### What is MCP?

**MCP (Multi-Agent Communication Protocol)** is a modular abstraction layer that:
- Encapsulates data-fetching logic into reusable tools
- Provides a consistent interface for agents
- Abstracts away API-specific details
- Enables easy testing and mocking

### MCP Tool Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP TOOL LAYER                            │
│  (backend/mcp/*.js)                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  finnhubTool.js  │  │    secTool.js     │              │
│  │                  │  │                   │              │
│  │  • getEarningsData()                                     │
│  │  • getAnalystRecommendations()                           │
│  └────────┬─────────┘  └────────┬──────────┘              │
│           │                      │                          │
│  ┌────────┴─────────┐  ┌────────┴──────────┐             │
│  │  yahooTool.js     │  │   newsTool.js      │             │
│  │                   │  │                    │             │
│  │  • fetchPerformanceBundle()                              │
│  │    - Profile API                                         │
│  │    - Quote API                                           │
│  │    - Historical API                                      │
│  └────────┬─────────┘  └────────┬──────────┘             │
│           │                      │                          │
│           └──────────┬───────────┘                         │
│                      │                                      │
│           ┌──────────┴───────────┐                        │
│           │   analystTool.js      │                        │
│           │   (re-exports finnhub) │                        │
│           └───────────────────────┘                        │
│                                                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVICE LAYER (backend/services/*.js)           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ finnhubService.js │  │   secService.js  │              │
│  │                   │  │                  │              │
│  │  • getEarningsCalendar(symbol, from, to)               │
│  │  • getRecommendationTrends(symbol)                      │
│  │  • Uses: FINNHUB_API_KEY                                │
│  └────────┬─────────┘  └────────┬──────────┘              │
│           │                      │                          │
│  ┌────────┴─────────┐  ┌────────┴──────────┐             │
│  │ yahooService.js   │  │marketauxService.js │             │
│  │                   │  │                    │             │
│  │  • getCompanyProfile(symbol)                              │
│  │  • getQuote(symbol)                                      │
│  │  • getHistoricalPrices(symbol, days)                     │
│  │  • Uses: ALPHA_VANTAGE_API_KEY                          │
│  └────────┬─────────┘  └────────┬──────────┘             │
│           │                      │                          │
│           └──────────────────────┘                         │
│                                                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIs                             │
├─────────────────────────────────────────────────────────────┤
│  • Finnhub API (earnings, recommendations)                  │
│  • SEC EDGAR API (filings)                                  │
│  • Alpha Vantage API (profile, quote, historical)          │
│  • MarketAux API (news)                                     │
└─────────────────────────────────────────────────────────────┘
```

### Example: MCP Tool Implementation

```javascript
// backend/mcp/finnhubTool.js
import { getEarningsCalendar } from '../services/finnhubService.js';

export async function getEarningsData(symbol) {
  const today = new Date();
  const from = today.toISOString().split('T')[0];
  const horizon = new Date(today);
  horizon.setDate(today.getDate() + 60);
  const to = horizon.toISOString().split('T')[0];
  
  return getEarningsCalendar(symbol, from, to);
}
```

**Key Points:**
- MCP tools are **pure functions** that take a symbol and return data
- They **delegate** to service layer for actual API calls
- They handle **data transformation** and **parameter preparation**
- They are **stateless** and **idempotent**

---

## Agent Communication Flow

### Agent Structure

Each agent follows this pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT LAYER                              │
│  (backend/agents/*.js)                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EarningsAgent (earningsAgent.js)                   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  1. LangChain Tool Wrapper:                         │   │
│  │     ┌──────────────────────────────────────────┐   │   │
│  │     │ earningsAgentTool = new Tool({            │   │   │
│  │     │   name: 'EarningsAgent',                   │   │   │
│  │     │   description: '...',                     │   │   │
│  │     │   func: async (symbol) => {                │   │   │
│  │     │     const result = await                  │   │   │
│  │     │       getEarningsData(symbol);             │   │   │
│  │     │     return JSON.stringify(result);         │   │   │
│  │     │   }                                        │   │   │
│  │     │ });                                        │   │   │
│  │     └──────────────────────────────────────────┘   │   │   │
│  │                                                      │   │   │
│  │  2. Direct Function (used by aggregateNode):      │   │   │
│  │     ┌──────────────────────────────────────────┐   │   │   │
│  │     │ export async function                    │   │   │   │
│  │     │   runEarningsAgent(symbol) {             │   │   │   │
│  │     │   try {                                   │   │   │   │
│  │     │     const result = await                  │   │   │   │
│  │     │       getEarningsData(symbol);            │   │   │   │
│  │     │     return result ?? null;                │   │   │   │
│  │     │   } catch (err) {                        │   │   │   │
│  │     │     return null;                         │   │   │   │
│  │     │   }                                      │   │   │   │
│  │     │ }                                        │   │   │   │
│  │     └──────────────────────────────────────────┘   │   │   │
│  │                                                      │   │   │
│  │  3. Calls MCP Tool:                                │   │   │
│  │     → getEarningsData(symbol)                     │   │   │
│  │       (from mcp/finnhubTool.js)                   │   │   │
│  │                                                      │   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Similar structure for:                                     │
│  • SECFilingsAgent → secTool.js                             │
│  • PerformanceAgent → yahooTool.js                          │
│  • AnalystAgent → analystTool.js (→ finnhubTool.js)         │
│  • NewsAgent → newsTool.js                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Agent Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│              AGGREGATE NODE EXECUTION                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Receives state: { symbol: "AAPL", ... }                │
│                                                              │
│  2. Creates 5 parallel promises:                           │
│     ┌──────────────────────────────────────────────┐        │
│     │ Promise.allSettled([                        │        │
│     │   runEarningsAgent(symbol),                 │        │
│     │   runFilingsAgent(symbol),                  │        │
│     │   runPerformanceAgent(symbol),              │        │
│     │   runAnalystAgent(symbol),                  │        │
│     │   runNewsAgent(symbol)                      │        │
│     │ ])                                          │        │
│     └──────────────────────────────────────────────┘        │
│                                                              │
│  3. Each agent execution:                                  │
│     ┌──────────────────────────────────────────────┐        │
│     │ (async () => {                               │        │
│     │   const agentStart = Date.now();             │        │
│     │   try {                                      │        │
│     │     const data = await                       │        │
│     │       runEarningsAgent(symbol);              │        │
│     │     const durationMs = Date.now() -          │        │
│     │       agentStart;                            │        │
│     │     return {                                 │        │
│     │       earnings: data,                        │        │
│     │       agentState: buildAgentSuccess(         │        │
│     │         'EarningsAgent', durationMs          │        │
│     │       )                                      │        │
│     │     };                                       │        │
│     │   } catch (err) {                            │        │
│     │     return {                                 │        │
│     │       earnings: null,                         │        │
│     │       agentState: buildAgentError(...)       │        │
│     │     };                                       │        │
│     │   }                                          │        │
│     │ })()                                         │        │
│     └──────────────────────────────────────────────┘        │
│                                                              │
│  4. Collects all results:                                 │
│     ┌──────────────────────────────────────────────┐        │
│     │ aggregated = {                               │        │
│     │   symbol: "AAPL",                            │        │
│     │   earnings: {...},                           │        │
│     │   filings: [...],                            │        │
│     │   overview: {...},                            │        │
│     │   performance: {...},                         │        │
│     │   analystRatings: [...],                     │        │
│     │   news: [...],                                │        │
│     │   agentStates: [                             │        │
│     │     { agent: "EarningsAgent",                │        │
│     │       status: "success", durationMs: 500 },  │        │
│     │     ...                                      │        │
│     │   ]                                          │        │
│     │ }                                            │        │
│     └──────────────────────────────────────────────┘        │
│                                                              │
│  5. Returns: { state: aggregated }                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## LangGraph Orchestration

### Graph Structure

```
┌─────────────────────────────────────────────────────────────┐
│              LANGGRAPH STATE GRAPH                          │
│  (backend/graph/stockGraph.js)                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  State Schema:                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ {                                                    │   │
│  │   symbol: string,                                    │   │
│  │   overview: object | null,                          │   │
│  │   performance: object | null,                       │   │
│  │   earnings: object | null,                          │   │
│  │   filings: array | null,                            │   │
│  │   analystRatings: array | null,                     │   │
│  │   news: array | null,                               │   │
│  │   summary: string | null,                           │   │
│  │   generatedAt: string | null,                        │   │
│  │   agentStates: array                                 │   │
│  │ }                                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Graph Nodes:                                               │
│                                                              │
│    ┌──────────┐                                             │
│    │ __start__ │                                             │
│    └────┬──────┘                                             │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                            │
│  │  inputNode   │  Normalizes symbol, initializes state     │
│  │              │  Returns: { state: { symbol, ... } }      │
│  └──────┬───────┘                                            │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                            │
│  │ aggregateNode│  Runs all 5 agents in parallel            │
│  │              │  Collects results into single state       │
│  │              │  Returns: { state: { earnings, ... } }     │
│  └──────┬───────┘                                            │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                            │
│  │summarizerNode│  Generates AI summary from aggregated     │
│  │              │  Preserves all existing data              │
│  │              │  Returns: { state: { summary, ... } }      │
│  └──────┬───────┘                                            │
│         │                                                    │
│         ▼                                                    │
│    ┌────────┐                                                │
│    │__end__ │  Final state returned to orchestrator         │
│    └────────┘                                                │
│                                                              │
│  State Reducer:                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ value: (prev, next) => {                            │   │
│  │   // Merges state updates from nodes                 │   │
│  │   // Handles agentStates array concatenation        │   │
│  │   // Preserves non-null values                       │   │
│  │   return merged;                                     │   │
│  │ }                                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Node Execution Details

#### 1. Input Node
```javascript
// backend/graph/nodes/inputNode.js
export default async function inputNode(state) {
  const channelState = state.state || state;
  const symbol = (channelState.symbol ?? '').toUpperCase();
  
  return {
    state: {
      symbol,
      agentStates: channelState.agentStates ?? []
    }
  };
}
```

#### 2. Aggregate Node
```javascript
// backend/graph/nodes/aggregateNode.js
export default async function aggregateNode(state) {
  const symbol = state.state.symbol;
  
  // Run all agents in parallel
  const results = await Promise.allSettled([
    runEarningsAgent(symbol),
    runFilingsAgent(symbol),
    runPerformanceAgent(symbol),
    runAnalystAgent(symbol),
    runNewsAgent(symbol)
  ]);
  
  // Aggregate results
  const aggregated = {
    symbol,
    earnings: null,
    filings: null,
    // ... other fields
    agentStates: []
  };
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const data = result.value;
      if (data.earnings) aggregated.earnings = data.earnings;
      // ... merge other fields
      aggregated.agentStates.push(data.agentState);
    }
  });
  
  return { state: aggregated };
}
```

#### 3. Summarizer Node
```javascript
// backend/graph/nodes/summarizerNode.js
export default async function summarizerNode(state) {
  const channelState = state.state;
  
  // Generate AI summary
  const summary = await runSummarizerAgent(channelState);
  
  // Preserve all existing data, add summary
  return {
    state: {
      ...channelState,  // Preserve all fields
      summary,
      generatedAt: new Date().toISOString()
    }
  };
}
```

---

## Data Flow Diagram

### Complete Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                           │
│  GET /api/stock/AAPL                                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              stockReportRoute.js                            │
│  • Extracts symbol from params                              │
│  • Calls orchestratorService.getStockIntelligence()        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│          orchestratorService.js                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Check PostgreSQL cache:                         │  │
│  │     SELECT * FROM cache_entries                     │  │
│  │     WHERE key = 'stock:AAPL'                        │  │
│  │     AND expires_at > NOW()                          │  │
│  │                                                      │  │
│  │  2. If cache hit:                                   │  │
│  │     → Return cached data                            │  │
│  │                                                      │  │
│  │  3. If cache miss:                                  │  │
│  │     → Invoke LangGraph:                             │  │
│  │       runStockGraph("AAPL")                          │  │
│  │                                                      │  │
│  │  4. Cache result:                                   │  │
│  │     INSERT INTO cache_entries (...)                 │  │
│  │                                                      │  │
│  │  5. Return report                                   │  │
│  └───────────────────────────┬──────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              runStockGraph("AAPL")                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Initial State:                                      │  │
│  │  {                                                   │  │
│  │    state: {                                          │  │
│  │      symbol: "AAPL",                                 │  │
│  │      agentStates: []                                 │  │
│  │    }                                                 │  │
│  │  }                                                   │  │
│  └───────────────────────────┬──────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              INPUT NODE                                      │
│  • Normalizes symbol to uppercase                          │
│  • Returns: { state: { symbol: "AAPL", ... } }            │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              AGGREGATE NODE                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Parallel Execution (Promise.allSettled):           │  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │EarningsAgent │  │FilingsAgent  │               │  │
│  │  │              │  │              │               │  │
│  │  │→ finnhubTool │  │→ secTool     │               │  │
│  │  │→ finnhubSvc  │  │→ secService  │               │  │
│  │  │→ Finnhub API │  │→ SEC API     │               │  │
│  │  └──────┬───────┘  └──────┬───────┘               │  │
│  │         │                 │                         │  │
│  │  ┌──────┴───────┐  ┌──────┴───────┐               │  │
│  │  │Performance   │  │AnalystAgent  │               │  │
│  │  │Agent         │  │              │               │  │
│  │  │              │  │→ analystTool │               │  │
│  │  │→ yahooTool   │  │→ finnhubTool │               │  │
│  │  │→ yahooSvc    │  │→ finnhubSvc  │               │  │
│  │  │→ Alpha Vant. │  │→ Finnhub API │               │  │
│  │  └──────┬───────┘  └──────┬───────┘               │  │
│  │         │                 │                         │  │
│  │         └────────┬─────────┘                        │  │
│  │                  │                                   │  │
│  │         ┌────────┴─────────┐                        │  │
│  │         │   NewsAgent      │                        │  │
│  │         │                  │                        │  │
│  │         │→ newsTool        │                        │  │
│  │         │→ marketauxSvc   │                        │  │
│  │         │→ MarketAux API  │                        │  │
│  │         └──────────────────┘                        │  │
│  │                                                      │  │
│  │  Results collected:                                 │  │
│  │  {                                                   │  │
│  │    earnings: {...},                                  │  │
│  │    filings: [...],                                   │  │
│  │    overview: {...},                                  │  │
│  │    performance: {...},                               │  │
│  │    analystRatings: [...],                           │  │
│  │    news: [...],                                      │  │
│  │    agentStates: [...]                                │  │
│  │  }                                                   │  │
│  └───────────────────────────┬──────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              SUMMARIZER NODE                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Receives aggregated state                        │  │
│  │  2. Calls runSummarizerAgent(state)                  │  │
│  │  3. Uses OpenAI/Ollama to generate summary          │  │
│  │  4. Returns: {                                       │  │
│  │       ...channelState,  // Preserve all data         │  │
│  │       summary: "...",                                │  │
│  │       generatedAt: "2025-..."                        │  │
│  │     }                                                │  │
│  └───────────────────────────┬──────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              STATE REDUCER                                  │
│  • Merges state updates                                     │
│  • Concatenates agentStates arrays                          │
│  • Returns final merged state                               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              FINAL STATE                                    │
│  {                                                          │
│    symbol: "AAPL",                                          │
│    overview: {...},                                        │
│    performance: {...},                                      │
│    earnings: {...},                                         │
│    filings: [...],                                         │
│    analystRatings: [...],                                   │
│    news: [...],                                             │
│    summary: "AI-generated summary...",                     │
│    generatedAt: "2025-11-13T...",                          │
│    agentStates: [                                           │
│      { agent: "EarningsAgent", status: "success", ... },   │
│      { agent: "SECFilingsAgent", status: "success", ... }, │
│      ...                                                    │
│    ]                                                        │
│  }                                                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              CACHE & RETURN                                 │
│  • Save to PostgreSQL cache                                │
│  • Return JSON response to client                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. MCP Tools (`backend/mcp/`)

| Tool | Purpose | Service Used | API |
|------|---------|--------------|-----|
| `finnhubTool.js` | Earnings calendar, analyst recommendations | `finnhubService.js` | Finnhub API |
| `secTool.js` | Recent SEC filings (10-K, 10-Q, 8-K) | `secService.js` | SEC EDGAR API |
| `yahooTool.js` | Company profile, quote, historical prices | `yahooService.js` | Alpha Vantage API |
| `newsTool.js` | Recent news headlines with sentiment | `marketauxService.js` | MarketAux API |
| `analystTool.js` | Re-exports finnhub analyst recommendations | `finnhubService.js` | Finnhub API |

### 2. Agents (`backend/agents/`)

| Agent | MCP Tool Used | Output Field | Purpose |
|-------|---------------|-------------|---------|
| `EarningsAgent` | `finnhubTool.getEarningsData()` | `earnings` | Upcoming earnings dates |
| `SECFilingsAgent` | `secTool.fetchRecentFilings()` | `filings` | Recent SEC filings |
| `PerformanceAgent` | `yahooTool.fetchPerformanceBundle()` | `overview`, `performance` | Company profile & price data |
| `AnalystAgent` | `analystTool.fetchAnalystRecommendations()` | `analystRatings` | Analyst recommendation trends |
| `NewsAgent` | `newsTool.fetchNewsFeed()` | `news` | Recent news headlines |
| `SummarizerAgent` | N/A (uses OpenAI/Ollama) | `summary` | AI-generated summary |

### 3. Graph Nodes (`backend/graph/nodes/`)

| Node | Purpose | Input | Output |
|------|---------|-------|--------|
| `inputNode` | Normalize symbol | `{ symbol: "AAPL" }` | `{ state: { symbol: "AAPL", ... } }` |
| `aggregateNode` | Run all agents in parallel | `{ state: { symbol: "AAPL" } }` | `{ state: { earnings, filings, ... } }` |
| `summarizerNode` | Generate AI summary | `{ state: { earnings, filings, ... } }` | `{ state: { summary, ... } }` |

### 4. Services (`backend/services/`)

| Service | Purpose | External API |
|---------|---------|--------------|
| `finnhubService.js` | Earnings calendar, recommendations | Finnhub |
| `secService.js` | SEC filings lookup | SEC EDGAR |
| `yahooService.js` | Company profile, quotes, historical | Alpha Vantage |
| `marketauxService.js` | News headlines with sentiment | MarketAux |
| `orchestratorService.js` | Coordinates graph execution, caching | N/A |

---

## State Management

### State Schema

```typescript
interface StockState {
  symbol: string;
  overview: CompanyOverview | null;
  performance: PerformanceData | null;
  earnings: EarningsData | null;
  filings: SECFiling[];
  analystRatings: AnalystRating[];
  news: NewsArticle[];
  summary: string | null;
  generatedAt: string | null;
  agentStates: AgentState[];
}

interface AgentState {
  agent: string;           // "EarningsAgent", "SECFilingsAgent", etc.
  status: "success" | "error";
  durationMs: number;
  error?: string;
}
```

### State Flow Through Graph

```
Initial State (from inputNode):
┌─────────────────────────────────────┐
│ {                                    │
│   symbol: "AAPL",                   │
│   agentStates: []                   │
│ }                                    │
└─────────────────────────────────────┘
         │
         ▼
After AggregateNode:
┌─────────────────────────────────────┐
│ {                                    │
│   symbol: "AAPL",                   │
│   earnings: {...},                  │
│   filings: [...],                   │
│   overview: {...},                  │
│   performance: {...},                │
│   analystRatings: [...],            │
│   news: [...],                       │
│   agentStates: [                    │
│     { agent: "EarningsAgent", ... }, │
│     { agent: "SECFilingsAgent", ... },│
│     ...                              │
│   ]                                  │
│ }                                    │
└─────────────────────────────────────┘
         │
         ▼
After SummarizerNode:
┌─────────────────────────────────────┐
│ {                                    │
│   symbol: "AAPL",                   │
│   earnings: {...},                  │  ← Preserved
│   filings: [...],                   │  ← Preserved
│   overview: {...},                  │  ← Preserved
│   performance: {...},                │  ← Preserved
│   analystRatings: [...],            │  ← Preserved
│   news: [...],                       │  ← Preserved
│   summary: "AI-generated...",       │  ← Added
│   generatedAt: "2025-11-13...",    │  ← Added
│   agentStates: [                    │  ← Merged
│     ... (5 agent states),           │
│     { agent: "SummaryAgent", ... }   │
│   ]                                  │
│ }                                    │
└─────────────────────────────────────┘
```

### State Reducer Logic

The reducer handles:
1. **Field Merging**: Only updates fields that are explicitly set (not `undefined`)
2. **Array Concatenation**: Merges `agentStates` arrays from multiple nodes
3. **Null Preservation**: Prevents `null` from overwriting existing data
4. **State Wrapping**: Handles `{ state: { ... } }` format from nodes

---

## Key Design Patterns

### 1. **MCP Pattern**
- **Separation of Concerns**: MCP tools abstract API details
- **Reusability**: Tools can be used by multiple agents
- **Testability**: Easy to mock for unit tests

### 2. **Agent Pattern**
- **Dual Interface**: Both LangChain Tool and direct function
- **Error Handling**: Graceful degradation on failures
- **State Tracking**: Returns agent execution metadata

### 3. **Graph Orchestration Pattern**
- **Parallel Execution**: Agents run concurrently
- **State Accumulation**: State flows through nodes
- **Fault Tolerance**: Individual agent failures don't stop the graph

### 4. **Caching Pattern**
- **PostgreSQL Cache**: Reduces API calls
- **TTL-based Expiration**: 24-hour default cache
- **Cache Invalidation**: Force refresh option

---

## File Structure Reference

```
backend/
├── mcp/                    # MCP Tools (Data Fetching Layer)
│   ├── finnhubTool.js      # Earnings & Analyst data
│   ├── secTool.js          # SEC filings
│   ├── yahooTool.js        # Company profile & prices
│   ├── newsTool.js         # News headlines
│   └── analystTool.js      # Analyst recommendations
│
├── agents/                 # Agent Layer (LangChain Tools)
│   ├── earningsAgent.js    # Wraps finnhubTool
│   ├── filingsAgent.js     # Wraps secTool
│   ├── performanceAgent.js # Wraps yahooTool
│   ├── analystAgent.js     # Wraps analystTool
│   ├── newsAgent.js        # Wraps newsTool
│   └── summarizerAgent.js  # AI summary generation
│
├── graph/                  # LangGraph Orchestration
│   ├── stockGraph.js       # Graph definition & execution
│   └── nodes/
│       ├── inputNode.js    # Input normalization
│       ├── aggregateNode.js # Parallel agent execution
│       └── summarizerNode.js # Summary generation
│
├── services/               # Service Layer (API Clients)
│   ├── finnhubService.js   # Finnhub API client
│   ├── secService.js       # SEC EDGAR API client
│   ├── yahooService.js     # Alpha Vantage API client
│   ├── marketauxService.js # MarketAux API client
│   └── orchestratorService.js # Graph orchestration & caching
│
└── routes/                 # Express Routes
    └── stockReportRoute.js # GET /api/stock/:symbol
```

---

## Summary

This architecture implements a **multi-agent system** where:

1. **MCP Tools** provide a clean abstraction for data fetching
2. **Agents** wrap MCP tools with LangChain Tool interface
3. **LangGraph** orchestrates agents in parallel
4. **State flows** through nodes, accumulating data
5. **Caching** reduces external API calls
6. **Error handling** ensures graceful degradation

The system is **scalable**, **maintainable**, and **testable** due to clear separation of concerns and modular design.

