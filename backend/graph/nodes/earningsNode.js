import { runEarningsAgent } from '../../agents/earningsAgent.js';
import { appendAgentState, buildAgentError, buildAgentSuccess } from '../../utils/mergeResults.js';

const AGENT_NAME = 'EarningsAgent';

export default async function earningsNode(state) {
  const startedAt = Date.now();
  // LangGraph passes the full state object, extract the channel value
  const channelState = state.state || state;
  const symbol = channelState.symbol;
  console.log(`[${AGENT_NAME}] Executing for symbol: ${symbol}`);
  if (!symbol) {
    console.error(`[${AGENT_NAME}] ERROR: symbol is undefined! State:`, JSON.stringify(state, null, 2));
    throw new Error('Symbol is required for earnings agent');
  }
  try {
    const data = await runEarningsAgent(symbol);
    const durationMs = Date.now() - startedAt;
    console.log(`[${AGENT_NAME}] Success in ${durationMs}ms, data:`, data ? 'present' : 'null');
    console.log(`[${AGENT_NAME}] Data structure:`, {
      isObject: typeof data === 'object',
      hasEarningsCalendar: data?.earningsCalendar !== undefined,
      earningsCalendarLength: Array.isArray(data?.earningsCalendar) ? data.earningsCalendar.length : 'N/A',
      keys: data ? Object.keys(data) : []
    });
    const returnValue = {
      earnings: data,
      agentStates: [buildAgentSuccess(AGENT_NAME, durationMs)]
    };
    console.log(`[${AGENT_NAME}] Returning object:`, JSON.stringify(returnValue, null, 2));
    console.log(`[${AGENT_NAME}] Return value keys:`, Object.keys(returnValue));
    console.log(`[${AGENT_NAME}] Earnings value:`, returnValue.earnings ? (typeof returnValue.earnings === 'object' ? 'object' : 'value') : 'null');
    return returnValue;
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    console.error(`[${AGENT_NAME}] Error in ${durationMs}ms:`, err.message);
    return {
      earnings: null,
      agentStates: [buildAgentError(AGENT_NAME, durationMs, err)]
    };
  }
}

