// Aggregate node that runs all agents in parallel and collects their results
// This bypasses LangGraph's reducer issues by manually collecting all data
import { runEarningsAgent } from '../../agents/earningsAgent.js';
import { runFilingsAgent } from '../../agents/filingsAgent.js';
import { runPerformanceAgent } from '../../agents/performanceAgent.js';
import { runAnalystAgent } from '../../agents/analystAgent.js';
import { runNewsAgent } from '../../agents/newsAgent.js';
import { buildAgentSuccess, buildAgentError } from '../../utils/mergeResults.js';

export default async function aggregateNode(state) {
  const startedAt = Date.now();
  const channelState = state.state || state;
  const symbol = channelState.symbol;
  
  console.log(`\n[AggregateNode] ===== RUNNING ALL AGENTS IN PARALLEL =====`);
  console.log(`[AggregateNode] Symbol: ${symbol}`);
  
  if (!symbol) {
    throw new Error('Symbol is required for aggregation');
  }
  
  // Run all agents in parallel
  const results = await Promise.allSettled([
    (async () => {
      const agentStart = Date.now();
      try {
        const data = await runEarningsAgent(symbol);
        const durationMs = Date.now() - agentStart;
        console.log(`[AggregateNode] EarningsAgent completed in ${durationMs}ms:`, data ? 'present' : 'null');
        return { 
          earnings: data, 
          agentState: buildAgentSuccess('EarningsAgent', durationMs) 
        };
      } catch (err) {
        const durationMs = Date.now() - agentStart;
        console.error(`[AggregateNode] EarningsAgent error:`, err.message);
        return { 
          earnings: null, 
          agentState: buildAgentError('EarningsAgent', durationMs, err) 
        };
      }
    })(),
    
    (async () => {
      const agentStart = Date.now();
      try {
        const data = await runFilingsAgent(symbol);
        const durationMs = Date.now() - agentStart;
        console.log(`[AggregateNode] SECFilingsAgent completed in ${durationMs}ms:`, data ? `present (${Array.isArray(data) ? data.length : '?'} items)` : 'null');
        return { 
          filings: data, 
          agentState: buildAgentSuccess('SECFilingsAgent', durationMs) 
        };
      } catch (err) {
        const durationMs = Date.now() - agentStart;
        console.error(`[AggregateNode] SECFilingsAgent error:`, err.message);
        return { 
          filings: null, 
          agentState: buildAgentError('SECFilingsAgent', durationMs, err) 
        };
      }
    })(),
    
    (async () => {
      const agentStart = Date.now();
      try {
        const bundle = await runPerformanceAgent(symbol);
        const durationMs = Date.now() - agentStart;
        
        const profile = bundle?.profile ?? null;
        const quote = bundle?.quote ?? null;
        const historical = bundle?.historical ?? [];
        
        // Map to expected format
        const overview = {
          symbol: symbol,
          companyName: profile?.companyName || profile?.Name || null,
          description: profile?.description || profile?.Description || null,
          industry: profile?.industry || profile?.Industry || null,
          sector: profile?.sector || profile?.Sector || null,
          ceo: profile?.ceo || profile?.CEO || null,
          website: profile?.website || profile?.Website || null,
          exchange: profile?.exchangeShortName || profile?.Exchange || profile?.exchange || null,
          marketCap: quote?.marketCap || profile?.marketCap || (profile?.MarketCapitalization ? parseInt(profile.MarketCapitalization) : null),
          currency: quote?.currency || 'USD',
          price: quote?.price || null,
          change: quote?.change || null,
          changesPercentage: quote?.changesPercentage || null,
          volume: quote?.volume || null
        };
        
        const formattedHistorical = Array.isArray(historical) ? historical.map(item => ({
          date: item.date,
          close: item.close || item.Close || null,
          open: item.open || item.Open || null,
          high: item.high || item.High || null,
          low: item.low || item.Low || null,
          volume: item.volume || item.Volume || null
        })) : [];
        
        console.log(`[AggregateNode] PerformanceAgent completed in ${durationMs}ms:`, {
          overview: overview.companyName ? 'present' : 'null',
          performance: bundle ? 'present' : 'null',
          historical: formattedHistorical.length
        });
        
        return { 
          overview, 
          performance: {
            profile,
            quote,
            historical: formattedHistorical
          },
          agentState: buildAgentSuccess('PerformanceAgent', durationMs) 
        };
      } catch (err) {
        const durationMs = Date.now() - agentStart;
        console.error(`[AggregateNode] PerformanceAgent error:`, err.message);
        return { 
          overview: null, 
          performance: null,
          agentState: buildAgentError('PerformanceAgent', durationMs, err) 
        };
      }
    })(),
    
    (async () => {
      const agentStart = Date.now();
      try {
        const data = await runAnalystAgent(symbol);
        const durationMs = Date.now() - agentStart;
        console.log(`[AggregateNode] AnalystAgent completed in ${durationMs}ms:`, data ? `present (${Array.isArray(data) ? data.length : '?'} items)` : 'null');
        return { 
          analystRatings: data, 
          agentState: buildAgentSuccess('AnalystAgent', durationMs) 
        };
      } catch (err) {
        const durationMs = Date.now() - agentStart;
        console.error(`[AggregateNode] AnalystAgent error:`, err.message);
        return { 
          analystRatings: null, 
          agentState: buildAgentError('AnalystAgent', durationMs, err) 
        };
      }
    })(),
    
    (async () => {
      const agentStart = Date.now();
      try {
        const data = await runNewsAgent(symbol);
        const durationMs = Date.now() - agentStart;
        console.log(`[AggregateNode] NewsAgent completed in ${durationMs}ms:`, data ? `present (${Array.isArray(data) ? data.length : '?'} items)` : 'null');
        return { 
          news: data, 
          agentState: buildAgentSuccess('NewsAgent', durationMs) 
        };
      } catch (err) {
        const durationMs = Date.now() - agentStart;
        console.error(`[AggregateNode] NewsAgent error:`, err.message);
        return { 
          news: null, 
          agentState: buildAgentError('NewsAgent', durationMs, err) 
        };
      }
    })()
  ]);
  
  // Aggregate all results
  const aggregated = {
    symbol: symbol,
    earnings: null,
    filings: null,
    analystRatings: null,
    news: null,
    overview: null,
    performance: null,
    agentStates: []
  };
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const data = result.value;
      if (data.earnings !== undefined) {
        console.log(`[AggregateNode] ✅ FILLING STATE: earnings =`, data.earnings ? (typeof data.earnings === 'object' ? 'object' : 'value') : 'null');
        aggregated.earnings = data.earnings;
      }
      if (data.filings !== undefined) {
        console.log(`[AggregateNode] ✅ FILLING STATE: filings =`, data.filings ? `array[${Array.isArray(data.filings) ? data.filings.length : '?'}]` : 'null');
        aggregated.filings = data.filings;
      }
      if (data.analystRatings !== undefined) {
        console.log(`[AggregateNode] ✅ FILLING STATE: analystRatings =`, data.analystRatings ? `array[${Array.isArray(data.analystRatings) ? data.analystRatings.length : '?'}]` : 'null');
        aggregated.analystRatings = data.analystRatings;
      }
      if (data.news !== undefined) {
        console.log(`[AggregateNode] ✅ FILLING STATE: news =`, data.news ? `array[${Array.isArray(data.news) ? data.news.length : '?'}]` : 'null');
        aggregated.news = data.news;
      }
      if (data.overview !== undefined) {
        console.log(`[AggregateNode] ✅ FILLING STATE: overview =`, data.overview ? 'object' : 'null');
        aggregated.overview = data.overview;
      }
      if (data.performance !== undefined) {
        console.log(`[AggregateNode] ✅ FILLING STATE: performance =`, data.performance ? 'object' : 'null');
        aggregated.performance = data.performance;
      }
      if (data.agentState) {
        console.log(`[AggregateNode] ✅ FILLING STATE: agentStates +=`, data.agentState.name || 'agent');
        aggregated.agentStates.push(data.agentState);
      }
    } else {
      console.error(`[AggregateNode] ❌ Agent ${index} failed:`, result.reason);
    }
  });
  
  const totalDuration = Date.now() - startedAt;
  console.log(`[AggregateNode] All agents completed in ${totalDuration}ms`);
  console.log(`[AggregateNode] Final aggregated data:`, {
    earnings: aggregated.earnings ? 'present' : 'null',
    filings: aggregated.filings ? `present (${Array.isArray(aggregated.filings) ? aggregated.filings.length : '?'})` : 'null',
    analystRatings: aggregated.analystRatings ? `present (${Array.isArray(aggregated.analystRatings) ? aggregated.analystRatings.length : '?'})` : 'null',
    news: aggregated.news ? `present (${Array.isArray(aggregated.news) ? aggregated.news.length : '?'})` : 'null',
    overview: aggregated.overview ? 'present' : 'null',
    performance: aggregated.performance ? 'present' : 'null',
    agentStates: aggregated.agentStates.length
  });
  
  // Log the actual return value structure
  console.log(`[AggregateNode] Returning object with keys:`, Object.keys(aggregated));
  console.log(`[AggregateNode] Returning full object:`, JSON.stringify(aggregated, null, 2));
  console.log(`[AggregateNode] ===== END AGGREGATION =====\n`);
  
  // CRITICAL: LangGraph expects nodes to return updates in { state: { ... } } format
  console.log(`[AggregateNode] 🔄 RETURNING STATE UPDATE:`, {
    earnings: aggregated.earnings ? '✅ present' : '❌ null',
    filings: aggregated.filings ? `✅ present (${Array.isArray(aggregated.filings) ? aggregated.filings.length : '?'})` : '❌ null',
    analystRatings: aggregated.analystRatings ? `✅ present (${Array.isArray(aggregated.analystRatings) ? aggregated.analystRatings.length : '?'})` : '❌ null',
    news: aggregated.news ? `✅ present (${Array.isArray(aggregated.news) ? aggregated.news.length : '?'})` : '❌ null',
    overview: aggregated.overview ? '✅ present' : '❌ null',
    performance: aggregated.performance ? '✅ present' : '❌ null',
    agentStates: `✅ ${aggregated.agentStates.length} agents`
  });
  
  return { state: aggregated };
}

