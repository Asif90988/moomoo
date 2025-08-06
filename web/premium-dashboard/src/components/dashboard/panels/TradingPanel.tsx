'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AIMarketVisualization from '@/components/charts/AIMarketVisualization';
import { MarketDataPanel } from '@/components/market/MarketDataPanel';
import { OrderEntryPanel } from '@/components/trading/OrderEntryPanel';
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel';
import { autonomousTradingService } from '@/services/autonomous-trading-service';
import { useTradingStore } from '@/stores/trading-store';
import { Play, Pause, Settings, Activity, Brain, Zap } from 'lucide-react';

export function TradingPanel() {
  const [isAutonomousEnabled, setIsAutonomousEnabled] = useState(false);
  const [serviceState, setServiceState] = useState(autonomousTradingService.getState());
  const { autoTrades, totalProfit } = useTradingStore();

  // Update service state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setServiceState(autonomousTradingService.getState());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleAutonomousTrading = () => {
    if (isAutonomousEnabled) {
      // Stop all autonomous trading
      autonomousTradingService.stopAlpacaTrading();
      autonomousTradingService.stopMoomooTrading();
      console.log('🛑 Stopped all autonomous trading from Trading Panel');
    } else {
      // Start autonomous trading for available brokers
      autonomousTradingService.startAlpacaTrading();
      autonomousTradingService.startMoomooTrading();
      console.log('🚀 Started autonomous trading from Trading Panel');
    }
    setIsAutonomousEnabled(!isAutonomousEnabled);
  };

  return (
    <div className="min-h-screen overflow-y-auto space-y-6 p-4">

      {/* Autonomous Trading Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl border border-neural-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-neon-purple" />
            <h3 className="text-xl font-bold text-white">Autonomous Trading Control</h3>
            {isAutonomousEnabled && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">ACTIVE</span>
              </div>
            )}
          </div>
          
          <button
            onClick={toggleAutonomousTrading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
              isAutonomousEnabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isAutonomousEnabled ? (
              <>
                <Pause className="w-5 h-5" />
                STOP AUTONOMOUS TRADING
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                START AUTONOMOUS TRADING
              </>
            )}
          </button>
        </div>

        {/* Trading Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm">Total Trades</span>
            </div>
            <div className="text-2xl font-mono text-white">{autoTrades.length}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-sm">Total P&L</span>
            </div>
            <div className={`text-2xl font-mono ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400 text-sm">AI Status</span>
            </div>
            <div className="text-lg font-medium text-purple-400">
              {isAutonomousEnabled ? 'Learning & Trading' : 'Standby'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Market Visualization - Main Feature */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="h-96 glass rounded-xl border border-neural-border overflow-hidden"
      >
        <AIMarketVisualization />
      </motion.div>
      
      {/* Market Data and Order Entry Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Data */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-80 glass rounded-xl border border-neural-border"
        >
          <MarketDataPanel />
        </motion.div>
        
        {/* Order Entry */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-80 glass rounded-xl border border-neural-border"
        >
          <OrderEntryPanel />
        </motion.div>
      </div>

      {/* AI Insights Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="h-80 glass rounded-xl border border-neural-border"
      >
        <AIInsightsPanel />
      </motion.div>

      {/* Additional Trading Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass rounded-xl border border-neural-border p-6"
        >
          <h3 className="text-lg font-bold text-neon-blue mb-4">📊 Real-Time Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Today's P&L</span>
              <span className="text-green-400 font-mono">+$24.67</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Win Rate</span>
              <span className="text-blue-400 font-mono">73.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AI Accuracy</span>
              <span className="text-purple-400 font-mono">87.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Score</span>
              <span className="text-yellow-400 font-mono">Low</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass rounded-xl border border-neural-border p-6"
        >
          <h3 className="text-lg font-bold text-neon-green mb-4">🎯 Active Positions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">AAPL</span>
              <div className="text-right">
                <div className="text-green-400 text-sm">+2.3%</div>
                <div className="text-gray-400 text-xs">10 shares</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">TSLA</span>
              <div className="text-right">
                <div className="text-red-400 text-sm">-0.8%</div>
                <div className="text-gray-400 text-xs">5 shares</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">MSFT</span>
              <div className="text-right">
                <div className="text-green-400 text-sm">+1.7%</div>
                <div className="text-gray-400 text-xs">8 shares</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass rounded-xl border border-neural-border p-6"
        >
          <h3 className="text-lg font-bold text-neon-purple mb-4">🧠 AI Recommendations</h3>
          <div className="space-y-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
              <div className="text-green-400 text-sm font-medium">STRONG BUY</div>
              <div className="text-white text-xs">NVDA - High confidence</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
              <div className="text-yellow-400 text-sm font-medium">HOLD</div>
              <div className="text-white text-xs">AAPL - Monitor volume</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
              <div className="text-blue-400 text-sm font-medium">WATCH</div>
              <div className="text-white text-xs">META - Pattern forming</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Spacer for proper scrolling */}
      <div className="h-20"></div>
    </div>
  );
}
