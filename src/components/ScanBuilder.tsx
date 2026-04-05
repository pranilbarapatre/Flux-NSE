import { useState } from 'react';
import { Wand2, Plus, Play, Save, Trash2, ChevronDown } from 'lucide-react';

interface Condition {
  id: number;
  indicator: string;
  operator: string;
  value: string;
}

export default function ScanBuilder() {
  const [scanName, setScanName] = useState('My Custom Scan');
  const [conditions, setConditions] = useState<Condition[]>([
    { id: 1, indicator: 'RSI (14)', operator: 'Less Than', value: '30' },
    { id: 2, indicator: 'Volume', operator: 'Greater Than', value: '1000000' },
  ]);
  const [running, setRunning] = useState(false);

  const indicators = ['RSI (14)', 'MACD', 'SMA (20)', 'SMA (50)', 'EMA (12)', 'EMA (26)', 'Bollinger Bands', 'Volume', 'Price', 'ATR (14)', 'Stochastic', 'OBV', 'VWAP', 'ADX'];
  const operators = ['Greater Than', 'Less Than', 'Equals', 'Crosses Above', 'Crosses Below', 'Between'];

  const addCondition = () => {
    setConditions(prev => [...prev, { id: Date.now(), indicator: 'Price', operator: 'Greater Than', value: '' }]);
  };

  const removeCondition = (id: number) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };

  const updateCondition = (id: number, field: keyof Condition, value: string) => {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const runScan = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 2000);
  };

  const results = [
    { symbol: 'TATASTEEL', name: 'Tata Steel', price: 134.25, rsi: 28.4, volume: '42.0M', change: 3.71 },
    { symbol: 'SBIN', name: 'State Bank of India', price: 625.30, rsi: 29.1, volume: '18.5M', change: 1.44 },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 678.90, rsi: 24.8, volume: '21.0M', change: 3.92 },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Scan Builder</h1>
          <p className="text-sm text-gray-500">Create custom scans with 50+ technical indicators</p>
        </div>
      </div>

      {/* Scan Name */}
      <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4 mb-4">
        <label className="text-xs text-gray-500 mb-1 block">Scan Name</label>
        <input value={scanName} onChange={e => setScanName(e.target.value)} className="w-full bg-[#0a0a12] border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-white" />
      </div>

      {/* Conditions */}
      <div className="bg-[#13131d] border border-gray-800/40 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Scan Conditions</h3>
        <div className="space-y-3">
          {conditions.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 bg-[#0a0a12] border border-gray-800/30 rounded-lg p-3">
              <span className="text-[10px] text-gray-600 w-4">{i + 1}.</span>
              <div className="relative flex-1">
                <select value={c.indicator} onChange={e => updateCondition(c.id, 'indicator', e.target.value)} className="w-full bg-[#13131d] border border-gray-700/40 rounded-lg px-3 py-2 text-xs text-white appearance-none cursor-pointer">
                  {indicators.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <select value={c.operator} onChange={e => updateCondition(c.id, 'operator', e.target.value)} className="w-full bg-[#13131d] border border-gray-700/40 rounded-lg px-3 py-2 text-xs text-white appearance-none cursor-pointer">
                  {operators.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
              <input value={c.value} onChange={e => updateCondition(c.id, 'value', e.target.value)} placeholder="Value" className="w-24 bg-[#13131d] border border-gray-700/40 rounded-lg px-3 py-2 text-xs text-white" />
              <button onClick={() => removeCondition(c.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addCondition} className="flex items-center gap-1.5 mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Condition
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button onClick={runScan} disabled={running} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 transition-all disabled:opacity-50">
          <Play className="w-4 h-4" />
          {running ? 'Scanning...' : 'Run Scan'}
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white transition-all">
          <Save className="w-4 h-4" /> Save Scan
        </button>
      </div>

      {/* Results */}
      <div className="bg-[#13131d] border border-gray-800/40 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800/50">
          <h3 className="text-sm font-semibold text-white">Scan Results ({results.length} matches)</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/30">
              <th className="text-left text-[10px] text-gray-500 font-medium px-4 py-2">Stock</th>
              <th className="text-right text-[10px] text-gray-500 font-medium px-4 py-2">Price</th>
              <th className="text-right text-[10px] text-gray-500 font-medium px-4 py-2">RSI</th>
              <th className="text-right text-[10px] text-gray-500 font-medium px-4 py-2">Volume</th>
              <th className="text-right text-[10px] text-gray-500 font-medium px-4 py-2">Change</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.symbol} className="border-b border-gray-800/10 hover:bg-gray-800/15 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-white">{r.symbol}</p>
                  <p className="text-[10px] text-gray-600">{r.name}</p>
                </td>
                <td className="px-4 py-3 text-sm text-white text-right">₹{r.price}</td>
                <td className="px-4 py-3 text-sm text-amber-400 text-right font-mono">{r.rsi}</td>
                <td className="px-4 py-3 text-sm text-gray-400 text-right">{r.volume}</td>
                <td className="px-4 py-3 text-sm text-emerald-400 text-right">+{r.change}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
