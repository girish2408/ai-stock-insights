import { Tool } from 'langchain/tools';
import { fetchAnalystRecommendations } from '../mcp/analystTool.js';

export const analystAgentTool = new Tool({
  name: 'AnalystAgent',
  description: 'Collect analyst recommendation trends from Finnhub for a stock symbol.',
  func: async (symbol) => {
    const result = await fetchAnalystRecommendations(symbol);
    return JSON.stringify(result ?? []);
  }
});

export async function runAnalystAgent(symbol) {
  try {
    const result = await fetchAnalystRecommendations(symbol);
    return result ?? [];
  } catch (err) {
    return [];
  }
}

export default analystAgentTool;

