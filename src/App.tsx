import { useState } from 'react';
import AuthPage from './components/AuthPage';
import Sidebar, { type Page } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Terminal from './components/Terminal';
import ScanBuilder from './components/ScanBuilder';
import OrderBook from './components/OrderBook';
import Screener from './components/Screener';
import StockDetail from './components/StockDetail';
import ChartsPage from './components/ChartsPage';
import Watchlist from './components/Watchlist';
import Alerts from './components/Alerts';
import SimulationTrading from './components/SimulationTrading';

interface User {
  email: string;
  name: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockDetailFrom, setStockDetailFrom] = useState<Page>('screener');

  const handleLogin = (email: string, name: string) => {
    setUser({ email, name });
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage('dashboard');
  };

  const handleViewStock = (symbol: string, fromPage?: Page) => {
    setSelectedStock(symbol);
    setStockDetailFrom(fromPage || activePage);
  };

  const handleBackFromStock = () => {
    setSelectedStock(null);
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    // If a stock is selected (from screener or charts), show detail view
    if (selectedStock && (activePage === 'screener' || activePage === 'charts')) {
      return (
        <StockDetail
          symbol={selectedStock}
          onBack={handleBackFromStock}
          pageLabel={stockDetailFrom === 'screener' ? 'Screener' : 'Charts'}
        />
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard onViewStock={(sym) => { setActivePage('screener'); handleViewStock(sym, 'screener'); }} />;
      case 'terminal':
        return <Terminal />;
      case 'scanbuilder':
        return <ScanBuilder />;
      case 'orderbook':
        return <OrderBook />;
      case 'screener':
        return <Screener onSelectStock={(sym) => handleViewStock(sym, 'screener')} />;
      case 'charts':
        return <ChartsPage />;
      case 'simulation':
        return <SimulationTrading />;
      case 'watchlist':
        return <Watchlist onSelectStock={(sym) => { setActivePage('screener'); handleViewStock(sym, 'screener'); }} />;
      case 'alerts':
        return <Alerts />;
      default:
        return <Dashboard onViewStock={(sym) => { setActivePage('screener'); handleViewStock(sym, 'screener'); }} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => { setActivePage(page); setSelectedStock(null); }}
        onLogout={handleLogout}
        userName={user.name}
        userEmail={user.email}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className="transition-all duration-300 p-5 min-h-screen"
        style={{ marginLeft: sidebarCollapsed ? 64 : 165 }}
      >
        {renderPage()}
      </main>
    </div>
  );
}
