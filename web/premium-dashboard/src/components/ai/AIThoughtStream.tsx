'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// AI Thought interfaces matching our Rust backend
export interface AIThought {
  id: string;
  timestamp: string;
  agent: 'MarketIntelligence' | 'RiskManager' | 'LearningEngine' | 'MasterCoordinator' | 'ExecutionEngine';
  thought_type: 'Analysis' | 'Decision' | 'Learning' | 'RiskCheck' | 'PatternFound' | 'StrategyUpdate' | 'Execution' | 'Rebalancing' | 'Sentiment' | 'Educational';
  message: string;
  confidence: number;
  confidence_level: 'VeryLow' | 'Low' | 'Medium' | 'High' | 'VeryHigh';
  reasoning: string[];
  supporting_data: Record<string, any>;
  symbols: string[];
  tags: string[];
  impact_level: string;
  educational: boolean;
  planned_actions: string[];
}

interface AIThoughtStreamProps {
  className?: string;
  maxThoughts?: number;
  showEducationalOnly?: boolean;
}

const AIThoughtStream: React.FC<AIThoughtStreamProps> = ({ 
  className = '', 
  maxThoughts = 50,
  showEducationalOnly = false 
}) => {
  const [thoughts, setThoughts] = useState<AIThought[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedThought, setSelectedThought] = useState<AIThought | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Agent configurations for UI display
  const agentConfig = {
    MarketIntelligence: {
      emoji: '🔍',
      color: 'bg-blue-500',
      name: 'Market Intelligence',
      description: 'Analyzes market patterns and trends'
    },
    RiskManager: {
      emoji: '🛡️',
      color: 'bg-red-500',
      name: 'Risk Manager',
      description: 'Monitors and manages portfolio risk'
    },
    LearningEngine: {
      emoji: '🧠',
      color: 'bg-purple-500',
      name: 'Learning Engine',
      description: 'Evolves strategies based on outcomes'
    },
    MasterCoordinator: {
      emoji: '🎯',
      color: 'bg-green-500',
      name: 'Master Coordinator',
      description: 'Makes final trading decisions'
    },
    ExecutionEngine: {
      emoji: '⚡',
      color: 'bg-yellow-500',
      name: 'Execution Engine',
      description: 'Executes trades with precision'
    }
  };

  const confidenceConfig = {
    VeryHigh: { emoji: '🟢', color: 'text-green-500', label: 'Very High' },
    High: { emoji: '🟡', color: 'text-yellow-500', label: 'High' },
    Medium: { emoji: '🟠', color: 'text-orange-500', label: 'Medium' },
    Low: { emoji: '🔴', color: 'text-red-500', label: 'Low' },
    VeryLow: { emoji: '⚫', color: 'text-gray-500', label: 'Very Low' }
  };

  // Mock WebSocket connection for development
  useEffect(() => {
    // Simulate WebSocket connection
    const generateMockThought = (): AIThought => {
      const agents: (keyof typeof agentConfig)[] = ['MarketIntelligence', 'RiskManager', 'LearningEngine', 'MasterCoordinator', 'ExecutionEngine'];
      const types: AIThought['thought_type'][] = ['Analysis', 'Decision', 'Learning', 'RiskCheck', 'PatternFound'];
      const confidenceLevels: AIThought['confidence_level'][] = ['VeryLow', 'Low', 'Medium', 'High', 'VeryHigh'];
      
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const thoughtType = types[Math.floor(Math.random() * types.length)];
      const confidence = Math.random();
      const confidenceLevel = confidenceLevels[Math.floor(confidence * 5)];

      const messages = [
        "Detected RSI oversold condition on AAPL (RSI: 28.5). Pattern matches 847 historical cases with 73% success rate.",
        "Portfolio heat at 8.2% (safe zone). TSLA correlation increased to 0.65 - monitoring closely.",
        "Updated momentum strategy based on last 3 trades. Reduced position size by 12% due to volatility.",
        "Bullish divergence spotted on SPY. Similar pattern from March 2023 had 68% success rate.",
        "Executing quick scalp on momentum spike - 45-second window identified with high probability.",
        "Learning from yesterday's NVDA trade (+2.3%). Adding pattern to neural network for future recognition.",
        "Market sentiment shifted from neutral to slightly bearish. Adjusting position sizes accordingly.",
        "Found mean reversion opportunity on QQQ. Historical data shows 78% success in similar conditions.",
        "Risk assessment complete: Current exposure within limits. Cleared for next trade execution.",
        "AI model accuracy improved to 74.2% after incorporating recent market regime changes."
      ];

      return {
        id: `thought_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
        agent,
        thought_type: thoughtType,
        message: messages[Math.floor(Math.random() * messages.length)],
        confidence,
        confidence_level: confidenceLevel,
        reasoning: [
          "Market conditions analyzed across multiple timeframes",
          "Historical pattern matching completed with 1000+ samples",
          "Risk-reward ratio calculated and verified",
          "Execution timing optimized for minimal slippage"
        ],
        supporting_data: {
          rsi: Math.random() * 100,
          volume: Math.random() * 1000000,
          patterns_matched: Math.floor(Math.random() * 1000),
          success_rate: Math.random()
        },
        symbols: ['AAPL', 'TSLA', 'SPY', 'QQQ', 'NVDA'][Math.floor(Math.random() * 5)] ? 
          [['AAPL', 'TSLA', 'SPY', 'QQQ', 'NVDA'][Math.floor(Math.random() * 5)]] : [],
        tags: ['analysis', 'pattern', 'risk', 'learning'].slice(0, Math.floor(Math.random() * 3) + 1),
        impact_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        educational: Math.random() > 0.6,
        planned_actions: Math.random() > 0.5 ? ["Monitor for 5 minutes", "Execute if conditions hold"] : []
      };
    };

    // Simulate real-time thoughts
    const interval = setInterval(() => {
      const newThought = generateMockThought();
      
      setThoughts(prev => {
        const updated = [newThought, ...prev].slice(0, maxThoughts);
        return updated;
      });
    }, 2000 + Math.random() * 3000); // Random interval 2-5 seconds

    setIsConnected(true);

    // Initial thoughts
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const thought = generateMockThought();
        setThoughts(prev => [thought, ...prev]);
      }, i * 500);
    }

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [maxThoughts]);

  const filteredThoughts = thoughts.filter(thought => {
    if (showEducationalOnly && !thought.educational) return false;
    if (filter === 'all') return true;
    return thought.agent.toLowerCase().includes(filter.toLowerCase()) || 
           thought.thought_type.toLowerCase().includes(filter.toLowerCase());
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <h2 className="text-xl font-bold text-white">🧠 AI Thought Stream</h2>
            </div>
            <span className="text-sm text-gray-400">Live · {filteredThoughts.length} thoughts</span>
          </div>
          
          {/* Filter */}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Agents</option>
            <option value="MarketIntelligence">🔍 Market Intelligence</option>
            <option value="RiskManager">🛡️ Risk Manager</option>
            <option value="LearningEngine">🧠 Learning Engine</option>
            <option value="MasterCoordinator">🎯 Coordinator</option>
            <option value="ExecutionEngine">⚡ Execution</option>
          </select>
        </div>
        
        <p className="text-sm text-gray-400 mt-2">
          See exactly what your AI trader is thinking in real-time. Complete transparency, no black boxes.
        </p>
      </div>

      {/* Thought Stream */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredThoughts.map((thought, index) => (
            <motion.div
              key={thought.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 border-b border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors ${
                selectedThought?.id === thought.id ? 'bg-gray-800 border-blue-500' : ''
              }`}
              onClick={() => setSelectedThought(selectedThought?.id === thought.id ? null : thought)}
            >
              <div className="flex items-start space-x-3">
                {/* Agent Avatar */}
                <div className={`w-8 h-8 rounded-full ${agentConfig[thought.agent].color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {agentConfig[thought.agent].emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white text-sm">
                        {agentConfig[thought.agent].name}
                      </span>
                      <span className={`text-xs ${confidenceConfig[thought.confidence_level].color}`}>
                        {confidenceConfig[thought.confidence_level].emoji} {confidenceConfig[thought.confidence_level].label}
                      </span>
                      {thought.educational && (
                        <span className="bg-blue-600 text-blue-100 px-2 py-1 rounded text-xs font-medium">
                          Educational
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(thought.timestamp)}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                    {thought.message}
                  </p>

                  {/* Symbols and Tags */}
                  <div className="flex items-center space-x-2 mt-2">
                    {thought.symbols.map(symbol => (
                      <span key={symbol} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                        ${symbol}
                      </span>
                    ))}
                    {thought.tags.map(tag => (
                      <span key={tag} className="bg-gray-600 text-gray-400 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Expanded Details */}
                  {selectedThought?.id === thought.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-gray-800 rounded border border-gray-600"
                    >
                      {/* Reasoning */}
                      {thought.reasoning.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-white mb-2">🤔 AI Reasoning:</h4>
                          <ul className="space-y-1">
                            {thought.reasoning.map((reason, idx) => (
                              <li key={idx} className="text-xs text-gray-300 flex items-start">
                                <span className="text-blue-400 mr-2">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Supporting Data */}
                      {Object.keys(thought.supporting_data).length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-white mb-2">📊 Supporting Data:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(thought.supporting_data).map(([key, value]) => (
                              <div key={key} className="bg-gray-700 p-2 rounded">
                                <div className="text-xs text-gray-400 capitalize">{key.replace('_', ' ')}</div>
                                <div className="text-sm text-white">
                                  {typeof value === 'number' ? 
                                    (value < 1 ? `${(value * 100).toFixed(1)}%` : value.toLocaleString()) : 
                                    String(value)
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Planned Actions */}
                      {thought.planned_actions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-white mb-2">⚡ Next Actions:</h4>
                          <ul className="space-y-1">
                            {thought.planned_actions.map((action, idx) => (
                              <li key={idx} className="text-xs text-gray-300 flex items-start">
                                <span className="text-green-400 mr-2">→</span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredThoughts.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🤖</div>
            <p>AI is thinking... Thoughts will appear here in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIThoughtStream;