import { runAnalystAgent } from '../../agents/analystAgent.js';
import { appendAgentState, buildAgentError, buildAgentSuccess } from '../../utils/mergeResults.js';

const AGENT_NAME = 'AnalystAgent';

export default async function analystNode(state) {
  const startedAt = Date.now();
  // LangGraph passes the full state object, extract the channel value
  const channelState = state.state || state;
  const symbol = channelState.symbol;
  if (!symbol) {
    throw new Error('Symbol is required for analyst agent');
  }
  try {
    const data = await runAnalystAgent(symbol);
    const durationMs = Date.now() - startedAt;
    const returnValue = {
      analystRatings: data,
      agentStates: [buildAgentSuccess(AGENT_NAME, durationMs)]
    };
    console.log(`[${AGENT_NAME}] Returning object keys:`, Object.keys(returnValue));
    console.log(`[${AGENT_NAME}] AnalystRatings value type:`, Array.isArray(returnValue.analystRatings) ? `array with ${returnValue.analystRatings.length} items` : (returnValue.analystRatings ? 'present' : 'null'));
    return returnValue;
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    console.error(`[${AGENT_NAME}] Error:`, err.message);
    return {
      analystRatings: null,
      agentStates: [buildAgentError(AGENT_NAME, durationMs, err)]
    };
  }
}

