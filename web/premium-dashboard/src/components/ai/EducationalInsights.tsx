'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIThought } from './AIThoughtStream';

interface EducationalInsight {
  id: string;
  title: string;
  description: string;
  category: 'Pattern Recognition' | 'Risk Management' | 'Market Psychology' | 'Strategy Evolution' | 'Execution Tactics';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  keyPoints: string[];
  example: string;
  whyItMatters: string;
  relatedThoughts: AIThought[];
  timestamp: string;
}

interface EducationalInsightsProps {
  className?: string;
  thoughts: AIThought[];
}

const EducationalInsights: React.FC<EducationalInsightsProps> = ({ className = '', thoughts }) => {
  const [insights, setInsights] = useState<EducationalInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<EducationalInsight | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categoryConfig = {
    'Pattern Recognition': {
      icon: '🔍',
      color: 'bg-blue-500',
      description: 'How AI identifies market patterns'
    },
    'Risk Management': {
      icon: '🛡️',
      color: 'bg-red-500',
      description: 'Protecting your investments'
    },
    'Market Psychology': {
      icon: '🧠',
      color: 'bg-purple-500',
      description: 'Understanding market sentiment'
    },
    'Strategy Evolution': {
      icon: '📈',
      color: 'bg-green-500',
      description: 'How strategies adapt and improve'
    },
    'Execution Tactics': {
      icon: '⚡',
      color: 'bg-yellow-500',
      description: 'Optimal trade execution methods'
    }
  };

  const difficultyConfig = {
    'Beginner': { color: 'bg-green-100 text-green-800', icon: '🌱' },
    'Intermediate': { color: 'bg-yellow-100 text-yellow-800', icon: '🌿' },
    'Advanced': { color: 'bg-red-100 text-red-800', icon: '🌳' }
  };

  // Generate educational insights based on AI thoughts
  useEffect(() => {
    const generateInsights = () => {
      const educationalThoughts = thoughts.filter(t => t.educational);
      const newInsights: EducationalInsight[] = [];

      // Pattern Recognition Insights
      const patternThoughts = thoughts.filter(t => t.thought_type === 'PatternFound' || t.tags.includes('pattern'));
      if (patternThoughts.length > 0) {
        newInsights.push({
          id: 'pattern_insight_' + Date.now(),
          title: 'How AI Recognizes Market Patterns',
          description: 'Learn how artificial intelligence identifies profitable trading patterns by analyzing thousands of historical examples.',
          category: 'Pattern Recognition',
          difficulty: 'Intermediate',
          keyPoints: [
            'AI analyzes over 1,000+ historical pattern occurrences',
            'Success rates are calculated based on similar market conditions',
            'Patterns are weighted by current market regime and volatility',
            'Multiple timeframes are considered for pattern confirmation'
          ],
          example: `When AI detects "RSI Oversold + Bullish Divergence" on AAPL:
• Historical Success: 73% (847 similar cases)
• Current RSI: 28.5 (below 30 threshold)
• Divergence confirmed on 1H and 4H charts
• Risk/Reward: 1:2.4 ratio`,
          whyItMatters: 'Pattern recognition helps AI make data-driven decisions instead of emotional ones. By studying thousands of historical examples, AI can identify high-probability setups that human traders might miss.',
          relatedThoughts: patternThoughts.slice(0, 3),
          timestamp: new Date().toISOString()
        });
      }

      // Risk Management Insights
      const riskThoughts = thoughts.filter(t => t.thought_type === 'RiskCheck' || t.agent === 'RiskManager');
      if (riskThoughts.length > 0) {
        newInsights.push({
          id: 'risk_insight_' + Date.now(),
          title: 'AI Risk Management in Action',
          description: 'Discover how AI continuously monitors and manages portfolio risk to protect your capital.',
          category: 'Risk Management',
          difficulty: 'Beginner',
          keyPoints: [
            'Portfolio heat is monitored every 50ms in real-time',
            'Maximum 2% daily loss limit is strictly enforced',
            'Position sizes are automatically adjusted based on volatility',
            'Correlation limits prevent overexposure to similar stocks'
          ],
          example: `Current Portfolio Status:
• Portfolio Heat: 8.2% (Safe - under 15% limit)
• Daily P&L: +1.3% (within 2% daily target)
• Max Position Size: 5% (TSLA correlation flagged)
• Risk Buffer: 6.8% remaining before position reduction`,
          whyItMatters: 'Proper risk management is the difference between long-term success and account blow-ups. AI never gets emotional and always follows the rules, even when humans might be tempted to "let it ride."',
          relatedThoughts: riskThoughts.slice(0, 3),
          timestamp: new Date().toISOString()
        });
      }

      // Learning Engine Insights
      const learningThoughts = thoughts.filter(t => t.agent === 'LearningEngine' || t.thought_type === 'Learning');
      if (learningThoughts.length > 0) {
        newInsights.push({
          id: 'learning_insight_' + Date.now(),
          title: 'How AI Learns from Every Trade',
          description: 'See how the AI continuously improves by learning from both successful and failed trades.',
          category: 'Strategy Evolution',
          difficulty: 'Advanced',
          keyPoints: [
            'Every trade outcome is fed back into the neural network',
            'Successful patterns are reinforced and given higher weights',
            'Failed strategies are analyzed to identify why they didnt work',
            'Model accuracy improves over time with more data'
          ],
          example: `Recent Learning Update:
• Yesterday's NVDA trade: +2.3% success
• Pattern "Tech Momentum Breakout" confidence increased
• Model accuracy improved: 73.1% → 74.2%
• Updated position sizing for similar setups`,
          whyItMatters: 'Unlike human traders who might repeat the same mistakes, AI learns from every single trade. This creates a continuously improving system that gets better over time.',
          relatedThoughts: learningThoughts.slice(0, 3),
          timestamp: new Date().toISOString()
        });
      }

      // Execution Insights
      const executionThoughts = thoughts.filter(t => t.agent === 'ExecutionEngine' || t.thought_type === 'Execution');
      if (executionThoughts.length > 0) {
        newInsights.push({
          id: 'execution_insight_' + Date.now(),
          title: 'Microsecond Trade Execution',
          description: 'Learn how AI executes trades with lightning speed to minimize slippage and maximize profits.',
          category: 'Execution Tactics',
          difficulty: 'Intermediate',
          keyPoints: [
            'Trade execution happens in under 1 millisecond',
            'TWAP and VWAP algorithms minimize market impact',
            'Smart order routing finds the best available prices',
            'Slippage tolerance is set to 0.05% maximum'
          ],
          example: `Recent Execution:
• Order: Buy 100 AAPL at market
• Target Price: $185.23
• Actual Fill: $185.25 (0.01% slippage)
• Execution Time: 0.8ms
• Saved vs. market order: $2.40`,
          whyItMatters: 'Fast execution can make the difference between profit and loss. While you see the results, AI is working behind the scenes to get you the best possible prices.',
          relatedThoughts: executionThoughts.slice(0, 3),
          timestamp: new Date().toISOString()
        });
      }

      setInsights(newInsights);
    };

    if (thoughts.length > 0) {
      generateInsights();
    }
  }, [thoughts]);

  const filteredInsights = insights.filter(insight => {
    if (filter === 'all') return true;
    return insight.category === filter;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              🎓 AI Trading Academy
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Learn how your AI trader thinks and makes decisions
            </p>
          </div>
          
          {/* Category Filter */}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryConfig).map(([category, config]) => (
              <option key={category} value={category}>
                {config.icon} {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-gray-800 rounded-lg border border-gray-600 p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                selectedInsight?.id === insight.id ? 'border-blue-500 bg-gray-750' : ''
              }`}
              onClick={() => setSelectedInsight(selectedInsight?.id === insight.id ? null : insight)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Category Icon */}
                  <div className={`w-10 h-10 rounded-full ${categoryConfig[insight.category].color} flex items-center justify-center text-white flex-shrink-0`}>
                    {categoryConfig[insight.category].icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white">{insight.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyConfig[insight.difficulty].color}`}>
                        {difficultyConfig[insight.difficulty].icon} {insight.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>{insight.category}</span>
                      <span>•</span>
                      <span>{formatTimestamp(insight.timestamp)}</span>
                      {insight.relatedThoughts.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{insight.relatedThoughts.length} related AI thoughts</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expand Indicator */}
                <div className="text-gray-400 flex-shrink-0 ml-2">
                  {selectedInsight?.id === insight.id ? '−' : '+'}
                </div>
              </div>

              {/* Expanded Content */}
              {selectedInsight?.id === insight.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-600"
                >
                  {/* Key Points */}
                  <div className="mb-4">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      💡 Key Learning Points
                    </h4>
                    <ul className="space-y-1">
                      {insight.keyPoints.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start">
                          <span className="text-blue-400 mr-2 flex-shrink-0">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Example */}
                  <div className="mb-4">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      📊 Real Example
                    </h4>
                    <div className="bg-gray-700 p-3 rounded border border-gray-600">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                        {insight.example}
                      </pre>
                    </div>
                  </div>

                  {/* Why It Matters */}
                  <div className="mb-4">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      🎯 Why This Matters
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {insight.whyItMatters}
                    </p>
                  </div>

                  {/* Related AI Thoughts */}
                  {insight.relatedThoughts.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-2 flex items-center">
                        🧠 Related AI Thoughts
                      </h4>
                      <div className="space-y-2">
                        {insight.relatedThoughts.map((thought, idx) => (
                          <div key={thought.id} className="bg-gray-700 p-2 rounded border border-gray-600">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs text-gray-400">{thought.agent}</span>
                              <span className="text-xs text-blue-400">•</span>
                              <span className="text-xs text-gray-400">{formatTimestamp(thought.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-300">{thought.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredInsights.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🎓</div>
            <p>Educational insights will appear as your AI trader learns and makes decisions.</p>
            <p className="text-sm mt-2">Start trading to see personalized learning content!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationalInsights;