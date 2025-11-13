import axios from 'axios';
import { summarizeText } from '../utils/summarize.js';

/**
 * SEC EDGAR data access
 *
 * Docs: https://www.sec.gov/edgar/sec-api-documentation
 * - Company submissions: https://data.sec.gov/submissions/CIK##########.json
 *   Contains recent filings with metadata (form, filingDate, accessionNumber, etc.)
 * - Ticker directory: https://www.sec.gov/files/company_tickers.json (used to map symbol ➝ CIK)
 *
 * The SEC requires a descriptive User-Agent header with contact information.
 */

const SEC_HEADERS = {
  'User-Agent':
    process.env.SEC_USER_AGENT ??
    'ai-stock-insights/1.0 (contact: you@example.com)',
  Accept: 'application/json'
};

let tickerDirectory;

async function loadTickerDirectory() {
  if (tickerDirectory) return tickerDirectory;
  const response = await axios.get(
    'https://www.sec.gov/files/company_tickers.json',
    { headers: SEC_HEADERS, timeout: 15000 }
  );

  const directory = {};
  Object.values(response.data).forEach((item) => {
    directory[item.ticker.toUpperCase()] = {
      cik: item.cik_str.toString().padStart(10, '0'),
      title: item.title
    };
  });
  tickerDirectory = directory;
  return tickerDirectory;
}

async function getCikForSymbol(symbol) {
  const directory = await loadTickerDirectory();
  const entry = directory[symbol.toUpperCase()];
  if (!entry) {
    throw new Error(`No CIK found for symbol ${symbol}`);
  }
  return entry;
}

async function downloadFilingSnippet(cik, accessionNumber, primaryDocument) {
  if (!primaryDocument) return null;
  const accessionPath = accessionNumber.replace(/-/g, '');
  const url = `https://www.sec.gov/Archives/edgar/data/${Number(
    cik
  )}/${accessionPath}/${primaryDocument}`;

  try {
    const response = await axios.get(url, {
      headers: {
        ...SEC_HEADERS,
        Accept: 'text/html,application/xhtml+xml'
      },
      timeout: 15000
    });

    const text = response.data;
    if (typeof text !== 'string') return null;
    return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000);
  } catch (err) {
    console.warn(`Failed to fetch filing body for ${url}`, err.message);
    return null;
  }
}

export async function getRecentFilings(symbol) {
  console.log(`[SECService] Getting filings for symbol: ${symbol}`);
  try {
    const { cik, title } = await getCikForSymbol(symbol);
    console.log(`[SECService] Found CIK: ${cik} for symbol: ${symbol}`);

    const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
    console.log(`[SECService] Calling API: ${url}`);
    const response = await axios.get(url, {
      headers: SEC_HEADERS,
      timeout: 15000
    });
    console.log(`[SECService] SEC API Response Status: ${response.status}`);
    console.log(`[SECService] SEC API Response Data keys:`, Object.keys(response.data || {}));
    console.log(`[SECService] Filings recent keys:`, Object.keys(response.data?.filings?.recent || {}));

    const filings = response.data?.filings?.recent;
    if (!filings) {
      return [];
    }

    const targetForms = new Set(['10-K', '10-Q', '8-K']);
    const results = [];

    for (let i = 0; i < filings.form.length; i += 1) {
      const form = filings.form[i];
      if (!targetForms.has(form)) continue;

      const filing = {
        cik,
        companyName: title,
        form,
        filingDate: filings.filingDate[i],
        reportDate: filings.reportDate[i],
        accessionNumber: filings.accessionNumber[i],
        primaryDocument: filings.primaryDocument[i],
        documentUrl: `https://www.sec.gov/Archives/edgar/data/${Number(
          cik
        )}/${filings.accessionNumber[i].replace(/-/g, '')}/${
          filings.primaryDocument[i]
        }`
      };

      const snippet = await downloadFilingSnippet(
        cik,
        filing.accessionNumber,
        filing.primaryDocument
      );
      filing.summary = snippet
        ? await summarizeText(snippet)
        : 'Summary unavailable.';

      results.push(filing);
      if (results.length >= 6) break;
    }

    console.log(`[SECService] Found ${results.length} filings for ${symbol}`);
    return results;
  } catch (err) {
    console.error(`[SECService] SEC API Error:`, err.message);
    console.error(`[SECService] SEC API Error Details:`, err.response?.data || err.message);
    throw err;
  }
}

