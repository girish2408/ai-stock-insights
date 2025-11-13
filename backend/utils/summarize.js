import axios from 'axios';

const { OPENAI_API_KEY, OLLAMA_ENDPOINT } = process.env;

async function summarizeWithOpenAI(text) {
  const prompt = `Summarize the following financial disclosure or news article in 3 concise bullet points:\n\n${text}`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a financial analyst.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 180
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  return response.data?.choices?.[0]?.message?.content?.trim();
}

async function summarizeWithOllama(text) {
  const response = await axios.post(
    OLLAMA_ENDPOINT ?? 'http://localhost:11434/api/generate',
    {
      model: 'llama2',
      prompt: `Summarize the following financial disclosure or news article in 3 concise bullet points:\n\n${text}`,
      stream: false
    },
    { timeout: 15000 }
  );

  if (response.data?.response) {
    return response.data.response.trim();
  }
  return null;
}

export async function summarizeText(text) {
  if (!text) return null;

  try {
    if (OPENAI_API_KEY) {
      return await summarizeWithOpenAI(text);
    }
    if (OLLAMA_ENDPOINT) {
      return await summarizeWithOllama(text);
    }
  } catch (err) {
    console.error('Summarization failed', err);
  }

  const truncated = text.length > 280 ? `${text.slice(0, 280)}…` : text;
  return `Summary unavailable. Here's a snippet:\n${truncated}`;
}

