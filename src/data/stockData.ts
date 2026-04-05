export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  high52: number;
  low52: number;
  sector: string;
  industry: string;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  avgVolume: string;
}

export const stocks: Stock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, change: 35.43, changePercent: 1.46, volume: '12.50M', marketCap: '1660.0L Cr', peRatio: 28.50, high52: 2856, low52: 2180, sector: 'Energy', industry: 'Oil & Gas', open: 2452.09, high: 2493.86, low: 2420.15, prevClose: 2456.75, avgVolume: '10.63M' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3678.20, change: -23.65, changePercent: -0.64, volume: '5.80M', marketCap: '1340.0L Cr', peRatio: 32.10, high52: 4045, low52: 3056, sector: 'Technology', industry: 'IT Services', open: 3695.00, high: 3710.50, low: 3665.30, prevClose: 3701.85, avgVolume: '4.92M' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1643.92, change: 8.72, changePercent: 0.53, volume: '8.20M', marketCap: '1250.0L Cr', peRatio: 19.80, high52: 1794, low52: 1363, sector: 'Financial', industry: 'Banking', open: 1638.00, high: 1652.40, low: 1635.10, prevClose: 1635.20, avgVolume: '7.85M' },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1458.16, change: 13.82, changePercent: 0.95, volume: '9.10M', marketCap: '605.0L Cr', peRatio: 25.40, high52: 1620, low52: 1215, sector: 'Technology', industry: 'IT Services', open: 1448.00, high: 1465.30, low: 1445.50, prevClose: 1444.34, avgVolume: '8.45M' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 678.90, change: 25.68, changePercent: 3.92, volume: '21.0M', marketCap: '250.0L Cr', peRatio: 8.20, high52: 730, low52: 420, sector: 'Automobile', industry: 'Auto Manufacturer', open: 658.00, high: 685.40, low: 655.20, prevClose: 653.22, avgVolume: '18.50M' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', price: 134.25, change: 4.80, changePercent: 3.71, volume: '42.0M', marketCap: '165.0L Cr', peRatio: 6.50, high52: 155, low52: 98, sector: 'Metals', industry: 'Steel', open: 130.50, high: 136.80, low: 129.90, prevClose: 129.45, avgVolume: '38.20M' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 10456.30, change: 156.80, changePercent: 1.52, volume: '1.80M', marketCap: '330.0L Cr', peRatio: 30.20, high52: 11200, low52: 8450, sector: 'Automobile', industry: 'Auto Manufacturer', open: 10350.00, high: 10520.00, low: 10310.00, prevClose: 10299.50, avgVolume: '1.65M' },
  { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1345.60, change: 19.40, changePercent: 1.46, volume: '4.50M', marketCap: '365.0L Cr', peRatio: 22.80, high52: 1550, low52: 1095, sector: 'Technology', industry: 'IT Services', open: 1330.00, high: 1358.90, low: 1326.40, prevClose: 1326.20, avgVolume: '4.10M' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', price: 478.90, change: -8.40, changePercent: -1.72, volume: '7.60M', marketCap: '250.0L Cr', peRatio: 20.50, high52: 520, low52: 380, sector: 'Technology', industry: 'IT Services', open: 486.50, high: 489.20, low: 476.30, prevClose: 487.30, avgVolume: '6.80M' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1234.50, change: -18.90, changePercent: -1.51, volume: '3.20M', marketCap: '296.0L Cr', peRatio: 35.60, high52: 1380, low52: 960, sector: 'Healthcare', industry: 'Pharma', open: 1250.00, high: 1256.80, low: 1230.10, prevClose: 1253.40, avgVolume: '2.95M' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1234.80, change: -15.20, changePercent: -1.22, volume: '5.40M', marketCap: '730.0L Cr', peRatio: 65.30, high52: 1380, low52: 850, sector: 'Telecom', industry: 'Telecom Services', open: 1248.00, high: 1252.60, low: 1230.40, prevClose: 1250.00, avgVolume: '5.10M' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', price: 2890.45, change: -32.55, changePercent: -1.12, volume: '2.10M', marketCap: '277.0L Cr', peRatio: 58.40, high52: 3420, low52: 2670, sector: 'Consumer', industry: 'Paints', open: 2918.00, high: 2925.30, low: 2885.10, prevClose: 2923.00, avgVolume: '1.85M' },
  { symbol: 'ITC', name: 'ITC Ltd', price: 438.50, change: 5.20, changePercent: 1.20, volume: '14.2M', marketCap: '546.0L Cr', peRatio: 26.80, high52: 475, low52: 330, sector: 'Consumer', industry: 'FMCG', open: 434.80, high: 441.20, low: 433.50, prevClose: 433.30, avgVolume: '12.80M' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 625.30, change: 8.90, changePercent: 1.44, volume: '18.5M', marketCap: '558.0L Cr', peRatio: 10.20, high52: 680, low52: 445, sector: 'Financial', industry: 'Banking', open: 618.50, high: 629.80, low: 616.20, prevClose: 616.40, avgVolume: '16.30M' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1085.60, change: 12.40, changePercent: 1.16, volume: '10.8M', marketCap: '762.0L Cr', peRatio: 18.90, high52: 1150, low52: 850, sector: 'Financial', industry: 'Banking', open: 1076.00, high: 1092.30, low: 1073.50, prevClose: 1073.20, avgVolume: '9.50M' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1820.40, change: -22.60, changePercent: -1.23, volume: '3.60M', marketCap: '362.0L Cr', peRatio: 22.10, high52: 1960, low52: 1545, sector: 'Financial', industry: 'Banking', open: 1840.00, high: 1845.60, low: 1815.20, prevClose: 1843.00, avgVolume: '3.20M' },
  { symbol: 'LT', name: 'Larsen & Toubro', price: 3245.80, change: 42.30, changePercent: 1.32, volume: '2.40M', marketCap: '445.0L Cr', peRatio: 32.60, high52: 3550, low52: 2680, sector: 'Industrial', industry: 'Engineering', open: 3210.00, high: 3260.40, low: 3205.30, prevClose: 3203.50, avgVolume: '2.15M' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', price: 6890.20, change: -78.80, changePercent: -1.13, volume: '1.90M', marketCap: '427.0L Cr', peRatio: 38.40, high52: 7850, low52: 5680, sector: 'Financial', industry: 'NBFC', open: 6960.00, high: 6975.30, low: 6880.10, prevClose: 6969.00, avgVolume: '1.70M' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2345.60, change: 18.40, changePercent: 0.79, volume: '2.80M', marketCap: '551.0L Cr', peRatio: 55.20, high52: 2750, low52: 2172, sector: 'Consumer', industry: 'FMCG', open: 2330.00, high: 2355.80, low: 2328.40, prevClose: 2327.20, avgVolume: '2.50M' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', price: 1125.40, change: 14.60, changePercent: 1.31, volume: '8.90M', marketCap: '347.0L Cr', peRatio: 14.80, high52: 1200, low52: 880, sector: 'Financial', industry: 'Banking', open: 1114.00, high: 1132.50, low: 1112.30, prevClose: 1110.80, avgVolume: '7.80M' },
];

