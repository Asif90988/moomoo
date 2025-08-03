'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, TrendingUp, TrendingDown, Eye, Zap, Activity, BarChart3, Sparkles, Star } from 'lucide-react';

interface MarketNode {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  aiSentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  position: { x: number; y: number };
  connections: string[];
  momentum: number;
  rsi: number;
  volume: number;
  marketCap: number;
}

interface AIInsight {
  id: string;
  type: 'pattern' | 'opportunity' | 'risk' | 'correlation';
  message: string;
  confidence: number;
  symbol?: string;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
}

const AIMarketVisualization: React.FC = () => {
  const [marketNodes, setMarketNodes] = useState<MarketNode[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [selectedNode, setSelectedNode] = useState<MarketNode | null>(null);
  const [viewMode, setViewMode] = useState<'neural' | 'cosmos' | 'matrix'>('neural');
  const [pulseIntensity, setPulseIntensity] = useState(1);

  // Initialize premium market data
  useEffect(() => {
    const symbols = [
      { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', cap: 3000 },
      { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', cap: 800 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', cap: 2800 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', cap: 1700 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', cap: 1200 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-commerce', cap: 1500 },
      { symbol: 'META', name: 'Meta Platforms', sector: 'Social Media', cap: 900 },
      { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial', cap: 600 }
    ];

    const nodes: MarketNode[] = symbols.map((stock, index) => {
      const centerX = 450; // Center horizontally with more space
      const centerY = 180; // Optimal vertical position
      const angle = (index / symbols.length) * 2 * Math.PI;
      const radius = 120 + (stock.cap / 3000) * 40; // Much larger radius for better spacing
      
      return {
        id: stock.symbol,
        symbol: stock.symbol,
        name: stock.name,
        price: 50 + Math.random() * 300,
        change: (Math.random() - 0.5) * 15,
        changePercent: (Math.random() - 0.5) * 8,
        aiSentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish',
        confidence: Math.random() * 35 + 65,
        position: {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        },
        connections: symbols
          .filter(s => s.symbol !== stock.symbol && Math.random() > 0.4)
          .map(s => s.symbol)
          .slice(0, 3),
        momentum: Math.random() * 100,
        rsi: Math.random() * 100,
        volume: Math.floor(Math.random() * 50000000),
        marketCap: stock.cap
      };
    });

    setMarketNodes(nodes);
  }, []);

  // Generate sophisticated AI insights
  useEffect(() => {
    const generateAdvancedInsight = (): AIInsight => {
      const types: AIInsight['type'][] = ['pattern', 'opportunity', 'risk', 'correlation'];
      const type = types[Math.floor(Math.random() * types.length)];
      const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'AMZN', 'META', 'JPM'];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];

      const advancedMessages = {
        pattern: [
          `Neural network detected inverse head-and-shoulders pattern in ${symbol} with 94% accuracy`,
          `Advanced ML identifies bullish flag breakout in ${symbol} - momentum accelerating`,
          `Quantum pattern recognition: ${symbol} showing rare golden cross formation`,
          `Deep learning model confirms Elliott Wave completion in ${symbol} structure`
        ],
        opportunity: [
          `AI sentiment analysis reveals ${symbol} oversold with institutional accumulation`,
          `Machine learning arbitrage detected: ${symbol} mispriced by 3.7% vs fair value`,
          `Neural sentiment engine: ${symbol} showing divergence from sector - alpha opportunity`,
          `Quantum computing models predict ${symbol} breakout within 24-48 hours`
        ],
        risk: [
          `Risk algorithms detect unusual options flow in ${symbol} - hedging recommended`,
          `AI volatility models show ${symbol} entering high-risk zone - position sizing critical`,
          `Machine learning correlation analysis: ${symbol} systemic risk increasing`,
          `Neural network warning: ${symbol} showing pre-crash behavioral patterns`
        ],
        correlation: [
          `Advanced correlation matrix reveals TSLA-NVDA coupling at 0.87 - unprecedented`,
          `AI detects sector rotation: Technology stocks decoupling from market indices`,
          `Machine learning identifies new regime: Traditional correlations breaking down`,
          `Quantum analysis: Cross-asset momentum signals suggest paradigm shift`
        ]
      };

      return {
        id: Date.now().toString() + Math.random(),
        type,
        message: advancedMessages[type][Math.floor(Math.random() * advancedMessages[type].length)],
        confidence: Math.random() * 25 + 75, // High confidence 75-100%
        priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        symbol: type !== 'correlation' ? symbol : undefined,
        timestamp: Date.now()
      };
    };

    setAIInsights(Array.from({ length: 4 }, generateAdvancedInsight));

    const interval = setInterval(() => {
      setAIInsights(prev => [...prev, generateAdvancedInsight()].slice(-6));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Dynamic market updates with sophisticated algorithms
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketNodes(prev => prev.map(node => ({
        ...node,
        price: Math.max(10, node.price + (Math.random() - 0.5) * 3),
        change: node.change + (Math.random() - 0.5) * 0.8,
        changePercent: node.changePercent + (Math.random() - 0.5) * 0.3,
        momentum: Math.max(0, Math.min(100, node.momentum + (Math.random() - 0.5) * 12)),
        rsi: Math.max(0, Math.min(100, node.rsi + (Math.random() - 0.5) * 8)),
        confidence: Math.max(50, Math.min(100, node.confidence + (Math.random() - 0.5) * 5))
      })));
      
      setPulseIntensity(Math.random() * 0.5 + 0.8);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const getSentimentGradient = (sentiment: string, confidence: number) => {
    const opacity = confidence / 100;
    switch (sentiment) {
      case 'bullish': 
        return `linear-gradient(135deg, rgba(34, 197, 94, ${opacity}) 0%, rgba(16, 185, 129, ${opacity * 0.7}) 100%)`;
      case 'bearish': 
        return `linear-gradient(135deg, rgba(239, 68, 68, ${opacity}) 0%, rgba(220, 38, 38, ${opacity * 0.7}) 100%)`;
      default: 
        return `linear-gradient(135deg, rgba(251, 191, 36, ${opacity}) 0%, rgba(245, 158, 11, ${opacity * 0.7}) 100%)`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10 text-red-300';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-300';
      default: return 'border-blue-500 bg-blue-500/10 text-blue-300';
    }
  };

  const renderNeuralView = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
      {/* Sophisticated Neural Background */}
      <div className="absolute inset-0">
        {/* Animated neural grid */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"
            style={{
              left: `${(i + 1) * 8}%`,
              height: '100%',
            }}
            animate={{
              opacity: [0.1, 0.4, 0.1],
              scaleY: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
        
        {/* Horizontal neural grid */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
            style={{
              top: `${(i + 1) * 12}%`,
              width: '100%',
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scaleX: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 5 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Neural Network Connections */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        {marketNodes.map(node =>
          node.connections.map(connId => {
            const connectedNode = marketNodes.find(n => n.id === connId);
            if (!connectedNode) return null;
            
            return (
              <motion.line
                key={`${node.id}-${connId}`}
                x1={node.position.x}
                y1={node.position.y}
                x2={connectedNode.position.x}
                y2={connectedNode.position.y}
                stroke="url(#neuralGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: [0.3, 0.8, 0.3],
                  strokeWidth: [1, 3, 1]
                }}
                transition={{ 
                  pathLength: { duration: 2 },
                  opacity: { duration: 3, repeat: Infinity },
                  strokeWidth: { duration: 3, repeat: Infinity, delay: Math.random() }
                }}
              />
            );
          })
        )}
        <defs>
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Sophisticated Market Nodes */}
      {marketNodes.map((node, index) => (
        <motion.div
          key={node.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
          className="absolute cursor-pointer group"
          style={{
            left: node.position.x - 40,
            top: node.position.y - 40,
            zIndex: 10
          }}
          onClick={() => setSelectedNode(node)}
          whileHover={{ scale: 1.15, zIndex: 20 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Neural Node Container */}
          <div className="relative w-20 h-20">
            {/* Outer Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 opacity-60"
              style={{
                borderColor: node.aiSentiment === 'bullish' ? '#10b981' : 
                            node.aiSentiment === 'bearish' ? '#ef4444' : '#f59e0b',
                background: getSentimentGradient(node.aiSentiment, node.confidence)
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
            />

            {/* Inner Neural Core */}
            <motion.div
              className="absolute inset-2 rounded-full backdrop-blur-sm border flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${node.aiSentiment === 'bullish' ? 'rgba(16, 185, 129, 0.3)' : 
                  node.aiSentiment === 'bearish' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'} 0%, transparent 70%)`,
                borderColor: node.aiSentiment === 'bullish' ? '#10b981' : 
                            node.aiSentiment === 'bearish' ? '#ef4444' : '#f59e0b',
              }}
              animate={{
                boxShadow: [
                  `0 0 20px ${node.aiSentiment === 'bullish' ? '#10b981' : 
                              node.aiSentiment === 'bearish' ? '#ef4444' : '#f59e0b'}`,
                  `0 0 40px ${node.aiSentiment === 'bullish' ? '#10b981' : 
                              node.aiSentiment === 'bearish' ? '#ef4444' : '#f59e0b'}`,
                  `0 0 20px ${node.aiSentiment === 'bullish' ? '#10b981' : 
                              node.aiSentiment === 'bearish' ? '#ef4444' : '#f59e0b'}`,
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xs font-bold text-white drop-shadow-lg">{node.symbol}</span>
            </motion.div>

            {/* Confidence Indicator */}
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                scale: { duration: 1.5, repeat: Infinity },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" }
              }}
            >
              <span className="text-xs font-bold text-white">{Math.round(node.confidence)}</span>
            </motion.div>

            {/* Activity Pulse */}
            {node.confidence > 85 && (
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: node.aiSentiment === 'bullish' ? '#10b981' : 
                              node.aiSentiment === 'bearish' ? '#ef4444' : '#f59e0b',
                }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            )}
          </div>

          {/* Advanced Info Panel */}
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-800/95 backdrop-blur-md border border-slate-600 rounded-lg p-3 min-w-48 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl"
            style={{ zIndex: 30 }}
          >
            <div className="text-center">
              <h3 className="font-bold text-white text-sm mb-1">{node.name}</h3>
              <div className={`text-2xl font-mono font-bold mb-2 ${
                node.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${node.price.toFixed(2)}
              </div>
              <div className={`text-sm font-medium mb-2 ${
                node.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {node.change >= 0 ? '+' : ''}{node.change.toFixed(2)} ({node.changePercent.toFixed(1)}%)
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                <div>
                  <span className="text-purple-400">RSI:</span> {node.rsi.toFixed(0)}
                </div>
                <div>
                  <span className="text-cyan-400">Momentum:</span> {node.momentum.toFixed(0)}
                </div>
                <div>
                  <span className="text-pink-400">Volume:</span> {(node.volume / 1000000).toFixed(1)}M
                </div>
                <div>
                  <span className="text-yellow-400">Cap:</span> ${node.marketCap}B
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-slate-600">
                <span className={`text-xs px-2 py-1 rounded ${
                  node.aiSentiment === 'bullish' ? 'bg-green-500/20 text-green-300' :
                  node.aiSentiment === 'bearish' ? 'bg-red-500/20 text-red-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  AI: {node.aiSentiment.toUpperCase()} ({node.confidence.toFixed(0)}%)
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* Compact Neural Command Center */}
      <motion.div
        className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-2 shadow-lg w-48"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-4 h-4 text-cyan-400" />
          </motion.div>
          <h3 className="text-xs font-bold text-white">Neural Center</h3>
          <motion.div
            className="w-2 h-2 bg-green-400 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-300">
            <span className="text-cyan-400">Nodes:</span> {marketNodes.length}/8
          </div>
          <div className="text-xs text-gray-300">
            <span className="text-purple-400">Activity:</span> 
            <span className="text-green-400 ml-1">{(pulseIntensity * 100).toFixed(0)}%</span>
          </div>
        </div>
      </motion.div>

      {/* Premium AI Insights Panel */}
      <motion.div
        className="absolute top-2 right-2 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-purple-500/40 rounded-xl p-4 shadow-2xl w-80"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-4 h-4 text-purple-400" />
            </motion.div>
            <h3 className="text-sm font-bold text-white">AI Market Intelligence</h3>
          </div>
          <motion.div
            className="px-2 py-1 bg-green-500/20 border border-green-500/40 rounded-full"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-green-400 text-xs font-bold">LIVE</span>
          </motion.div>
        </div>

        <div className="space-y-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30">
          <AnimatePresence>
            {aiInsights.slice(-3).map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`relative p-3 rounded-lg border backdrop-blur-sm ${
                  insight.priority === 'high' 
                    ? 'border-red-500/50 bg-gradient-to-r from-red-500/10 to-red-600/5' 
                    : insight.priority === 'medium'
                    ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5'
                    : 'border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-blue-600/5'
                }`}
              >
                {/* Priority Indicator */}
                <motion.div
                  className={`absolute -left-1 top-3 w-2 h-2 rounded-full ${
                    insight.priority === 'high' ? 'bg-red-500' :
                    insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        insight.type === 'pattern' ? 'bg-purple-500/20 text-purple-400' :
                        insight.type === 'opportunity' ? 'bg-green-500/20 text-green-400' :
                        insight.type === 'risk' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      {insight.type === 'pattern' && <Target className="w-3 h-3" />}
                      {insight.type === 'opportunity' && <TrendingUp className="w-3 h-3" />}
                      {insight.type === 'risk' && <TrendingDown className="w-3 h-3" />}
                      {insight.type === 'correlation' && <Eye className="w-3 h-3" />}
                    </motion.div>
                    <span className={`text-xs font-bold uppercase tracking-wide ${
                      insight.priority === 'high' ? 'text-red-300' :
                      insight.priority === 'medium' ? 'text-yellow-300' : 'text-blue-300'
                    }`}>
                      {insight.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className={`px-2 py-1 rounded-full text-xs font-mono font-bold ${
                        insight.confidence >= 90 ? 'bg-green-500/20 text-green-300' :
                        insight.confidence >= 75 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {insight.confidence.toFixed(0)}%
                    </motion.div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  {insight.message}
                </p>

                {insight.symbol && (
                  <div className="mt-2 pt-2 border-t border-gray-600/30">
                    <span className="text-xs text-purple-400 font-mono font-bold">
                      TARGET: {insight.symbol}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* AI Processing Indicator */}
        <div className="mt-3 pt-3 border-t border-gray-600/30">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-cyan-400 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-gray-400">Neural Processing</span>
            </div>
            <span className="text-cyan-400 font-mono">Active</span>
          </div>
        </div>
      </motion.div>

      {/* Compact Neural Activity Monitor */}
      <motion.div
        className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-sm border border-green-500/30 rounded-lg p-2 shadow-lg w-44"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="flex items-center space-x-2 mb-1">
          <Activity className="w-3 h-3 text-green-400" />
          <h3 className="text-xs font-bold text-white">Activity</h3>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Speed</span>
            <span className="text-green-400 font-mono">2.3 THz</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Coverage</span>
            <span className="text-cyan-400 font-mono">Global</span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Sophisticated Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-purple-900/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Neural Market Vision
              </h2>
              <p className="text-sm text-gray-400">Advanced AI-powered market analysis & visualization</p>
            </div>
            <motion.div
              className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-green-400 text-xs font-bold">● LIVE</span>
            </motion.div>
          </div>

          {/* Advanced View Controls */}
          <div className="flex items-center space-x-2">
            {[
              { mode: 'neural', label: 'Neural Network', icon: Brain },
              { mode: 'cosmos', label: 'Market Cosmos', icon: Sparkles },
              { mode: 'matrix', label: 'Data Matrix', icon: BarChart3 }
            ].map(({ mode, label, icon: Icon }) => (
              <motion.button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all duration-300 ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-800/50 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {viewMode === 'neural' && (
            <motion.div
              key="neural"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {renderNeuralView()}
            </motion.div>
          )}
          {(viewMode === 'cosmos' || viewMode === 'matrix') && (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 flex items-center justify-center"
            >
              <div className="text-center text-gray-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mx-auto mb-4"
                >
                  <Sparkles className="w-12 h-12" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">Advanced View Coming Soon</h3>
                <p className="text-sm">{viewMode === 'cosmos' ? 'Market Cosmos' : 'Data Matrix'} visualization in development</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Node Details Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/95 backdrop-blur-md border border-slate-600 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedNode.symbol}</h3>
                <p className="text-gray-400 text-sm mb-4">{selectedNode.name}</p>
                
                <div className={`text-4xl font-mono font-bold mb-4 ${
                  selectedNode.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${selectedNode.price.toFixed(2)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-gray-400">Change</span>
                    <div className={`font-bold ${selectedNode.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedNode.change >= 0 ? '+' : ''}{selectedNode.change.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-gray-400">AI Confidence</span>
                    <div className="font-bold text-purple-400">{selectedNode.confidence.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-gray-400">RSI</span>
                    <div className="font-bold text-cyan-400">{selectedNode.rsi.toFixed(0)}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-gray-400">Momentum</span>
                    <div className="font-bold text-pink-400">{selectedNode.momentum.toFixed(0)}</div>
                  </div>
                </div>
                
                <div className={`inline-block px-4 py-2 rounded-lg font-medium mb-4 ${
                  selectedNode.aiSentiment === 'bullish' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                  selectedNode.aiSentiment === 'bearish' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                  'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                }`}>
                  AI Sentiment: {selectedNode.aiSentiment.toUpperCase()}
                </div>
                
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIMarketVisualization;
