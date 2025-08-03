'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { useTradingStore } from '@/stores/trading-store';
import { useWebSocket } from '@/services/websocket';
import { useHotkeys } from 'react-hotkeys-hook';
import AIThoughtsTicker from '../ai/AIThoughtsTicker';
import TimeSquareTickerSystem from '../ai/TimeSquareTickerSystem';
import TruthBanner from '../ai/TruthBanner';
import BottomNewsTicker from '../ai/BottomNewsTicker';
import RotatingTrustBanner from '../ai/RotatingTrustBanner';

export function TradingDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { layout, activePanel, setActivePanel } = useTradingStore();
  const ws = useWebSocket();

  // Trading hotkeys
  useHotkeys('ctrl+1', () => setActivePanel('trading'));
  useHotkeys('ctrl+2', () => setActivePanel('portfolio'));
  useHotkeys('ctrl+3', () => setActivePanel('ai-brain'));
  useHotkeys('ctrl+4', () => setActivePanel('analytics'));
  useHotkeys('ctrl+b', () => setActivePanel('trading')); // Quick buy
  useHotkeys('ctrl+s', () => setActivePanel('trading')); // Quick sell
  useHotkeys('esc', () => setActivePanel('trading')); // Reset to main

  useEffect(() => {
    // Initialize WebSocket connections
    ws.on('connection_status', (status) => {
      console.log('Connection status:', status);
    });

    return () => {
      // Cleanup listeners
      ws.off('connection_status');
    };
  }, [ws]);

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';
  const contentWidth = sidebarCollapsed ? 'w-[calc(100%-4rem)]' : 'w-[calc(100%-16rem)]';
  
  // Define panels that should show in full-page mode (hide tickers and banner)
  const fullPagePanels = [
    'portfolio', 
    'ai-thoughts', 
    'trust-metrics', 
    'ai-brain', 
    'ai-agents', 
    'ml-predictions',
    'ensemble-engine',
    'portfolio-optimizer',
    'risk-management',
    'alternative-data',
    'risk', 
    'analytics', 
    'history', 
    'news', 
    'settings'
  ];
  
  const isFullPageMode = fullPagePanels.includes(activePanel);

  return (
    <div className="min-h-screen bg-neural-dark text-white relative">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 neural-grid opacity-15 pointer-events-none z-0" />
      <div className="fixed inset-0 holographic opacity-8 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-br from-neural-dark via-neural-panel/5 to-neural-surface/10 pointer-events-none z-0" />
      
      {/* Header - Always visible */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Conditionally render tickers and banner - only show on trading panel */}
      {!isFullPageMode && (
        <>
          {/* AI Thoughts Ticker - Second line */}
          <div className="relative z-20">
            <AIThoughtsTicker />
          </div>

          {/* Split Layout: AI Banner (Left) + Deposit Protection (Right) */}
          <div className="px-4 py-1 relative z-20">
            <div className="flex gap-4 items-center">
              {/* Left Side - Compact AI Banner */}
              <div className="flex-1">
                <RotatingTrustBanner />
              </div>
              
              {/* Right Side - Deposit Protection */}
              <div className="flex-1">
                <div className="bg-gradient-to-r from-yellow-900/90 to-orange-900/90 backdrop-blur-md border border-yellow-500/40 rounded-lg overflow-hidden shadow-xl">
                  <div className="relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-500/40 flex items-center justify-center shadow-lg">
                          <span className="text-xl">🛡️</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-300 mb-1">
                            Maximum Deposit Protection
                          </h3>
                          <p className="text-lg font-bold text-yellow-400">
                            $300 Limit
                          </p>
                          <p className="text-xs text-gray-400">
                            Education over extraction - Building trust
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          <span className="text-xs text-gray-400">Protection</span>
                          <p className="text-sm font-bold text-yellow-400">
                            100%
                          </p>
                        </div>
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full w-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Main Layout */}
      <div className={`flex ${isFullPageMode ? 'mt-0' : 'mt-4'} relative z-10`}>
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -256 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`${sidebarWidth} transition-all duration-300 ease-in-out`}
        >
          <Sidebar 
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </motion.aside>
        
        {/* Main Content Area */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${contentWidth} transition-all duration-300 ease-in-out overflow-y-auto ${isFullPageMode ? 'h-screen' : ''}`}
        >
          <MainContent layout={layout} />
          
          {/* Additional content to ensure scrolling - only show on trading panel */}
          {!isFullPageMode && (
            <div className="mt-8 p-4 space-y-6">
              <div className="bg-neural-panel/50 rounded-lg p-6 border border-neural-border/30">
                <h3 className="text-xl font-bold text-neon-blue mb-3">📊 Market Analysis</h3>
                <p className="text-gray-300 text-sm mb-4">Advanced AI-driven market analysis and insights providing real-time market sentiment, trend analysis, and predictive modeling.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neural-dark/50 p-3 rounded">
                    <span className="text-neon-blue text-xs">Market Sentiment</span>
                    <p className="text-white font-bold">Bullish</p>
                  </div>
                  <div className="bg-neural-dark/50 p-3 rounded">
                    <span className="text-neon-green text-xs">Trend Strength</span>
                    <p className="text-white font-bold">Strong</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-neural-panel/50 rounded-lg p-6 border border-neural-border/30">
                <h3 className="text-xl font-bold text-neon-green mb-3">💰 Portfolio Performance</h3>
                <p className="text-gray-300 text-sm mb-4">Real-time portfolio tracking and performance metrics with detailed analytics and risk assessment.</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-neural-dark/50 p-3 rounded">
                    <span className="text-neon-green text-xs">Total Return</span>
                    <p className="text-white font-bold">+12.5%</p>
                  </div>
                  <div className="bg-neural-dark/50 p-3 rounded">
                    <span className="text-neon-blue text-xs">Win Rate</span>
                    <p className="text-white font-bold">73%</p>
                  </div>
                  <div className="bg-neural-dark/50 p-3 rounded">
                    <span className="text-neon-yellow text-xs">Sharpe Ratio</span>
                    <p className="text-white font-bold">1.8</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-neural-panel/50 rounded-lg p-6 border border-neural-border/30">
                <h3 className="text-xl font-bold text-neon-purple mb-3">🤖 AI Trading Signals</h3>
                <p className="text-gray-300 text-sm mb-4">Live AI-generated trading signals and recommendations based on advanced machine learning algorithms.</p>
                <div className="space-y-3">
                  <div className="bg-neural-dark/50 p-3 rounded flex justify-between items-center">
                    <span className="text-white">AAPL - Strong Buy</span>
                    <span className="text-neon-green text-sm">87% Confidence</span>
                  </div>
                  <div className="bg-neural-dark/50 p-3 rounded flex justify-between items-center">
                    <span className="text-white">TSLA - Hold</span>
                    <span className="text-neon-yellow text-sm">65% Confidence</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-neural-panel/50 rounded-lg p-6 border border-neural-border/30">
                <h3 className="text-xl font-bold text-neon-yellow mb-3">⚠️ Risk Management</h3>
                <p className="text-gray-300 text-sm mb-4">Comprehensive risk analysis and management tools to protect your investments and optimize returns.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neural-dark/50 p-3 rounded">
                    <span className="text-neon-yellow text-xs">Portfolio Risk</span>
                    <p className="text-white font-bold">Low</p>
                  </div>
                  <div className="bg-neural-dark/50 p-3 rounded">
                    <span className="text-neon-red text-xs">Max Drawdown</span>
                    <p className="text-white font-bold">-3.2%</p>
                  </div>
                </div>
              </div>
              
              {/* Extra content to ensure scrolling */}
              <div className="bg-neural-panel/50 rounded-lg p-6 border border-neural-border/30">
                <h3 className="text-xl font-bold text-neon-cyan mb-3">📈 Advanced Analytics</h3>
                <p className="text-gray-300 text-sm mb-4">Deep dive into advanced trading analytics and performance metrics.</p>
                <div className="h-32 bg-neural-dark/50 rounded flex items-center justify-center">
                  <span className="text-gray-400">Analytics Dashboard</span>
                </div>
              </div>
              
              <div className="bg-neural-panel/50 rounded-lg p-6 border border-neural-border/30">
                <h3 className="text-xl font-bold text-neon-pink mb-3">🎯 Trading History</h3>
                <p className="text-gray-300 text-sm mb-4">Complete history of all trading activities and performance tracking.</p>
                <div className="h-32 bg-neural-dark/50 rounded flex items-center justify-center">
                  <span className="text-gray-400">Trading History</span>
                </div>
              </div>
            </div>
          )}
        </motion.main>
      </div>
      
      {/* Bottom News Ticker - Only show on trading panel */}
      {!isFullPageMode && (
        <div className="mt-8 mb-4 relative z-20">
          <BottomNewsTicker />
        </div>
      )}
      
      {/* Keyboard Shortcuts Help (Hidden by default) */}
      <div id="shortcuts-help" className="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-neural-panel border border-neural-border rounded-xl p-6 max-w-md w-full mx-4"
        >
          <h3 className="text-lg font-bold text-neon-blue mb-4">Keyboard Shortcuts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Trading Panel</span>
              <kbd className="bg-neural-dark px-2 py-1 rounded text-neon-blue">Ctrl+1</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Portfolio</span>
              <kbd className="bg-neural-dark px-2 py-1 rounded text-neon-blue">Ctrl+2</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AI Brain</span>
              <kbd className="bg-neural-dark px-2 py-1 rounded text-neon-blue">Ctrl+3</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Analytics</span>
              <kbd className="bg-neural-dark px-2 py-1 rounded text-neon-blue">Ctrl+4</kbd>
            </div>
            <hr className="border-neural-border my-3" />
            <div className="flex justify-between">
              <span className="text-gray-400">Quick Buy</span>
              <kbd className="bg-neural-dark px-2 py-1 rounded text-neon-green">Ctrl+B</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Quick Sell</span>
              <kbd className="bg-neural-dark px-2 py-1 rounded text-red-400">Ctrl+S</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reset View</span>
              <kbd className="bg-neural-dark px-2 py-1 rounded text-gray-400">Esc</kbd>
            </div>
          </div>
          <button
            onClick={() => document.getElementById('shortcuts-help')?.classList.add('hidden')}
            className="mt-4 w-full bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/40 rounded-lg py-2 text-neon-blue transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    </div>
  );
}
