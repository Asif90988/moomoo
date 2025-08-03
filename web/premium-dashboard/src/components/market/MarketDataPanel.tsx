'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useWatchlistData, useTradingStore } from '@/stores/trading-store';

export function MarketDataPanel() {
  const watchlistData = useWatchlistData();
  const { setSelectedSymbol } = useTradingStore();

  // Mock data if no real data available
  const mockData = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.47, change: 2.34, changePercent: 1.25, volume: 45234567 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.63, change: -15.42, changePercent: -0.54, volume: 1234567 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 334.89, change: 4.67, changePercent: 1.41, volume: 23456789 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.52, change: -8.91, changePercent: -3.46, volume: 67890123 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 456.78, change: 12.34, changePercent: 2.78, volume: 34567890 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3234.56, change: 23.45, changePercent: 0.73, volume: 12345678 },
    { symbol: 'META', name: 'Meta Platforms', price: 298.45, change: -5.67, changePercent: -1.86, volume: 56789012 },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 445.23, change: 8.91, changePercent: 2.04, volume: 9876543 },
  ];

  const marketData = watchlistData.length > 0 ? watchlistData : mockData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neural-border flex items-center justify-between">
        <h2 className="text-lg font-bold text-neon-green">Market Data</h2>
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-neon-green animate-pulse" />
          <span className="text-xs text-neon-green font-medium">LIVE</span>
        </div>
      </div>

      {/* Market Data List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {marketData.filter((stock): stock is NonNullable<typeof stock> => Boolean(stock)).map((stock, index) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedSymbol(stock.symbol)}
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer group border border-transparent hover:border-neon-blue/20"
            >
              {/* Symbol and Name */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="font-bold text-white text-sm">{stock.symbol}</span>
                  <span className="text-xs text-gray-400 truncate">{stock.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-white">
                    {formatCurrency(stock.price)}
                  </div>
                  <div className={`font-mono text-xs flex items-center space-x-1 ${
                    stock.change >= 0 ? 'text-neon-green' : 'text-red-400'
                  }`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Volume and Market Cap */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div>
                  <span>Vol: </span>
                  <span className="font-mono">{formatVolume(stock.volume)}</span>
                </div>
                <div>
                  <span>Cap: </span>
                  <span className="font-mono">${(stock.price * 1000000000 / 1000000000).toFixed(1)}B</span>
                </div>
              </div>

              {/* Volume Indicator Bar */}
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.abs(stock.changePercent) * 10, 100)}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    stock.change >= 0 ? 'bg-neon-green' : 'bg-red-400'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}