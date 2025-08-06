'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradingStore } from '@/stores/trading-store';
import { autonomousTradingService } from '@/services/autonomous-trading-service';
import { brokerTradingEngine } from '@/services/broker-trading-engine';
import { getBrokerConfig } from '@/services/broker-configs';
import { 
  Play, 
  Pause, 
  Brain, 
  Target, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Settings,
  Zap,
  DollarSign,
  BarChart3,
  Building2,
  Mountain,
  RotateCcw,
  Filter,
  Plus,
  ChevronDown,
  Search,
  Calendar,
  Download
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
  startTime?: number;
  elapsedTime: number;
}

interface Trade {
  id: string;
  timestamp: Date;
  broker: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  pnl?: number;
  aiReasoning: string;
  status: 'Pending' | 'Completed';
}

interface FilterState {
  broker: string;
  symbol: string;
  action: string;
  timeRange: string;
  pnlFilter: string;
}

// Add persistent broker state interface
interface PersistentBrokerState {
  [key: string]: {
    isActive: boolean;
    portfolio: number;
    trades: number;
    pnl: number;
    initialDeposit: number;
  };
}

// Create a global state for broker persistence
const globalBrokerState: PersistentBrokerState = {
  moomoo: { isActive: false, portfolio: 300.00, trades: 0, pnl: 0.00, initialDeposit: 300.00 },
  alpaca: { isActive: false, portfolio: parseFloat(process.env.NEXT_PUBLIC_INITIAL_DEPOSIT || '1000'), trades: 0, pnl: 1000.00, initialDeposit: parseFloat(process.env.NEXT_PUBLIC_INITIAL_DEPOSIT || '1000') },
  binance: { isActive: false, portfolio: 1000.00, trades: 0, pnl: 0.00, initialDeposit: 1000.00 }
};

