// ============================================================
// FluxNSE API Service Layer
// ============================================================
// This service handles all API calls. When ENABLE_LIVE_DATA is false,
// it returns simulated data. When true, it calls the configured API.
//
// To integrate your own API:
// 1. Open src/config/api.ts
// 2. Add your API key
// 3. Set ENABLE_LIVE_DATA = true
// ============================================================

import { API_CONFIG, SYMBOL_MAP, type ApiProvider } from '../config/api';
import { stocks, generateChartData, generateIntradayData, generateOrderBook, generateRecentTrades } from '../data/stockData';

// ---------- Types ----------
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: string;
  marketCap: string;
}

export interface ChartPoint {
  time: string;
  price: number;
  volume: number;
}

export interface OrderBookData {
  bids: { orders: number; quantity: string; price: number; total: string; barWidth: number }[];
  asks: { orders: number; quantity: string; price: number; total: string; barWidth: number }[];
  spread: number;
  spreadPercent: number;
}

// ---------- Cache ----------
const cache = new Map<string, { data: unknown; timestamp: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < API_CONFIG.CACHE_DURATION) {
    return entry.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

// ---------- Helper: Get mapped symbol ----------
function getMappedSymbol(symbol: string, provider: ApiProvider): string {
  const mapping = SYMBOL_MAP[symbol];
  if (!mapping) return symbol;
  switch (provider) {
    case 'alpha_vantage': return mapping.alphav;
    case 'twelve_data': return mapping.twelve;
    case 'finnhub': return mapping.finnhub;
    case 'yahoo': return mapping.yahoo;
    default: return symbol;
  }
}

// ---------- API Fetchers ----------

async function fetchAlphaVantageQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const mapped = getMappedSymbol(symbol, 'alpha_vantage');
    const url = `${API_CONFIG.ALPHA_VANTAGE.BASE_URL}?function=GLOBAL_QUOTE&symbol=${mapped}&apikey=${API_CONFIG.ALPHA_VANTAGE.API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const q = data['Global Quote'];
    if (!q) return null;
    
    const stock = stocks.find(s => s.symbol === symbol);
    return {
      symbol,
      name: stock?.name || symbol,
      price: parseFloat(q['05. price']),
      change: parseFloat(q['09. change']),
      changePercent: parseFloat(q['10. change percent']?.replace('%', '')),
      open: parseFloat(q['02. open']),
      high: parseFloat(q['03. high']),
      low: parseFloat(q['04. low']),
      prevClose: parseFloat(q['08. previous close']),
      volume: q['06. volume'],
      marketCap: stock?.marketCap || 'N/A',
    };
  } catch (err) {
    console.error('Alpha Vantage fetch error:', err);
    return null;
  }
}

async function fetchTwelveDataQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const mapped = getMappedSymbol(symbol, 'twelve_data');
    const url = `${API_CONFIG.TWELVE_DATA.BASE_URL}/quote?symbol=${mapped}&apikey=${API_CONFIG.TWELVE_DATA.API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code) return null; // error response
    
    const stock = stocks.find(s => s.symbol === symbol);
    return {
      symbol,
      name: data.name || stock?.name || symbol,
      price: parseFloat(data.close),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change),
      open: parseFloat(data.open),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      prevClose: parseFloat(data.previous_close),
      volume: data.volume,
      marketCap: stock?.marketCap || 'N/A',
    };
  } catch (err) {
    console.error('Twelve Data fetch error:', err);
    return null;
  }
}

