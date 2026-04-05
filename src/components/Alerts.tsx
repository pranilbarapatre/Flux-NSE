import { useState } from 'react';
import { Bell, Plus, Trash2, Check, X, TrendingUp, TrendingDown } from 'lucide-react';

interface Alert {
  id: number;
  symbol: string;
  condition: string;
  value: number;
  active: boolean;
  triggered: boolean;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 1, symbol: 'RELIANCE', condition: 'Price Above', value: 2500, active: true, triggered: false },
    { id: 2, symbol: 'TCS', condition: 'Price Below', value: 3600, active: true, triggered: true },
    { id: 3, symbol: 'HDFCBANK', condition: 'Price Above', value: 1700, active: false, triggered: false },
    { id: 4, symbol: 'TATAMOTORS', condition: 'Change % Above', value: 5, active: true, triggered: false },
    { id: 5, symbol: 'INFY', condition: 'Volume Above', value: 10000000, active: true, triggered: false },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [newSymbol, setNewSymbol] = useState('RELIANCE');
  const [newCondition, setNewCondition] = useState('Price Above');
  const [newValue, setNewValue] = useState('');

  const toggleAlert = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const deleteAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const createAlert = () => {
    if (newValue) {
      setAlerts(prev => [...prev, { id: Date.now(), symbol: newSymbol, condition: newCondition, value: Number(newValue), active: true, triggered: false }]);
      setShowCreate(false);
      setNewValue('');
    }
  };

  const conditions = ['Price Above', 'Price Below', 'Change % Above', 'Change % Below', 'Volume Above', 'RSI Above', 'RSI Below'];
  const symbolOptions = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'TATASTEEL', 'SBIN', 'ITC', 'WIPRO', 'MARUTI'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Price Alerts</h1>
            <p className="text-sm text-gray-500">{alerts.filter(a => a.active).length} active alerts</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-all">
          <Plus className="w-4 h-4" /> Create Alert
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreate && (
        <div className="bg-[#13131d] border border-cyan-500/20 rounded-xl p-4 mb-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-white mb-3">New Alert</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] text-gray-500 mb-1 block">Symbol</label>
              <select value={newSymbol} onChange={e => setNewSymbol(e.target.value)} className="w-full bg-[#0a0a12] border border-gray-700/40 rounded-lg px-3 py-2 text-xs text-white">
                {symbolOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] text-gray-500 mb-1 block">Condition</label>
              <select value={newCondition} onChange={e => setNewCondition(e.target.value)} className="w-full bg-[#0a0a12] border border-gray-700/40 rounded-lg px-3 py-2 text-xs text-white">
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="w-24">
              <label className="text-[10px] text-gray-500 mb-1 block">Value</label>
              <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="2500" className="w-full bg-[#0a0a12] border border-gray-700/40 rounded-lg px-3 py-2 text-xs text-white" />
            </div>
            <button onClick={createAlert} className="px-4 py-2 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-400 transition-all">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-800 text-gray-400 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-2">
        {alerts.map(alert => (
          <div key={alert.id} className={`bg-[#13131d] border rounded-xl p-4 flex items-center justify-between transition-all ${alert.triggered ? 'border-amber-500/30 bg-amber-500/5' : alert.active ? 'border-gray-800/40' : 'border-gray-800/20 opacity-50'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                alert.triggered ? 'bg-amber-500/15 text-amber-400' :
                alert.condition.includes('Above') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {alert.condition.includes('Above') ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{alert.symbol}</span>
                  {alert.triggered && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">Triggered</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {alert.condition}: <span className="text-white font-mono">{alert.value.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleAlert(alert.id)} className={`w-10 h-5 rounded-full transition-all relative ${alert.active ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${alert.active ? 'left-5' : 'left-0.5'}`} />
              </button>
              <button onClick={() => deleteAlert(alert.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
