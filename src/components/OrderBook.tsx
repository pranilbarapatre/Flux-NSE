import { useState, useMemo } from 'react';
import { Settings, RefreshCw, ChevronDown, BarChart3, Waves, Grid3X3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { stocks, generateOrderBook, generateRecentTrades } from '../data/stockData';

export default function OrderBook() {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [activeView, setActiveView] = useState('ladder');
  const [showDropdown, setShowDropdown] = useState(false);

  const stock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];
  const { bids, asks, spread, spreadPercent } = useMemo(() => generateOrderBook(), [selectedSymbol]);
  const trades = useMemo(() => generateRecentTrades(), [selectedSymbol]);

  // Build depth chart data (cumulative bids/asks)
  const depthData = useMemo(() => {
    const bidPrices = bids.map(b => b.price).sort((a, b) => a - b);
    const askPrices = asks.map(a => a.price).sort((a, b) => a - b);

    const bidQtyRaw = bids.map(b => parseFloat(b.quantity.replace('K', '')) * (b.quantity.includes('K') ? 1000 : 1));
    const askQtyRaw = asks.map(a => parseFloat(a.quantity.replace('K', '')) * (a.quantity.includes('K') ? 1000 : 1));

    // Cumulative bids (right to left)
    const bidCum: number[] = [];
    let cumB = 0;
    for (let i = bidQtyRaw.length - 1; i >= 0; i--) {
      cumB += bidQtyRaw[i];
      bidCum.unshift(cumB);
    }

    // Cumulative asks (left to right)
    const askCum: number[] = [];
    let cumA = 0;
    for (let i = 0; i < askQtyRaw.length; i++) {
      cumA += askQtyRaw[i];
      askCum.push(cumA);
    }

    const points: { price: number; bidDepth: number | null; askDepth: number | null }[] = [];
    bidPrices.forEach((p, i) => {
      points.push({ price: p, bidDepth: bidCum[i], askDepth: null });
    });
    askPrices.forEach((p, i) => {
      points.push({ price: p, bidDepth: null, askDepth: askCum[i] });
    });

    points.sort((a, b) => a.price - b.price);
    return points;
  }, [bids, asks]);

  // Build heatmap data
  const heatmapData = useMemo(() => {
    const rows: { price: number; qty: number; side: 'bid' | 'ask'; intensity: number }[] = [];
    const allQty = [...bids, ...asks].map(r => parseFloat(r.quantity.replace('K', '')) * (r.quantity.includes('K') ? 1000 : 1));
    const maxQty = Math.max(...allQty);

    bids.forEach(b => {
      const qty = parseFloat(b.quantity.replace('K', '')) * (b.quantity.includes('K') ? 1000 : 1);
      rows.push({ price: b.price, qty, side: 'bid', intensity: qty / maxQty });
    });
    asks.forEach(a => {
      const qty = parseFloat(a.quantity.replace('K', '')) * (a.quantity.includes('K') ? 1000 : 1);
      rows.push({ price: a.price, qty, side: 'ask', intensity: qty / maxQty });
    });

    rows.sort((a, b) => b.price - a.price);
    return rows;
  }, [bids, asks]);

  const totalBidQty = useMemo(() => {
    return bids.reduce((sum, b) => sum + parseFloat(b.quantity.replace('K', '')) * (b.quantity.includes('K') ? 1000 : 1), 0);
  }, [bids]);

  const totalAskQty = useMemo(() => {
    return asks.reduce((sum, a) => sum + parseFloat(a.quantity.replace('K', '')) * (a.quantity.includes('K') ? 1000 : 1), 0);
  }, [asks]);

  const imbalance = useMemo(() => {
    const total = totalBidQty + totalAskQty;
    if (total === 0) return 0;
    return ((totalBidQty - totalAskQty) / total) * 100;
  }, [totalBidQty, totalAskQty]);

  const views = [
    { id: 'ladder', label: 'Ladder View', icon: BarChart3 },
    { id: 'depth', label: 'Depth Chart', icon: Waves },
    { id: 'heatmap', label: 'Heatmap', icon: Grid3X3 },
  ];

  const formatQty = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.round(n));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Visual Order Book</h1>
            <p className="text-sm text-gray-500">Real-time market depth & order flow analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
          <button className="p-2 text-gray-500 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Stock Selection & Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        {/* Stock Selector */}
        <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-3 col-span-2 lg:col-span-1">
          <p className="text-[10px] text-gray-500 mb-1">Select Stock</p>
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="w-full flex items-center justify-between bg-[#0a0a12] border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-white">
              <span>{stock.symbol} - {stock.name.slice(0, 18)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                {stocks.map(s => (
                  <button key={s.symbol} onClick={() => { setSelectedSymbol(s.symbol); setShowDropdown(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-800/50 text-xs text-white">
                    {s.symbol} - {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">Last Price</span>
            <span className="text-sm font-bold text-white">₹{stock.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Change</span>
            <span className={`text-xs font-medium ${stock.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ↗ {stock.changePercent}%
            </span>
          </div>
        </div>

        {/* Stats */}
        {[
          { label: 'Spread', value: `₹${spread.toFixed(2)}`, sub: `${spreadPercent}%`, icon: '⚡' },
          { label: 'Total Bid Qty', value: formatQty(totalBidQty), sub: `${bids.length} levels`, icon: '📈', color: 'emerald' },
          { label: 'Total Ask Qty', value: formatQty(totalAskQty), sub: `${asks.length} levels`, icon: '📉', color: 'red' },
          { label: 'Order Imbalance', value: `${imbalance.toFixed(2)}%`, sub: imbalance > 0 ? 'Buyers dominate' : 'Sellers dominate', icon: '⚡', color: imbalance > 0 ? 'emerald' : 'red' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#13131d] border border-gray-800/40 rounded-xl p-3">
            <p className={`text-[10px] mb-1 ${stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'red' ? 'text-red-400' : 'text-gray-500'}`}>
              {stat.icon} {stat.label}
            </p>
            <p className={`text-lg font-bold ${stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'red' ? 'text-red-400' : 'text-white'}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-600">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 mb-4">
        {views.map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeView === v.id ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`}>
            <v.icon className="w-3.5 h-3.5" />
            {v.label}
          </button>
        ))}
      </div>

      {/* ===== LADDER VIEW ===== */}
      {activeView === 'ladder' && (
        <div className="flex gap-3">
          <div className="flex-1 bg-[#13131d] border border-gray-800/40 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left text-[10px] text-gray-500 font-medium px-4 py-2">Orders</th>
                  <th className="text-center text-[10px] text-gray-500 font-medium px-4 py-2">Quantity</th>
                  <th className="text-center text-[10px] text-gray-500 font-medium px-4 py-2">Price (₹)</th>
                  <th className="text-right text-[10px] text-gray-500 font-medium px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((row, i) => (
                  <tr key={`bid-${i}`} className="border-b border-gray-800/10 hover:bg-gray-800/15 transition-colors relative">
                    <td className="px-4 py-2 text-xs text-gray-400 relative">
                      <div className="absolute inset-0 bg-emerald-500/8" style={{ width: `${row.barWidth}%` }} />
                      <span className="relative">{row.orders}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-emerald-400 text-center font-mono">{row.quantity}</td>
                    <td className="px-4 py-2 text-xs text-white text-center font-mono font-medium">{row.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-xs text-gray-400 text-right font-mono">{row.total}</td>
                  </tr>
                ))}
                <tr className="bg-gray-800/20 border-y border-gray-700/30">
                  <td colSpan={2} className="px-4 py-2 text-xs text-gray-500">Spread</td>
                  <td className="px-4 py-2 text-xs text-emerald-400 text-center font-mono font-medium">₹{spread.toFixed(2)}</td>
                  <td className="px-4 py-2 text-[10px] text-gray-500 text-right">({spreadPercent}%)</td>
                </tr>
                {asks.map((row, i) => (
                  <tr key={`ask-${i}`} className="border-b border-gray-800/10 hover:bg-gray-800/15 transition-colors relative">
                    <td className="px-4 py-2 text-xs text-gray-400 relative">
                      <div className="absolute inset-0 bg-red-500/8" style={{ width: `${row.barWidth}%` }} />
                      <span className="relative">{row.orders}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-red-400 text-center font-mono">{row.quantity}</td>
                    <td className="px-4 py-2 text-xs text-white text-center font-mono font-medium">{row.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-xs text-gray-400 text-right font-mono">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Trades Sidebar */}
          <div className="w-80 hidden lg:block">
            <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
                <span className="text-[10px] text-gray-500">Time & Sales</span>
              </div>
              <div className="space-y-1.5">
                {trades.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-medium ${t.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>₹{t.price.toFixed(2)}</span>
                    <span className="text-white font-mono">{t.qty}</span>
                    <span className="text-gray-600 font-mono text-[10px]">{t.time}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-gray-800/30">
                <div>
                  <p className="text-[10px] text-gray-500">Buy Volume</p>
                  <p className="text-xs font-semibold text-emerald-400">9.2K</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500">Sell Volume</p>
                  <p className="text-xs font-semibold text-red-400">6.6K</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DEPTH CHART VIEW ===== */}
      {activeView === 'depth' && (
        <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Market Depth</h3>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" /> Bids (Buy)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/60" /> Asks (Sell)</span>
            </div>
          </div>

          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={depthData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="askGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="price"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickFormatter={(v: number) => `₹${v.toFixed(0)}`}
                  axisLine={{ stroke: '#1f2937' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickFormatter={(v: number) => formatQty(v)}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                  labelFormatter={(v) => `Price: ₹${Number(v).toFixed(2)}`}
                  formatter={(value, name) => {
                    if (value === null || value === undefined) return ['-', String(name)];
                    return [formatQty(Number(value)), name === 'bidDepth' ? 'Bid Volume' : 'Ask Volume'];
                  }}
                />
                <Area
                  type="stepAfter"
                  dataKey="bidDepth"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#bidGrad)"
                  connectNulls={false}
                />
                <Area
                  type="stepAfter"
                  dataKey="askDepth"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#askGrad)"
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Depth Summary */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-800/30">
            <div className="bg-[#0a0a12] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Bid Wall</p>
              <p className="text-sm font-bold text-emerald-400">₹{bids[bids.length - 1]?.price.toFixed(2)}</p>
              <p className="text-[10px] text-gray-600">Strongest support</p>
            </div>
            <div className="bg-[#0a0a12] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Mid Price</p>
              <p className="text-sm font-bold text-white">₹{((bids[0]?.price + asks[0]?.price) / 2).toFixed(2)}</p>
              <p className="text-[10px] text-gray-600">Best bid/ask avg</p>
            </div>
            <div className="bg-[#0a0a12] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Ask Wall</p>
              <p className="text-sm font-bold text-red-400">₹{asks[asks.length - 1]?.price.toFixed(2)}</p>
              <p className="text-[10px] text-gray-600">Strongest resistance</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== HEATMAP VIEW ===== */}
      {activeView === 'heatmap' && (
        <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Order Book Heatmap</h3>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Bids</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Asks</span>
              <span className="text-gray-500">Brighter = Higher Volume</span>
            </div>
          </div>

          <div className="space-y-1">
            {heatmapData.map((row, i) => {
              const isBid = row.side === 'bid';
              const bgOpacity = 0.1 + row.intensity * 0.7;
              const borderColor = isBid ? `rgba(16, 185, 129, ${bgOpacity})` : `rgba(239, 68, 68, ${bgOpacity})`;
              const bgColor = isBid ? `rgba(16, 185, 129, ${bgOpacity * 0.3})` : `rgba(239, 68, 68, ${bgOpacity * 0.3})`;

              // Check if this is where spread sits
              const isSpreadBoundary =
                (i > 0 && heatmapData[i - 1]?.side !== row.side);

              return (
                <div key={i}>
                  {isSpreadBoundary && (
                    <div className="flex items-center gap-2 py-2 px-4 my-1">
                      <div className="flex-1 h-px bg-gray-700/50" />
                      <span className="text-[10px] text-yellow-400 font-medium px-2">Spread ₹{spread.toFixed(2)}</span>
                      <div className="flex-1 h-px bg-gray-700/50" />
                    </div>
                  )}
                  <div
                    className="flex items-center rounded-lg px-4 py-2.5 transition-all hover:scale-[1.01] cursor-pointer"
                    style={{ backgroundColor: bgColor, borderLeft: `3px solid ${borderColor}` }}
                  >
                    <div className="w-20 text-xs font-mono font-semibold text-white">
                      ₹{row.price.toFixed(2)}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="relative h-6 bg-gray-900/30 rounded overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded ${isBid ? 'bg-gradient-to-r from-emerald-600/80 to-emerald-400/40' : 'bg-gradient-to-r from-red-600/80 to-red-400/40'}`}
                          style={{ width: `${row.intensity * 100}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/70 font-mono">
                          {formatQty(row.qty)}
                        </div>
                      </div>
                    </div>
                    <div className={`w-16 text-right text-xs font-mono font-semibold ${isBid ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(row.intensity * 100).toFixed(0)}%
                    </div>
                    {/* Heat indicator dots */}
                    <div className="w-12 flex justify-end gap-0.5 ml-2">
                      {Array.from({ length: Math.ceil(row.intensity * 5) }).map((_, j) => (
                        <div
                          key={j}
                          className={`w-1.5 h-1.5 rounded-full ${isBid ? 'bg-emerald-400' : 'bg-red-400'}`}
                          style={{ opacity: 0.4 + (j / 5) * 0.6 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Heatmap Summary */}
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-800/30">
            <div className="bg-[#0a0a12] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Bid Levels</p>
              <p className="text-sm font-bold text-emerald-400">{bids.length}</p>
            </div>
            <div className="bg-[#0a0a12] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Ask Levels</p>
              <p className="text-sm font-bold text-red-400">{asks.length}</p>
            </div>
            <div className="bg-[#0a0a12] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Max Bid Vol</p>
              <p className="text-sm font-bold text-emerald-400">
                {formatQty(Math.max(...heatmapData.filter(r => r.side === 'bid').map(r => r.qty)))}
              </p>
            </div>
            <div className="bg-[#0a0a12] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Max Ask Vol</p>
              <p className="text-sm font-bold text-red-400">
                {formatQty(Math.max(...heatmapData.filter(r => r.side === 'ask').map(r => r.qty)))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
