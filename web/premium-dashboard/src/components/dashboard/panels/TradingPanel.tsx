'use client';

import { motion } from 'framer-motion';
import AIMarketVisualization from '@/components/charts/AIMarketVisualization';
import { MarketDataPanel } from '@/components/market/MarketDataPanel';
import { OrderEntryPanel } from '@/components/trading/OrderEntryPanel';
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel';

export function TradingPanel() {
  return (
    <div className="min-h-screen overflow-y-auto space-y-6 p-4">

      {/* AI Market Visualization - Main Feature */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
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
