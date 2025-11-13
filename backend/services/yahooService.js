// Load environment variables first
import 'dotenv/config';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load .env from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Stock Data API wrapper using Alpha Vantage and Finnhub
 *
 * Alpha Vantage (Free tier): https://www.alphavantage.co/
 * - Company Overview: GET /query?function=OVERVIEW&symbol={symbol}
 * - Quote: GET /query?function=GLOBAL_QUOTE&symbol={symbol}
 * - Historical: GET /query?function=TIME_SERIES_DAILY&symbol={symbol}
 *
 * Finnhub (already integrated): Used for quote as fallback
 */

const { ALPHA_VANTAGE_API_KEY } = process.env;
// Use demo key if not set (limited but works for testing)
const alphaVantageKey = ALPHA_VANTAGE_API_KEY || 'demo';

if (!ALPHA_VANTAGE_API_KEY) {
  console.warn('[YahooService] ⚠️  ALPHA_VANTAGE_API_KEY is not set - using demo key (limited functionality)');
}

const alphaVantageClient = axios.create({
  baseURL: 'https://www.alphavantage.co/query',
  timeout: 15000
});

export async function getCompanyProfile(symbol) {
  console.log(`[YahooService] Getting company profile for symbol: ${symbol}`);
  
  try {
    const response = await alphaVantageClient.get('', {
      params: {
        function: 'OVERVIEW',
        symbol: symbol.toUpperCase(),
        apikey: alphaVantageKey
      }
    });
    
    console.log(`[YahooService] Profile API Response Status: ${response.status}`);
    
    if (response.data.Note || response.data['Error Message']) {
      console.warn(`[YahooService] Alpha Vantage API limit reached or error:`, response.data.Note || response.data['Error Message']);
      return null;
    }
    
    const data = response.data;
    if (!data || !data.Symbol) {
      console.log(`[YahooService] No profile data found for ${symbol}`);
      return null;
    }
    
    // Map Alpha Vantage format to our expected format
    const profile = {
      symbol: data.Symbol,
      companyName: data.Name,
      description: data.Description,
      industry: data.Industry,
      sector: data.Sector,
      ceo: data.CEO || null,
      website: data.Website || null,
      exchangeShortName: data.Exchange,
      marketCap: data.MarketCapitalization ? parseInt(data.MarketCapitalization) : null,
      currency: 'USD',
      country: data.Country,
      fullTimeEmployees: data.FullTimeEmployees
    };
    
    console.log(`[YahooService] Profile Result: Found for ${symbol}`);
    return profile;
  } catch (err) {
    console.error(`[YahooService] Profile API Error:`, err.message);
    console.error(`[YahooService] Profile API Error Details:`, err.response?.data || err.message);
    return null;
  }
}

export async function getQuote(symbol) {
  console.log(`[YahooService] Getting quote for symbol: ${symbol}`);
  
  try {
    const response = await alphaVantageClient.get('', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: alphaVantageKey
      }
    });
    
    console.log(`[YahooService] Quote API Response Status: ${response.status}`);
    
    if (response.data.Note || response.data['Error Message']) {
      console.warn(`[YahooService] Alpha Vantage API limit reached or error:`, response.data.Note || response.data['Error Message']);
      return null;
    }
    
    const quoteData = response.data['Global Quote'];
    if (!quoteData || !quoteData['01. symbol']) {
      console.log(`[YahooService] No quote data found for ${symbol}`);
      return null;
    }
    
    // Map Alpha Vantage format to our expected format
    const quote = {
      symbol: quoteData['01. symbol'],
      price: parseFloat(quoteData['05. price']) || null,
      change: parseFloat(quoteData['09. change']) || null,
      changesPercentage: parseFloat(quoteData['10. change percent']?.replace('%', '')) || null,
      volume: parseInt(quoteData['06. volume']) || null,
      marketCap: null, // Not available in GLOBAL_QUOTE
      currency: 'USD',
      high: parseFloat(quoteData['03. high']) || null,
      low: parseFloat(quoteData['04. low']) || null,
      open: parseFloat(quoteData['02. open']) || null,
      previousClose: parseFloat(quoteData['08. previous close']) || null
    };
    
    console.log(`[YahooService] Quote Result: Found for ${symbol}, price: ${quote.price}`);
    return quote;
  } catch (err) {
    console.error(`[YahooService] Quote API Error:`, err.message);
    console.error(`[YahooService] Quote API Error Details:`, err.response?.data || err.message);
    return null;
  }
}

export async function getHistoricalPrice(symbol, days = 30) {
  console.log(`[YahooService] Getting historical prices for symbol: ${symbol}, days: ${days}`);
  
  try {
    const response = await alphaVantageClient.get('', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol.toUpperCase(),
        apikey: alphaVantageKey,
        outputsize: days > 100 ? 'full' : 'compact'
      }
    });
    
    console.log(`[YahooService] Historical API Response Status: ${response.status}`);
    
    if (response.data.Note || response.data['Error Message']) {
      console.warn(`[YahooService] Alpha Vantage API limit reached or error:`, response.data.Note || response.data['Error Message']);
      return [];
    }
    
    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) {
      console.log(`[YahooService] No historical data found for ${symbol}`);
      return [];
    }
    
    // Convert Alpha Vantage format to our expected format
    const historical = Object.entries(timeSeries)
      .slice(0, days) // Limit to requested days
      .map(([date, data]) => ({
        date,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume'])
      }))
      .reverse(); // Reverse to get chronological order (oldest first)
    
    console.log(`[YahooService] Historical count: ${historical.length} days`);
    return historical;
  } catch (err) {
    console.error(`[YahooService] Historical API Error:`, err.message);
    console.error(`[YahooService] Historical API Error Details:`, err.response?.data || err.message);
    return [];
  }
}

