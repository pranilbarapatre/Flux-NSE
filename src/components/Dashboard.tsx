import { TrendingUp, TrendingDown, Activity, DollarSign, Zap, BarChart3 } from 'lucide-react';
import { stocks, getTopGainers, getTopLosers, getMostActive, getTotalMarketCap } from '../data/stockData';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onViewStock: (symbol: string) => void;
}

function MiniSparkline({ positive }: { positive: boolean }) {
  const data = Array.from({ length: 20 }, (_, i) => ({
    v: 50 + (positive ? 1 : -1) * i * 0.8 + (Math.random() - 0.5) * 15,
  }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={positive ? '#10b981' : '#ef4444'} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard({ onViewStock }: DashboardProps) {
  const gainers = getTopGainers();
  const losers = getTopLosers();
  const active = getMostActive();
  const totalGainers = stocks.filter(s => s.change > 0).length;
  const totalLosers = stocks.filter(s => s.change < 0).length;

  const featured = [
    { symbol: 'RELIANCE', sector: 'Energy', change: '+1.26%', price: '₹2,452.78', positive: true },
    { symbol: 'TCS', sector: 'Technology', change: '-0.22%', price: '₹3,693.85', positive: false },
    { symbol: 'HDFCBANK', sector: 'Financial', change: '+0.53%', price: '₹1,643.92', positive: true },
    { symbol: 'INFY', sector: 'Technology', change: '+0.95%', price: '₹1,458.16', positive: true },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time NSE market overview</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Stocks', value: String(stocks.length), icon: BarChart3, color: 'blue' },
          { label: 'Gainers', value: String(totalGainers), icon: TrendingUp, color: 'green' },
          { label: 'Losers', value: String(totalLosers), icon: TrendingDown, color: 'red' },
          { label: 'Market Cap (Cr)', value: `₹${getTotalMarketCap()}`, icon: DollarSign, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              stat.color === 'blue' ? 'bg-blue-500/15 text-blue-400' :
              stat.color === 'green' ? 'bg-emerald-500/15 text-emerald-400' :
              stat.color === 'red' ? 'bg-red-500/15 text-red-400' :
              'bg-emerald-500/15 text-emerald-400'
            }`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Top Gainers, Losers, Most Active */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Top Gainers */}
        <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Top Gainers</h3>
          </div>
          <div className="space-y-2">
            {gainers.map(s => (
              <button key={s.symbol} onClick={() => onViewStock(s.symbol)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {s.symbol.slice(0, 2)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">{s.symbol}</p>
                  <p className="text-[10px] text-gray-600 truncate">{s.name.slice(0, 18)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">₹{s.price.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-400">+{s.changePercent}%</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-white">Top Losers</h3>
          </div>
          <div className="space-y-2">
            {losers.map(s => (
              <button key={s.symbol} onClick={() => onViewStock(s.symbol)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-400">
                  {s.symbol.slice(0, 2)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white group-hover:text-red-300 transition-colors">{s.symbol}</p>
                  <p className="text-[10px] text-gray-600 truncate">{s.name.slice(0, 18)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">₹{s.price.toLocaleString()}</p>
                  <p className="text-[10px] text-red-400">{s.changePercent}%</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Most Active */}
        <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Most Active</h3>
          </div>
          <div className="space-y-2">
            {active.map(s => (
              <button key={s.symbol} onClick={() => onViewStock(s.symbol)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-xs font-bold text-cyan-400">
                  {s.symbol.slice(0, 2)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">{s.symbol}</p>
                  <p className="text-[10px] text-gray-600 truncate">{s.name.slice(0, 18)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{s.volume}</p>
                  <p className="text-[10px] text-gray-500">volume</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Stocks */}
      <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Featured Stocks</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((f, i) => (
            <button key={i} onClick={() => onViewStock(f.symbol)} className="bg-[#0a0a12] border border-gray-800/30 rounded-xl p-4 hover:border-gray-700/50 transition-all text-left">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-sm font-bold text-white">{f.symbol}</p>
                  <p className="text-[10px] text-gray-600">{f.sector}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${f.positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {f.change}
                </span>
              </div>
              <div className="my-2">
                <MiniSparkline positive={f.positive} />
              </div>
              <p className="text-center text-sm font-semibold text-white">{f.price}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
