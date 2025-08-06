'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradingStore } from '@/stores/trading-store';
import { autonomousTradingService } from '@/services/autonomous-trading-service';
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
  Mountain
} from 'lucide-react';

interface AutoTrade {
  id: string;
  timestamp: Date;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  reason: string;
  confidence: number;
  profit?: number;
  broker: 'moomoo' | 'alpaca';
}

interface AIDecision {
  symbol: string;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  reasoning: string;
  targetPrice: number;
  stopLoss: number;
  positionSize: number;
  broker: 'moomoo' | 'alpaca';
}

const AutonomousEngine: React.FC = () => {
  const { 
    portfolio, 
    updatePortfolioValue, 
    resetPortfolioToBaseline, 
    setPortfolio,
    isAutonomousActive,
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
  
  const [aiThoughts, setAiThoughts] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  
  // Get state from persistent service
  const [serviceState, setServiceState] = useState(autonomousTradingService.getState());
  const [realAlpacaData, setRealAlpacaData] = useState<any>(null);
  
  // Input states for setting starting balances
  const [moomooInput, setMoomooInput] = useState('300.00');
  const [alpacaInput, setAlpacaInput] = useState('1000.00');
  const [showBalanceInputs, setShowBalanceInputs] = useState(false);

  // Extract values from service state
  const moomooActive = serviceState.moomooActive;
  const alpacaActive = serviceState.alpacaActive;
  const moomooPortfolio = serviceState.moomooPortfolio;
  const alpacaPortfolio = serviceState.alpacaPortfolio;
  const useRealData = serviceState.useRealData;


  // Update service state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setServiceState(autonomousTradingService.getState());
      setAiThoughts(autonomousTradingService.getState().aiThoughts);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleMoomoo = () => {
    if (moomooActive) {
      autonomousTradingService.stopMoomooTrading();
    } else {
      autonomousTradingService.startMoomooTrading();
    }
    setServiceState(autonomousTradingService.getState());
  };

  const toggleAlpaca = () => {
    if (alpacaActive) {
      autonomousTradingService.stopAlpacaTrading();
    } else {
      autonomousTradingService.startAlpacaTrading();
    }
    setServiceState(autonomousTradingService.getState());
  };

  const updateMoomooBalance = () => {
    const newValue = parseFloat(moomooInput) || 300.00;
    autonomousTradingService.updateMoomooPortfolio({ value: newValue, trades: 0, profit: 0 });
    setServiceState(autonomousTradingService.getState());
    console.log(`🏦 MooMoo balance updated to $${newValue.toFixed(2)}`);
  };

  const updateAlpacaBalance = () => {
    const newValue = parseFloat(alpacaInput) || 1000.00;
    autonomousTradingService.updateAlpacaPortfolio({ value: newValue, trades: 0, profit: 0 });
    setServiceState(autonomousTradingService.getState());
    console.log(`🦙 Alpaca balance updated to $${newValue.toFixed(2)}`);
  };

  const resetToBaseline = async () => {
    console.log('🔄 HARD RESET: Starting complete system reset');
    
    autonomousTradingService.resetAll();
    setServiceState(autonomousTradingService.getState());
    setAiThoughts([]);
    
    resetPortfolioToBaseline();
    
    setTimeout(() => {
      syncPortfolioWithAI();
      console.log('🔄 HARD RESET COMPLETE');
    }, 100);
  };

  // Filter trades by broker
  const moomooTrades = autoTrades.filter(trade => trade.broker === 'moomoo');
  const alpacaTrades = autoTrades.filter(trade => trade.broker === 'alpaca');

  // Calculate performance metrics
  const calculateMetrics = (trades: AutoTrade[]) => {
    if (trades.length === 0) return { winRate: 0, avgProfit: 0, totalProfit: 0, bestTrade: 0, worstTrade: 0 };
    
    const completedTrades = trades.filter(t => t.profit !== undefined);
    const winningTrades = completedTrades.filter(t => (t.profit || 0) > 0);
    const totalProfit = completedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const avgProfit = completedTrades.length > 0 ? totalProfit / completedTrades.length : 0;
    const profits = completedTrades.map(t => t.profit || 0);
    
    return {
      winRate: completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0,
      avgProfit,
      totalProfit,
      bestTrade: profits.length > 0 ? Math.max(...profits) : 0,
      worstTrade: profits.length > 0 ? Math.min(...profits) : 0,
      completedTrades: completedTrades.length,
      pendingTrades: trades.length - completedTrades.length
    };
  };

  const moomooMetrics = calculateMetrics(moomooTrades);
  const alpacaMetrics = calculateMetrics(alpacaTrades);

  // Verification functions
  const checkAlpacaAccount = () => {
    window.open('https://app.alpaca.markets/paper/dashboard/overview', '_blank');
  };

  const checkMoomooAccount = () => {
    window.open('https://www.moomoo.com/', '_blank');
  };

  const exportTradeData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      moomoo: {
        trades: moomooTrades,
        metrics: moomooMetrics,
        portfolio: moomooPortfolio
      },
      alpaca: {
        trades: alpacaTrades,
        metrics: alpacaMetrics,
        portfolio: alpacaPortfolio
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-trading-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-neural-dark text-white p-6 overflow-y-auto">
      {/* Safety Banner */}
      <div className="glass rounded-xl border border-yellow-500/40 p-4 mb-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-400">🛡️ PAPER TRADING MODE ACTIVE</h3>
            <p className="text-gray-300 text-sm">Your real shares are PROTECTED. All trades are simulated for learning purposes.</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            Multi-Broker AI Engine
          </h1>
          <p className="text-gray-400 mt-1">Separate AI trading engines for MooMoo (HK) and Alpaca (US) markets</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowBalanceInputs(!showBalanceInputs)}
            className="px-3 py-2 glass rounded-lg border border-neon-blue/40 hover:border-neon-blue/60 transition-colors text-sm text-neon-blue hover:text-blue-300"
          >
            Set Balances
          </button>
          <button 
            onClick={resetToBaseline}
            className="px-3 py-2 glass rounded-lg border border-yellow-500/40 hover:border-yellow-500/60 transition-colors text-sm text-yellow-400 hover:text-yellow-300"
          >
            Reset All
          </button>
          <select 
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value as any)}
            className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-neon-blue/40 focus:outline-none"
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
      </div>

      {/* Balance Input Panel */}
      <AnimatePresence>
        {showBalanceInputs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl border border-neural-border p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 text-neon-blue mr-2" />
              Set Starting Balances for Testing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MooMoo Balance Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  MooMoo Starting Balance (USD)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={moomooInput}
                    onChange={(e) => setMoomooInput(e.target.value)}
                    placeholder="300.00"
                    className="flex-1 px-3 py-2 bg-white/5 border border-red-500/40 rounded-lg text-white placeholder-gray-500 focus:border-red-400 focus:outline-none"
                  />
                  <button
                    onClick={updateMoomooBalance}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300"
                  >
                    Set
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Current: ${moomooPortfolio.value.toFixed(2)} • Default: $300.00 (your actual MooMoo balance)
                </p>
              </div>

              {/* Alpaca Balance Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Alpaca Starting Balance (USD)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={alpacaInput}
                    onChange={(e) => setAlpacaInput(e.target.value)}
                    placeholder="1000.00"
                    className="flex-1 px-3 py-2 bg-white/5 border border-blue-500/40 rounded-lg text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none"
                  />
                  <button
                    onClick={updateAlpacaBalance}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300"
                  >
                    Set
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Current: ${alpacaPortfolio.value.toFixed(2)} • Suggested: $1000.00 for testing
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
              <p className="text-sm text-neon-blue">
                💡 <strong>Testing Tip:</strong> Set higher balances to see more AI trading activity. 
                The AI will make trades based on portfolio size - larger balances = more trades to analyze.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broker Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* MooMoo Panel */}
        <div className="glass rounded-xl border border-neural-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                moomooActive 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-400 animate-pulse' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500'
              }`}>
                <Building2 className={`w-6 h-6 ${moomooActive ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center">
                  MooMoo AI Trading
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                    HK MARKET
                  </span>
                </h3>
                <p className="text-sm text-gray-400">
                  {moomooActive ? 'Trading Hong Kong stocks' : 'Hong Kong market standby'}
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleMoomoo}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                moomooActive
                  ? 'bg-gradient-to-r from-neon-red to-red-500 hover:from-red-500 hover:to-neon-red text-white'
                  : 'bg-gradient-to-r from-neon-green to-green-500 hover:from-green-500 hover:to-neon-green text-white'
              }`}
            >
              {moomooActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{moomooActive ? 'Stop' : 'Start'}</span>
            </button>
          </div>

          {/* MooMoo Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-lg border border-red-500/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Portfolio</span>
                <DollarSign className="w-3 h-3 text-red-400" />
              </div>
              <p className="text-lg font-bold text-white">${moomooPortfolio.value.toFixed(2)}</p>
              <p className="text-xs text-gray-500">MooMoo USD</p>
            </div>
            
            <div className="glass rounded-lg border border-red-500/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Trades</span>
                <Activity className="w-3 h-3 text-red-400" />
              </div>
              <p className="text-lg font-bold text-white">{moomooTrades.length}</p>
            </div>
            
            <div className="glass rounded-lg border border-red-500/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">P&L</span>
                <BarChart3 className="w-3 h-3 text-red-400" />
              </div>
              <p className={`text-lg font-bold ${moomooPortfolio.profit >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                {moomooPortfolio.profit >= 0 ? '+' : ''}${moomooPortfolio.profit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Alpaca Panel */}
        <div className="glass rounded-xl border border-neural-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                alpacaActive 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400 animate-pulse' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500'
              }`}>
                <Mountain className={`w-6 h-6 ${alpacaActive ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center">
                  Alpaca AI Trading
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40">
                    US MARKET
                  </span>
                </h3>
                <p className="text-sm text-gray-400">
                  {alpacaActive ? 'Trading US stocks' : 'US market standby'}
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleAlpaca}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                alpacaActive
                  ? 'bg-gradient-to-r from-neon-red to-red-500 hover:from-red-500 hover:to-neon-red text-white'
                  : 'bg-gradient-to-r from-neon-green to-green-500 hover:from-green-500 hover:to-neon-green text-white'
              }`}
            >
              {alpacaActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{alpacaActive ? 'Stop' : 'Start'}</span>
            </button>
          </div>

          {/* Alpaca Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-lg border border-blue-500/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Portfolio</span>
                <DollarSign className="w-3 h-3 text-blue-400" />
              </div>
              <p className="text-lg font-bold text-white">${alpacaPortfolio.value.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Alpaca USD</p>
            </div>
            
            <div className="glass rounded-lg border border-blue-500/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Trades</span>
                <Activity className="w-3 h-3 text-blue-400" />
              </div>
              <p className="text-lg font-bold text-white">{alpacaTrades.length}</p>
            </div>
            
            <div className="glass rounded-lg border border-blue-500/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">P&L</span>
                <BarChart3 className="w-3 h-3 text-blue-400" />
              </div>
              <p className={`text-lg font-bold ${alpacaPortfolio.profit >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                {alpacaPortfolio.profit >= 0 ? '+' : ''}${alpacaPortfolio.profit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analytics Panel */}
      <div className="glass rounded-xl border border-neural-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart3 className="w-5 h-5 text-neon-yellow mr-2" />
            AI Performance Analytics & Verification
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={exportTradeData}
              className="px-3 py-2 glass rounded-lg border border-neon-green/40 hover:border-neon-green/60 transition-colors text-sm text-neon-green hover:text-green-300"
            >
              Export Data
            </button>
            <button
              onClick={checkAlpacaAccount}
              className="px-3 py-2 glass rounded-lg border border-blue-500/40 hover:border-blue-500/60 transition-colors text-sm text-blue-400 hover:text-blue-300"
            >
              Check Alpaca
            </button>
            <button
              onClick={checkMoomooAccount}
              className="px-3 py-2 glass rounded-lg border border-red-500/40 hover:border-red-500/60 transition-colors text-sm text-red-400 hover:text-red-300"
            >
              Check MooMoo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MooMoo Analytics */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-red-400 flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              MooMoo AI Performance
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-lg border border-red-500/20 p-3">
                <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                <p className="text-lg font-bold text-white">{moomooMetrics.winRate.toFixed(1)}%</p>
              </div>
              <div className="glass rounded-lg border border-red-500/20 p-3">
                <p className="text-xs text-gray-400 mb-1">Avg Profit</p>
                <p className={`text-lg font-bold ${moomooMetrics.avgProfit >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                  ${moomooMetrics.avgProfit.toFixed(2)}
                </p>
              </div>
              <div className="glass rounded-lg border border-red-500/20 p-3">
                <p className="text-xs text-gray-400 mb-1">Best Trade</p>
                <p className="text-lg font-bold text-neon-green">+${moomooMetrics.bestTrade.toFixed(2)}</p>
              </div>
              <div className="glass rounded-lg border border-red-500/20 p-3">
                <p className="text-xs text-gray-400 mb-1">Worst Trade</p>
                <p className="text-lg font-bold text-neon-red">${moomooMetrics.worstTrade.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Completed: {moomooMetrics.completedTrades} | Pending: {moomooMetrics.pendingTrades}
            </div>
          </div>

          {/* Alpaca Analytics */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-blue-400 flex items-center">
              <Mountain className="w-4 h-4 mr-2" />
              Alpaca AI Performance
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-lg border border-blue-500/20 p-3">
                <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                <p className="text-lg font-bold text-white">{alpacaMetrics.winRate.toFixed(1)}%</p>
              </div>
              <div className="glass rounded-lg border border-blue-500/20 p-3">
                <p className="text-xs text-gray-400 mb-1">Avg Profit</p>
                <p className={`text-lg font-bold ${alpacaMetrics.avgProfit >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                  ${alpacaMetrics.avgProfit.toFixed(2)}
                </p>
              </div>
              <div className="glass rounded-lg border border-blue-500/20 p-3">
                <p className="text-xs text-gray-400 mb-1">Best Trade</p>
                <p className="text-lg font-bold text-neon-green">+${alpacaMetrics.bestTrade.toFixed(2)}</p>
              </div>
              <div className="glass rounded-lg border border-blue-500/20 p-3">
                <p className="text-xs text-gray-400 mb-1">Worst Trade</p>
                <p className="text-lg font-bold text-neon-red">${alpacaMetrics.worstTrade.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Completed: {alpacaMetrics.completedTrades} | Pending: {alpacaMetrics.pendingTrades}
            </div>
          </div>
        </div>

        {/* Verification Guide */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20">
          <h5 className="text-sm font-semibold text-neon-blue mb-2">🔍 How to Verify AI Performance:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
            <div>
              <p className="font-medium text-blue-400 mb-1">Alpaca Verification:</p>
              <ul className="space-y-1 text-gray-400">
                <li>• Click "Check Alpaca" to open paper trading dashboard</li>
                <li>• Compare order history with our trade log</li>
                <li>• Verify portfolio balance changes</li>
                <li>• Check execution timestamps match</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-red-400 mb-1">MooMoo Verification:</p>
              <ul className="space-y-1 text-gray-400">
                <li>• Click "Check MooMoo" to open account</li>
                <li>• Review trade confirmations in app</li>
                <li>• Compare portfolio value changes</li>
                <li>• Verify HK stock symbols match</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Thoughts Stream */}
        <div className="glass rounded-xl border border-neural-border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-neon-purple" />
            <h3 className="text-lg font-semibold text-white">AI Thoughts Stream</h3>
            <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {aiThoughts.map((thought, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border border-neon-purple/20"
              >
                <p className="text-sm text-gray-300">{thought}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleTimeString()}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent AI Decisions */}
        <div className="glass rounded-xl border border-neural-border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-neon-blue" />
            <h3 className="text-lg font-semibold text-white">AI Decisions</h3>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {aiDecisions.map((decision, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{decision.symbol}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      decision.broker === 'moomoo' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}>
                      {decision.broker.toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    decision.recommendation.includes('buy') ? 'bg-neon-green/20 text-neon-green border-neon-green/40' :
                    decision.recommendation.includes('sell') ? 'bg-neon-red/20 text-neon-red border-neon-red/40' :
                    'bg-yellow-400/20 text-yellow-400 border-yellow-400/40'
                  }`}>
                    {decision.recommendation.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{decision.reasoning}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Confidence: {decision.confidence.toFixed(1)}%</span>
                  <span>Size: {decision.positionSize} shares</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Trades by Broker */}
      {autoTrades.length > 0 && (
        <div className="glass rounded-xl border border-neural-border p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 text-neon-yellow mr-2" />
            Recent Trades by Broker
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-400">Broker</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-400">Time</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-400">Symbol</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-400">Action</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-400">Quantity</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-400">Price</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-400">P&L</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-400">AI Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {autoTrades.slice(0, 10).map((trade) => (
                  <tr key={trade.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        trade.broker === 'moomoo' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}>
                        {trade.broker.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-400">{trade.timestamp.toLocaleTimeString()}</td>
                    <td className="p-3 font-semibold text-white">{trade.symbol}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        trade.action === 'buy' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'
                      }`}>
                        {trade.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-white">{trade.quantity}</td>
                    <td className="p-3 text-right font-mono text-white">${trade.price.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono">
                      {trade.profit !== undefined ? (
                        <span className={trade.profit >= 0 ? 'text-neon-green' : 'text-neon-red'}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-500">Pending</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-400 max-w-xs truncate">{trade.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutonomousEngine;
