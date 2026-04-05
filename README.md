# Flux NSE - Advanced Stock Scanner & Analytics

A modern, real-time stock scanner and analytics dashboard for NSE (National Stock Exchange of India) built with React, Vite, TypeScript, and Tailwind CSS.

## Features

### 🎯 Core Features
- **Real-time Market Overview**: Live updates of NIFTY 50, SENSEX, and key market metrics
- **Advanced Stock Scanner**: Filter stocks by sector, signal, volume, and custom criteria
- **Interactive Analytics**: Visual charts and insights for market analysis
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 📊 Market Data
- NIFTY 50 and SENSEX tracking with live updates
- Total market volume monitoring
- Advance/Decline ratio analysis
- Real-time price changes and percentage movements

### 🔍 Stock Scanner Capabilities
- **Smart Search**: Search by stock symbol or company name
- **Sector Filtering**: Filter by IT, Banking, FMCG, Energy, and more
- **Signal-Based Filtering**: Buy, Sell, or Hold signals based on technical analysis
- **Volume Filtering**: Set minimum volume thresholds
- **Real-time Updates**: Auto-refresh with simulated market data

### 📈 Analytics & Insights
- **Market Performance Charts**: Area charts showing index performance over time
- **Sector Distribution**: Pie charts visualizing sector allocation
- **Volume Analysis**: Bar charts displaying trading volume patterns
- **Top/Bottom Performers**: Identify best and worst performing stocks
- **Market Insights**: AI-powered insights and trend analysis

### 🎨 UI/UX Features
- **Modern Dark Theme**: Professional dark interface with purple/blue accents
- **Glass Morphism**: Frosted glass effect on cards and modals
- **Smooth Animations**: Slide-up, fade-in, and scale animations
- **Custom Scrollbars**: Styled scrollbars matching the theme
- **Gradient Effects**: Beautiful gradient borders and text effects
- **Hover Effects**: Interactive elements with smooth transitions
- **Tooltips**: Contextual information on hover

## Tech Stack

- **React 19** - Latest React with hooks and functional components
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **Lucide React** - Beautiful & consistent icon pack

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Navigation header
│   ├── MarketOverview.tsx  # Market statistics cards
│   ├── StockScanner.tsx    # Main stock scanning interface
│   └── Analytics.tsx       # Charts and insights
├── App.tsx                 # Main app component
├── main.tsx               # Entry point
├── index.css              # Custom styles and animations
└── utils/
    └── cn.ts              # Utility functions
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### Market Overview
The dashboard displays real-time market data:
- **NIFTY 50**: Current value with change indicator
- **SENSEX**: Current value with change indicator  
- **Total Volume**: Overall market trading volume
- **Advance/Decline**: Ratio of advancing vs declining stocks

### Using the Stock Scanner

1. **Search**: Type stock symbols or company names in the search bar
2. **Apply Filters**: Click the Filters button to show filtering options
3. **Filter by Sector**: Select specific sectors (IT, Banking, FMCG, etc.)
4. **Filter by Signal**: Show only Buy, Sell, or Hold recommendations
5. **Volume Filter**: Set minimum trading volume in millions
6. **Refresh**: Click refresh to update with latest market data

### Analytics Dashboard

Switch to the Analytics tab to view:
- **Market Performance**: Historical index performance chart
- **Sector Distribution**: Visual breakdown of market sectors
- **Volume Analysis**: Trading volume patterns throughout the day
- **Top/Bottom Performers**: Best and worst performing stocks
- **Market Insights**: Key insights and trend analysis

## Customization

### Adding New Features

The modular component structure makes it easy to add new features:

1. **New Filters**: Add filter options in `StockScanner.tsx`
2. **New Charts**: Use Recharts components in `Analytics.tsx`
3. **New Metrics**: Extend the `MarketOverview.tsx` component

### Styling

The project uses Tailwind CSS with custom CSS variables:

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-card: #1a1a28;
  --accent-primary: #8b5cf6;
  --accent-secondary: #06b6d4;
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
}
```

### Color Scheme
- **Primary**: Purple (`#8b5cf6`)
- **Secondary**: Cyan (`#06b6d4`)
- **Success**: Emerald (`#10b981`)
- **Danger**: Red (`#ef4444`)
- **Background**: Dark gray shades

## Data Sources

This application uses simulated/mock data for demonstration purposes. To connect to real market data:

1. **NSE API**: Integrate with NSE's official API
2. **Market Data Providers**: Connect to providers like Alpha Vantage, Yahoo Finance, or Bloomberg
3. **WebSocket**: Implement real-time data streaming
4. **Backend Service**: Create a Node.js/Express backend for data aggregation

## Performance Optimizations

- **Virtual Scrolling**: For large stock lists
- **Debounced Search**: Optimized search performance
- **Memoization**: React.memo for component optimization
- **Code Splitting**: Lazy loading for heavy components
- **Single File Build**: Vite single-file plugin for easy deployment

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is created for educational and demonstration purposes.

## Contributing

Feel free to submit issues and enhancement requests!

## Disclaimer

This application is for educational and informational purposes only. Not financial advice. Please consult with a qualified financial advisor before making investment decisions.

---

**Built with ❤️ using React, Vite, TypeScript, and Tailwind CSS**
