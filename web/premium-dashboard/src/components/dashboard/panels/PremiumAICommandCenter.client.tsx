'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradingStore } from '@/stores/trading-store';
import { autonomousTradingService } from '@/services/autonomous-trading-service';
import { brokerTradingEngine } from '@/services/broker-trading-engine';
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
  Download,
  Eye,
  Cpu,
  Layers,
  Globe,
  Shield,
  Sparkles,
  Command,
  Rocket,
  Star,
  Crown,
  Diamond,
  Hexagon,
  Triangle,
  Circle,
  Square
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
  performance: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  aiConfidence: number;
}

interface AIMetrics {
  totalDecisions: number;
  successRate: number;
  avgConfidence: number;
  neuralLoadings: number[];
  marketSentiment: number;
  volatilityIndex: number;
  riskScore: number;
}

interface NeuralVisualization {
  nodes: { id: string; x: number; y: number; activity: number; type: string }[];
  connections: { from: string; to: string; strength: number }[];
}

const PremiumAICommandCenterClient: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
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

  // Premium state management
  const [brokers, setBrokers] = useState<BrokerStatus[]>([]);
  const [aiMetrics, setAiMetrics] = useState<AIMetrics>({
    totalDecisions: 1247,
    successRate: 74.2,
    avgConfidence: 87.5,
    neuralLoadings: [0.89, 0.76, 0.92, 0.68, 0.84],
    marketSentiment: 0.65,
    volatilityIndex: 0.34,
    riskScore: 0.23
  });
  
  const [neuralViz, setNeuralViz] = useState<NeuralVisualization>({
    nodes: [
      { id: 'input1', x: 50, y: 100, activity: 0.8, type: 'input' },
      { id: 'input2', x: 50, y: 200, activity: 0.6, type: 'input' },
      { id: 'input3', x: 50, y: 300, activity: 0.9, type: 'input' },
      { id: 'hidden1', x: 200, y: 150, activity: 0.7, type: 'hidden' },
      { id: 'hidden2', x: 200, y: 250, activity: 0.85, type: 'hidden' },
      { id: 'output', x: 350, y: 200, activity: 0.92, type: 'output' }
    ],
    connections: [
      { from: 'input1', to: 'hidden1', strength: 0.8 },
      { from: 'input2', to: 'hidden1', strength: 0.6 },
      { from: 'input3', to: 'hidden2', strength: 0.9 },
      { from: 'hidden1', to: 'output', strength: 0.7 },
      { from: 'hidden2', to: 'output', strength: 0.85 }
    ]
  });

  const [selectedView, setSelectedView] = useState<'overview' | 'neural' | 'trades' | 'risk'>('overview');
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [aiThoughts, setAiThoughts] = useState<string[]>([
    "🧠 Advanced pattern recognition: Identified emerging momentum in AAPL, confidence 94.7%",
    "⚡ Risk calibration: Adjusting position sizes based on VIX spike to 23.4",
    "🎯 Multi-timeframe analysis: Bullish convergence detected across 1H, 4H, and 1D charts",
    "📊 Factor loading optimization: IPCA model showing 0.89 Sharpe on tech sector",
    "🔮 Sentiment fusion: News NLP + social signals indicating 78% bullish sentiment"
  ]);

  // Neural network animation - client-side only
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections with pulsing effect
      neuralViz.connections.forEach(conn => {
        const fromNode = neuralViz.nodes.find(n => n.id === conn.from);
        const toNode = neuralViz.nodes.find(n => n.id === conn.to);
        
        if (fromNode && toNode) {
          const pulse = Math.sin(timestamp * 0.005 + conn.strength * 10) * 0.3 + 0.7;
          ctx.strokeStyle = `rgba(59, 130, 246, ${conn.strength * pulse})`;
          ctx.lineWidth = conn.strength * 3;
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        }
      });
      
      // Draw nodes with activity-based glow
      neuralViz.nodes.forEach(node => {
        const pulse = Math.sin(timestamp * 0.008 + node.activity * 15) * 0.4 + 0.6;
        const radius = 8 + node.activity * 5;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${node.activity * pulse})`);
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Core node
        ctx.fillStyle = node.type === 'output' ? '#10B981' : 
                       node.type === 'input' ? '#3B82F6' : '#8B5CF6';
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [neuralViz]);

  // Update broker data
  const updateBrokerData = () => {
    try {
      const engineState = brokerTradingEngine.getState();
      const newBrokers: BrokerStatus[] = [
        {
          id: 'alpaca',
          name: 'Neural Alpaca Engine',
          market: 'US EQUITY MARKETS',
          icon: '🦙',
          portfolio: engineState.brokers.alpaca?.portfolio.value || 1000,
          trades: engineState.brokers.alpaca?.portfolio.trades || 0,
          pnl: engineState.brokers.alpaca?.portfolio.profit || 0,
          isActive: engineState.brokers.alpaca?.active || false,
          isConnected: true,
          currency: 'USD',
          initialDeposit: 1000,
          elapsedTime: 0,
          performance: 94.7,
          riskLevel: 'MEDIUM',
          aiConfidence: 89.3
        },
        {
          id: 'moomoo',
          name: 'Quantum MooMoo Core',
          market: 'HONG KONG MARKETS',
          icon: '🏢',
          portfolio: engineState.brokers.moomoo?.portfolio.value || 300,
          trades: engineState.brokers.moomoo?.portfolio.trades || 0,
          pnl: engineState.brokers.moomoo?.portfolio.profit || 0,
          isActive: engineState.brokers.moomoo?.active || false,
          isConnected: true,
          currency: 'HKD',
          initialDeposit: 300,
          elapsedTime: 0,
          performance: 87.2,
          riskLevel: 'LOW',
          aiConfidence: 92.1
        },
        {
          id: 'binance',
          name: 'CryptoMind Binance',
          market: 'DIGITAL ASSETS',
          icon: '₿',
          portfolio: engineState.brokers['binance-testnet']?.portfolio.value || 1000,
          trades: engineState.brokers['binance-testnet']?.portfolio.trades || 0,
          pnl: engineState.brokers['binance-testnet']?.portfolio.profit || 0,
          isActive: engineState.brokers['binance-testnet']?.active || false,
          isConnected: true,
          currency: 'USDT',
          initialDeposit: 1000,
          elapsedTime: 0,
          performance: 91.8,
          riskLevel: 'HIGH',
          aiConfidence: 85.7
        }
      ];
      
      setBrokers(newBrokers);
    } catch (error) {
      console.error('❌ Error updating broker data:', error);
    }
  };

  // Initialize
  useEffect(() => {
    console.log('🚀 Premium AI Command Center Client initializing...');
    setIsMounted(true);
    updateBrokerData();
    
    // Update neural visualization periodically with deterministic changes
    let neuralCounter = 0;
    const neuralInterval = setInterval(() => {
      neuralCounter++;
      setNeuralViz(prev => ({
        ...prev,
        nodes: prev.nodes.map((node, index) => ({
          ...node,
          activity: Math.max(0.3, Math.min(1, 0.7 + Math.sin((neuralCounter + index) * 0.1) * 0.3))
        }))
      }));
    }, 2000);

    return () => clearInterval(neuralInterval);
  }, []);

  // Real-time updates
  useEffect(() => {
    let updateCounter = 0;
    
    const interval = setInterval(() => {
      updateBrokerData();
      updateCounter++;
      
      // Update AI metrics with deterministic changes
      const cycle = updateCounter % 100; // 100-second cycle
      setAiMetrics(prev => ({
        ...prev,
        totalDecisions: prev.totalDecisions + (cycle % 3 === 0 ? 1 : 0),
        successRate: Math.max(70, Math.min(95, 74.2 + Math.sin(cycle * 0.1) * 5)),
        avgConfidence: Math.max(80, Math.min(95, 87.5 + Math.cos(cycle * 0.1) * 3)),
        marketSentiment: Math.max(0, Math.min(1, 0.65 + Math.sin(cycle * 0.05) * 0.2)),
        volatilityIndex: Math.max(0, Math.min(1, 0.34 + Math.cos(cycle * 0.08) * 0.1))
      }));

      // Rotate AI thoughts deterministically
      if (cycle % 10 === 0) { // Every 10 seconds
        const thoughts = [
          "🧠 Deep learning convergence: Pattern recognition accuracy increased to 97.3%",
          "⚡ Quantum momentum detected: Multi-asset correlation analysis complete",
          "🎯 Precision targeting: High-probability setups identified in 5 securities",
          "📊 Factor decomposition: Risk-adjusted alpha generation at 2.4x market",
          "🔮 Predictive synthesis: Cross-market signals showing 89% confidence alignment",
          "🌊 Market flow analysis: Institutional order flow detected in TSLA",
          "🎪 Volatility surface mapping: Options skew suggesting directional bias",
          "🚀 Momentum cascade: Multi-timeframe bullish alignment confirmed"
        ];
        
        const selectedThought = thoughts[Math.floor(updateCounter / 10) % thoughts.length];
        setAiThoughts(prev => [selectedThought, ...prev.slice(0, 4)]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTrading = (brokerId: string) => {
    setBrokers(prev => prev.map(broker => {
      if (broker.id === brokerId) {
        const newState = !broker.isActive;
        
        if (newState) {
          if (brokerId === 'moomoo') {
            autonomousTradingService.startMoomooTrading();
          } else if (brokerId === 'alpaca') {
            autonomousTradingService.startAlpacaTrading();
          } else if (brokerId === 'binance') {
            brokerTradingEngine.startBrokerTrading('binance-testnet');
          }
        } else {
          if (brokerId === 'moomoo') {
            autonomousTradingService.stopMoomooTrading();
          } else if (brokerId === 'alpaca') {
            autonomousTradingService.stopAlpacaTrading();
          } else if (brokerId === 'binance') {
            brokerTradingEngine.stopBrokerTrading('binance-testnet');
          }
        }
        
        return { ...broker, isActive: newState };
      }
      return broker;
    }));
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-400 bg-green-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
      case 'HIGH': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-4">
      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Compact Premium Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Command className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Crown className="w-2 h-2 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Neural Core Alpha-7
                </h1>
                <p className="text-sm text-gray-300 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Quantum AI Trading Command Center
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center text-green-400">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mr-1" />
                    <span className="text-xs font-medium">LIVE</span>
                  </div>
                  <div className="text-blue-400 text-xs">
                    Networks: <span className="font-mono">7</span>
                  </div>
                  <div className="text-purple-400 text-xs">
                    Markets: <span className="font-mono">24/7</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCommandMode(!isCommandMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isCommandMode
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Cpu className="w-4 h-4 mr-1 inline" />
                Command
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Compact View Selector */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm p-1 rounded-xl border border-gray-700/50">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'neural', label: 'Neural', icon: Brain },
              { id: 'trades', label: 'Trades', icon: Activity },
              { id: 'risk', label: 'Risk', icon: Shield }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as any)}
                className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                  selectedView === view.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <view.icon className="w-4 h-4 mr-1" />
                {view.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Content Based on Selected View */}
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Compact AI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Decisions', value: aiMetrics.totalDecisions.toLocaleString(), icon: Brain, color: 'blue' },
                  { label: 'Success', value: `${aiMetrics.successRate.toFixed(1)}%`, icon: Target, color: 'green' },
                  { label: 'Confidence', value: `${aiMetrics.avgConfidence.toFixed(1)}%`, icon: Zap, color: 'purple' },
                  { label: 'Sentiment', value: `${(aiMetrics.marketSentiment * 100).toFixed(0)}%`, icon: TrendingUp, color: 'pink' }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg bg-${metric.color}-500/20`}>
                        <metric.icon className={`w-4 h-4 text-${metric.color}-400`} />
                      </div>
                      <div className={`text-lg font-bold text-${metric.color}-400`}>
                        {metric.value}
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm font-medium">{metric.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Compact Broker Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {brokers.map((broker, index) => (
                  <motion.div
                    key={broker.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg ${
                      broker.isActive 
                        ? 'border-green-500/50 shadow-md shadow-green-500/10' 
                        : 'border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    {/* Status Indicator */}
                    {broker.isActive && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Zap className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{broker.icon}</div>
                        <div>
                          <div className="text-lg font-bold text-white">{broker.name}</div>
                          <div className="text-xs text-gray-400">{broker.market}</div>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${getRiskColor(broker.riskLevel)}`}>
                        {broker.riskLevel}
                      </div>
                    </div>

                    {/* Trading Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-400">
                          {formatCurrency(broker.portfolio, broker.currency)}
                        </div>
                        <div className="text-xs text-gray-400">Portfolio</div>
                      </div>
                      
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-400">
                          {broker.trades}
                        </div>
                        <div className="text-xs text-gray-400">Trades</div>
                      </div>
                    </div>

                    {/* P&L and Performance */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <div className={`text-lg font-bold ${broker.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {broker.pnl >= 0 ? '+' : ''}{formatCurrency(broker.pnl, broker.currency)}
                        </div>
                        <div className="text-xs text-gray-400">P&L</div>
                      </div>
                      
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <div className="text-lg font-bold text-purple-400">
                          {broker.aiConfidence.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">AI Confidence</div>
                      </div>
                    </div>

                    {/* Control Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleTrading(broker.id)}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                        broker.isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20'
                          : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg shadow-green-500/20'
                      }`}
                    >
                      {broker.isActive ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>STOP</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>START</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Compact AI Thought Stream */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Brain className="w-5 h-5 text-purple-400 mr-2" />
                    Neural Thought Stream
                    <div className="ml-2 flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {aiThoughts.slice(0, 2).map((thought, index) => (
                    <motion.div
                      key={`${thought}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4"
                    >
                      <p className="text-gray-200 text-sm leading-relaxed">{thought}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">Neural Core Alpha-7</span>
                        <span className="text-xs text-purple-400 font-mono">{isMounted ? new Date().toLocaleTimeString() : '--:--:--'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {selectedView === 'neural' && (
            <motion.div
              key="neural"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Neural Network Visualization */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Layers className="w-8 h-8 text-blue-400 mr-3" />
                  Live Neural Network Activity
                </h3>
                
                <div className="relative">
                  <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={400} 
                    className="w-full h-96 bg-gray-900/50 rounded-2xl border border-gray-700/50"
                  />
                  
                  <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-2">Network Status</div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                        <span className="text-xs text-gray-300">Input Layer</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                        <span className="text-xs text-gray-300">Hidden Layer</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                        <span className="text-xs text-gray-300">Output Layer</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Neural Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8">
                  <h4 className="text-xl font-bold text-white mb-6">Layer Activations</h4>
                  <div className="space-y-4">
                    {aiMetrics.neuralLoadings.map((loading, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Layer {index + 1}</span>
                          <span className="text-blue-400 font-mono">{(loading * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${loading * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8">
                  <h4 className="text-xl font-bold text-white mb-6">Processing Metrics</h4>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Forward Pass Speed</span>
                      <span className="text-green-400 font-mono">2.3ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Gradient Norm</span>
                      <span className="text-blue-400 font-mono">0.0847</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Learning Rate</span>
                      <span className="text-purple-400 font-mono">1e-4</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Batch Size</span>
                      <span className="text-yellow-400 font-mono">256</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'trades' && (
            <motion.div
              key="trades"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* AI Trading Activity */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 text-green-400 mr-2" />
                  Live AI Trading Activity
                  <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </h3>
                
                <div className="space-y-3">
                  {/* Sample Trading Activities */}
                  {[
                    { action: 'BUY', symbol: 'AAPL', quantity: 100, price: 185.50, confidence: 94.7, broker: 'Alpaca', status: 'Executed', time: '14:23:45' },
                    { action: 'SELL', symbol: 'TSLA', quantity: 50, price: 242.18, confidence: 89.2, broker: 'Alpaca', status: 'Pending', time: '14:22:12' },
                    { action: 'BUY', symbol: 'BTC/USDT', quantity: 0.5, price: 43250.00, confidence: 91.8, broker: 'Binance', status: 'Executed', time: '14:20:33' },
                    { action: 'BUY', symbol: '0700.HK', quantity: 200, price: 285.60, confidence: 87.5, broker: 'MooMoo', status: 'Executed', time: '14:18:21' }
                  ].map((trade, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          trade.action === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.action === 'BUY' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${trade.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.action}
                            </span>
                            <span className="text-white font-semibold">{trade.symbol}</span>
                            <span className="text-gray-400">×{trade.quantity}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {trade.broker} • AI Confidence: {trade.confidence}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-mono">${trade.price.toLocaleString()}</div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            trade.status === 'Executed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {trade.status}
                          </span>
                          <span className="text-xs text-gray-400">{trade.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trade Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4">Today's Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Trades</span>
                      <span className="text-blue-400 font-mono">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Successful Trades</span>
                      <span className="text-green-400 font-mono">94 (74.0%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total P&L</span>
                      <span className="text-green-400 font-mono">+$2,847.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Avg Trade Size</span>
                      <span className="text-purple-400 font-mono">$1,250</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4">AI Decision Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Avg Confidence</span>
                      <span className="text-purple-400 font-mono">87.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">High Conf. Trades</span>
                      <span className="text-green-400 font-mono">89 (>85%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Processing Speed</span>
                      <span className="text-blue-400 font-mono">23ms avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Risk Score</span>
                      <span className="text-yellow-400 font-mono">2.3/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper function
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'USDT' ? 'USD' : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export default PremiumAICommandCenterClient;