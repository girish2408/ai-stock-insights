import { Tool } from 'langchain/tools';
import { fetchNewsFeed } from '../mcp/newsTool.js';

export const newsAgentTool = new Tool({
  name: 'NewsAgent',
  description: 'Fetch recent news headlines and sentiment for a stock symbol.',
  func: async (symbol) => {
    const result = await fetchNewsFeed(symbol);
    return JSON.stringify(result ?? []);
  }
});

export async function runNewsAgent(symbol) {
  try {
    const result = await fetchNewsFeed(symbol);
    return result ?? [];
  } catch (err) {
    return [];
  }
}

export default newsAgentTool;

