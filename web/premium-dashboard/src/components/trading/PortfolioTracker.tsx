'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  BarChart3, 
  RefreshCw,
  Eye,
  AlertCircle,
  Clock
} from 'lucide-react';
import { portfolioService, Portfolio, Position, PortfolioUpdate } from '@/services/portfolio-service';

export default function PortfolioTracker() {
  const { data: session } = useSession();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [recentUpdates, setRecentUpdates] = useState<PortfolioUpdate[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      // Start portfolio tracking
      portfolioService.startTracking(session.user.id, 'default_account');

      // Subscribe to portfolio updates
      const unsubscribe = portfolioService.subscribe((newPortfolio) => {
        setPortfolio(newPortfolio);
        setIsLoading(false);
        setLastUpdate(Date.now());
      });

      // Subscribe to portfolio update events
      const unsubscribeUpdates = portfolioService.subscribeToUpdates((update) => {
        setRecentUpdates(prev => [update, ...prev].slice(0, 5)); // Keep last 5 updates
      });

      return () => {
        unsubscribe();
        unsubscribeUpdates();
        portfolioService.stopTracking();
      };
    }
  }, [session]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getChangeBgColor = (change: number) => {
    if (change > 0) return 'bg-green-500/10 border-green-500/20';
    if (change < 0) return 'bg-red-500/10 border-red-500/20';
    return 'bg-gray-500/10 border-gray-500/20';
  };

  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mr-3"
          />
          <span className="text-gray-300">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Portfolio Data</h3>
          <p className="text-gray-400 text-sm">Unable to load portfolio information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Portfolio Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: portfolioService.isCurrentlyTracking() ? 360 : 0 }}
              transition={{ duration: 2, repeat: portfolioService.isCurrentlyTracking() ? Infinity : 0, ease: "linear" }}
            >
              <Activity className="w-6 h-6 text-cyan-400 mr-3" />
            </motion.div>
            <h2 className="text-xl font-bold text-white">Portfolio Overview</h2>
            <div className="ml-3 px-2 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
              <span className="text-green-400 text-xs font-bold">● LIVE</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-white mb-1">
              {formatCurrency(portfolio.totalValue)}
            </div>
            <div className="text-sm text-gray-400">Total Value</div>
          </div>
          
          <div className={`text-center p-4 rounded-lg border ${getChangeBgColor(portfolio.dayPnl)}`}>
            <div className={`text-2xl font-bold mb-1 ${getChangeColor(portfolio.dayPnl)}`}>
              {formatCurrency(portfolio.dayPnl)}
            </div>
            <div className="text-sm text-gray-400">Today's P&L</div>
          </div>

          <div className={`text-center p-4 rounded-lg border ${getChangeBgColor(portfolio.totalPnl)}`}>
            <div className={`text-2xl font-bold mb-1 ${getChangeColor(portfolio.totalPnl)}`}>
              {formatPercent(portfolio.totalPnlPercent)}
            </div>
            <div className="text-sm text-gray-400">Total Return</div>
          </div>

          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {formatCurrency(portfolio.cash)}
            </div>
            <div className="text-sm text-gray-400">Buying Power</div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="h-32 bg-slate-800/30 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Performance chart coming soon</p>
          </div>
        </div>
      </motion.div>

      {/* Positions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Positions ({portfolio.positions.length})</h3>
          <div className="flex items-center text-sm text-gray-400">
            <Eye className="w-4 h-4 mr-1" />
            Real-time tracking
          </div>
        </div>

        {portfolio.positions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No positions</div>
            <p className="text-sm text-gray-500">Start trading to build your portfolio</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {portfolio.positions.map((position, index) => (
                <motion.div
                  key={position.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="font-bold text-white text-sm">{position.symbol}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{position.symbol}</div>
                        <div className="text-sm text-gray-400">{position.quantity} shares</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {formatCurrency(position.marketValue)}
                      </div>
                      <div className={`text-sm ${getChangeColor(position.unrealizedPnl)}`}>
                        {formatCurrency(position.unrealizedPnl)} ({formatPercent(position.unrealizedPnlPercent)})
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Avg Cost:</span>
                      <div className="text-white">{formatCurrency(position.avgCost)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Current:</span>
                      <div className="text-white">{formatCurrency(position.currentPrice)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Day Change:</span>
                      <div className={getChangeColor(position.dayChange)}>
                        {formatPercent(position.dayChangePercent)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Active Orders */}
      {portfolio.orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl"
        >
          <h3 className="text-lg font-bold text-white mb-4">Active Orders ({portfolio.orders.length})</h3>
          
          <div className="space-y-3">
            {portfolio.orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      order.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {order.side}
                    </div>
                    <span className="ml-3 font-semibold text-white">{order.symbol}</span>
                    <span className="ml-2 text-sm text-gray-400">{order.quantity} @ {order.price ? formatCurrency(order.price) : 'Market'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      order.status === 'FILLED' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.status}
                    </span>
                    <Clock className="w-4 h-4 text-gray-400 ml-2" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Updates */}
      {recentUpdates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl"
        >
          <h3 className="text-lg font-bold text-white mb-4">Recent Updates</h3>
          
          <div className="space-y-2">
            <AnimatePresence>
              {recentUpdates.map((update, index) => (
                <motion.div
                  key={update.timestamp}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 bg-slate-800/30 rounded-lg text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {update.dayPnl >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400 mr-2" />
                      )}
                      <span className="text-gray-300">
                        Portfolio updated: {formatCurrency(update.totalValue)}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}