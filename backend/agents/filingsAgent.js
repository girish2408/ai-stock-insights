import { Tool } from 'langchain/tools';
import { fetchRecentFilings } from '../mcp/secTool.js';

export const filingsAgentTool = new Tool({
  name: 'SECFilingsAgent',
  description: 'Retrieve the latest SEC 10-K/10-Q/8-K filings for a stock symbol.',
  func: async (symbol) => {
    const result = await fetchRecentFilings(symbol);
    return JSON.stringify(result ?? []);
  }
});

export async function runFilingsAgent(symbol) {
  try {
    const result = await fetchRecentFilings(symbol);
    return result ?? [];
  } catch (err) {
    return [];
  }
}

export default filingsAgentTool;

