import { runFilingsAgent } from '../../agents/filingsAgent.js';
import { appendAgentState, buildAgentError, buildAgentSuccess } from '../../utils/mergeResults.js';

const AGENT_NAME = 'SECFilingsAgent';

export default async function filingsNode(state) {
  const startedAt = Date.now();
  // LangGraph passes the full state object, extract the channel value
  const channelState = state.state || state;
  const symbol = channelState.symbol;
  if (!symbol) {
    throw new Error('Symbol is required for filings agent');
  }
  try {
    const data = await runFilingsAgent(symbol);
    const durationMs = Date.now() - startedAt;
    const returnValue = {
      filings: data,
      agentStates: [buildAgentSuccess(AGENT_NAME, durationMs)]
    };
    console.log(`[${AGENT_NAME}] Returning object keys:`, Object.keys(returnValue));
    console.log(`[${AGENT_NAME}] Filings value type:`, Array.isArray(returnValue.filings) ? `array with ${returnValue.filings.length} items` : (returnValue.filings ? 'present' : 'null'));
    return returnValue;
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    console.error(`[${AGENT_NAME}] Error:`, err.message);
    return {
      filings: null,
      agentStates: [buildAgentError(AGENT_NAME, durationMs, err)]
    };
  }
}

