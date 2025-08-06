'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Settings, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface BrokerStatus {
  id: string;
  name: string;
  market: string;
  icon: string;
  portfolio: number;
  trades: number;
  pnl: number;
  isActive: boolean;
  isConnected: boolean;
  currency: string;
  initialDeposit: number;
}

const AITradingControlPanel: React.FC = () => {
  const [brokers, setBrokers] = useState<BrokerStatus[]>([
    {
      id: 'moomoo',
      name: 'MooMoo AI Trading',
      market: 'HK MARKET',
      icon: '🏢',
      portfolio: 300.00,
      trades: 0,
      pnl: 0.00,
      isActive: false,
      isConnected: true,
      currency: 'USD',
      initialDeposit: 300.00
    },
    {
      id: 'alpaca',
      name: 'Alpaca AI Trading',
      market: 'US MARKET',
      icon: '🦙',
      portfolio: 100761.50,
      trades: 0,
      pnl: 710.79,
      isActive: false,
      isConnected: true,
      currency: 'USD',
      initialDeposit: parseFloat(process.env.NEXT_PUBLIC_INITIAL_DEPOSIT || '1000') // 🔴 LIVE ACCOUNT VALUE
    },
    {
      id: 'binance',
      name: 'Binance AI Trading',
      market: 'CRYPTO MARKET',
      icon: '₿',
      portfolio: 1000.00,
      trades: 0,
      pnl: 0.00,
      isActive: false,
      isConnected: true,
      currency: 'USDT',
      initialDeposit: 1000.00
    }
  ]);

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [tempBalances, setTempBalances] = useState<{[key: string]: number}>({});
  const [globalRiskLevel, setGlobalRiskLevel] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');

  useEffect(() => {
    // Initialize temp balances
    const initialBalances: {[key: string]: number} = {};
    brokers.forEach(broker => {
      initialBalances[broker.id] = broker.initialDeposit;
    });
    setTempBalances(initialBalances);
  }, []);

  const toggleTrading = (brokerId: string) => {
    setBrokers(prev => prev.map(broker => 
      broker.id === brokerId 
        ? { ...broker, isActive: !broker.isActive }
        : broker
    ));
  };

  const resetAllBalances = () => {
    setBrokers(prev => prev.map(broker => ({
      ...broker,
      portfolio: broker.initialDeposit,
      trades: 0,
      pnl: 0.00,
      isActive: false
    })));
  };

  const applyBalanceChanges = () => {
    setBrokers(prev => prev.map(broker => ({
      ...broker,
      initialDeposit: tempBalances[broker.id] || broker.initialDeposit,
      portfolio: tempBalances[broker.id] || broker.initialDeposit
    })));
    setShowBalanceModal(false);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USDT' ? 'USD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPnL = (pnl: number, currency: string) => {
    const formatted = formatCurrency(Math.abs(pnl), currency);
    return pnl >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Multi-Broker AI Engine</h2>
          <p className="text-gray-400">Separate AI trading engines for each market</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBalanceModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Set Balances
          </button>
          
          <button
            onClick={resetAllBalances}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Risk Level:</span>
            <select
              value={globalRiskLevel}
              onChange={(e) => setGlobalRiskLevel(e.target.value as any)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Conservative">Conservative</option>
              <option value="Moderate">Moderate</option>
              <option value="Aggressive">Aggressive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Broker Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {brokers.map((broker) => (
          <motion.div
            key={broker.id}
            className={`relative bg-gray-800/50 rounded-xl border-2 transition-all duration-300 ${
              broker.isActive 
                ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                : 'border-gray-700/50 hover:border-gray-600/50'
            }`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Status Indicator */}
            <div className="absolute top-4 right-4">
              {broker.isConnected ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-500 font-medium">Disconnected</span>
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{broker.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{broker.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    broker.market === 'HK MARKET' ? 'bg-red-500/20 text-red-400' :
                    broker.market === 'US MARKET' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {broker.market}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <span className={`text-sm font-medium ${
                  broker.isActive ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {broker.isActive ? 'AI Trading Active' : 'Standby Mode'}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-400">Portfolio</div>
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(broker.portfolio, broker.currency)}
                  </div>
                  <div className="text-xs text-gray-500">{broker.currency}</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Activity className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-400">Trades</div>
                  <div className="text-lg font-bold text-white">{broker.trades}</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-400">P&L</div>
                  <div className={`text-lg font-bold ${
                    broker.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPnL(broker.pnl, broker.currency)}
                  </div>
                </div>
              </div>

              {/* Start/Stop Button */}
              <button
                onClick={() => toggleTrading(broker.id)}
                disabled={!broker.isConnected}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  broker.isActive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
                }`}
              >
                {broker.isActive ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop Trading
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Trading
                  </>
                )}
              </button>

              {/* Activity Indicator */}
              {broker.isActive && (
                <div className="mt-3 flex items-center justify-center gap-2 text-green-400">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                  <span className="text-sm font-medium">AI Engine Running</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Balance Setting Modal */}
      <AnimatePresence>
        {showBalanceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowBalanceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Set Initial Balances</h3>
              
              <div className="space-y-4">
                {brokers.map((broker) => (
                  <div key={broker.id} className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-lg">{broker.icon}</span>
                      {broker.name} ({broker.currency})
                    </label>
                    <input
                      type="number"
                      value={tempBalances[broker.id] || broker.initialDeposit}
                      onChange={(e) => setTempBalances(prev => ({
                        ...prev,
                        [broker.id]: parseFloat(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyBalanceChanges}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AITradingControlPanel;
