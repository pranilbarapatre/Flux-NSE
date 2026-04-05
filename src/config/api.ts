// ============================================================
// FluxNSE API Configuration
// ============================================================
// 
// HOW TO USE:
// 1. Replace the placeholder API keys below with your actual keys
// 2. Set ENABLE_LIVE_DATA to true to use real API data
// 3. When ENABLE_LIVE_DATA is false, the app uses demo/simulated data
//
// SUPPORTED APIs:
// - NSE India (no key required, but CORS proxy needed)
// - Alpha Vantage (free tier: 5 req/min)
// - Twelve Data (free tier: 8 req/min)
// - Finnhub (free tier: 60 req/min)
// - Yahoo Finance (via RapidAPI)
//
// ============================================================

export const API_CONFIG = {
  // ==================== MASTER SWITCH ====================
  // Set to true when you have valid API keys configured
  ENABLE_LIVE_DATA: false,

  // ==================== API KEYS ====================
  
  // Alpha Vantage - Stock data, fundamentals, technicals
  // Get your free key at: https://www.alphavantage.co/support/#api-key
  ALPHA_VANTAGE: {
    API_KEY: 'YOUR_ALPHA_VANTAGE_API_KEY_HERE',
    BASE_URL: 'https://www.alphavantage.co/query',
    RATE_LIMIT: 5, // requests per minute (free tier)
  },

  // Twelve Data - Real-time & historical market data
  // Get your free key at: https://twelvedata.com/account/api-keys
  TWELVE_DATA: {
    API_KEY: 'YOUR_TWELVE_DATA_API_KEY_HERE',
    BASE_URL: 'https://api.twelvedata.com',
    RATE_LIMIT: 8, // requests per minute (free tier)
  },

  // Finnhub - Real-time stock prices, news, fundamentals
  // Get your free key at: https://finnhub.io/register
  FINNHUB: {
    API_KEY: 'YOUR_FINNHUB_API_KEY_HERE',
    BASE_URL: 'https://finnhub.io/api/v1',
    WEBSOCKET_URL: 'wss://ws.finnhub.io',
    RATE_LIMIT: 60, // requests per minute (free tier)
  },

  // Yahoo Finance via RapidAPI
  // Subscribe at: https://rapidapi.com/sparior/api/yahoo-finance15
  YAHOO_FINANCE: {
    API_KEY: 'YOUR_RAPIDAPI_KEY_HERE',
    BASE_URL: 'https://yahoo-finance15.p.rapidapi.com/api/v1',
    HOST: 'yahoo-finance15.p.rapidapi.com',
    RATE_LIMIT: 500, // requests per month (free tier)
  },

  // NSE India Direct (requires CORS proxy in production)
  NSE_INDIA: {
    BASE_URL: 'https://www.nseindia.com/api',
    // Use a CORS proxy for browser requests:
    CORS_PROXY: 'https://cors-anywhere.herokuapp.com/',
    // Or set up your own proxy server URL:
    PROXY_SERVER: 'YOUR_PROXY_SERVER_URL_HERE',
  },

  // ==================== SETTINGS ====================
  
  // Which API provider to use as primary source
  // Options: 'alpha_vantage' | 'twelve_data' | 'finnhub' | 'yahoo' | 'nse_direct'
  PRIMARY_PROVIDER: 'alpha_vantage' as ApiProvider,
  
  // Fallback provider if primary fails
  FALLBACK_PROVIDER: 'twelve_data' as ApiProvider,

  // Cache duration in milliseconds
  CACHE_DURATION: 60000, // 1 minute
  
  // Auto-refresh interval for live data (in ms)
  REFRESH_INTERVAL: 30000, // 30 seconds

  // NSE market hours (IST)
  MARKET_OPEN_HOUR: 9,
  MARKET_OPEN_MINUTE: 15,
  MARKET_CLOSE_HOUR: 15,
  MARKET_CLOSE_MINUTE: 30,
};

