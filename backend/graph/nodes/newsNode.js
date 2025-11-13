import { runNewsAgent } from '../../agents/newsAgent.js';
import { appendAgentState, buildAgentError, buildAgentSuccess } from '../../utils/mergeResults.js';

const AGENT_NAME = 'NewsAgent';

export default async function newsNode(state) {
  const startedAt = Date.now();
  // LangGraph passes the full state object, extract the channel value
  const channelState = state.state || state;
  const symbol = channelState.symbol;
  if (!symbol) {
    throw new Error('Symbol is required for news agent');
  }
  try {
    const data = await runNewsAgent(symbol);
    const durationMs = Date.now() - startedAt;
    const returnValue = {
      news: data,
      agentStates: [buildAgentSuccess(AGENT_NAME, durationMs)]
    };
    console.log(`[${AGENT_NAME}] Returning object keys:`, Object.keys(returnValue));
    console.log(`[${AGENT_NAME}] News value type:`, Array.isArray(returnValue.news) ? `array with ${returnValue.news.length} items` : (returnValue.news ? 'present' : 'null'));
    return returnValue;
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    console.error(`[${AGENT_NAME}] Error:`, err.message);
    return {
      news: null,
      agentStates: [buildAgentError(AGENT_NAME, durationMs, err)]
    };
  }
}

