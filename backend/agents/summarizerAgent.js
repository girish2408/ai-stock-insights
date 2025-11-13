import { Tool } from 'langchain/tools';
import { ChatOpenAI } from '@langchain/openai';
import logger from '../utils/logger.js';

function buildSummaryPrompt(state) {
  return `
You are an AI financial analyst. Create a concise 3-5 bullet stock intelligence brief with an overall sentiment indicator (bullish, neutral, bearish).

Symbol: ${state.symbol}

Earnings Data:
${JSON.stringify(state.earnings ?? {}, null, 2)}

SEC Filings:
${JSON.stringify(state.filings ?? [], null, 2)}

Performance:
${JSON.stringify(state.performance ?? {}, null, 2)}

Analyst Ratings:
${JSON.stringify(state.analystRatings ?? [], null, 2)}

News:
${JSON.stringify(state.news ?? [], null, 2)}

Base your report strictly on the data provided.`;
}

let chatModel;

function getChatModel() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!chatModel) {
    chatModel = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.3,
      modelName: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo'
    });
  }
  return chatModel;
}

async function summarizeWithLLM(state) {
  const model = getChatModel();
  if (!model) return null;
  const prompt = buildSummaryPrompt(state);
  const response = await model.invoke(prompt);
  if (typeof response === 'string') {
    return response.trim();
  }
  const content = Array.isArray(response?.content) ? response.content : response?.text ?? '';
  return typeof content === 'string' ? content.trim() : JSON.stringify(content);
}

function fallbackSummary(state) {
  const lines = [];
  if (state.performance?.quote) {
    const quote = state.performance.quote;
    lines.push(
      `Price ${quote.price ?? 'N/A'} (${quote.changesPercentage ?? '0'}%) with volume ${quote.volume ?? 'N/A'}.`
    );
  }
  if (state.earnings?.earningsCalendar?.length) {
    const next = state.earnings.earningsCalendar[0];
    lines.push(
      `Next earnings ${next.date ?? 'TBD'}: EPS est ${next.epsEstimate ?? 'N/A'}, revenue est ${next.revenueEstimate ?? 'N/A'}.`
    );
  }
  if (Array.isArray(state.analystRatings) && state.analystRatings.length) {
    const latest = state.analystRatings[0];
    lines.push(
      `Analyst mix: Buy ${latest.buy ?? 0}, Hold ${latest.hold ?? 0}, Sell ${latest.sell ?? 0}.`
    );
  }
  if (Array.isArray(state.news) && state.news.length) {
    lines.push(`Recent news: ${state.news[0].title ?? 'Headline unavailable'}.`);
  }
  if (Array.isArray(state.filings) && state.filings.length) {
    lines.push(`Latest filing: ${state.filings[0].form ?? 'N/A'} on ${state.filings[0].filingDate ?? 'N/A'}.`);
  }
  if (!lines.length) {
    return `No sufficient data to summarize ${state.symbol}.`;
  }
  return `Summary for ${state.symbol}:\n- ${lines.join('\n- ')}`;
}

export const summarizerAgentTool = new Tool({
  name: 'SummaryAgent',
  description: 'Generate an analyst-style report from aggregated stock intelligence data.',
  func: async (input) => {
    let state;
    try {
      state = JSON.parse(input);
    } catch {
      throw new Error('Invalid state payload for summary agent.');
    }
    const summary = await summarizeWithLLM(state);
    return (summary ?? fallbackSummary(state)).trim();
  }
});

export async function runSummarizerAgent(state) {
  try {
    // Call the summarization logic directly instead of using Tool.func
    const summary = await summarizeWithLLM(state);
    return summary ?? fallbackSummary(state);
  } catch (err) {
    logger.warn({ agent: 'SummaryAgent', error: err.message }, 'Summary agent failed, using fallback');
    return fallbackSummary(state);
  }
}

export default summarizerAgentTool;

