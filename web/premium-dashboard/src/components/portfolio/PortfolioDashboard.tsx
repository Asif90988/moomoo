'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradingStore } from '@/stores/trading-store';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Activity,
  Target,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';

interface PortfolioSummary {
  totalValue: number;
  cashBalance: number;
  investedAmount: number;
  dayPL: number;
  dayPLPercent: number;
  totalPL: number;
  totalPLPercent: number;
  availableBuyingPower: number;
}

const PortfolioDashboard: React.FC = () => {
  const { portfolio, resetPortfolioToBaseline, setPortfolio } = useTradingStore();
  
  const [selectedView, setSelectedView] = useState<'overview' | 'positions' | 'performance' | 'deposit'>('overview');
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');


  useEffect(() => {
    // Initialize portfolio if it doesn't exist in the store
    if (!portfolio) {
      const initialPortfolio = {
        totalValue: 300.00,
        cash: 300.00,
        buyingPower: 300.00,
        marginUsed: 0,
        marginAvailable: 300.00,
        dayPnl: 0.00,
        dayPnlPercent: 0.00,
        totalPnl: 0.00,
        totalPnlPercent: 0.00,
        positions: [],
        orders: []
      };
      setPortfolio(initialPortfolio);
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [portfolio, setPortfolio]);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0 && amount <= 300) {
      // Simulate deposit using global store
      if (portfolio) {
        const updatedPortfolio = {
          ...portfolio,
          cash: portfolio.cash + amount,
          totalValue: portfolio.totalValue + amount,
          buyingPower: portfolio.buyingPower + amount
        };
        setPortfolio(updatedPortfolio);
      }
      setDepositAmount('');
    }
  };

  const handleResetPortfolio = async () => {
    // Force reset to exactly $300 using global store
    localStorage.clear(); // Clear any cached state
    sessionStorage.clear(); // Clear session data
    
    // Clear all server-side orders
    try {
      await fetch('/api/trading/orders?action=clear_all', { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to clear orders:', error);
    }
    
    // Reset portfolio using global store action
    resetPortfolioToBaseline();
    
    console.log('🔄 Portfolio reset to $300 baseline');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mx-auto"></div>
          <p className="text-neon-blue font-medium">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-neural-dark text-white p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Portfolio Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Manage your investments and track performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleResetPortfolio}
            className="px-3 py-2 glass rounded-lg border border-yellow-500/40 hover:border-yellow-500/60 transition-colors text-sm text-yellow-400 hover:text-yellow-300"
          >
            Reset to $300
          </button>
          <button 
            onClick={() => setLoading(true)}
            className="p-2 glass rounded-lg border border-neon-blue/20 hover:border-neon-blue/40 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-neon-blue" />
          </button>
          <button className="p-2 glass rounded-lg border border-gray-600/20 hover:border-gray-600/40 transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 glass rounded-lg p-1 border border-neural-border">
        {[
          { key: 'overview', label: 'Overview', icon: PieChart },
          { key: 'positions', label: 'Positions', icon: BarChart3 },
          { key: 'performance', label: 'Performance', icon: Activity },
          { key: 'deposit', label: 'Deposit', icon: DollarSign }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedView(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              selectedView === key
                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass rounded-xl border border-neon-blue/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Total Portfolio Value</h3>
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">
                    ${portfolio?.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      portfolio && portfolio.dayPnl >= 0 ? 'text-neon-green' : 'text-neon-red'
                    }`}>
                      {portfolio && portfolio.dayPnl >= 0 ? '+' : ''}
                      ${portfolio?.dayPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      portfolio && portfolio.dayPnlPercent >= 0 
                        ? 'bg-neon-green/20 text-neon-green' 
                        : 'bg-neon-red/20 text-neon-red'
                    }`}>
                      {portfolio && portfolio.dayPnlPercent >= 0 ? '+' : ''}
                      {portfolio?.dayPnlPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl border border-neon-green/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Cash Balance</h3>
                  <DollarSign className="w-5 h-5 text-neon-green" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">
                    ${portfolio?.cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-400">Available for trading</p>
                </div>
              </div>

              <div className="glass rounded-xl border border-neon-purple/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Invested Amount</h3>
                  <Target className="w-5 h-5 text-neon-purple" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">
                    ${((portfolio?.totalValue || 0) - (portfolio?.cash || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {portfolio && ((((portfolio.totalValue || 0) - (portfolio.cash || 0)) / (portfolio.totalValue || 1)) * 100).toFixed(1)}% allocated
                  </p>
                </div>
              </div>

              <div className="glass rounded-xl border border-neon-yellow/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Total P&L</h3>
                  <Activity className="w-5 h-5 text-neon-yellow" />
                </div>
                <div className="space-y-2">
                  <p className={`text-2xl font-bold ${
                    portfolio && portfolio.totalPnl >= 0 ? 'text-neon-green' : 'text-neon-red'
                  }`}>
                    {portfolio && portfolio.totalPnl >= 0 ? '+' : ''}
                    ${portfolio?.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${
                    portfolio && portfolio.totalPnlPercent >= 0 
                      ? 'bg-neon-green/20 text-neon-green' 
                      : 'bg-neon-red/20 text-neon-red'
                  }`}>
                    {portfolio && portfolio.totalPnlPercent >= 0 ? '+' : ''}
                    {portfolio?.totalPnlPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Top Positions */}
            <div className="glass rounded-xl border border-neural-border p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Holdings</h3>
              <div className="space-y-4">
                {portfolio?.positions && portfolio.positions.length > 0 ? (
                  portfolio.positions.slice(0, 5).map((position, index) => (
                  <div key={position.symbol} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{position.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{position.symbol}</p>
                        <p className="text-sm text-gray-400">{position.quantity} shares</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">${position.marketValue.toLocaleString()}</p>
                      <p className={`text-sm ${position.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                        {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <p>No positions yet</p>
                    <p className="text-sm mt-1">Start trading to see your holdings here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === 'positions' && (
          <motion.div
            key="positions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass rounded-xl border border-neural-border overflow-hidden">
              <div className="p-6 border-b border-neural-border">
                <h3 className="text-lg font-semibold text-white">All Positions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Symbol</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-400">Quantity</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-400">Avg Cost</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-400">Current Price</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-400">Market Value</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-400">Unrealized P&L</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-400">Day Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio?.positions && portfolio.positions.length > 0 ? (
                      portfolio.positions.map((position, index) => (
                      <tr key={position.symbol} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center">
                              <span className="text-white font-bold text-xs">{position.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{position.symbol}</p>
                              <p className="text-xs text-gray-400">{position.side.toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right font-mono text-white">{position.quantity}</td>
                        <td className="p-4 text-right font-mono text-white">${position.avgCost.toFixed(2)}</td>
                        <td className="p-4 text-right font-mono text-white">-</td>
                        <td className="p-4 text-right font-mono text-white">${position.marketValue.toLocaleString()}</td>
                        <td className={`p-4 text-right font-mono ${position.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                          {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                          <br />
                          <span className="text-xs">({position.pnlPercent.toFixed(2)}%)</span>
                        </td>
                        <td className="p-4 text-right font-mono text-gray-400">
                          -
                          <br />
                          <span className="text-xs">-</span>
                        </td>
                      </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          <p>No positions to display</p>
                          <p className="text-sm mt-1">Start trading to see your positions here</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === 'deposit' && (
          <motion.div
            key="deposit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Deposit Safety Notice */}
            <div className="glass rounded-xl border border-yellow-500/40 p-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">$300 Maximum Deposit Protection</h3>
                  <p className="text-gray-300 mb-3">
                    Neural Core Alpha-7 prioritizes education over extraction. We limit deposits to $300 to help you learn 
                    algorithmic trading while protecting your capital.
                  </p>
                  <div className="text-sm text-gray-400">
                    <p>• Focus on learning and strategy development</p>
                    <p>• Build confidence with limited risk</p>
                    <p>• Graduate to larger amounts as you gain experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deposit Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-xl border border-neon-green/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Plus className="w-5 h-5 text-neon-green mr-2" />
                  Deposit Funds
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Deposit Amount (USD)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        max="300"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-neon-green/40 focus:outline-none"
                      />
                      <span className="absolute right-3 top-3 text-gray-400">USD</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Maximum: $300.00</p>
                  </div>

                  <div className="flex space-x-2">
                    {[50, 100, 200, 300].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount.toString())}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-gray-300 hover:border-neon-green/40 hover:text-white transition-colors"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleDeposit}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0 || parseFloat(depositAmount) > 300}
                    className="w-full px-4 py-3 bg-gradient-to-r from-neon-green to-green-500 text-white font-medium rounded-lg hover:from-green-500 hover:to-neon-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deposit ${depositAmount || '0.00'}
                  </button>
                </div>
              </div>

              <div className="glass rounded-xl border border-neural-border p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-400">Current Cash Balance</span>
                    <span className="font-mono text-white">
                      ${portfolio?.cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-400">Available Buying Power</span>
                    <span className="font-mono text-neon-green">
                      ${portfolio?.buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-400">Total Portfolio Value</span>
                    <span className="font-mono text-white">
                      ${portfolio?.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="text-sm text-gray-400 space-y-2">
                      <p>• Instant deposits up to $300</p>
                      <p>• Funds available immediately for trading</p>
                      <p>• Educational trading environment</p>
                      <p>• Real-time portfolio tracking</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioDashboard;