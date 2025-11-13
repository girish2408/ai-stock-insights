import { Tool } from 'langchain/tools';
import { fetchPerformanceBundle } from '../mcp/yahooTool.js';

export const performanceAgentTool = new Tool({
  name: 'PerformanceAgent',
  description: 'Retrieve profile, quote, and historical performance for a stock symbol.',
  func: async (symbol) => {
    const result = await fetchPerformanceBundle(symbol);
    return JSON.stringify(result ?? {});
  }
});

export async function runPerformanceAgent(symbol) {
  try {
    const result = await fetchPerformanceBundle(symbol);
    return result ?? null;
  } catch (err) {
    return null;
  }
}

export default performanceAgentTool;

