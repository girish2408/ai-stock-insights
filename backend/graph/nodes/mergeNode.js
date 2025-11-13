// Merge node that manually collects all parallel node outputs
// When multiple nodes feed into the same target, LangGraph collects their outputs
// but the reducer might not be called for each one. This node manually aggregates everything.
export default async function mergeNode(state) {
  console.log(`\n[MergeNode] ===== COLLECTING ALL DATA =====`);
  console.log(`[MergeNode] Received state:`, JSON.stringify(state, null, 2));
  
  // Extract channel state
  const channelState = state.state || state;
  
  // Manually collect all data fields - preserve whatever is in the state
  // The state should contain merged outputs from all parallel nodes
  const aggregatedState = {
    symbol: channelState?.symbol || '',
    // Preserve all data fields - don't overwrite with null if they exist
    earnings: channelState?.earnings !== undefined ? channelState.earnings : null,
    filings: channelState?.filings !== undefined ? channelState.filings : null,
    analystRatings: channelState?.analystRatings !== undefined ? channelState.analystRatings : null,
    news: channelState?.news !== undefined ? channelState.news : null,
    overview: channelState?.overview !== undefined ? channelState.overview : null,
    performance: channelState?.performance !== undefined ? channelState.performance : null,
    agentStates: channelState?.agentStates || []
  };
  
  console.log(`[MergeNode] Aggregated state:`, {
    symbol: aggregatedState.symbol,
    earnings: aggregatedState.earnings ? (typeof aggregatedState.earnings === 'object' ? 'object' : 'present') : 'null',
    filings: aggregatedState.filings ? (Array.isArray(aggregatedState.filings) ? `array[${aggregatedState.filings.length}]` : 'present') : 'null',
    analystRatings: aggregatedState.analystRatings ? (Array.isArray(aggregatedState.analystRatings) ? `array[${aggregatedState.analystRatings.length}]` : 'present') : 'null',
    news: aggregatedState.news ? (Array.isArray(aggregatedState.news) ? `array[${aggregatedState.news.length}]` : 'present') : 'null',
    overview: aggregatedState.overview ? 'object' : 'null',
    performance: aggregatedState.performance ? 'object' : 'null',
    agentStates: aggregatedState.agentStates.length
  });
  
  // Since LangGraph might not be calling reducer for parallel outputs,
  // we need to check if we're receiving the data in a different format
  // Check if state has direct properties (not nested in state.state)
  if (state.earnings !== undefined || state.filings !== undefined || state.news !== undefined) {
    console.log(`[MergeNode] Found data in top-level state!`);
    aggregatedState.earnings = state.earnings !== undefined ? state.earnings : aggregatedState.earnings;
    aggregatedState.filings = state.filings !== undefined ? state.filings : aggregatedState.filings;
    aggregatedState.analystRatings = state.analystRatings !== undefined ? state.analystRatings : aggregatedState.analystRatings;
    aggregatedState.news = state.news !== undefined ? state.news : aggregatedState.news;
    aggregatedState.overview = state.overview !== undefined ? state.overview : aggregatedState.overview;
    aggregatedState.performance = state.performance !== undefined ? state.performance : aggregatedState.performance;
  }
  
  console.log(`[MergeNode] Final aggregated state:`, JSON.stringify(aggregatedState, null, 2));
  console.log(`[MergeNode] ===== END COLLECTION =====\n`);
  
  // Return the aggregated state - this will trigger the reducer
  return aggregatedState;
}

