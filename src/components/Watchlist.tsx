import { useState } from 'react';
import { Star, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { stocks } from '../data/stockData';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface WatchlistProps {
  onSelectStock: (symbol: string) => void;
}

export default function Watchlist({ onSelectStock }: WatchlistProps) {
  const [watchlistSymbols, setWatchlistSymbols] = useState(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'SBIN', 'ITC']);
  const [showAdd, setShowAdd] = useState(false);

  const watchlistStocks = watchlistSymbols.map(sym => stocks.find(s => s.symbol === sym)).filter(Boolean) as typeof stocks;
  const availableStocks = stocks.filter(s => !watchlistSymbols.includes(s.symbol));

  const removeFromWatchlist = (symbol: string) => {
    setWatchlistSymbols(prev => prev.filter(s => s !== symbol));
  };

  const addToWatchlist = (symbol: string) => {
    setWatchlistSymbols(prev => [...prev, symbol]);
    setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Watchlist</h1>
            <p className="text-sm text-gray-500">{watchlistStocks.length} stocks tracked</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-all">
            <Plus className="w-4 h-4" /> Add Stock
          </button>
          {showAdd && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1a1a2e] border border-gray-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
              {availableStocks.map(s => (
                <button key={s.symbol} onClick={() => addToWatchlist(s.symbol)} className="w-full text-left px-4 py-2.5 hover:bg-gray-800/50 text-sm text-white flex justify-between items-center">
                  <span className="font-medium">{s.symbol}</span>
                  <span className="text-gray-500 text-xs">{s.name.slice(0, 20)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {watchlistStocks.map(s => {
          const sparkData = Array.from({ length: 20 }, (_, i) => ({
            v: 50 + (s.change > 0 ? 1 : -1) * i * 0.5 + (Math.random() - 0.5) * 10,
          }));
          return (
            <div key={s.symbol} onClick={() => onSelectStock(s.symbol)} className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4 hover:border-gray-700/60 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${s.change > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {s.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">{s.symbol}</p>
                    <p className="text-[10px] text-gray-600">{s.name.slice(0, 22)}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFromWatchlist(s.symbol); }} className="p-1 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="h-12 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line type="monotone" dataKey="v" stroke={s.change > 0 ? '#10b981' : '#ef4444'} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">₹{s.price.toLocaleString()}</span>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.change > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {s.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.change > 0 ? '+' : ''}{s.changePercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
