'use client';

import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';
import { useLatestAIInsights } from '@/stores/trading-store';

export function AIInsightsPanel() {
  const aiInsights = useLatestAIInsights(10);

  // Mock AI insights if no real data
  const mockInsights = [
    {
      id: '1',
      type: 'trade_signal' as const,
      symbol: 'AAPL',
      title: 'Strong Bullish Breakout Detected',
      description: 'AAPL has broken above the $188.50 resistance level with high volume confirmation. RSI shows healthy momentum without overbought conditions.',
      confidence: 87,
      impact: 'high' as const,
      timestamp: Date.now() - 120000,
      actionable: true,
      suggestedAction: {
        type: 'buy' as const,
        quantity: 500,
        price: 189.50,
        reasoning: 'Technical breakout with volume confirmation'
      },
      tags: ['breakout', 'volume', 'bullish']
    },
    {
      id: '2',
      type: 'market_analysis' as const,
      title: 'Market Regime Shift Detected',
      description: 'Neural networks detect transition from choppy to trending market regime. Increased probability of sustained directional moves.',
      confidence: 73,
      impact: 'medium' as const,
      timestamp: Date.now() - 300000,
      actionable: false,
      tags: ['market-regime', 'trend', 'neural-network']
    },
    {
      id: '3',
      type: 'risk_alert' as const,
      symbol: 'TSLA',
      title: 'Elevated Volatility Warning',
      description: 'TSLA showing increased volatility patterns. Consider reducing position size or implementing tighter stops.',
      confidence: 91,
      impact: 'high' as const,
      timestamp: Date.now() - 450000,
      actionable: true,
      suggestedAction: {
        type: 'reduce' as const,
        reasoning: 'Risk management due to elevated volatility'
      },
      tags: ['volatility', 'risk', 'tesla']
    },
    {
      id: '4',
      type: 'pattern_recognition' as const,
      symbol: 'NVDA',
      title: 'Cup and Handle Formation',
      description: 'Classic cup and handle pattern forming on NVDA 4H chart. Historical success rate of 78% for similar setups.',
      confidence: 82,
      impact: 'medium' as const,
      timestamp: Date.now() - 600000,
      actionable: true,
      suggestedAction: {
        type: 'buy' as const,
        price: 456.00,
        reasoning: 'Technical pattern with high success probability'
      },
      tags: ['pattern', 'cup-handle', 'technical']
    }
  ];

  const insights = aiInsights.length > 0 ? aiInsights : mockInsights;

  const getInsightIcon = (type: string, impact: string) => {
    switch (type) {
      case 'trade_signal':
        return <TrendingUp className={`w-4 h-4 ${impact === 'high' ? 'text-neon-green' : 'text-neon-blue'}`} />;
      case 'risk_alert':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'pattern_recognition':
        return <Target className="w-4 h-4 text-neon-purple" />;
      default:
        return <Zap className="w-4 h-4 text-neon-orange" />;
    }
  };

  const getInsightColor = (type: string, impact: string) => {
    switch (type) {
      case 'trade_signal':
        return impact === 'high' ? 'neon-green' : 'neon-blue';
      case 'risk_alert':
        return 'red-400';
      case 'pattern_recognition':
        return 'neon-purple';
      default:
        return 'neon-orange';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neural-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-neon-purple" />
          <h2 className="text-lg font-bold text-neon-purple">AI Neural Insights</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse" />
          <span className="text-xs text-neon-purple font-medium">Processing</span>
        </div>
      </div>

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer neural-card ${
                insight.actionable ? 'bg-white/5 border-white/10 hover:border-neon-blue/40' : 'bg-white/3 border-white/5'
              }`}
            >
              {/* Insight Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getInsightIcon(insight.type, insight.impact)}
                  <div>
                    <h3 className="text-sm font-semibold text-white">{insight.title}</h3>
                    {insight.symbol && (
                      <span className="text-xs text-gray-400">{insight.symbol}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full bg-${getInsightColor(insight.type, insight.impact)}/20 text-${getInsightColor(insight.type, insight.impact)}`}>
                    {insight.confidence}% confidence
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(insight.timestamp)}
                  </span>
                </div>
              </div>

              {/* Insight Description */}
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                {insight.description}
              </p>

              {/* Suggested Action */}
              {insight.actionable && insight.suggestedAction && (
                <div className={`p-3 rounded-lg bg-${getInsightColor(insight.type, insight.impact)}/10 border border-${getInsightColor(insight.type, insight.impact)}/20`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium text-${getInsightColor(insight.type, insight.impact)} uppercase`}>
                      Suggested Action
                    </span>
                    <span className={`text-xs px-2 py-1 rounded bg-${getInsightColor(insight.type, insight.impact)}/20 text-${getInsightColor(insight.type, insight.impact)}`}>
                      {insight.suggestedAction.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {insight.suggestedAction.reasoning}
                    {insight.suggestedAction.price && (
                      <span className="ml-2 font-mono text-white">
                        @ ${insight.suggestedAction.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {insight.tags && insight.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {insight.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Status Footer */}
      <div className="p-4 border-t border-neural-border">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Neural Activity:</span>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className={`w-1 h-3 rounded-full ${
                    i === 0 ? 'bg-neon-green' : 
                    i === 1 ? 'bg-neon-blue' : 
                    i === 2 ? 'bg-neon-purple' : 
                    i === 3 ? 'bg-neon-orange' : 'bg-neon-pink'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <span>Processed: <span className="text-neon-green font-mono">23.4K</span></span>
            <span>Speed: <span className="text-neon-blue font-mono">2.3ms</span></span>
            <span>Accuracy: <span className="text-neon-purple font-mono">87.3%</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}