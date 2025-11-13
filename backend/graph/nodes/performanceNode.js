import { runPerformanceAgent } from '../../agents/performanceAgent.js';
import { appendAgentState, buildAgentError, buildAgentSuccess } from '../../utils/mergeResults.js';

const AGENT_NAME = 'PerformanceAgent';

export default async function performanceNode(state) {
  const startedAt = Date.now();
  // LangGraph passes the full state object, extract the channel value
  const channelState = state.state || state;
  const symbol = channelState.symbol;
  console.log(`[${AGENT_NAME}] Executing for symbol: ${symbol}`);
  if (!symbol) {
    throw new Error('Symbol is required for performance agent');
  }
  try {
    const bundle = await runPerformanceAgent(symbol);
    const durationMs = Date.now() - startedAt;
    console.log(`[${AGENT_NAME}] Success in ${durationMs}ms, bundle:`, bundle ? 'present' : 'null');

    const profile = bundle?.profile ?? null;
    const quote = bundle?.quote ?? null;
    const historical = bundle?.historical ?? [];

    // Map Alpha Vantage profile fields to expected format
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

    // Map historical data to expected format (with date and close)
    const formattedHistorical = Array.isArray(historical) ? historical.map(item => ({
      date: item.date,
      close: item.close || item.Close || null,
      open: item.open || item.Open || null,
      high: item.high || item.High || null,
      low: item.low || item.Low || null,
      volume: item.volume || item.Volume || null
    })) : [];

    const returnValue = {
      overview,
      performance: {
        profile,
        quote,
        historical: formattedHistorical
      },
      agentStates: [buildAgentSuccess(AGENT_NAME, durationMs)]
    };
    
    console.log(`[${AGENT_NAME}] Returning object keys:`, Object.keys(returnValue));
    console.log(`[${AGENT_NAME}] Overview:`, overview ? 'present' : 'null');
    console.log(`[${AGENT_NAME}] Performance:`, returnValue.performance ? 'present' : 'null');
    
    return returnValue;
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    console.error(`[${AGENT_NAME}] Error in ${durationMs}ms:`, err.message);
    return {
      agentStates: [buildAgentError(AGENT_NAME, durationMs, err)]
    };
  }
}

