import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Play, Pause, RotateCcw, TrendingUp, DollarSign,
  ChevronDown, History, Briefcase, Target, AlertTriangle, Award,
  ArrowUpRight, ArrowDownRight, X, BarChart3, Percent,
  ShieldCheck, Zap, Info, ChevronRight,
} from 'lucide-react';
import { stocks, generateChartData } from '../data/stockData';

// ---- Types ----
interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  stopLoss: number | null;
  takeProfit: number | null;
  pnl: number;
  pnlPercent: number;
  openTime: string;
  status: 'open' | 'closed';
  closePrice?: number;
  closeTime?: string;
  closeReason?: string;
}

interface OrderEntry {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP';
  price: number;
  quantity: number;
  time: string;
  status: 'filled' | 'pending' | 'cancelled';
}

// ---- Helpers ----
const genId = () => Math.random().toString(36).slice(2, 10);
const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const INITIAL_BALANCE = 1000000; // ₹10 Lakh starting balance

export default function SimulationTrading() {
  // ---- State ----
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [timeframe, setTimeframe] = useState('1D');
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderEntry[]>([]);
  const [isSimRunning, setIsSimRunning] = useState(false);

  // Order form
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [orderQty, setOrderQty] = useState(10);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLossInput, setStopLossInput] = useState('');
  const [takeProfitInput, setTakeProfitInput] = useState('');

  // Panel tabs
  const [bottomTab, setBottomTab] = useState<'positions' | 'orders' | 'history' | 'performance'>('positions');
  const [showOrderPanel, setShowOrderPanel] = useState(true);

  // Simulated price tick
  const [tickOffset, setTickOffset] = useState(0);

  const stock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];
  const currentPrice = stock.price + tickOffset;

  // Chart data
  const chartData = useMemo(() => generateChartData(timeframe, stock.price), [selectedSymbol, timeframe]);

  // Simulate price movement
  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      setTickOffset(prev => {
        const delta = (Math.random() - 0.48) * stock.price * 0.002;
        return Math.round((prev + delta) * 100) / 100;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isSimRunning, stock.price]);

  // Update open positions with current price
  useEffect(() => {
    setPositions(prev =>
      prev.map(pos => {
        if (pos.status !== 'open' || pos.symbol !== selectedSymbol) return pos;
        const cp = currentPrice;
        const pnl = pos.type === 'LONG'
          ? (cp - pos.entryPrice) * pos.quantity
          : (pos.entryPrice - cp) * pos.quantity;
        const pnlPct = (pnl / (pos.entryPrice * pos.quantity)) * 100;

        // Check SL/TP
        let newStatus: 'open' | 'closed' = 'open';
        let closeReason: string | undefined;
        if (pos.stopLoss && pos.type === 'LONG' && cp <= pos.stopLoss) {
          newStatus = 'closed'; closeReason = 'Stop Loss Hit';
        } else if (pos.stopLoss && pos.type === 'SHORT' && cp >= pos.stopLoss) {
          newStatus = 'closed'; closeReason = 'Stop Loss Hit';
        } else if (pos.takeProfit && pos.type === 'LONG' && cp >= pos.takeProfit) {
          newStatus = 'closed'; closeReason = 'Take Profit Hit';
        } else if (pos.takeProfit && pos.type === 'SHORT' && cp <= pos.takeProfit) {
          newStatus = 'closed'; closeReason = 'Take Profit Hit';
        }

        if (newStatus === 'closed') {
          setBalance(b => b + (pos.entryPrice * pos.quantity) + pnl);
        }

        return {
          ...pos,
          currentPrice: cp,
          pnl: Math.round(pnl * 100) / 100,
          pnlPercent: Math.round(pnlPct * 100) / 100,
          status: newStatus,
          closePrice: newStatus === 'closed' ? cp : undefined,
          closeTime: newStatus === 'closed' ? now() : undefined,
          closeReason,
        };
      })
    );
  }, [tickOffset, currentPrice, selectedSymbol]);

  // ---- Handlers ----
  const handlePlaceOrder = useCallback(() => {
    const price = orderType === 'MARKET' ? currentPrice : parseFloat(limitPrice) || currentPrice;
    const cost = price * orderQty;

    if (orderSide === 'BUY' && cost > balance) {
      alert('Insufficient balance!');
      return;
    }

    const sl = stopLossInput ? parseFloat(stopLossInput) : null;
    const tp = takeProfitInput ? parseFloat(takeProfitInput) : null;

    const position: Position = {
      id: genId(),
      symbol: selectedSymbol,
      type: orderSide === 'BUY' ? 'LONG' : 'SHORT',
      entryPrice: price,
      currentPrice: price,
      quantity: orderQty,
      stopLoss: sl,
      takeProfit: tp,
      pnl: 0,
      pnlPercent: 0,
      openTime: now(),
      status: 'open',
    };

    const order: OrderEntry = {
      id: genId(),
      symbol: selectedSymbol,
      type: orderSide,
      orderType: orderType,
      price,
      quantity: orderQty,
      time: now(),
      status: 'filled',
    };

    setPositions(prev => [position, ...prev]);
    setOrderHistory(prev => [order, ...prev]);

    if (orderSide === 'BUY') {
      setBalance(prev => prev - cost);
    } else {
      // Short: credit the sell amount
      setBalance(prev => prev + cost);
    }

    // Auto-start simulation on first trade
    if (!isSimRunning) setIsSimRunning(true);
  }, [orderSide, orderType, orderQty, limitPrice, stopLossInput, takeProfitInput, currentPrice, balance, selectedSymbol, isSimRunning]);

  const handleClosePosition = useCallback((posId: string) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id !== posId || p.status !== 'open') return p;
        const pnl = p.type === 'LONG'
          ? (currentPrice - p.entryPrice) * p.quantity
          : (p.entryPrice - currentPrice) * p.quantity;
        setBalance(b => b + (p.entryPrice * p.quantity) + pnl);
        return {
          ...p,
          status: 'closed' as const,
          closePrice: currentPrice,
          closeTime: now(),
          closeReason: 'Manual Close',
          pnl: Math.round(pnl * 100) / 100,
          pnlPercent: Math.round((pnl / (p.entryPrice * p.quantity)) * 100 * 100) / 100,
          currentPrice,
        };
      })
    );
  }, [currentPrice]);

  const handleReset = () => {
    setBalance(INITIAL_BALANCE);
    setPositions([]);
    setOrderHistory([]);
    setTickOffset(0);
    setIsSimRunning(false);
  };

  // ---- Computed ----
  const openPositions = positions.filter(p => p.status === 'open');
  const closedPositions = positions.filter(p => p.status === 'closed');
  const totalPnL = openPositions.reduce((s, p) => s + p.pnl, 0);
  const realizedPnL = closedPositions.reduce((s, p) => s + p.pnl, 0);
  const totalInvested = openPositions.reduce((s, p) => s + p.entryPrice * p.quantity, 0);
  const portfolioValue = balance + totalInvested + totalPnL;
  const overallReturn = ((portfolioValue - INITIAL_BALANCE) / INITIAL_BALANCE) * 100;
  const winRate = closedPositions.length > 0
    ? (closedPositions.filter(p => p.pnl > 0).length / closedPositions.length * 100)
    : 0;

  const timeframes = ['1H', '1D', '1W', '1M', '3M', '6M', '1Y'];

  // Entry markers on chart
  const entryMarkers = openPositions
    .filter(p => p.symbol === selectedSymbol)
    .map(p => p.entryPrice);

  return (
    <div className="h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Simulation Trading</h1>
            <p className="text-[11px] text-gray-500">Practice trading with ₹10L virtual money — zero risk</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sim controls */}
          <button
            onClick={() => setIsSimRunning(!isSimRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSimRunning ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}
          >
            {isSimRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimRunning ? 'Pause' : 'Start'} Sim
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-gray-800/30 border border-gray-700/30 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Portfolio Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {[
          { label: 'Portfolio Value', value: `₹${portfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: Briefcase, color: 'cyan' },
          { label: 'Available Balance', value: `₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'white' },
          { label: 'Unrealized P&L', value: `₹${totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: totalPnL >= 0 ? 'emerald' : 'red' },
          { label: 'Realized P&L', value: `₹${realizedPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: Award, color: realizedPnL >= 0 ? 'emerald' : 'red' },
          { label: 'Overall Return', value: `${overallReturn.toFixed(2)}%`, icon: Percent, color: overallReturn >= 0 ? 'emerald' : 'red' },
          { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, icon: ShieldCheck, color: winRate >= 50 ? 'emerald' : 'yellow' },
        ].map((stat, i) => {
          const colorMap: Record<string, string> = { cyan: 'text-cyan-400', emerald: 'text-emerald-400', red: 'text-red-400', yellow: 'text-yellow-400', white: 'text-white' };
          return (
            <div key={i} className="bg-[#13131d] border border-gray-800/40 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className={`w-3 h-3 ${colorMap[stat.color] || 'text-gray-400'}`} />
                <span className="text-[10px] text-gray-500">{stat.label}</span>
              </div>
              <p className={`text-sm font-bold font-mono ${colorMap[stat.color] || 'text-white'}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Layout: Chart + Order Panel */}
      <div className="flex gap-3 mb-3">
        {/* Chart Area */}
        <div className="flex-1 bg-[#13131d] border border-gray-800/40 rounded-xl overflow-hidden">
          {/* Chart Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800/30">
            <div className="flex items-center gap-3">
              {/* Symbol Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSymbolDropdown(!showSymbolDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a12] border border-gray-700/40 rounded-lg text-sm text-white font-medium hover:border-cyan-500/30 transition-all"
                >
                  <span className="text-cyan-400 font-bold">{stock.symbol}</span>
                  <span className="text-gray-400 text-xs hidden md:inline">{stock.name}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>
                {showSymbolDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
                    {stocks.map(s => (
                      <button
                        key={s.symbol}
                        onClick={() => { setSelectedSymbol(s.symbol); setShowSymbolDropdown(false); setTickOffset(0); }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-800/50 text-xs flex items-center justify-between ${s.symbol === selectedSymbol ? 'bg-cyan-500/10 text-cyan-400' : 'text-white'}`}
                      >
                        <span className="font-medium">{s.symbol}</span>
                        <span className="text-gray-500">{s.name.slice(0, 20)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white font-mono">₹{currentPrice.toFixed(2)}</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${stock.change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                </span>
              </div>

              {isSimRunning && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sim
                </span>
              )}
            </div>

            {/* Timeframes */}
            <div className="flex items-center gap-1">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${timeframe === tf ? 'bg-cyan-500 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-800/40'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[320px] px-2 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="simChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => `₹${v}`} width={60} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(v) => [`₹${Number(v).toFixed(2)}`, 'Price']}
                />
                {/* Entry price markers */}
                {entryMarkers.map((ep, i) => (
                  <ReferenceLine key={i} y={ep} stroke="#a855f7" strokeDasharray="4 4" strokeWidth={1} label={{ value: `Entry ₹${ep.toFixed(0)}`, fill: '#a855f7', fontSize: 9, position: 'right' }} />
                ))}
                <Area type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} fill="url(#simChartGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume */}
          <div className="h-[70px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 5, bottom: 0 }}>
                <XAxis dataKey="time" tick={false} axisLine={false} tickLine={false} />
                <YAxis tick={false} axisLine={false} tickLine={false} width={60} />
                <Bar dataKey="volume" fill="#06b6d4" opacity={0.3} radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Panel */}
        {showOrderPanel && (
          <div className="w-80 bg-[#13131d] border border-gray-800/40 rounded-xl flex flex-col">
            {/* Order Form Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/30">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Place Order
              </h3>
              <button onClick={() => setShowOrderPanel(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Buy/Sell Toggle */}
              <div className="grid grid-cols-2 gap-1 bg-[#0a0a12] rounded-lg p-1">
                <button
                  onClick={() => setOrderSide('BUY')}
                  className={`py-2 rounded-md text-xs font-bold transition-all ${orderSide === 'BUY' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-500 hover:text-white'}`}
                >
                  <span className="flex items-center justify-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> BUY / LONG</span>
                </button>
                <button
                  onClick={() => setOrderSide('SELL')}
                  className={`py-2 rounded-md text-xs font-bold transition-all ${orderSide === 'SELL' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-gray-500 hover:text-white'}`}
                >
                  <span className="flex items-center justify-center gap-1"><ArrowDownRight className="w-3.5 h-3.5" /> SELL / SHORT</span>
                </button>
              </div>

              {/* Order Type */}
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Order Type</label>
                <div className="grid grid-cols-3 gap-1 bg-[#0a0a12] rounded-lg p-0.5">
                  {(['MARKET', 'LIMIT', 'STOP'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setOrderType(t)}
                      className={`py-1.5 rounded-md text-[10px] font-medium transition-all ${orderType === t ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Quantity (Shares)</label>
                <input
                  type="number"
                  value={orderQty}
                  onChange={e => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#0a0a12] border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500/50 focus:outline-none transition-colors"
                />
                <div className="flex gap-1 mt-1.5">
                  {[1, 5, 10, 25, 50, 100].map(q => (
                    <button key={q} onClick={() => setOrderQty(q)} className={`flex-1 py-1 rounded text-[9px] font-medium transition-all ${orderQty === q ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-800/30 text-gray-500 hover:text-white'}`}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Limit Price (shown for LIMIT / STOP orders) */}
              {orderType !== 'MARKET' && (
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">{orderType === 'LIMIT' ? 'Limit Price' : 'Stop Price'}</label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={e => setLimitPrice(e.target.value)}
                    placeholder={`₹${currentPrice.toFixed(2)}`}
                    className="w-full bg-[#0a0a12] border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500/50 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {/* Stop Loss */}
              <div>
                <label className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" /> Stop Loss (Optional)
                </label>
                <input
                  type="number"
                  value={stopLossInput}
                  onChange={e => setStopLossInput(e.target.value)}
                  placeholder={`e.g. ₹${(currentPrice * 0.98).toFixed(2)}`}
                  className="w-full bg-[#0a0a12] border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-red-500/50 focus:outline-none transition-colors"
                />
              </div>

              {/* Take Profit */}
              <div>
                <label className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
                  <Target className="w-3 h-3 text-emerald-400" /> Take Profit (Optional)
                </label>
                <input
                  type="number"
                  value={takeProfitInput}
                  onChange={e => setTakeProfitInput(e.target.value)}
                  placeholder={`e.g. ₹${(currentPrice * 1.03).toFixed(2)}`}
                  className="w-full bg-[#0a0a12] border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500/50 focus:outline-none transition-colors"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-[#0a0a12] rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Est. Cost</span>
                  <span className="text-white font-mono">₹{(currentPrice * orderQty).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Available</span>
                  <span className="text-white font-mono">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                {stopLossInput && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Max Loss</span>
                    <span className="text-red-400 font-mono">
                      ₹{Math.abs((currentPrice - parseFloat(stopLossInput)) * orderQty).toFixed(0)}
                    </span>
                  </div>
                )}
                {takeProfitInput && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Target Profit</span>
                    <span className="text-emerald-400 font-mono">
                      ₹{Math.abs((parseFloat(takeProfitInput) - currentPrice) * orderQty).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  orderSide === 'BUY'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-400 hover:to-green-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-400 hover:to-pink-400 shadow-lg shadow-red-500/20'
                }`}
              >
                {orderSide === 'BUY' ? 'Buy' : 'Sell'} {orderQty} {selectedSymbol} @ ₹{currentPrice.toFixed(2)}
              </button>

              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 px-1">
                <Info className="w-3 h-3" />
                This is a simulation. No real money is involved.
              </div>
            </div>
          </div>
        )}

        {!showOrderPanel && (
          <button
            onClick={() => setShowOrderPanel(true)}
            className="w-8 bg-[#13131d] border border-gray-800/40 rounded-xl flex items-center justify-center hover:bg-gray-800/30 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Bottom Panel: Positions / Orders / History / Performance */}
      <div className="bg-[#13131d] border border-gray-800/40 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-800/30">
          {[
            { id: 'positions' as const, label: 'Open Positions', icon: Target, count: openPositions.length },
            { id: 'orders' as const, label: 'Order History', icon: History, count: orderHistory.length },
            { id: 'history' as const, label: 'Closed Trades', icon: BarChart3, count: closedPositions.length },
            { id: 'performance' as const, label: 'Performance', icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setBottomTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 ${
                bottomTab === tab.id
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-gray-500 hover:text-gray-300 border-transparent'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-gray-800 text-gray-400">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-h-[250px] overflow-y-auto">
          {/* Positions */}
          {bottomTab === 'positions' && (
            openPositions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <Target className="w-8 h-8 mb-2 text-gray-700" />
                <p className="text-sm">No open positions</p>
                <p className="text-[10px] text-gray-600 mt-1">Place a trade to get started</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-gray-500 border-b border-gray-800/30">
                    <th className="text-left px-4 py-2 font-medium">Symbol</th>
                    <th className="text-center px-2 py-2 font-medium">Side</th>
                    <th className="text-right px-2 py-2 font-medium">Qty</th>
                    <th className="text-right px-2 py-2 font-medium">Entry</th>
                    <th className="text-right px-2 py-2 font-medium">Current</th>
                    <th className="text-right px-2 py-2 font-medium">SL</th>
                    <th className="text-right px-2 py-2 font-medium">TP</th>
                    <th className="text-right px-2 py-2 font-medium">P&L</th>
                    <th className="text-right px-4 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {openPositions.map(pos => (
                    <tr key={pos.id} className="border-b border-gray-800/10 hover:bg-gray-800/10 transition-colors">
                      <td className="px-4 py-2 text-xs text-white font-medium">{pos.symbol}</td>
                      <td className="px-2 py-2 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${pos.type === 'LONG' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                          {pos.type}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-300 text-right font-mono">{pos.quantity}</td>
                      <td className="px-2 py-2 text-xs text-gray-300 text-right font-mono">₹{pos.entryPrice.toFixed(2)}</td>
                      <td className="px-2 py-2 text-xs text-white text-right font-mono">₹{pos.currentPrice.toFixed(2)}</td>
                      <td className="px-2 py-2 text-xs text-right font-mono text-red-400/60">{pos.stopLoss ? `₹${pos.stopLoss.toFixed(0)}` : '—'}</td>
                      <td className="px-2 py-2 text-xs text-right font-mono text-emerald-400/60">{pos.takeProfit ? `₹${pos.takeProfit.toFixed(0)}` : '—'}</td>
                      <td className={`px-2 py-2 text-xs text-right font-mono font-medium ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pos.pnl >= 0 ? '+' : ''}₹{pos.pnl.toFixed(0)} ({pos.pnlPercent.toFixed(2)}%)
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleClosePosition(pos.id)}
                          className="text-[10px] px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* Order History */}
          {bottomTab === 'orders' && (
            orderHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <History className="w-8 h-8 mb-2 text-gray-700" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-gray-500 border-b border-gray-800/30">
                    <th className="text-left px-4 py-2 font-medium">Time</th>
                    <th className="text-left px-2 py-2 font-medium">Symbol</th>
                    <th className="text-center px-2 py-2 font-medium">Side</th>
                    <th className="text-center px-2 py-2 font-medium">Type</th>
                    <th className="text-right px-2 py-2 font-medium">Qty</th>
                    <th className="text-right px-2 py-2 font-medium">Price</th>
                    <th className="text-right px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.map(order => (
                    <tr key={order.id} className="border-b border-gray-800/10 hover:bg-gray-800/10">
                      <td className="px-4 py-2 text-xs text-gray-500 font-mono">{order.time}</td>
                      <td className="px-2 py-2 text-xs text-white font-medium">{order.symbol}</td>
                      <td className="px-2 py-2 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${order.type === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                          {order.type}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-400 text-center">{order.orderType}</td>
                      <td className="px-2 py-2 text-xs text-gray-300 text-right font-mono">{order.quantity}</td>
                      <td className="px-2 py-2 text-xs text-white text-right font-mono">₹{order.price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* Closed Trades */}
          {bottomTab === 'history' && (
            closedPositions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <BarChart3 className="w-8 h-8 mb-2 text-gray-700" />
                <p className="text-sm">No closed trades yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-gray-500 border-b border-gray-800/30">
                    <th className="text-left px-4 py-2 font-medium">Symbol</th>
                    <th className="text-center px-2 py-2 font-medium">Side</th>
                    <th className="text-right px-2 py-2 font-medium">Entry</th>
                    <th className="text-right px-2 py-2 font-medium">Exit</th>
                    <th className="text-right px-2 py-2 font-medium">Qty</th>
                    <th className="text-right px-2 py-2 font-medium">P&L</th>
                    <th className="text-right px-4 py-2 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {closedPositions.map(pos => (
                    <tr key={pos.id} className="border-b border-gray-800/10 hover:bg-gray-800/10">
                      <td className="px-4 py-2 text-xs text-white font-medium">{pos.symbol}</td>
                      <td className="px-2 py-2 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${pos.type === 'LONG' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                          {pos.type}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-300 text-right font-mono">₹{pos.entryPrice.toFixed(2)}</td>
                      <td className="px-2 py-2 text-xs text-white text-right font-mono">₹{pos.closePrice?.toFixed(2)}</td>
                      <td className="px-2 py-2 text-xs text-gray-300 text-right font-mono">{pos.quantity}</td>
                      <td className={`px-2 py-2 text-xs text-right font-mono font-medium ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pos.pnl >= 0 ? '+' : ''}₹{pos.pnl.toFixed(0)} ({pos.pnlPercent.toFixed(2)}%)
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-500 text-right">{pos.closeReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* Performance Tab */}
          {bottomTab === 'performance' && (
            <div className="p-4">
              {closedPositions.length === 0 && openPositions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <Award className="w-8 h-8 mb-2 text-gray-700" />
                  <p className="text-sm">Start trading to see performance stats</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[#0a0a12] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Total Trades</p>
                    <p className="text-lg font-bold text-white">{positions.length}</p>
                  </div>
                  <div className="bg-[#0a0a12] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Winning Trades</p>
                    <p className="text-lg font-bold text-emerald-400">{closedPositions.filter(p => p.pnl > 0).length}</p>
                  </div>
                  <div className="bg-[#0a0a12] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Losing Trades</p>
                    <p className="text-lg font-bold text-red-400">{closedPositions.filter(p => p.pnl < 0).length}</p>
                  </div>
                  <div className="bg-[#0a0a12] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Win Rate</p>
                    <p className={`text-lg font-bold ${winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{winRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-[#0a0a12] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Best Trade</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {closedPositions.length > 0 ? `₹${Math.max(...closedPositions.map(p => p.pnl)).toFixed(0)}` : '—'}
                    </p>
                  </div>
                  <div className="bg-[#0a0a12] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Worst Trade</p>
                    <p className="text-lg font-bold text-red-400">
                      {closedPositions.length > 0 ? `₹${Math.min(...closedPositions.map(p => p.pnl)).toFixed(0)}` : '—'}
                    </p>
                  </div>
                  <div className="bg-[#0a0a12] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Avg Profit</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {closedPositions.filter(p => p.pnl > 0).length > 0
                        ? `₹${(closedPositions.filter(p => p.pnl > 0).reduce((s, p) => s + p.pnl, 0) / closedPositions.filter(p => p.pnl > 0).length).toFixed(0)}`
                        : '—'}
                    </p>
                  </div>
                  <div className="bg-[#0a0a12] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Avg Loss</p>
                    <p className="text-lg font-bold text-red-400">
                      {closedPositions.filter(p => p.pnl < 0).length > 0
                        ? `₹${(closedPositions.filter(p => p.pnl < 0).reduce((s, p) => s + p.pnl, 0) / closedPositions.filter(p => p.pnl < 0).length).toFixed(0)}`
                        : '—'}
                    </p>
                  </div>

                  {/* Equity Curve */}
                  {closedPositions.length > 1 && (
                    <div className="col-span-full bg-[#0a0a12] rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 mb-2">Equity Curve</p>
                      <div className="h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={closedPositions.map((_, i) => ({
                              trade: i + 1,
                              equity: INITIAL_BALANCE + closedPositions.slice(0, i + 1).reduce((s, p) => s + p.pnl, 0),
                            }))}
                          >
                            <XAxis dataKey="trade" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} width={50} />
                            <Line type="monotone" dataKey="equity" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
