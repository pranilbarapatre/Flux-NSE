import { LayoutDashboard, Monitor, Wand2, BookOpen, Search, BarChart3, Star, Bell, Settings, LogOut, Zap, ChevronLeft, Target } from 'lucide-react';

export type Page = 'dashboard' | 'terminal' | 'scanbuilder' | 'orderbook' | 'screener' | 'charts' | 'watchlist' | 'alerts' | 'simulation';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'terminal', label: 'Terminal', icon: Monitor },
  { id: 'scanbuilder', label: 'Scan Builder', icon: Wand2 },
  { id: 'orderbook', label: 'Order Book', icon: BookOpen },
  { id: 'screener', label: 'Screener', icon: Search },
  { id: 'charts', label: 'Charts', icon: BarChart3 },
  { id: 'simulation', label: 'Simulation', icon: Target },
  { id: 'watchlist', label: 'Watchlist', icon: Star },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

export default function Sidebar({ activePage, onNavigate, onLogout, userName, userEmail, collapsed, onToggle }: SidebarProps) {
  return (
    <>
      <aside className={`fixed left-0 top-0 h-full bg-[#0d0d14] border-r border-gray-800/50 flex flex-col z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-[165px]'}`}>
        {/* Logo */}
        <div className={`flex items-center gap-2 px-4 py-5 border-b border-gray-800/30 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight">FluxNSE</h1>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider">Stock Scanner</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isSimulation = item.id === 'simulation';
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activePage === item.id
                    ? isSimulation
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/20'
                    : isSimulation
                      ? 'text-purple-400/60 hover:text-purple-300 hover:bg-purple-800/10'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>



        {/* Bottom */}
        <div className="border-t border-gray-800/30 px-2 py-2 space-y-0.5">
          <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <Settings className="w-4 h-4" />
            {!collapsed && <span>Settings</span>}
          </button>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800/30 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-gray-800/30">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-gray-600 truncate">{userEmail}</p>
          </div>
        )}
      </aside>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="fixed z-50 bg-cyan-500 hover:bg-cyan-400 w-6 h-6 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-all"
        style={{ left: collapsed ? 52 : 152, top: '50%' }}
      >
        <ChevronLeft className={`w-3.5 h-3.5 text-white transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>
    </>
  );
}
