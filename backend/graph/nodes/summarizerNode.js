import { runSummarizerAgent } from '../../agents/summarizerAgent.js';
import { appendAgentState, buildAgentError, buildAgentSuccess } from '../../utils/mergeResults.js';

const AGENT_NAME = 'SummaryAgent';

export default async function summarizerNode(state) {
  const startedAt = Date.now();
  // LangGraph passes the full state object, extract the channel value
  const channelState = state.state || state;
  
  console.log(`[${AGENT_NAME}] Received state with data:`, {
    earnings: channelState?.earnings ? 'present' : 'null',
    filings: channelState?.filings ? `present (${Array.isArray(channelState.filings) ? channelState.filings.length : '?'})` : 'null',
    analystRatings: channelState?.analystRatings ? `present (${Array.isArray(channelState.analystRatings) ? channelState.analystRatings.length : '?'})` : 'null',
    news: channelState?.news ? `present (${Array.isArray(channelState.news) ? channelState.news.length : '?'})` : 'null',
    overview: channelState?.overview ? 'present' : 'null',
    performance: channelState?.performance ? 'present' : 'null'
  });
  
  try {
    const summary = await runSummarizerAgent(channelState);
    const durationMs = Date.now() - startedAt;
    
    // CRITICAL: Preserve ALL existing state data, only add summary and generatedAt
    console.log(`[${AGENT_NAME}] 🔄 PRESERVING STATE: Keeping all existing data and adding summary`);
    const returnValue = {
      // Preserve all existing data
      symbol: channelState?.symbol || '',
      earnings: channelState?.earnings !== undefined ? channelState.earnings : null,
      filings: channelState?.filings !== undefined ? channelState.filings : null,
      analystRatings: channelState?.analystRatings !== undefined ? channelState.analystRatings : null,
      news: channelState?.news !== undefined ? channelState.news : null,
      overview: channelState?.overview !== undefined ? channelState.overview : null,
      performance: channelState?.performance !== undefined ? channelState.performance : null,
      // Add new fields
      summary,
      generatedAt: new Date().toISOString(),
      // Merge agent states
      agentStates: [...(channelState?.agentStates || []), buildAgentSuccess(AGENT_NAME, durationMs)]
    };
    
    console.log(`[${AGENT_NAME}] ✅ PRESERVED STATE:`, {
      earnings: returnValue.earnings ? '✅ preserved' : '❌ null',
      filings: returnValue.filings ? `✅ preserved (${Array.isArray(returnValue.filings) ? returnValue.filings.length : '?'})` : '❌ null',
      analystRatings: returnValue.analystRatings ? `✅ preserved (${Array.isArray(returnValue.analystRatings) ? returnValue.analystRatings.length : '?'})` : '❌ null',
      news: returnValue.news ? `✅ preserved (${Array.isArray(returnValue.news) ? returnValue.news.length : '?'})` : '❌ null',
      overview: returnValue.overview ? '✅ preserved' : '❌ null',
      performance: returnValue.performance ? '✅ preserved' : '❌ null',
      summary: returnValue.summary ? '✅ added' : '❌ null'
    });
    
    console.log(`[${AGENT_NAME}] Returning state with:`, {
      earnings: returnValue.earnings ? 'present' : 'null',
      filings: returnValue.filings ? `present (${Array.isArray(returnValue.filings) ? returnValue.filings.length : '?'})` : 'null',
      analystRatings: returnValue.analystRatings ? `present (${Array.isArray(returnValue.analystRatings) ? returnValue.analystRatings.length : '?'})` : 'null',
      news: returnValue.news ? `present (${Array.isArray(returnValue.news) ? returnValue.news.length : '?'})` : 'null',
      overview: returnValue.overview ? 'present' : 'null',
      performance: returnValue.performance ? 'present' : 'null',
      summary: returnValue.summary ? 'present' : 'null',
      agentStates: returnValue.agentStates.length
    });
    
    // CRITICAL: LangGraph expects nodes to return updates in { state: { ... } } format
    console.log(`[${AGENT_NAME}] 🔄 RETURNING STATE UPDATE wrapped in { state: { ... } }`);
    return { state: returnValue };
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    console.error(`[${AGENT_NAME}] Error:`, err.message);
    
    // Even on error, preserve all existing state
    // CRITICAL: LangGraph expects nodes to return updates in { state: { ... } } format
    return {
      state: {
        // Preserve all existing data
        symbol: channelState?.symbol || '',
        earnings: channelState?.earnings !== undefined ? channelState.earnings : null,
        filings: channelState?.filings !== undefined ? channelState.filings : null,
        analystRatings: channelState?.analystRatings !== undefined ? channelState.analystRatings : null,
        news: channelState?.news !== undefined ? channelState.news : null,
        overview: channelState?.overview !== undefined ? channelState.overview : null,
        performance: channelState?.performance !== undefined ? channelState.performance : null,
        // Add error info
        agentStates: [...(channelState?.agentStates || []), buildAgentError(AGENT_NAME, durationMs, err)],
        summary: channelState.summary ?? `Unable to generate summary for ${channelState.symbol}.`
      }
    };
  }
}

