import { Tool } from 'langchain/tools';
import { getEarningsData } from '../mcp/finnhubTool.js';

export const earningsAgentTool = new Tool({
  name: 'EarningsAgent',
  description: 'Fetch upcoming earnings for a stock symbol via Finnhub.',
  func: async (symbol) => {
    const result = await getEarningsData(symbol);
    return JSON.stringify(result ?? null);
  }
});

export async function runEarningsAgent(symbol) {
  try {
    const result = await getEarningsData(symbol);
    return result ?? null;
  } catch (err) {
    return null;
  }
}

export default earningsAgentTool;

