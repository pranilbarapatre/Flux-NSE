import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Star, Bell, ChevronDown, Clock, Maximize2, Search, BarChart3, TrendingUp,
  Minus, PenTool, Type, Circle, Triangle, Ruler, Magnet, Eye, Trash2,
  Play, Settings, ArrowUpRight, ExternalLink, ChevronRight,
  MoreHorizontal, RefreshCw, X, Plus, MousePointer, Crosshair,
  ZoomIn, ZoomOut, CandlestickChart as CandleIcon, LineChart, BarChart2, Square, Pause
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart as ReLineChart, Line, ReferenceLine } from 'recharts';
import CandlestickChart from './CandlestickChart';
import type { ChartType } from './CandlestickChart';
import {
  stocks, generateCandlestickData, calculateSMA, calculateEMA, calculateBollingerBands,
  calculateRSI, calculateMACD, calculateVWAP, watchlistIndices, watchlistFutures, watchlistForex,
  getStockNews, generateEarningsData,
  type CandleData
} from '../data/stockData';

// Drawing tools
const drawingTools = [
  { id: 'cursor', icon: MousePointer, label: 'Cursor (Pan)', group: 1 },
  { id: 'crosshair', icon: Crosshair, label: 'Crosshair', group: 1 },
  { id: 'trendline', icon: TrendingUp, label: 'Trend Line', group: 2 },
  { id: 'ray', icon: ArrowUpRight, label: 'Ray', group: 2 },
  { id: 'hline', icon: Minus, label: 'Horizontal Line', group: 2 },
  { id: 'fib', icon: Triangle, label: 'Fibonacci Retracement', group: 3 },
  { id: 'rect', icon: Square, label: 'Rectangle', group: 3 },
  { id: 'pen', icon: PenTool, label: 'Free Draw', group: 4 },
  { id: 'text', icon: Type, label: 'Text Note', group: 4 },
  { id: 'ruler', icon: Ruler, label: 'Measure Tool', group: 5 },
  { id: 'magnet', icon: Magnet, label: 'Magnet Mode', group: 5 },
  { id: 'eye', icon: Eye, label: 'Show/Hide Drawings', group: 6 },
  { id: 'trash', icon: Trash2, label: 'Remove All Drawings', group: 6 },
];

// Indicator definitions
const indicatorList = [
  { id: 'sma', name: 'SMA', desc: 'Simple Moving Average (20)', color: '#f59e0b', overlay: true },
  { id: 'ema', name: 'EMA', desc: 'Exponential Moving Average (12)', color: '#06b6d4', overlay: true },
  { id: 'bb', name: 'BB', desc: 'Bollinger Bands (20, 2)', color: '#8b5cf6', overlay: true },
  { id: 'vwap', name: 'VWAP', desc: 'Volume Weighted Avg Price', color: '#f97316', overlay: true },
  { id: 'rsi', name: 'RSI', desc: 'Relative Strength Index (14)', color: '#ec4899', overlay: false },
  { id: 'macd', name: 'MACD', desc: 'MACD (12, 26, 9)', color: '#10b981', overlay: false },
];

// Chart types
const chartTypes: { id: ChartType; label: string; icon: typeof CandleIcon }[] = [
  { id: 'candles', label: 'Candlestick', icon: CandleIcon },
  { id: 'hollow', label: 'Hollow Candles', icon: Circle },
  { id: 'heikinashi', label: 'Heikin-Ashi', icon: CandleIcon },
  { id: 'bars', label: 'OHLC Bars', icon: BarChart2 },
  { id: 'line', label: 'Line', icon: LineChart },
  { id: 'area', label: 'Area', icon: TrendingUp },
];