export function getTopGainers() {
  return [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
}

export function getTopLosers() {
  return [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
}

export function getMostActive() {
  return [...stocks].sort((a, b) => {
    const volA = parseFloat(a.volume.replace('M', ''));
    const volB = parseFloat(b.volume.replace('M', ''));
    return volB - volA;
  }).slice(0, 5);
}

export function getTotalMarketCap() {
  return '11179.0L';
}

// Candlestick data type
export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isBullish: boolean;
}

// Generate candlestick (OHLC) chart data
export function generateCandlestickData(timeframe: string, basePrice: number): CandleData[] {
  const candles: CandleData[] = [];
  let currentPrice = basePrice * 0.97;

  const configs: Record<string, { count: number; volatility: number; labels: (i: number) => string }> = {
    '1m':  { count: 120, volatility: 0.0015, labels: (i) => { const totalMin = i; const h = Math.floor(totalMin / 60) + 10; const m = totalMin % 60; return `${h}:${String(m).padStart(2, '0')}`; }},
    '5m':  { count: 78,  volatility: 0.003,  labels: (i) => { const totalMin = i * 5; const h = Math.floor(totalMin / 60) + 9; const m = (totalMin % 60) + 15; return `${h}:${String(m).padStart(2, '0')}`; }},
    '15m': { count: 52,  volatility: 0.005,  labels: (i) => { const totalMin = i * 15; const h = Math.floor(totalMin / 60) + 9; const m = (totalMin % 60) + 15; return `${h}:${String(m).padStart(2, '0')}`; }},
    '1H':  { count: 78,  volatility: 0.008,  labels: (i) => { const d = new Date(); d.setHours(d.getHours() - (77 - i)); return `${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:00`; }},
    '4H':  { count: 60,  volatility: 0.012,  labels: (i) => { const d = new Date(); d.setHours(d.getHours() - (59 - i) * 4); return `${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:00`; }},
    '1D':  { count: 78,  volatility: 0.005,  labels: (i) => { const totalMin = Math.floor(i * 7.5); const h = Math.floor(totalMin / 60) + 9; const m = totalMin % 60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }},
    '5D':  { count: 5,   volatility: 0.02,   labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (4-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '1W':  { count: 5,   volatility: 0.02,   labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (4-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '1M':  { count: 22,  volatility: 0.018,  labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (21-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '3M':  { count: 65,  volatility: 0.015,  labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (64-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '6M':  { count: 130, volatility: 0.015,  labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (129-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    'YTD': { count: 90,  volatility: 0.015,  labels: (i) => { const d = new Date(new Date().getFullYear(), 0, 1); d.setDate(d.getDate() + i); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '1Y':  { count: 250, volatility: 0.015,  labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (249-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '5Y':  { count: 60,  volatility: 0.025,  labels: (i) => { const d = new Date(); d.setMonth(d.getMonth() - (59-i)); return `${d.getMonth()+1}/${d.getFullYear()%100}`; }},
    'All': { count: 120, volatility: 0.03,   labels: (i) => { const d = new Date(); d.setMonth(d.getMonth() - (119-i)); return `${d.getMonth()+1}/${d.getFullYear()%100}`; }},
  };

  const config = configs[timeframe] || configs['1D'];
  
  for (let i = 0; i < config.count; i++) {
    const open = currentPrice;
    const moveRange = basePrice * config.volatility;
    const change = (Math.random() - 0.48) * moveRange * 2;
    const close = open + change;
    const highExtra = Math.random() * moveRange * 0.8;
    const lowExtra = Math.random() * moveRange * 0.8;
    const high = Math.max(open, close) + highExtra;
    const low = Math.min(open, close) - lowExtra;
    
    candles.push({
      time: config.labels(i),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(Math.random() * 1000000 + 200000),
      isBullish: close >= open,
    });
    
    currentPrice = close;
    currentPrice = Math.max(currentPrice, basePrice * 0.85);
    currentPrice = Math.min(currentPrice, basePrice * 1.15);
  }
  
  return candles;
}

// Generate chart data for different timeframes (line chart version)
export function generateChartData(timeframe: string, basePrice: number) {
  const points: { time: string; price: number; volume: number }[] = [];
  let price = basePrice * 0.92;
  
  const configs: Record<string, { count: number; labels: (i: number) => string }> = {
    '1H': { count: 60, labels: (i) => { const m = i; return `${Math.floor(m/60)+9}:${String(m%60).padStart(2,'0')}`; }},
    '1D': { count: 78, labels: (i) => { const h = Math.floor(i * 7.5 / 60) + 9; const m = Math.floor((i * 7.5) % 60); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }},
    '1W': { count: 5, labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (4-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '1M': { count: 22, labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (21-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '3M': { count: 65, labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (64-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '6M': { count: 130, labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (129-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '1Y': { count: 250, labels: (i) => { const d = new Date(); d.setDate(d.getDate() - (249-i)); return `${d.getDate()}/${d.getMonth()+1}`; }},
    '5Y': { count: 60, labels: (i) => { const d = new Date(); d.setMonth(d.getMonth() - (59-i)); return `${d.getMonth()+1}/${d.getFullYear()%100}`; }},
  };

  const config = configs[timeframe] || configs['3M'];
  
  for (let i = 0; i < config.count; i++) {
    const volatility = timeframe === '1H' ? 0.002 : timeframe === '1D' ? 0.005 : 0.015;
    price = price + (Math.random() - 0.48) * basePrice * volatility;
    price = Math.max(price, basePrice * 0.85);
    price = Math.min(price, basePrice * 1.15);
    points.push({
      time: config.labels(i),
      price: Math.round(price * 100) / 100,
      volume: Math.floor(Math.random() * 1000000 + 200000),
    });
  }
  
  return points;
}

// Generate intraday data for terminal
export function generateIntradayData(basePrice: number) {
  const points: { time: string; price: number; volume: number }[] = [];
  let price = basePrice * 0.98;
  
  for (let h = 9; h <= 15; h++) {
    for (let m = h === 9 ? 15 : 0; m < 60; m += 5) {
      if (h === 15 && m > 30) break;
      price = price + (Math.random() - 0.48) * basePrice * 0.003;
      points.push({
        time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 1200000 + 300000),
      });
    }
  }
  return points;
}

// Watchlist data for terminal
export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  color: string;
}

export const watchlistIndices: WatchlistItem[] = [
  { symbol: 'NIFTY', name: 'Nifty 50', price: 22819.60, change: -486.85, changePercent: -2.09, color: '#3b82f6' },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty', price: 52274.60, change: -1433.50, changePercent: -2.67, color: '#f59e0b' },
  { symbol: 'SENSEX', name: 'BSE Sensex', price: 73583.22, change: -1690.22, changePercent: -2.25, color: '#8b5cf6' },
  { symbol: 'CNXIT', name: 'Nifty IT', price: 29541.65, change: -129.65, changePercent: -0.44, color: '#06b6d4' },
  { symbol: 'SPX', name: 'S&P 500', price: 6368.85, change: -108.31, changePercent: -1.67, color: '#ef4444' },
];

export const watchlistFutures: WatchlistItem[] = [
  { symbol: 'NIFTY', name: 'Nifty Fut', price: 22816.60, change: -483.40, changePercent: -2.07, color: '#3b82f6' },
  { symbol: 'BANKNIFTY', name: 'BankNifty Fut', price: 52271.00, change: -1459.80, changePercent: -2.72, color: '#f59e0b' },
  { symbol: 'RELIANCE', name: 'Reliance Fut', price: 1347.80, change: -64.40, changePercent: -4.56, color: '#ef4444' },
  { symbol: 'INFY', name: 'Infosys Fut', price: 1272.20, change: -3.50, changePercent: -0.27, color: '#22d3ee' },
];

export const watchlistForex: WatchlistItem[] = [
  { symbol: 'USDINR', name: 'USD/INR', price: 94.6300, change: 0.3830, changePercent: 0.41, color: '#10b981' },
];

// Technical indicator calculations
export function calculateSMA(data: CandleData[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j].close;
      }
      result.push(Math.round((sum / period) * 100) / 100);
    }
  }
  return result;
}

export function calculateEMA(data: CandleData[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[j].close;
      result.push(Math.round((sum / period) * 100) / 100);
    } else {
      const prev = result[i - 1]!;
      const ema = (data[i].close - prev) * multiplier + prev;
      result.push(Math.round(ema * 100) / 100);
    }
  }
  return result;
}

export function calculateBollingerBands(data: CandleData[], period: number = 20, stdDev: number = 2): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const sma = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      let variance = 0;
      for (let j = i - period + 1; j <= i; j++) {
        variance += Math.pow(data[j].close - sma[i]!, 2);
      }
      const sd = Math.sqrt(variance / period);
      upper.push(Math.round((sma[i]! + stdDev * sd) * 100) / 100);
      lower.push(Math.round((sma[i]! - stdDev * sd) * 100) / 100);
    }
  }
  
  return { upper, middle: sma, lower };
}

export function calculateRSI(data: CandleData[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }
    
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
    
    if (i < period) {
      result.push(null);
    } else if (i === period) {
      const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(Math.round((100 - 100 / (1 + rs)) * 100) / 100);
    } else {
      const prevRSI = result[i - 1] ?? 50;
      const avgGain = (gains.slice(-period).reduce((a, b) => a + b, 0)) / period;
      const avgLoss = (losses.slice(-period).reduce((a, b) => a + b, 0)) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      result.push(Math.round(((rsi + prevRSI) / 2) * 100) / 100);
    }
  }
  return result;
}

export function calculateVWAP(data: CandleData[]): (number | null)[] {
  const result: (number | null)[] = [];
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  
  for (let i = 0; i < data.length; i++) {
    const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
    cumulativeTPV += typicalPrice * data[i].volume;
    cumulativeVolume += data[i].volume;
    result.push(cumulativeVolume > 0 ? Math.round((cumulativeTPV / cumulativeVolume) * 100) / 100 : null);
  }
  return result;
}

export function calculateMACD(data: CandleData[]): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macdLine: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (ema12[i] !== null && ema26[i] !== null) {
      macdLine.push(Math.round((ema12[i]! - ema26[i]!) * 100) / 100);
    } else {
      macdLine.push(null);
    }
  }
  
  // Signal line (9-period EMA of MACD)
  const signalPeriod = 9;
  const signalLine: (number | null)[] = [];
  const histogram: (number | null)[] = [];
  const multiplier = 2 / (signalPeriod + 1);
  let firstValid = -1;
  
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null) {
      signalLine.push(null);
      histogram.push(null);
      continue;
    }
    
    if (firstValid === -1) firstValid = i;
    const validCount = i - firstValid;
    
    if (validCount < signalPeriod - 1) {
      signalLine.push(null);
      histogram.push(null);
    } else if (validCount === signalPeriod - 1) {
      let sum = 0;
      for (let j = firstValid; j <= i; j++) sum += macdLine[j]!;
      const sig = sum / signalPeriod;
      signalLine.push(Math.round(sig * 100) / 100);
      histogram.push(Math.round((macdLine[i]! - sig) * 100) / 100);
    } else {
      const prev = signalLine[i - 1]!;
      const sig = (macdLine[i]! - prev) * multiplier + prev;
      signalLine.push(Math.round(sig * 100) / 100);
      histogram.push(Math.round((macdLine[i]! - sig) * 100) / 100);
    }
  }
  
  return { macd: macdLine, signal: signalLine, histogram };
}

// Earnings data
export function generateEarningsData() {
  return [
    { quarter: "Q4 '24", actual: 18.5, estimate: 17.2 },
    { quarter: "Q1 '25", actual: 22.3, estimate: 20.8 },
    { quarter: "Q2 '25", actual: 19.8, estimate: 21.5 },
    { quarter: "Q3 '25", actual: 24.1, estimate: 22.0 },
    { quarter: "Q4 '25", actual: null, estimate: 23.5 },
  ];
}

// News data
export function getStockNews(symbol: string) {
  const newsMap: Record<string, string[]> = {
    'RELIANCE': [
      'Bombay HC dismisses plea for CBI probe into RIL\'s alleged...',
      'Reliance Jio adds 5.2M subscribers in February 2026',
      'RIL to invest ₹75,000 Cr in green energy over next 3 years',
    ],
    'TCS': [
      'TCS wins $2B deal from leading European bank',
      'TCS announces special dividend of ₹67 per share',
    ],
    'HDFCBANK': [
      'HDFC Bank reports 18% growth in Q3 net profit',
      'HDFC Bank launches new digital banking platform',
    ],
    'INFY': [
      'Infosys raises FY26 guidance to 4-5% growth',
      'Infosys partners with Microsoft for AI solutions',
    ],
  };
  return newsMap[symbol] || [`${symbol} shows strong quarterly performance`, `Analysts upgrade ${symbol} target price`];
}

// Order book data
export function generateOrderBook() {
  const basePrice = 2456.75;
  const bids: { orders: number; quantity: string; price: number; total: string; barWidth: number }[] = [];
  const asks: { orders: number; quantity: string; price: number; total: string; barWidth: number }[] = [];

  let cumBid = 0;
  for (let i = 0; i < 15; i++) {
    const qty = Math.floor(Math.random() * 9000 + 500);
    cumBid += qty;
    bids.push({
      orders: Math.floor(Math.random() * 50 + 5),
      quantity: qty >= 1000 ? `${(qty/1000).toFixed(1)}K` : String(qty),
      price: Math.round((basePrice - i * 2.5) * 100) / 100,
      total: cumBid >= 1000 ? `${(cumBid/1000).toFixed(1)}K` : String(cumBid),
      barWidth: Math.min(90, Math.random() * 80 + 10),
    });
  }

  let cumAsk = 0;
  for (let i = 0; i < 15; i++) {
    const qty = Math.floor(Math.random() * 9000 + 500);
    cumAsk += qty;
    asks.push({
      orders: Math.floor(Math.random() * 50 + 5),
      quantity: qty >= 1000 ? `${(qty/1000).toFixed(1)}K` : String(qty),
      price: Math.round((basePrice + (i + 1) * 2.5) * 100) / 100,
      total: cumAsk >= 1000 ? `${(cumAsk/1000).toFixed(1)}K` : String(cumAsk),
      barWidth: Math.min(90, Math.random() * 80 + 10),
    });
  }

  return { bids, asks, spread: 6.23, spreadPercent: 0.254 };
}

export function generateRecentTrades() {
  const basePrice = 2456.75;
  const trades: { time: string; price: number; qty: number; isBuy: boolean }[] = [];
  for (let i = 0; i < 15; i++) {
    const isBuy = Math.random() > 0.5;
    trades.push({
      time: `01:30:${String(43 - i * 3).padStart(2, '0')} am`,
      price: Math.round((basePrice + (Math.random() - 0.5) * 20) * 100) / 100,
      qty: Math.floor(Math.random() * 1000 + 100),
      isBuy,
    });
  }
  return trades;
}