const UnifiedAITradingCenter: React.FC = () => {
  // Add mounted state to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);

  // Trading store state
  const { 
    autoTrades,
    aiDecisions,
    totalProfit,
    setAutonomousActive,
    addAutoTrade,
    addAiDecision,
    updateTotalProfit,
    updateTradeProfit,
    syncPortfolioWithAI,
    resetAutonomousState
  } = useTradingStore();

  // Local state - Initialize with live data from broker engine
  const [brokers, setBrokers] = useState<BrokerStatus[]>([]);
  
  // Function to get live broker data
  const updateBrokerData = () => {
    try {
      const engineState = brokerTradingEngine.getState();
      const newBrokers = [
        {
          id: 'moomoo',
          name: 'MooMoo AI Trading',
          market: 'HK MARKET',
          icon: '🏢',
          portfolio: engineState.brokers.moomoo?.portfolio.value || 300,
          trades: engineState.brokers.moomoo?.portfolio.trades || 0,
          pnl: engineState.brokers.moomoo?.portfolio.profit || 0,
          isActive: engineState.brokers.moomoo?.active || false,
          isConnected: true,
          currency: 'HKD',
          initialDeposit: 300,
          elapsedTime: 0
        },
        {
          id: 'alpaca',
          name: 'Alpaca AI Trading',
          market: 'US MARKET',
          icon: '🦙',
          portfolio: engineState.brokers.alpaca?.portfolio.value || 1000, // 🔴 LIVE DATA
          trades: engineState.brokers.alpaca?.portfolio.trades || 0,
          pnl: engineState.brokers.alpaca?.portfolio.profit || 0,
          isActive: engineState.brokers.alpaca?.active || false,
          isConnected: true,
          currency: 'USD',
          initialDeposit: engineState.brokers.alpaca?.portfolio.value || 1000, // 🔴 LIVE DATA
          elapsedTime: 0
        },
        {
          id: 'binance',
          name: 'Binance AI Trading',
          market: 'CRYPTO MARKET',
          icon: '₿',
          portfolio: engineState.brokers['binance-testnet']?.portfolio.value || 1000,
          trades: engineState.brokers['binance-testnet']?.portfolio.trades || 0,
          pnl: engineState.brokers['binance-testnet']?.portfolio.profit || 0,
          isActive: engineState.brokers['binance-testnet']?.active || false,
          isConnected: true,
          currency: 'USDT',
          initialDeposit: 1000,
          elapsedTime: 0
        }
      ];
      
      setBrokers(newBrokers);
      console.log('🔄 Updated broker data from engine:', newBrokers.find(b => b.id === 'alpaca'));
    } catch (error) {
      console.error('❌ Error updating broker data:', error);
    }
  };

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [tempBalances, setTempBalances] = useState<{[key: string]: number}>({});
  const [globalRiskLevel, setGlobalRiskLevel] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [aiThoughts, setAiThoughts] = useState<string[]>([
    "🧠 AI analyzing market conditions for optimal entry points...",
    "📊 Technical indicators showing bullish momentum in tech sector",
    "⚡ Risk management protocols active - monitoring position sizes",
    "🎯 Identifying high-probability trading opportunities",
    "📈 Market sentiment analysis complete - proceeding with strategy"
  ]);
  const [serviceState, setServiceState] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    broker: 'All',
    symbol: 'All',
    action: 'All',
    timeRange: 'Last 24h',
    pnlFilter: 'All'
  });
  const [showFilters, setShowFilters] = useState(false);

  // ONLY use real trades from trading store - NO MOCK DATA
  const recentTrades: Trade[] = isMounted && autoTrades.length > 0 ? autoTrades.map(trade => ({
    id: trade.id,
    timestamp: new Date(trade.timestamp),
    broker: trade.broker?.toUpperCase() || 'UNKNOWN',
    symbol: trade.symbol,
    action: trade.action?.toUpperCase() as 'BUY' | 'SELL',
    quantity: trade.quantity,
    price: trade.price,
    pnl: trade.profit,
    status: trade.profit !== undefined ? 'Completed' : 'Pending',
    aiReasoning: trade.reason || 'AI trading decision'
  })) : []; // Return empty array if no real trades exist or not mounted

  // Debug logging to verify data source
  console.log('🔍 DEBUG: autoTrades from store:', autoTrades.length);
  console.log('🔍 DEBUG: recentTrades processed:', recentTrades.length);

  // Set mounted state to prevent hydration errors and initialize live data
  useEffect(() => {
    setIsMounted(true);
    // Initialize service state and broker data after mount to prevent hydration errors
    setTimeout(() => {
      setServiceState(autonomousTradingService.getState());
      updateBrokerData(); // 🔄 Load live data after mount
    }, 0);
  }, []);

  // Initialize temp balances
  useEffect(() => {
    const initialBalances: {[key: string]: number} = {};
    brokers.forEach(broker => {
      initialBalances[broker.id] = broker.initialDeposit;
    });
    setTempBalances(initialBalances);
  }, []);

  // Update service state periodically and sync with broker engine
  useEffect(() => {
    const interval = setInterval(() => {
      const state = autonomousTradingService.getState();
      setServiceState(state);
      
      // Update AI thoughts from the broker engine
      if (state.aiThoughts && state.aiThoughts.length > 0) {
        setAiThoughts(state.aiThoughts);
      }
      
      // 🔄 Update broker data with live values
      updateBrokerData();
      
      // 🔧 FIX DATA SYNCHRONIZATION - Ensure P&L matches trade count
      setBrokers(prev => prev.map(broker => {
        const engineState = state.brokers?.[broker.id];
        let updatedBroker = { ...broker };
        
        if (engineState) {
          // 🚨 CRITICAL FIX - Only show P&L if there are actual trades
          const actualTrades = engineState.portfolio.trades || 0;
          const displayPnL = actualTrades > 0 ? engineState.portfolio.profit : 0;
          
          // Update global persistent state with corrected data
          globalBrokerState[broker.id] = {
            isActive: engineState.active,
            portfolio: engineState.portfolio.value,
            trades: actualTrades,
            pnl: displayPnL,
            initialDeposit: broker.initialDeposit
          };
          
          updatedBroker = {
            ...broker,
            isActive: engineState.active,
            portfolio: engineState.portfolio.value,
            trades: actualTrades,
            pnl: displayPnL // Only show P&L if trades exist
          };
          
          // 🔧 VALIDATION - Log inconsistencies for debugging
          if (actualTrades === 0 && displayPnL !== 0) {
            console.warn(`🚨 DATA INCONSISTENCY: ${broker.name} shows P&L $${displayPnL.toFixed(2)} but 0 trades - correcting to $0.00`);
            updatedBroker.pnl = 0;
            globalBrokerState[broker.id].pnl = 0;
          }
        }
        
        // Update elapsed time for active brokers
        if (updatedBroker.isActive && updatedBroker.startTime) {
          updatedBroker.elapsedTime = Math.floor((Date.now() - updatedBroker.startTime) / 1000);
        }
        
        return updatedBroker;
      }));
      
      // 🔧 SYNC TRADING STORE - Ensure consistency
      syncPortfolioWithAI();
      
    }, 1000); // Update every second for timer accuracy

    return () => clearInterval(interval);
  }, [syncPortfolioWithAI]);

  // Filter trades based on current filters
  const filteredTrades = recentTrades.filter(trade => {
    if (filters.broker !== 'All' && trade.broker !== filters.broker) return false;
    if (filters.action !== 'All' && trade.action !== filters.action) return false;
    if (filters.pnlFilter === 'Profitable Only' && (!trade.pnl || trade.pnl <= 0)) return false;
    if (filters.pnlFilter === 'Losses Only' && (!trade.pnl || trade.pnl >= 0)) return false;
    if (filters.pnlFilter === 'Pending' && trade.status !== 'Pending') return false;
    return true;
  });

  const toggleTrading = (brokerId: string) => {
    setBrokers(prev => prev.map(broker => {
      if (broker.id === brokerId) {
        const newState = !broker.isActive;
        // Update global persistent state
        globalBrokerState[brokerId].isActive = newState;
        
        // Handle timer logic
        let updatedBroker = { ...broker, isActive: newState };
        if (newState) {
          // Starting trading - set start time
          updatedBroker.startTime = Date.now();
          updatedBroker.elapsedTime = 0;
        } else {
          // Stopping trading - clear start time
          updatedBroker.startTime = undefined;
          updatedBroker.elapsedTime = 0;
        }
        
        // Actually start/stop the trading service
        if (newState) {
          // Starting trading
          if (brokerId === 'moomoo') {
            autonomousTradingService.startMoomooTrading();
            console.log('🏦 Started MooMoo AI Trading from Unified Center');
          } else if (brokerId === 'alpaca') {
            autonomousTradingService.startAlpacaTrading();
            console.log('🦙 Started Alpaca AI Trading from Unified Center');
          } else if (brokerId === 'binance') {
            brokerTradingEngine.startBrokerTrading('binance-testnet');
            console.log('₿ Started Binance AI Trading from Unified Center');
          }
        } else {
          // Stopping trading
          if (brokerId === 'moomoo') {
            autonomousTradingService.stopMoomooTrading();
            console.log('🏦 Stopped MooMoo AI Trading from Unified Center');
          } else if (brokerId === 'alpaca') {
            autonomousTradingService.stopAlpacaTrading();
            console.log('🦙 Stopped Alpaca AI Trading from Unified Center');
          } else if (brokerId === 'binance') {
            brokerTradingEngine.stopBrokerTrading('binance-testnet');
            console.log('₿ Stopped Binance AI Trading from Unified Center');
          }
        }
        
        return updatedBroker;
      }
      return broker;
    }));
  };

  const resetAllBalances = () => {
    setBrokers(prev => prev.map(broker => ({
      ...broker,
      portfolio: broker.initialDeposit,
      trades: 0,
      pnl: 0.00,
      isActive: false
    })));
    autonomousTradingService.resetAll();
    setServiceState(autonomousTradingService.getState());
    setAiThoughts([]);
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

  const formatPnL = (pnl: number | undefined) => {
    if (pnl === undefined) return 'Pending';
    const formatted = Math.abs(pnl).toFixed(2);
    return pnl >= 0 ? `+$${formatted}` : `-$${formatted}`;
  };

  const getBrokerColor = (broker: string) => {
    switch (broker) {
      case 'ALPACA': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'MOOMOO': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'BINANCE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const exportTradeData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      trades: filteredTrades,
      brokers: brokers,
      filters: filters
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-trading-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper function to format elapsed time
  const formatElapsedTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎛️ AI Trading Command Center
          </h2>
          <p className="text-gray-400 mt-1">Unified control and monitoring for multi-broker AI trading</p>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Broker Control Panel */}
        <div className="space-y-6">
          {/* Broker Grid - Larger Cards */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Building2 className="w-6 h-6 text-blue-400 mr-3" />
              Trading Platforms
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {brokers.map((broker) => (
                <motion.div
                  key={broker.id}
                  className={`relative bg-gray-700/50 rounded-xl border-2 transition-all duration-300 p-6 ${
                    broker.isActive 
                      ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                      : 'border-gray-600/50 hover:border-gray-500/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">{broker.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-semibold text-white">{broker.name.split(' ')[0]}</div>
                            {(() => {
                              try {
                                const config = getBrokerConfig(broker.id === 'binance' ? 'binance-testnet' : broker.id);
                                const isLive = config.mode === 'live';
                                return (
                                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                    isLive 
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                  }`}>
                                    {isLive ? 'LT' : 'PT'}
                                  </span>
                                );
                              } catch (error) {
                                return (
                                  <span className="text-xs px-2 py-1 rounded-full font-bold bg-gray-500/20 text-gray-400 border border-gray-500/40">
                                    PT
                                  </span>
                                );
                              }
                            })()}
                          </div>
                          <div className="text-sm text-gray-400">{broker.market}</div>
                          
                          {/* Individual Balance Control */}
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              value={tempBalances[broker.id] || broker.portfolio}
                              onChange={(e) => setTempBalances(prev => ({
                                ...prev,
                                [broker.id]: parseFloat(e.target.value) || 0
                              }))}
                              onBlur={() => {
                                const newBalance = tempBalances[broker.id] || broker.portfolio;
                                if (newBalance !== broker.portfolio) {
                                  setBrokers(prev => prev.map(b => 
                                    b.id === broker.id 
                                      ? { ...b, portfolio: newBalance, initialDeposit: newBalance }
                                      : b
                                  ));
                                  // Update global state
                                  globalBrokerState[broker.id].portfolio = newBalance;
                                  globalBrokerState[broker.id].initialDeposit = newBalance;
                                }
                              }}
                              className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              step="0.01"
                              min="0"
                            />
                            <span className="text-green-400 text-sm font-mono">{broker.currency}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <div className="text-gray-400">
                              Trades: <span className="text-white font-mono">{broker.trades}</span>
                            </div>
                            <div className="text-gray-400">
                              P&L: <span className={`font-mono ${broker.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {broker.pnl >= 0 ? '+' : ''}${broker.pnl.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Timer Display */}
                          <div className="mt-2 text-sm">
                            <div className="text-gray-400">
                              Runtime: <span className={`font-mono ${broker.isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                                {broker.isActive ? formatElapsedTime(broker.elapsedTime) : '00:00:00'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      {broker.isActive && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-sm font-medium">ACTIVE</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => toggleTrading(broker.id)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                          broker.isActive
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {broker.isActive ? (
                          <>
                            <Pause className="w-5 h-5" />
                            STOP
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            START
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Add Broker Slot */}
              <div className="bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-600/50 p-6 flex items-center justify-center cursor-pointer hover:border-gray-500/50 transition-colors">
                <div className="text-center">
                  <Plus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Add Trading Platform</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live AI Activity Feed */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Brain className="w-6 h-6 text-purple-400 mr-3" />
              Live AI Activity
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse ml-3"></div>
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {aiThoughts.slice(0, 5).map((thought, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20"
                >
                  <p className="text-gray-300 text-sm">{thought}</p>
                  <p className="text-xs text-gray-500 mt-2">{isMounted ? new Date().toLocaleTimeString() : '--:--:--'}</p>
                </motion.div>
              ))}
              {aiThoughts.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-base">AI thoughts will appear here when trading is active</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Recent Trades */}
        <div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            {/* Trades Header with Filters */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                Recent Trades by Broker
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={exportTradeData}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600/50"
                >
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <select
                      value={filters.broker}
                      onChange={(e) => setFilters(prev => ({ ...prev, broker: e.target.value }))}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                    >
                      <option value="All">All Brokers</option>
                      <option value="ALPACA">Alpaca</option>
                      <option value="MOOMOO">MooMoo</option>
                      <option value="BINANCE">Binance</option>
                    </select>
                    
                    <select
                      value={filters.action}
                      onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                    >
                      <option value="All">All Actions</option>
                      <option value="BUY">Buy Only</option>
                      <option value="SELL">Sell Only</option>
                    </select>
                    
                    <select
                      value={filters.timeRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                    >
                      <option value="Last 1h">Last 1h</option>
                      <option value="Last 6h">Last 6h</option>
                      <option value="Last 24h">Last 24h</option>
                      <option value="Last Week">Last Week</option>
                    </select>
                    
                    <select
                      value={filters.pnlFilter}
                      onChange={(e) => setFilters(prev => ({ ...prev, pnlFilter: e.target.value }))}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                    >
                      <option value="All">All P&L</option>
                      <option value="Profitable Only">Profitable Only</option>
                      <option value="Losses Only">Losses Only</option>
                      <option value="Pending">Pending</option>
                    </select>
                    
                    <button
                      onClick={() => setFilters({
                        broker: 'All',
                        symbol: 'All',
                        action: 'All',
                        timeRange: 'Last 24h',
                        pnlFilter: 'All'
                      })}
                      className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trades Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left p-2 text-xs font-medium text-gray-400">Broker</th>
                    <th className="text-left p-2 text-xs font-medium text-gray-400">Time</th>
                    <th className="text-left p-2 text-xs font-medium text-gray-400">Symbol</th>
                    <th className="text-left p-2 text-xs font-medium text-gray-400">Action</th>
                    <th className="text-right p-2 text-xs font-medium text-gray-400">Quantity</th>
                    <th className="text-right p-2 text-xs font-medium text-gray-400">Price</th>
                    <th className="text-right p-2 text-xs font-medium text-gray-400">P&L</th>
                    <th className="text-left p-2 text-xs font-medium text-gray-400">AI Reasoning</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => (
                    <tr key={trade.id} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                      <td className="p-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getBrokerColor(trade.broker)}`}>
                          {trade.broker}
                        </span>
                      </td>
                      <td className="p-2 text-xs text-gray-400 font-mono">
                        {trade.timestamp.toLocaleTimeString()}
                      </td>
                      <td className="p-2 font-semibold text-white text-sm">{trade.symbol}</td>
                      <td className="p-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          trade.action === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.action}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono text-white text-sm">{trade.quantity}</td>
                      <td className="p-2 text-right font-mono text-white text-sm">${trade.price.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono text-sm">
                        <span className={
                          trade.pnl === undefined ? 'text-gray-500' :
                          trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }>
                          {formatPnL(trade.pnl)}
                        </span>
                      </td>
                      <td className="p-2 text-xs text-gray-400 max-w-xs">
                        <div className="truncate" title={trade.aiReasoning}>
                          {trade.aiReasoning}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTrades.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No trades match the current filters</p>
                  <p className="text-sm mt-1">Start AI trading to see activity here</p>
                </div>
              )}
            </div>
          </div>
        </div>
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

      {/* AI Performance Analytics Section - Moved to Bottom */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <BarChart3 className="w-6 h-6 text-green-400 mr-3" />
            📊 AI Performance Analytics & Verification
          </h3>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm">
              Export Data
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm">
              Check Alpaca
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm">
              Check MooMoo
            </button>
            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors text-sm">
              Check Binance
            </button>
          </div>
        </div>

        {isMounted ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MooMoo Performance */}
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                🏢 MooMoo AI Performance
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-white">0.0%</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Avg Profit</div>
                  <div className="text-2xl font-bold text-green-400">
                    {(() => {
                      const moomooTrades = recentTrades.filter(t => t.broker === 'MOOMOO' && t.pnl !== undefined);
                      const avgProfit = moomooTrades.length > 0 
                        ? moomooTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / moomooTrades.length 
                        : 0;
                      return `$${avgProfit.toFixed(2)}`;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Best Trade</div>
                  <div className="text-2xl font-bold text-green-400">
                    {(() => {
                      const moomooTrades = recentTrades.filter(t => t.broker === 'MOOMOO' && t.pnl !== undefined);
                      const bestTrade = moomooTrades.length > 0 
                        ? Math.max(...moomooTrades.map(t => t.pnl || 0))
                        : 0;
                      return `+$${bestTrade.toFixed(2)}`;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Worst Trade</div>
                  <div className="text-2xl font-bold text-red-400">
                    {(() => {
                      const moomooTrades = recentTrades.filter(t => t.broker === 'MOOMOO' && t.pnl !== undefined);
                      const worstTrade = moomooTrades.length > 0 
                        ? Math.min(...moomooTrades.map(t => t.pnl || 0))
                        : 0;
                      return `$${worstTrade.toFixed(2)}`;
                    })()}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                Completed: {recentTrades.filter(t => t.broker === 'MOOMOO' && t.status === 'Completed').length} | 
                Pending: {recentTrades.filter(t => t.broker === 'MOOMOO' && t.status === 'Pending').length}
              </div>
            </div>

            {/* Alpaca Performance */}
            <div>
              <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                🦙 Alpaca AI Performance
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-white">
                    {(() => {
                      const alpacaTrades = recentTrades.filter(t => t.broker === 'ALPACA');
                      const winningTrades = alpacaTrades.filter(t => t.pnl && t.pnl > 0);
                      const winRate = alpacaTrades.length > 0 ? (winningTrades.length / alpacaTrades.length * 100) : 0;
                      return `${winRate.toFixed(1)}%`;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Avg Profit</div>
                  <div className="text-2xl font-bold text-green-400">
                    {(() => {
                      const alpacaTrades = recentTrades.filter(t => t.broker === 'ALPACA' && t.pnl !== undefined);
                      const avgProfit = alpacaTrades.length > 0 
                        ? alpacaTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / alpacaTrades.length 
                        : 0;
                      return `$${avgProfit.toFixed(2)}`;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Best Trade</div>
                  <div className="text-2xl font-bold text-green-400">
                    {(() => {
                      const alpacaTrades = recentTrades.filter(t => t.broker === 'ALPACA' && t.pnl !== undefined);
                      const bestTrade = alpacaTrades.length > 0 
                        ? Math.max(...alpacaTrades.map(t => t.pnl || 0))
                        : 0;
                      return `+$${bestTrade.toFixed(2)}`;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Worst Trade</div>
                  <div className="text-2xl font-bold text-red-400">
                    {(() => {
                      const alpacaTrades = recentTrades.filter(t => t.broker === 'ALPACA' && t.pnl !== undefined);
                      const worstTrade = alpacaTrades.length > 0 
                        ? Math.min(...alpacaTrades.map(t => t.pnl || 0))
                        : 0;
                      return `$${worstTrade.toFixed(2)}`;
                    })()}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                Completed: {recentTrades.filter(t => t.broker === 'ALPACA' && t.status === 'Completed').length} | 
                Pending: {recentTrades.filter(t => t.broker === 'ALPACA' && t.status === 'Pending').length}
              </div>
            </div>

            {/* Binance Performance */}
            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                ₿ Binance AI Performance
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-white">
                    {(() => {
                      const binanceTrades = recentTrades.filter(t => t.broker === 'BINANCE');
                      const winningTrades = binanceTrades.filter(t => t.pnl && t.pnl > 0);
                      const winRate = binanceTrades.length > 0 ? (winningTrades.length / binanceTrades.length * 100) : 0;
                      return `${winRate.toFixed(1)}%`;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Avg Profit</div>
                  <div className="text-2xl font-bold text-green-400">
                    {(() => {
                      const binanceTrades = recentTrades.filter(t => t.broker === 'BINANCE' && t.pnl !== undefined);
                      const avgProfit = binanceTrades.length > 0 
                        ? binanceTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / binanceTrades.length 
                        : 0;
                      return `$${avgProfit.toFixed(2)}`;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Best Trade</div>
                  <div className="text-2xl font-bold text-green-400">
                    {(() => {
                      const binanceTrades = recentTrades.filter(t => t.broker === 'BINANCE' && t.pnl !== undefined);
                      const bestTrade = binanceTrades.length > 0 
                        ? Math.max(...binanceTrades.map(t => t.pnl || 0))
                        : 0;
                      return `+$${bestTrade.toFixed(2)}`;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Worst Trade</div>
                  <div className="text-2xl font-bold text-red-400">
                    {(() => {
                      const binanceTrades = recentTrades.filter(t => t.broker === 'BINANCE' && t.pnl !== undefined);
                      const worstTrade = binanceTrades.length > 0 
                        ? Math.min(...binanceTrades.map(t => t.pnl || 0))
                        : 0;
                      return `$${worstTrade.toFixed(2)}`;
                    })()}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                Completed: {recentTrades.filter(t => t.broker === 'BINANCE' && t.status === 'Completed').length} | 
                Pending: {recentTrades.filter(t => t.broker === 'BINANCE' && t.status === 'Pending').length}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Loading placeholders */}
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                🏢 MooMoo AI Performance
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Loading...</div>
                    <div className="text-2xl font-bold text-white">0.0%</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                🦙 Alpaca AI Performance
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Loading...</div>
                    <div className="text-2xl font-bold text-white">$0.00</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                ₿ Binance AI Performance
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Loading...</div>
                    <div className="text-2xl font-bold text-white">$0.00</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedAITradingCenter;
