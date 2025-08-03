'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AIThought {
  id: string;
  message: string;
  confidence: number;
  type: 'analysis' | 'learning' | 'planning' | 'decision' | 'warning';
  timestamp: number;
}

interface AIThoughtTickerProps {
  className?: string;
}

const AIThoughtTicker: React.FC<AIThoughtTickerProps> = ({ className = '' }) => {
  const [thoughts, setThoughts] = useState<AIThought[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Generate realistic AI thoughts
  const generateThought = (): AIThought => {
    const thoughtTypes = [
      {
        type: 'analysis' as const,
        messages: [
          '📊 Analyzing RSI divergence in AAPL - potential reversal signal detected',
          '📈 Volume spike in TSLA suggests institutional accumulation',
          '🔍 Pattern recognition: Double bottom forming in SPY 15min chart',
          '📉 Bearish flag pattern completed in NVDA - monitoring for breakout',
          '📊 Support level holding strong at $185.50 in AAPL',
          '🎯 Fibonacci retracement to 61.8% level - watching for bounce'
        ]
      },
      {
        type: 'learning' as const,
        messages: [
          '🧠 Learning: Morning gaps >2% have 73% fill rate within 2 hours',
          '📚 Pattern update: Hammer candles at support show 68% reversal success',
          '🔄 Adapting strategy: Volume confirmation improves win rate by 12%',
          '📖 New insight: Pre-market activity correlates with intraday momentum',
          '🧪 Testing hypothesis: Options flow predicts price direction 15min ahead',
          '🎓 Knowledge gained: Weekend news impact fades by Tuesday close'
        ]
      },
      {
        type: 'planning' as const,
        messages: [
          '🎯 Planning: Setting buy alert for GOOGL at $142.30 support',
          '📋 Strategy: Preparing scalp setup on SPY 5min breakout',
          '⏰ Scheduling: FOMC announcement at 2pm - reducing position sizes',
          '🎲 Risk planning: Max 2% portfolio risk on next 3 trades',
          '📅 Tomorrow focus: Earnings plays on AMZN and META',
          '🚀 Setup ready: Bull flag completion target $195 on AAPL'
        ]
      },
      {
        type: 'decision' as const,
        messages: [
          '✅ Decision: Entering long TSLA 50 shares at $218.45',
          '❌ Rejecting: NVDA setup - risk/reward ratio unfavorable',
          '🔄 Adjusting: Stop loss moved to break-even on AAPL position',
          '💰 Taking profit: Closing 50% of SPY calls at 15% gain',
          '⏹️ Stopped out: MSFT position hit 1% stop loss as planned',
          '🎯 Target hit: GOOGL reached $145 target - closing position'
        ]
      },
      {
        type: 'warning' as const,
        messages: [
          '⚠️ Warning: High volatility detected - reducing position sizes',
          '🚨 Alert: Unusual options activity in banking sector',
          '⚡ Risk alert: VIX spiking above 20 - defensive mode activated',
          '🔔 Caution: Low volume during breakout - waiting for confirmation',
          '⚠️ Notice: Economic data release in 30min - monitoring impact',
          '🚩 Flag: Correlation breakdown between tech stocks - stay alert'
        ]
      }
    ];

    const typeData = thoughtTypes[Math.floor(Math.random() * thoughtTypes.length)];
    const message = typeData.messages[Math.floor(Math.random() * typeData.messages.length)];

    return {
      id: Date.now().toString() + Math.random(),
      message,
      type: typeData.type,
      confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
      timestamp: Date.now()
    };
  };

  // Initialize with some thoughts and continuously add new ones
  useEffect(() => {
    // Start with some initial thoughts
    const initialThoughts = Array.from({ length: 3 }, generateThought);
    setThoughts(initialThoughts);

    // Add new thoughts every 5-8 seconds
    const interval = setInterval(() => {
      const newThought = generateThought();
      setThoughts(prev => {
        const updated = [...prev, newThought];
        // Keep only last 10 thoughts
        return updated.slice(-10);
      });
    }, Math.random() * 3000 + 5000); // 5-8 seconds

    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'analysis': return 'text-blue-400';
      case 'learning': return 'text-purple-400';
      case 'planning': return 'text-yellow-400';
      case 'decision': return 'text-green-400';
      case 'warning': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'analysis': return '📊';
      case 'learning': return '🧠';
      case 'planning': return '🎯';
      case 'decision': return '✅';
      case 'warning': return '⚠️';
      default: return '🤖';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Ticker Background */}
      <div className="bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-sm border-b border-neon-blue/30 shadow-lg">
        <div className="relative h-12 overflow-hidden">
          {/* AI Branding */}
          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-neon-purple/20 to-transparent px-4 flex items-center z-10">
            <span className="text-neon-purple font-bold text-sm whitespace-nowrap">
              🧠 AI LIVE THOUGHTS
            </span>
          </div>

          {/* Scrolling Thoughts Container */}
          <div className="ml-40 h-full flex items-center">
            <motion.div
              animate={{ x: '100vw' }}
              transition={{
                duration: 45,
                repeat: Infinity,
                ease: 'linear',
                repeatType: 'loop'
              }}
              className="flex items-center space-x-8 whitespace-nowrap"
              style={{ x: '-100%' }}
            >
              {thoughts.map((thought, index) => (
                <motion.div
                  key={thought.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 bg-gray-800/50 rounded-full px-4 py-1 border border-gray-600/30"
                >
                  <span className="text-lg">{getTypeIcon(thought.type)}</span>
                  <span className={`text-sm font-medium ${getTypeColor(thought.type)}`}>
                    {thought.message}
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-neon-green rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-400">
                      {(thought.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-700/50 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Pulse Effect */}
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 pointer-events-none"
        />
      </div>

      {/* Show Button when hidden */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed top-2 right-4 bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/40 rounded-lg px-3 py-1 text-neon-purple text-xs transition-colors z-50"
        >
          Show AI Thoughts
        </button>
      )}
    </div>
  );
};

export default AIThoughtTicker;