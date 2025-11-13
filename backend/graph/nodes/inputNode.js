export default async function inputNode(state) {
  // LangGraph passes the full state object, extract the channel value
  const channelState = state.state || state;
  const symbol = (channelState.symbol ?? '').toUpperCase();
  console.log(`[InputNode] Normalized symbol: ${symbol}`);
  // CRITICAL: LangGraph expects nodes to return updates in { state: { ... } } format
  return {
    state: {
      symbol,
      agentStates: channelState.agentStates ?? []
    }
  };
}