export default function Terminal() {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [showSymbolSearch, setShowSymbolSearch] = useState(false);
  const [symbolSearchQuery, setSymbolSearchQuery] = useState('');
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['sma']);
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);
  const [showChartTypeMenu, setShowChartTypeMenu] = useState(false);
  const [activeTool, setActiveTool] = useState('crosshair');
  const [magnetMode, setMagnetMode] = useState(false);
  const [showDrawingsFlag, setShowDrawingsFlag] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'watchlist' | 'detail'>('watchlist');
  const [watchlistSelectedSymbol, setWatchlistSelectedSymbol] = useState('RELIANCE');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState('Crossing');
  const [alerts, setAlerts] = useState<{ symbol: string; price: number; type: string }[]>([]);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [isReplayPaused, setIsReplayPaused] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(100);
  const [chartDimensions, setChartDimensions] = useState({ width: 800, height: 500 });
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newsIndex, setNewsIndex] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [watchlistSections, setWatchlistSections] = useState({ indices: true, stocks: true, futures: true, forex: true });
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Chart settings
  const [chartSettings, setChartSettings] = useState({
    gridLines: true,
    volumeBars: true,
    crosshairType: 'both' as 'both' | 'horizontal' | 'vertical',
    priceScale: 'linear' as 'linear' | 'log',
  });

  const stock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];
  const detailStock = stocks.find(s => s.symbol === watchlistSelectedSymbol) || stocks[0];

  // Generate candlestick data
  const candleData = useMemo(() => {
    return generateCandlestickData(timeframe, stock.price);
  }, [selectedSymbol, timeframe, stock.price]);

  // Data for replay mode
  const displayData = useMemo(() => {
    if (isReplayMode) return candleData.slice(0, replayIndex + 1);
    return candleData;
  }, [candleData, isReplayMode, replayIndex]);

  // Technical indicators
  const smaData = useMemo(() => activeIndicators.includes('sma') ? calculateSMA(candleData, 20) : undefined, [candleData, activeIndicators]);
  const emaData = useMemo(() => activeIndicators.includes('ema') ? calculateEMA(candleData, 12) : undefined, [candleData, activeIndicators]);
  const bbData = useMemo(() => activeIndicators.includes('bb') ? calculateBollingerBands(candleData) : undefined, [candleData, activeIndicators]);
  const rsiData = useMemo(() => activeIndicators.includes('rsi') ? calculateRSI(candleData) : undefined, [candleData, activeIndicators]);
  const macdData = useMemo(() => activeIndicators.includes('macd') ? calculateMACD(candleData) : undefined, [candleData, activeIndicators]);
  const vwapData = useMemo(() => activeIndicators.includes('vwap') ? calculateVWAP(candleData) : undefined, [candleData, activeIndicators]);

  // Subcharts height
  const rsiActive = activeIndicators.includes('rsi');
  const macdActive = activeIndicators.includes('macd');
  const subChartHeight = (rsiActive ? 120 : 0) + (macdActive ? 120 : 0);

  // Chart resize
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setChartDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height - subChartHeight,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [subChartHeight]);

  // News rotation
  const news = useMemo(() => getStockNews(watchlistSelectedSymbol), [watchlistSelectedSymbol]);
  useEffect(() => {
    const timer = setInterval(() => setNewsIndex(prev => (prev + 1) % news.length), 5000);
    return () => clearInterval(timer);
  }, [news.length]);

  // Replay mode
  const startReplay = useCallback(() => {
    setIsReplayMode(true);
    setIsReplayPaused(false);
    setReplayIndex(0);
    if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    replayTimerRef.current = setInterval(() => {
      setReplayIndex(prev => {
        if (prev >= candleData.length - 1) {
          if (replayTimerRef.current) clearInterval(replayTimerRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, replaySpeed);
  }, [candleData.length, replaySpeed]);

  const pauseReplay = useCallback(() => {
    setIsReplayPaused(true);
    if (replayTimerRef.current) clearInterval(replayTimerRef.current);
  }, []);

  const resumeReplay = useCallback(() => {
    setIsReplayPaused(false);
    if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    replayTimerRef.current = setInterval(() => {
      setReplayIndex(prev => {
        if (prev >= candleData.length - 1) {
          if (replayTimerRef.current) clearInterval(replayTimerRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, replaySpeed);
  }, [candleData.length, replaySpeed]);

  const stopReplay = useCallback(() => {
    setIsReplayMode(false);
    setIsReplayPaused(false);
    if (replayTimerRef.current) clearInterval(replayTimerRef.current);
  }, []);

  // Step forward/backward in replay
  const stepReplay = useCallback((direction: number) => {
    setReplayIndex(prev => Math.max(0, Math.min(candleData.length - 1, prev + direction)));
  }, [candleData.length]);

  useEffect(() => {
    return () => { if (replayTimerRef.current) clearInterval(replayTimerRef.current); };
  }, []);

  // Earnings data
  const earningsData = useMemo(() => generateEarningsData(), []);

  // Current candle
  const currentCandle = hoveredCandle || (displayData.length > 0 ? displayData[displayData.length - 1] : null);

  // Filtered stocks
  const filteredStocks = stocks.filter(s =>
    s.symbol.toLowerCase().includes(symbolSearchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(symbolSearchQuery.toLowerCase())
  );

  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '5D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];
  const quickTimeframes = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];

  const toggleIndicator = (id: string) => {
    setActiveIndicators(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addAlert = () => {
    if (alertPrice) {
      setAlerts(prev => [...prev, { symbol: selectedSymbol, price: parseFloat(alertPrice), type: alertType }]);
      setAlertPrice('');
      setShowAlertModal(false);
    }
  };

  // Handle drawing tool selection
  const handleToolSelect = (toolId: string) => {
    if (toolId === 'magnet') {
      setMagnetMode(!magnetMode);
      return;
    }
    if (toolId === 'eye') {
      setShowDrawingsFlag(!showDrawingsFlag);
      return;
    }
    if (toolId === 'trash') {
      setActiveTool('crosshair');
      return;
    }
    setActiveTool(toolId);
  };

  // Watchlist stocks
  const watchlistStocks = stocks.slice(0, 6).map(s => ({
    symbol: s.symbol, name: s.name, price: s.price,
    change: s.change, changePercent: s.changePercent,
    color: s.change >= 0 ? '#10b981' : '#ef4444',
  }));

  // RSI & MACD data for sub-charts
  const rsiChartData = useMemo(() => {
    if (!rsiData) return [];
    return candleData.map((c, i) => ({ time: c.time, rsi: rsiData[i] }));
  }, [candleData, rsiData]);

  const macdChartData = useMemo(() => {
    if (!macdData) return [];
    return candleData.map((c, i) => ({
      time: c.time, macd: macdData.macd[i], signal: macdData.signal[i], histogram: macdData.histogram[i],
    }));
  }, [candleData, macdData]);

  // Alerts for current symbol
  const currentAlerts = alerts.filter(a => a.symbol === selectedSymbol);

  // Get chart type icon
  const currentChartType = chartTypes.find(ct => ct.id === chartType) || chartTypes[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => {
      setShowSymbolSearch(false);
      setShowTimeframeDropdown(false);
      setShowIndicatorPanel(false);
      setShowChartTypeMenu(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className={`h-full flex flex-col bg-[#0a0a14] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* ===== TOP TOOLBAR ===== */}
      <div className="flex items-center gap-0.5 px-2 py-1 bg-[#12121e] border-b border-gray-800/60 flex-shrink-0">
        {/* Symbol selector */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setShowSymbolSearch(!showSymbolSearch); setShowTimeframeDropdown(false); setShowIndicatorPanel(false); setShowChartTypeMenu(false); }}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-800/50 text-white font-bold text-sm"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[8px] font-bold">
              {stock.symbol.charAt(0)}
            </div>
            {stock.symbol}
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          {showSymbolSearch && (
            <div className="absolute top-full left-0 mt-1 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-2xl z-50 w-80">
              <div className="p-2 border-b border-gray-800">
                <div className="flex items-center gap-2 bg-[#0a0a14] rounded px-2 py-1.5">
                  <Search className="w-3.5 h-3.5 text-gray-500" />
                  <input type="text" placeholder="Search symbol or name..." value={symbolSearchQuery}
                    onChange={e => setSymbolSearchQuery(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none flex-1" autoFocus />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {filteredStocks.map(s => (
                  <button key={s.symbol}
                    onClick={() => { setSelectedSymbol(s.symbol); setWatchlistSelectedSymbol(s.symbol); setShowSymbolSearch(false); setSymbolSearchQuery(''); }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-800/50 text-sm flex items-center justify-between ${s.symbol === selectedSymbol ? 'bg-gray-800/30' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
                        {s.symbol.charAt(0)}
                      </div>
                      <div>
                        <span className="text-white font-medium">{s.symbol}</span>
                        <span className="text-gray-500 text-xs ml-2">{s.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-xs">₹{s.price.toFixed(2)}</div>
                      <div className={`text-[10px] ${s.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.change >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-800 mx-1" />

        {/* Timeframe selector */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setShowTimeframeDropdown(!showTimeframeDropdown); setShowSymbolSearch(false); setShowIndicatorPanel(false); setShowChartTypeMenu(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800/50 text-gray-300 text-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            {timeframe}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showTimeframeDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-2xl z-50 p-1.5">
              <div className="grid grid-cols-3 gap-0.5">
                {timeframes.map(tf => (
                  <button key={tf} onClick={() => { setTimeframe(tf); setShowTimeframeDropdown(false); }}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${timeframe === tf ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-800 mx-1" />

        {/* Chart type selector */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setShowChartTypeMenu(!showChartTypeMenu); setShowSymbolSearch(false); setShowTimeframeDropdown(false); setShowIndicatorPanel(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800/50 text-gray-300 text-sm"
            title={`Chart: ${currentChartType.label}`}
          >
            <currentChartType.icon className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3" />
          </button>
          {showChartTypeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-2xl z-50 w-48">
              <div className="p-1">
                {chartTypes.map(ct => (
                  <button key={ct.id} onClick={() => { setChartType(ct.id); setShowChartTypeMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ${chartType === ct.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'}`}>
                    <ct.icon className="w-4 h-4" />
                    <span>{ct.label}</span>
                    {chartType === ct.id && <span className="ml-auto text-blue-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-800 mx-1" />

        {/* Indicators */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setShowIndicatorPanel(!showIndicatorPanel); setShowSymbolSearch(false); setShowTimeframeDropdown(false); setShowChartTypeMenu(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800/50 text-gray-300 text-sm"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Indicators
            {activeIndicators.length > 0 && (
              <span className="bg-blue-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{activeIndicators.length}</span>
            )}
          </button>
          {showIndicatorPanel && (
            <div className="absolute top-full left-0 mt-1 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-2xl z-50 w-80">
              <div className="p-2 border-b border-gray-800">
                <p className="text-xs text-gray-400 font-medium">Technical Indicators</p>
              </div>
              <div className="p-1 max-h-80 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] text-gray-600 font-medium">OVERLAY</div>
                {indicatorList.filter(i => i.overlay).map(ind => (
                  <button key={ind.id} onClick={() => toggleIndicator(ind.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeIndicators.includes(ind.id) ? 'bg-gray-800/80' : 'hover:bg-gray-800/40'}`}>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ind.color }} />
                    <div className="text-left flex-1">
                      <span className="text-white font-medium">{ind.name}</span>
                      <span className="text-gray-500 text-xs ml-2">{ind.desc}</span>
                    </div>
                    {activeIndicators.includes(ind.id) && <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center"><span className="text-white text-[10px]">✓</span></div>}
                  </button>
                ))}
                <div className="px-2 py-1 mt-1 text-[10px] text-gray-600 font-medium">SEPARATE PANEL</div>
                {indicatorList.filter(i => !i.overlay).map(ind => (
                  <button key={ind.id} onClick={() => toggleIndicator(ind.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeIndicators.includes(ind.id) ? 'bg-gray-800/80' : 'hover:bg-gray-800/40'}`}>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ind.color }} />
                    <div className="text-left flex-1">
                      <span className="text-white font-medium">{ind.name}</span>
                      <span className="text-gray-500 text-xs ml-2">{ind.desc}</span>
                    </div>
                    {activeIndicators.includes(ind.id) && <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center"><span className="text-white text-[10px]">✓</span></div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alert */}
        <button onClick={() => setShowAlertModal(true)} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800/50 text-gray-300 text-sm">
          <Bell className="w-3.5 h-3.5" />
          Alert
          {currentAlerts.length > 0 && <span className="bg-yellow-500/20 text-yellow-400 text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{currentAlerts.length}</span>}
        </button>

        {/* Replay */}
        <button
          onClick={isReplayMode ? stopReplay : startReplay}
          className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${isReplayMode ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-800/50 text-gray-300'}`}
        >
          <Play className="w-3.5 h-3.5" />
          Replay
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Active indicator chips */}
        <div className="flex items-center gap-1 mr-2 overflow-hidden">
          {activeIndicators.map(id => {
            const ind = indicatorList.find(i => i.id === id);
            if (!ind) return null;
            return (
              <span key={id} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-800/60 text-gray-300">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ind.color }} />
                {ind.name}
                <button onClick={() => toggleIndicator(id)} className="text-gray-500 hover:text-white ml-0.5"><X className="w-2.5 h-2.5" /></button>
              </span>
            );
          })}
        </div>

        {/* Zoom */}
        <button onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))} className="p-1.5 text-gray-500 hover:text-white" title="Zoom In"><ZoomIn className="w-3.5 h-3.5" /></button>
        <button onClick={() => setZoomLevel(prev => Math.max(0.25, prev - 0.25))} className="p-1.5 text-gray-500 hover:text-white" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5" /></button>

        {/* Right actions */}
        <button onClick={() => setRightPanelTab(rightPanelTab === 'watchlist' ? 'detail' : 'watchlist')} className="p-1.5 text-gray-500 hover:text-white" title="Watchlist"><Star className="w-4 h-4" /></button>
        <button onClick={() => setShowSettingsModal(true)} className="p-1.5 text-gray-500 hover:text-white" title="Settings"><Settings className="w-4 h-4" /></button>
        <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 text-gray-500 hover:text-white" title="Fullscreen"><Maximize2 className="w-4 h-4" /></button>
      </div>

      {/* ===== OHLC INFO BAR ===== */}
      <div className="flex items-center gap-3 px-2 py-1 bg-[#0e0e1a] border-b border-gray-800/30 flex-shrink-0 text-[11px]">
        <span className="text-gray-400">
          <span className="text-white font-medium">{stock.name}</span> · {timeframe} · NSE
          {chartType !== 'candles' && <span className="text-gray-600 ml-1">({currentChartType.label})</span>}
        </span>
        {currentCandle && (
          <>
            <span className="text-gray-500">O</span>
            <span className={currentCandle.isBullish ? 'text-emerald-400' : 'text-red-400'}>{currentCandle.open.toFixed(2)}</span>
            <span className="text-gray-500">H</span>
            <span className={currentCandle.isBullish ? 'text-emerald-400' : 'text-red-400'}>{currentCandle.high.toFixed(2)}</span>
            <span className="text-gray-500">L</span>
            <span className={currentCandle.isBullish ? 'text-emerald-400' : 'text-red-400'}>{currentCandle.low.toFixed(2)}</span>
            <span className="text-gray-500">C</span>
            <span className={currentCandle.isBullish ? 'text-emerald-400' : 'text-red-400'}>{currentCandle.close.toFixed(2)}</span>
            <span className={currentCandle.isBullish ? 'text-emerald-400' : 'text-red-400'}>
              {(currentCandle.close - currentCandle.open) >= 0 ? '+' : ''}{(currentCandle.close - currentCandle.open).toFixed(2)} ({((currentCandle.close - currentCandle.open) / currentCandle.open * 100).toFixed(2)}%)
            </span>
          </>
        )}
        <span className="text-gray-500 ml-auto">Vol {currentCandle ? (currentCandle.volume / 1000).toFixed(1) + 'K' : '-'}</span>

        {/* Buy/Sell buttons */}
        <div className="flex items-center gap-1">
          <button className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-bold border border-red-500/30 hover:bg-red-500/30 transition-all">
            {stock.price.toFixed(2)} SELL
          </button>
          <span className="text-gray-600 text-[9px]">{((stock.price * 0.001)).toFixed(2)}</span>
          <button className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-all">
            {(stock.price + stock.price * 0.0001).toFixed(2)} BUY
          </button>
        </div>
      </div>

      {/* ===== MAIN AREA ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT DRAWING TOOLS */}
        <div className="w-10 bg-[#0e0e1a] border-r border-gray-800/40 flex flex-col items-center py-1 gap-0.5 flex-shrink-0 overflow-y-auto">
          {drawingTools.map((tool, idx) => {
            const Icon = tool.icon;
            const prevGroup = idx > 0 ? drawingTools[idx - 1].group : tool.group;
            const isActive = activeTool === tool.id ||
              (tool.id === 'magnet' && magnetMode) ||
              (tool.id === 'eye' && !showDrawingsFlag);
            return (
              <div key={tool.id}>
                {tool.group !== prevGroup && <div className="w-6 border-t border-gray-800/50 my-0.5" />}
                <button
                  onClick={() => handleToolSelect(tool.id)}
                  className={`w-8 h-8 rounded flex items-center justify-center transition-all group relative ${
                    isActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/40'
                  }`}
                  title={tool.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {tool.label}
                    {tool.id === 'magnet' && <span className="text-gray-400 ml-1">{magnetMode ? '(ON)' : '(OFF)'}</span>}
                    {tool.id === 'eye' && <span className="text-gray-400 ml-1">{showDrawingsFlag ? '(Visible)' : '(Hidden)'}</span>}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* CHART AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={chartContainerRef} className="flex-1 relative">
            {chartDimensions.width > 0 && chartDimensions.height > 0 && (
              <CandlestickChart
                data={displayData}
                width={chartDimensions.width}
                height={chartDimensions.height}
                chartType={chartType}
                smaData={smaData}
                emaData={emaData}
                bbData={bbData}
                vwapData={vwapData}
                onCrosshairMove={(candle) => setHoveredCandle(candle)}
                drawingTool={activeTool}
                magnetMode={magnetMode}
                showDrawings={showDrawingsFlag}
                alerts={currentAlerts}
                zoomLevel={zoomLevel}
              />
            )}

            {/* Replay overlay */}
            {isReplayMode && (
              <div className="absolute top-2 left-2 flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-blue-400 text-xs font-medium">Replay</span>
                <span className="text-blue-300 text-xs">{replayIndex + 1}/{candleData.length}</span>
                <div className="flex items-center gap-1 ml-1">
                  <button onClick={() => stepReplay(-1)} className="text-blue-300 hover:text-white p-0.5" title="Step Back">
                    <ChevronDown className="w-3 h-3 rotate-90" />
                  </button>
                  {isReplayPaused ? (
                    <button onClick={resumeReplay} className="text-blue-300 hover:text-white p-0.5" title="Resume">
                      <Play className="w-3 h-3" />
                    </button>
                  ) : (
                    <button onClick={pauseReplay} className="text-blue-300 hover:text-white p-0.5" title="Pause">
                      <Pause className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => stepReplay(1)} className="text-blue-300 hover:text-white p-0.5" title="Step Forward">
                    <ChevronDown className="w-3 h-3 -rotate-90" />
                  </button>
                </div>
                <select value={replaySpeed} onChange={e => setReplaySpeed(Number(e.target.value))}
                  className="bg-transparent text-blue-300 text-[10px] outline-none cursor-pointer">
                  <option value={50} className="bg-[#1a1a2e]">Fast</option>
                  <option value={100} className="bg-[#1a1a2e]">Normal</option>
                  <option value={300} className="bg-[#1a1a2e]">Slow</option>
                </select>
                <button onClick={stopReplay} className="text-blue-300 hover:text-white ml-1"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>

          {/* RSI Sub-chart */}
          {rsiActive && (
            <div className="h-[120px] border-t border-gray-800/40 bg-[#0a0a14] flex-shrink-0">
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-[10px] text-gray-500">RSI (14)</span>
                <div className="flex gap-2 text-[9px]">
                  <span className="text-red-400/50">70</span>
                  <span className="text-emerald-400/50">30</span>
                  <button onClick={() => toggleIndicator('rsi')} className="text-gray-600 hover:text-white"><X className="w-3 h-3" /></button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <ReLineChart data={rsiChartData}>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} hide />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.3} />
                  <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.3} />
                  <ReferenceLine y={50} stroke="#374151" strokeDasharray="2 2" strokeOpacity={0.2} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #374151', borderRadius: 8, fontSize: 10 }}
                    formatter={(v: unknown) => [Number(v).toFixed(2), 'RSI']} />
                  <Line type="monotone" dataKey="rsi" stroke="#ec4899" strokeWidth={1.2} dot={false} connectNulls />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MACD Sub-chart */}
          {macdActive && (
            <div className="h-[120px] border-t border-gray-800/40 bg-[#0a0a14] flex-shrink-0">
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-[10px] text-gray-500">MACD (12, 26, 9)</span>
                <button onClick={() => toggleIndicator('macd')} className="text-gray-600 hover:text-white"><X className="w-3 h-3" /></button>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={macdChartData} barCategoryGap={0}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #374151', borderRadius: 8, fontSize: 10 }}
                    formatter={(v: unknown) => [Number(v).toFixed(4), 'MACD']} />
                  <Bar dataKey="histogram" radius={[1, 1, 0, 0]}>
                    {macdChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.histogram === null ? '#374151' : entry.histogram >= 0 ? '#26a69a' : '#ef5350'} opacity={0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* BOTTOM TIMEFRAME BAR */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[#0e0e1a] border-t border-gray-800/40 flex-shrink-0">
            {quickTimeframes.map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${timeframe === tf ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {tf}
              </button>
            ))}
            <div className="flex-1" />
            <span className="text-[9px] text-gray-600 font-mono">
              {new Date().toLocaleTimeString()} UTC+5:30
            </span>
            <span className="text-[9px] text-gray-600 mx-1">RTH</span>
            <span className="text-[9px] text-gray-600">ADJ</span>
          </div>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="w-72 bg-[#0e0e1a] border-l border-gray-800/40 flex flex-col flex-shrink-0 hidden xl:flex">
          {/* Sidebar tabs */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/40">
            <div className="flex items-center gap-3">
              <button onClick={() => setRightPanelTab('watchlist')}
                className={`text-xs font-medium ${rightPanelTab === 'watchlist' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                Watchlist
              </button>
              <button onClick={() => setRightPanelTab('detail')}
                className={`text-xs font-medium ${rightPanelTab === 'detail' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                Details
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 text-gray-500 hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
              <button className="p-1 text-gray-500 hover:text-white"><MoreHorizontal className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center justify-between px-3 py-1 text-[9px] text-gray-600 border-b border-gray-800/20">
            <span className="flex-1">Symbol</span>
            <span className="w-16 text-right">Last</span>
            <span className="w-16 text-right">Chg</span>
            <span className="w-14 text-right">Chg%</span>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {rightPanelTab === 'watchlist' ? (
              <>
                {/* INDICES */}
                <div className="px-3 py-1.5">
                  <button onClick={() => setWatchlistSections(p => ({ ...p, indices: !p.indices }))}
                    className="flex items-center gap-1 text-[10px] text-gray-500 font-medium hover:text-gray-300">
                    <ChevronDown className={`w-3 h-3 transition-transform ${!watchlistSections.indices ? '-rotate-90' : ''}`} /> INDICES
                  </button>
                </div>
                {watchlistSections.indices && watchlistIndices.map(item => (
                  <button key={`idx-${item.symbol}`}
                    onClick={() => { setWatchlistSelectedSymbol(item.symbol); setRightPanelTab('detail'); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-800/30 text-[11px] transition-all ${watchlistSelectedSymbol === item.symbol ? 'bg-gray-800/20' : ''}`}>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: item.color }}>{item.symbol.charAt(0)}</div>
                      <span className="text-white font-medium truncate">{item.symbol}</span>
                      <span className="text-yellow-500 text-[8px]">★</span>
                    </div>
                    <span className="w-16 text-right text-white font-mono">{item.price.toFixed(2)}</span>
                    <span className={`w-16 text-right font-mono ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}</span>
                    <span className={`w-14 text-right font-mono ${item.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                  </button>
                ))}

                {/* STOCKS */}
                <div className="px-3 py-1.5 mt-1">
                  <button onClick={() => setWatchlistSections(p => ({ ...p, stocks: !p.stocks }))}
                    className="flex items-center gap-1 text-[10px] text-gray-500 font-medium hover:text-gray-300">
                    <ChevronDown className={`w-3 h-3 transition-transform ${!watchlistSections.stocks ? '-rotate-90' : ''}`} /> STOCKS
                  </button>
                </div>
                {watchlistSections.stocks && watchlistStocks.map(item => (
                  <button key={`stk-${item.symbol}`}
                    onClick={() => { setWatchlistSelectedSymbol(item.symbol); setSelectedSymbol(item.symbol); setRightPanelTab('detail'); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-800/30 text-[11px] transition-all ${watchlistSelectedSymbol === item.symbol ? 'bg-gray-800/20' : ''}`}>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: item.color }}>{item.symbol.substring(0, 2)}</div>
                      <span className="text-white font-medium truncate">{item.symbol}</span>
                      <span className="text-yellow-500 text-[8px]">★</span>
                    </div>
                    <span className="w-16 text-right text-white font-mono">{item.price.toFixed(2)}</span>
                    <span className={`w-16 text-right font-mono ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}</span>
                    <span className={`w-14 text-right font-mono ${item.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                  </button>
                ))}

                {/* FUTURES */}
                <div className="px-3 py-1.5 mt-1">
                  <button onClick={() => setWatchlistSections(p => ({ ...p, futures: !p.futures }))}
                    className="flex items-center gap-1 text-[10px] text-gray-500 font-medium hover:text-gray-300">
                    <ChevronDown className={`w-3 h-3 transition-transform ${!watchlistSections.futures ? '-rotate-90' : ''}`} /> FUTURES
                  </button>
                </div>
                {watchlistSections.futures && watchlistFutures.map(item => (
                  <button key={`fut-${item.symbol}`}
                    onClick={() => { setWatchlistSelectedSymbol(item.symbol); setRightPanelTab('detail'); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-800/30 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: item.color }}>{item.symbol.charAt(0)}</div>
                      <span className="text-white font-medium truncate">{item.symbol}</span>
                      <span className="text-yellow-500 text-[8px]">★</span>
                    </div>
                    <span className="w-16 text-right text-white font-mono">{item.price.toFixed(2)}</span>
                    <span className={`w-16 text-right font-mono ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}</span>
                    <span className={`w-14 text-right font-mono ${item.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                  </button>
                ))}

                {/* FOREX */}
                <div className="px-3 py-1.5 mt-1">
                  <button onClick={() => setWatchlistSections(p => ({ ...p, forex: !p.forex }))}
                    className="flex items-center gap-1 text-[10px] text-gray-500 font-medium hover:text-gray-300">
                    <ChevronDown className={`w-3 h-3 transition-transform ${!watchlistSections.forex ? '-rotate-90' : ''}`} /> FOREX
                  </button>
                </div>
                {watchlistSections.forex && watchlistForex.map(item => (
                  <button key={`fx-${item.symbol}`}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-800/30 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[10px]">🇺🇸</span>
                      <span className="text-white font-medium">{item.symbol}</span>
                    </div>
                    <span className="w-16 text-right text-white font-mono">{item.price.toFixed(4)}</span>
                    <span className={`w-16 text-right font-mono ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.change >= 0 ? '+' : ''}{item.change.toFixed(4)}</span>
                    <span className={`w-14 text-right font-mono ${item.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                  </button>
                ))}
              </>
            ) : (
              /* STOCK DETAIL PANEL */
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
                      {detailStock.symbol.charAt(0)}
                    </div>
                    <span className="text-white font-bold text-sm">{detailStock.symbol}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setSelectedSymbol(detailStock.symbol); }} className="p-1 text-gray-500 hover:text-white" title="Load on chart"><BarChart3 className="w-3.5 h-3.5" /></button>
                    <button className="p-1 text-gray-500 hover:text-white"><PenTool className="w-3.5 h-3.5" /></button>
                    <button className="p-1 text-gray-500 hover:text-white"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span>{detailStock.name}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                  <span>· NSE</span>
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5">{detailStock.sector} · {detailStock.industry}</div>

                {/* Price */}
                <div className="mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{detailStock.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">INR</span>
                    <span className={`text-sm font-medium ${detailStock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {detailStock.change >= 0 ? '+' : ''}{detailStock.change.toFixed(2)}
                    </span>
                    <span className={`text-sm ${detailStock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {detailStock.change >= 0 ? '+' : ''}{detailStock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                    <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" /> Market closed
                  </div>
                  <div className="text-[9px] text-gray-600 mt-0.5">Last update at {new Date().toLocaleDateString()}, 15:59 GMT+5:30</div>
                </div>

                {/* News */}
                <div className="mt-2 bg-[#1a1a2e] rounded-lg p-2 flex items-center gap-2">
                  <span className="text-blue-400 text-xs">⚡</span>
                  <p className="text-[10px] text-gray-300 flex-1 truncate">{news[newsIndex]}</p>
                  <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                </div>

                {/* Key stats */}
                <div className="mt-3">
                  <p className="text-xs font-semibold text-white mb-2">Key stats</p>
                  <div className="space-y-1.5 text-[11px]">
                    {[
                      ['Next earnings report', 'In 26 days'],
                      ['Volume', detailStock.volume],
                      ['Average Volume (30D)', detailStock.avgVolume],
                      ['Market capitalization', `₹${detailStock.marketCap}`],
                      ['P/E Ratio', String(detailStock.peRatio)],
                      ['52W High', `₹${detailStock.high52.toFixed(2)}`],
                      ['52W Low', `₹${detailStock.low52.toFixed(2)}`],
                      ['Open', `₹${detailStock.open.toFixed(2)}`],
                      ['High', `₹${detailStock.high.toFixed(2)}`],
                      ['Low', `₹${detailStock.low.toFixed(2)}`],
                      ['Prev Close', `₹${detailStock.prevClose.toFixed(2)}`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Earnings chart */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-white">Earnings</p>
                    <span className="text-[9px] text-gray-500">26</span>
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    {earningsData.map((e, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        {e.actual !== null ? (
                          <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: e.actual >= e.estimate ? '#10b981' : '#ef4444', backgroundColor: e.actual >= e.estimate ? '#10b981' : '#ef4444' }}
                            title={`Actual: ${e.actual}`} />
                        ) : (
                          <div className="w-3 h-3 rounded-full border-2 border-gray-600 bg-transparent" title="Estimate" />
                        )}
                        <div className="w-full bg-gray-800/50 rounded-sm" style={{ height: `${(e.estimate / 25) * 100}%`, maxHeight: '50px' }}>
                          <div className="w-full rounded-sm"
                            style={{ height: e.actual !== null ? `${(e.actual / e.estimate) * 100}%` : '0%', backgroundColor: e.actual !== null ? (e.actual >= e.estimate ? '#10b981' : '#ef4444') : 'transparent', maxHeight: '100%' }} />
                        </div>
                        <span className="text-[8px] text-gray-600">{e.quarter}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[9px]">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-gray-500">Actual</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full border border-gray-500" />
                      <span className="text-gray-500">Estimate</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT EDGE TOOLBAR */}
        <div className="w-8 bg-[#0e0e1a] border-l border-gray-800/30 flex flex-col items-center py-2 gap-1 flex-shrink-0 hidden 2xl:flex">
          {[
            { icon: BarChart3, label: 'Chart', action: () => {} },
            { icon: TrendingUp, label: 'Analysis', action: () => {} },
            { icon: Star, label: 'Watchlist', action: () => setRightPanelTab('watchlist') },
            { icon: Bell, label: 'Alerts', action: () => setShowAlertModal(true) },
            { icon: Clock, label: 'History', action: () => {} },
            { icon: RefreshCw, label: 'Refresh', action: () => { setTimeframe(timeframe); } },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className="w-7 h-7 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-gray-800/40 transition-all" title={item.label}>
              <item.icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* ===== ALERT MODAL ===== */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAlertModal(false)}>
          <div className="bg-[#1a1a2e] border border-gray-700 rounded-xl p-5 w-96" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" /> Set Price Alert
              </h3>
              <button onClick={() => setShowAlertModal(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Symbol</label>
                <div className="bg-[#0a0a14] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">{selectedSymbol} — {stock.name}</div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Current Price</label>
                <div className="text-lg font-bold text-white">₹{stock.price.toFixed(2)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Alert Price</label>
                <input type="number" value={alertPrice} onChange={e => setAlertPrice(e.target.value)}
                  placeholder="Enter target price..."
                  className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Condition</label>
                <select value={alertType} onChange={e => setAlertType(e.target.value)}
                  className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                  <option>Crossing</option>
                  <option>Crossing Up</option>
                  <option>Crossing Down</option>
                  <option>Greater Than</option>
                  <option>Less Than</option>
                </select>
              </div>
              {alerts.length > 0 && (
                <div className="border-t border-gray-800 pt-2 mt-2">
                  <p className="text-[10px] text-gray-500 mb-1">Active Alerts ({alerts.length})</p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {alerts.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 px-2 bg-gray-800/30 rounded">
                        <span className="text-white">{a.symbol} @ ₹{a.price.toFixed(2)}</span>
                        <span className="text-gray-500 text-[10px] mr-2">{a.type}</span>
                        <button onClick={() => setAlerts(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={addAlert}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg text-sm hover:opacity-90 transition-opacity">
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SETTINGS MODAL ===== */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-[#1a1a2e] border border-gray-700 rounded-xl p-5 w-96" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" /> Chart Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              {/* Chart Type */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Chart Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {chartTypes.map(ct => (
                    <button key={ct.id} onClick={() => setChartType(ct.id)}
                      className={`px-2 py-1.5 rounded text-[11px] flex items-center gap-1 ${chartType === ct.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/40 text-gray-400 hover:bg-gray-800/60'}`}>
                      <ct.icon className="w-3 h-3" />{ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Lines */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Grid Lines</span>
                <button onClick={() => setChartSettings(p => ({ ...p, gridLines: !p.gridLines }))}
                  className={`w-10 h-5 rounded-full transition-colors ${chartSettings.gridLines ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${chartSettings.gridLines ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Volume Bars</span>
                <button onClick={() => setChartSettings(p => ({ ...p, volumeBars: !p.volumeBars }))}
                  className={`w-10 h-5 rounded-full transition-colors ${chartSettings.volumeBars ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${chartSettings.volumeBars ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Crosshair */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Crosshair</label>
                <div className="flex gap-1">
                  {(['both', 'horizontal', 'vertical'] as const).map(t => (
                    <button key={t} onClick={() => setChartSettings(p => ({ ...p, crosshairType: t }))}
                      className={`flex-1 px-2 py-1.5 rounded text-[11px] capitalize ${chartSettings.crosshairType === t ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800/40 text-gray-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Zoom Level: {zoomLevel.toFixed(2)}x</label>
                <input type="range" min="0.25" max="3" step="0.25" value={zoomLevel}
                  onChange={e => setZoomLevel(Number(e.target.value))}
                  className="w-full accent-blue-500" />
              </div>

              {/* Replay Speed */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Replay Speed</label>
                <div className="flex gap-1">
                  {[{ label: 'Slow', val: 300 }, { label: 'Normal', val: 100 }, { label: 'Fast', val: 50 }, { label: 'Ultra', val: 20 }].map(s => (
                    <button key={s.val} onClick={() => setReplaySpeed(s.val)}
                      className={`flex-1 px-2 py-1.5 rounded text-[11px] ${replaySpeed === s.val ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800/40 text-gray-400'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Indicators */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Active Indicators</label>
                <div className="flex flex-wrap gap-1">
                  {indicatorList.map(ind => (
                    <button key={ind.id} onClick={() => toggleIndicator(ind.id)}
                      className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 ${activeIndicators.includes(ind.id) ? 'bg-gray-800 text-white' : 'bg-gray-800/30 text-gray-500'}`}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ind.color }} />
                      {ind.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