// ==================== NSE SYMBOL MAPPINGS ====================
// Map NSE symbols to API-compatible formats
export const SYMBOL_MAP: Record<string, { alphav: string; twelve: string; finnhub: string; yahoo: string }> = {
  'RELIANCE': { alphav: 'RELIANCE.BSE', twelve: 'RELIANCE', finnhub: 'RELIANCE.NS', yahoo: 'RELIANCE.NS' },
  'TCS':      { alphav: 'TCS.BSE',      twelve: 'TCS',      finnhub: 'TCS.NS',      yahoo: 'TCS.NS' },
  'HDFCBANK': { alphav: 'HDFCBANK.BSE', twelve: 'HDFCBANK', finnhub: 'HDFCBANK.NS', yahoo: 'HDFCBANK.NS' },
  'INFY':     { alphav: 'INFY',         twelve: 'INFY',     finnhub: 'INFY.NS',     yahoo: 'INFY.NS' },
  'TATAMOTORS': { alphav: 'TATAMOTORS.BSE', twelve: 'TATAMOTORS', finnhub: 'TATAMOTORS.NS', yahoo: 'TATAMOTORS.NS' },
  'TATASTEEL': { alphav: 'TATASTEEL.BSE', twelve: 'TATASTEEL', finnhub: 'TATASTEEL.NS', yahoo: 'TATASTEEL.NS' },
  'MARUTI':   { alphav: 'MARUTI.BSE',   twelve: 'MARUTI',   finnhub: 'MARUTI.NS',   yahoo: 'MARUTI.NS' },
  'HCLTECH':  { alphav: 'HCLTECH.BSE',  twelve: 'HCLTECH',  finnhub: 'HCLTECH.NS',  yahoo: 'HCLTECH.NS' },
  'WIPRO':    { alphav: 'WIPRO.BSE',    twelve: 'WIPRO',    finnhub: 'WIPRO.NS',    yahoo: 'WIPRO.NS' },
  'SUNPHARMA': { alphav: 'SUNPHARMA.BSE', twelve: 'SUNPHARMA', finnhub: 'SUNPHARMA.NS', yahoo: 'SUNPHARMA.NS' },
  'BHARTIARTL': { alphav: 'BHARTIARTL.BSE', twelve: 'BHARTIARTL', finnhub: 'BHARTIARTL.NS', yahoo: 'BHARTIARTL.NS' },
  'ASIANPAINT': { alphav: 'ASIANPAINT.BSE', twelve: 'ASIANPAINT', finnhub: 'ASIANPAINT.NS', yahoo: 'ASIANPAINT.NS' },
  'ITC':      { alphav: 'ITC.BSE',      twelve: 'ITC',      finnhub: 'ITC.NS',      yahoo: 'ITC.NS' },
  'SBIN':     { alphav: 'SBIN.BSE',     twelve: 'SBIN',     finnhub: 'SBIN.NS',     yahoo: 'SBIN.NS' },
  'ICICIBANK': { alphav: 'ICICIBANK.BSE', twelve: 'ICICIBANK', finnhub: 'ICICIBANK.NS', yahoo: 'ICICIBANK.NS' },
  'KOTAKBANK': { alphav: 'KOTAKBANK.BSE', twelve: 'KOTAKBANK', finnhub: 'KOTAKBANK.NS', yahoo: 'KOTAKBANK.NS' },
  'LT':       { alphav: 'LT.BSE',       twelve: 'LT',       finnhub: 'LT.NS',       yahoo: 'LT.NS' },
  'BAJFINANCE': { alphav: 'BAJFINANCE.BSE', twelve: 'BAJFINANCE', finnhub: 'BAJFINANCE.NS', yahoo: 'BAJFINANCE.NS' },
  'HINDUNILVR': { alphav: 'HINDUNILVR.BSE', twelve: 'HINDUNILVR', finnhub: 'HINDUNILVR.NS', yahoo: 'HINDUNILVR.NS' },
  'AXISBANK': { alphav: 'AXISBANK.BSE', twelve: 'AXISBANK', finnhub: 'AXISBANK.NS', yahoo: 'AXISBANK.NS' },
};

export type ApiProvider = 'alpha_vantage' | 'twelve_data' | 'finnhub' | 'yahoo' | 'nse_direct';
