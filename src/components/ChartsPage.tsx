import { useState, useMemo } from 'react';
import { ChevronDown, TrendingUp, Star, Bell } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { stocks, generateChartData } from '../data/stockData';

export default function ChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [timeframe, setTimeframe] = useState('3M');
  const [showDropdown, setShowDropdown] = useState(false);
  const [watching, setWatching] = useState(true);

  const stock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];

  const chartData = useMemo(() => {
    return generateChartData(timeframe, stock.price);
  }, [selectedSymbol, timeframe, stock.price]);

  const timeframes = ['1H', '1D', '1W', '1M', '3M', '6M', '1Y'];

  const dayLow = stock.price - Math.random() * 50;
  const dayHigh = stock.price + Math.random() * 50;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 text-left">
              <h1 className="text-2xl font-bold text-white">{stock.symbol}</h1>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-[#1a1a2e] border border-gray-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto w-72">
                {stocks.map(s => (
                  <button key={s.symbol} onClick={() => { setSelectedSymbol(s.symbol); setShowDropdown(false); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-800/50 text-sm text-white flex justify-between">
                    <span className="font-medium">{s.symbol}</span>
                    <span className="text-gray-500 text-xs">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${stock.change > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <TrendingUp className="w-3 h-3" />
            {stock.change > 0 ? '+' : ''}{stock.changePercent}%
          </span>
          <p className="text-sm text-gray-500">{stock.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setWatching(!watching)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${watching ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-gray-800/50 border border-gray-700/50 text-gray-400'}`}>
            <Star className={`w-4 h-4 ${watching ? 'fill-amber-400' : ''}`} />
            {watching ? 'Watching' : 'Watch'}
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white transition-all">
            <Bell className="w-4 h-4" /> Set Alert
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-white">₹{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className={`text-lg font-medium ${stock.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change > 0 ? '+' : ''}{stock.changePercent}%)
          </span>
        </div>
      </div>

      {/* Timeframe */}
      <div className="flex items-center gap-1.5 mb-4">
        {timeframes.map(tf => (
          <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${timeframe === tf ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/40 border border-transparent hover:border-gray-700/50'}`}>
            {tf}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4 mb-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#6b7280' }} interval="preserveStartEnd" tickLine={false} axisLine={{ stroke: '#1f2937' }} />
              <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} domain={['auto', 'auto']} tickLine={false} axisLine={false} width={60} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }} formatter={(v: unknown) => [`₹${Number(v).toFixed(2)}`, 'Price']} />
              <Line type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-24 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="time" tick={{ fontSize: 7, fill: '#4b5563' }} interval="preserveStartEnd" tickLine={false} axisLine={false} />
              <YAxis tick={false} axisLine={false} width={60} />
              <Bar dataKey="volume" fill="#3b82f6" opacity={0.4} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Market Cap', value: `₹${stock.marketCap}` },
          { label: 'P/E Ratio', value: stock.peRatio.toFixed(2) },
          { label: '52W High', value: `₹${stock.high52.toLocaleString()}` },
          { label: '52W Low', value: `₹${stock.low52.toLocaleString()}` },
          { label: 'Volume', value: stock.volume },
          { label: 'Sector', value: stock.sector },
          { label: 'Industry', value: stock.industry },
          { label: 'Day Range', value: `₹${Math.round(dayLow)} - ₹${Math.round(dayHigh)}` },
        ].map((item, i) => (
          <div key={i} className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className="text-sm font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
