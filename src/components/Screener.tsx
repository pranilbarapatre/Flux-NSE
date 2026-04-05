import { useState } from 'react';
import { Search, Filter, SlidersHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { stocks } from '../data/stockData';

interface ScreenerProps {
  onSelectStock: (symbol: string) => void;
}

export default function Screener({ onSelectStock }: ScreenerProps) {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change' | 'volume'>('symbol');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sectors = ['All', ...Array.from(new Set(stocks.map(s => s.sector)))];

  const filtered = stocks
    .filter(s => {
      const matchSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
      const matchSector = sectorFilter === 'All' || s.sector === sectorFilter;
      return matchSearch && matchSector;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'symbol') cmp = a.symbol.localeCompare(b.symbol);
      else if (sortBy === 'price') cmp = a.price - b.price;
      else if (sortBy === 'change') cmp = a.changePercent - b.changePercent;
      else if (sortBy === 'volume') cmp = parseFloat(a.volume) - parseFloat(b.volume);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock Screener</h1>
          <p className="text-sm text-gray-500">Filter and analyze NSE stocks</p>
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">{filtered.length} stocks</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stocks..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#13131d] border border-gray-800/50 rounded-xl text-sm text-white placeholder-gray-600 focus:border-cyan-500/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} className="bg-[#13131d] border border-gray-800/50 rounded-xl px-3 py-2.5 text-sm text-white appearance-none cursor-pointer pr-8">
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#13131d] border border-gray-800/40 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                {[
                  { key: 'symbol' as const, label: 'Stock' },
                  { key: 'price' as const, label: 'Price' },
                  { key: 'change' as const, label: 'Change' },
                  { key: 'volume' as const, label: 'Volume' },
                ].map(col => (
                  <th key={col.key} onClick={() => toggleSort(col.key)} className="text-left text-xs text-gray-500 font-medium px-4 py-3 cursor-pointer hover:text-gray-300 select-none">
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortBy === col.key && <span className="text-cyan-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </span>
                  </th>
                ))}
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Sector</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.symbol} onClick={() => onSelectStock(s.symbol)} className="border-b border-gray-800/20 hover:bg-gray-800/20 cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${s.change > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {s.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{s.symbol}</p>
                        <p className="text-[10px] text-gray-600 truncate max-w-[120px]">{s.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white">₹{s.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1 text-sm font-medium ${s.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {s.change > 0 ? '+' : ''}{s.changePercent}%
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{s.volume}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.sector}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">₹{s.marketCap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