async function fetchFinnhubQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const mapped = getMappedSymbol(symbol, 'finnhub');
    const url = `${API_CONFIG.FINNHUB.BASE_URL}/quote?symbol=${mapped}&token=${API_CONFIG.FINNHUB.API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.c) return null;

    const stock = stocks.find(s => s.symbol === symbol);
    return {
      symbol,
      name: stock?.name || symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      open: data.o,
      high: data.h,
      low: data.l,
      prevClose: data.pc,
      volume: stock?.volume || 'N/A',
      marketCap: stock?.marketCap || 'N/A',
    };
  } catch (err) {
    console.error('Finnhub fetch error:', err);
    return null;
  }
}

async function fetchAlphaVantageChart(symbol: string, timeframe: string): Promise<ChartPoint[] | null> {
  try {
    const mapped = getMappedSymbol(symbol, 'alpha_vantage');
    let func = 'TIME_SERIES_DAILY';
    let seriesKey = 'Time Series (Daily)';
    
    if (timeframe === '1H' || timeframe === '1D') {
      func = 'TIME_SERIES_INTRADAY&interval=5min';
      seriesKey = 'Time Series (5min)';
    }

    const url = `${API_CONFIG.ALPHA_VANTAGE.BASE_URL}?function=${func}&symbol=${mapped}&apikey=${API_CONFIG.ALPHA_VANTAGE.API_KEY}&outputsize=full`;
    const res = await fetch(url);
    const data = await res.json();
    const series = data[seriesKey];
    if (!series) return null;

    const points: ChartPoint[] = Object.entries(series)
      .slice(0, 100)
      .reverse()
      .map(([time, values]: [string, unknown]) => ({
        time: time.split(' ').pop() || time,
        price: parseFloat((values as Record<string, string>)['4. close']),
        volume: parseInt((values as Record<string, string>)['5. volume']),
      }));

    return points;
  } catch (err) {
    console.error('Alpha Vantage chart error:', err);
    return null;
  }
}

// ---------- Main API Service ----------

export const apiService = {
  /**
   * Get a real-time quote for a stock
   */
  async getQuote(symbol: string): Promise<StockQuote> {
    // Check cache
    const cached = getCached<StockQuote>(`quote_${symbol}`);
    if (cached) return cached;

    // If live data is enabled, try API
    if (API_CONFIG.ENABLE_LIVE_DATA) {
      let quote: StockQuote | null = null;

      const primary = API_CONFIG.PRIMARY_PROVIDER;
      if (primary === 'alpha_vantage') quote = await fetchAlphaVantageQuote(symbol);
      else if (primary === 'twelve_data') quote = await fetchTwelveDataQuote(symbol);
      else if (primary === 'finnhub') quote = await fetchFinnhubQuote(symbol);

      // Try fallback if primary failed
      if (!quote) {
        const fallback = API_CONFIG.FALLBACK_PROVIDER;
        if (fallback === 'alpha_vantage') quote = await fetchAlphaVantageQuote(symbol);
        else if (fallback === 'twelve_data') quote = await fetchTwelveDataQuote(symbol);
        else if (fallback === 'finnhub') quote = await fetchFinnhubQuote(symbol);
      }

      if (quote) {
        setCache(`quote_${symbol}`, quote);
        return quote;
      }
    }

    // Fallback to simulated data
    const stock = stocks.find(s => s.symbol === symbol) || stocks[0];
    const simulated: StockQuote = {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      open: stock.open,
      high: stock.high,
      low: stock.low,
      prevClose: stock.prevClose,
      volume: stock.volume,
      marketCap: stock.marketCap,
    };
    setCache(`quote_${symbol}`, simulated);
    return simulated;
  },

  /**
   * Get chart data for a stock
   */
  async getChartData(symbol: string, timeframe: string): Promise<ChartPoint[]> {
    const cacheKey = `chart_${symbol}_${timeframe}`;
    const cached = getCached<ChartPoint[]>(cacheKey);
    if (cached) return cached;

    if (API_CONFIG.ENABLE_LIVE_DATA) {
      const data = await fetchAlphaVantageChart(symbol, timeframe);
      if (data) {
        setCache(cacheKey, data);
        return data;
      }
    }

    // Fallback to simulated chart data
    const stock = stocks.find(s => s.symbol === symbol) || stocks[0];
    const data = generateChartData(timeframe, stock.price);
    setCache(cacheKey, data);
    return data;
  },

  /**
   * Get intraday data for terminal
   */
  async getIntradayData(symbol: string): Promise<ChartPoint[]> {
    const stock = stocks.find(s => s.symbol === symbol) || stocks[0];
    return generateIntradayData(stock.price);
  },

  /**
   * Get order book data
   */
  async getOrderBook(_symbol: string): Promise<OrderBookData> {
    // Order book data is typically from exchange feeds
    // For now returns simulated data
    return generateOrderBook();
  },

  /**
   * Get recent trades
   */
  async getRecentTrades(_symbol: string) {
    return generateRecentTrades();
  },

  /**
   * Get all stocks
   */
  getAllStocks() {
    return stocks;
  },

  /**
   * Check if live data is enabled
   */
  isLiveEnabled(): boolean {
    return API_CONFIG.ENABLE_LIVE_DATA;
  },

  /**
   * Check if market is open (IST)
   */
  isMarketOpen(): boolean {
    const now = new Date();
    const istOffset = 5.5 * 60; // IST is UTC+5:30
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const istMinutes = utcMinutes + istOffset;
    
    const openMinutes = API_CONFIG.MARKET_OPEN_HOUR * 60 + API_CONFIG.MARKET_OPEN_MINUTE;
    const closeMinutes = API_CONFIG.MARKET_CLOSE_HOUR * 60 + API_CONFIG.MARKET_CLOSE_MINUTE;
    
    const day = now.getUTCDay();
    const isWeekday = day >= 1 && day <= 5;
    
    return isWeekday && istMinutes >= openMinutes && istMinutes <= closeMinutes;
  },
};

export default apiService;
