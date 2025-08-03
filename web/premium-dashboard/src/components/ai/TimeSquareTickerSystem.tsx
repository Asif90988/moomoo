'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { aiThoughtsService, type HumanReadableThought } from '@/services/ai-thoughts-translator';

interface AIThought extends HumanReadableThought {
  // Using the real AI thought structure from translator
}

interface CelebrityTrade {
  id: string;
  celebrity: string;
  action: 'BOUGHT' | 'SOLD' | 'INCREASED' | 'DECREASED';
  symbol: string;
  amount: string;
  price?: string;
  timestamp: number;
}

interface NewsItem {
  id: string;
  headline: string;
  impact: 'high' | 'medium' | 'low';
  symbols: string[];
  timestamp: number;
}

interface TimeSquareTickerSystemProps {
  className?: string;
}

const TimeSquareTickerSystem: React.FC<TimeSquareTickerSystemProps> = ({ className = '' }) => {
  const [aiThoughts, setAIThoughts] = useState<AIThought[]>([]);
  const [celebrityTrades, setCelebrityTrades] = useState<CelebrityTrade[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  // Connect to real AI thoughts from Rust backend (translated to human language)

  // Generate celebrity trades
  const generateCelebrityTrade = (): CelebrityTrade => {
    const celebrities = [
      'Warren Buffett', 'Bill Gates', 'Elon Musk', 'Jeff Bezos', 'Mark Cuban', 
      'Ray Dalio', 'Carl Icahn', 'David Tepper', 'George Soros', 'Michael Burry',
      'Cathie Wood', 'Ken Griffin', 'Steve Cohen', 'Bill Ackman', 'Dan Loeb'
    ];
    
    const actions = ['BOUGHT', 'SOLD', 'INCREASED', 'DECREASED'] as const;
    const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'BRK.B', 'JPM', 'BAC', 'XOM', 'JNJ', 'PG', 'KO', 'DIS'];
    
    const celebrity = celebrities[Math.floor(Math.random() * celebrities.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    // Generate realistic amounts based on celebrity
    const getAmount = (celeb: string) => {
      if (celeb.includes('Buffett')) return `$${Math.floor(Math.random() * 500 + 100)}M`;
      if (celeb.includes('Gates') || celeb.includes('Bezos')) return `$${Math.floor(Math.random() * 200 + 50)}M`;
      return `$${Math.floor(Math.random() * 100 + 10)}M`;
    };

    return {
      id: Date.now().toString() + Math.random(),
      celebrity,
      action,
      symbol,
      amount: getAmount(celebrity),
      price: `$${(Math.random() * 200 + 50).toFixed(2)}`,
      timestamp: Date.now()
    };
  };

  // Generate financial news
  const generateFinancialNews = (): NewsItem => {
    const headlines = [
      { text: "🚨 BREAKING: Fed signals potential rate cut ahead of schedule - Markets surge", impact: 'high' as const, symbols: ['SPY', 'QQQ', 'DIA'] },
      { text: "⚡ NVIDIA beats earnings by 15% - AI revolution accelerating", impact: 'high' as const, symbols: ['NVDA', 'AMD', 'INTC'] },
      { text: "📈 Apple announces record iPhone sales in China - Supply chain optimized", impact: 'high' as const, symbols: ['AAPL', 'TSMC'] },
      { text: "🛢️ Oil prices spike 3% on Middle East tensions - Energy sector rallies", impact: 'medium' as const, symbols: ['XOM', 'CVX', 'COP'] },
      { text: "💰 Tesla reports 40% increase in deliveries - Production milestones achieved", impact: 'high' as const, symbols: ['TSLA'] },
      { text: "🏦 JPMorgan raises dividend 12% - Banking sector strength confirmed", impact: 'medium' as const, symbols: ['JPM', 'BAC', 'WFC'] },
      { text: "🔬 Microsoft AI partnership with OpenAI expands - Cloud dominance grows", impact: 'high' as const, symbols: ['MSFT', 'GOOGL'] },
      { text: "📱 Meta launches new VR platform - Metaverse adoption accelerating", impact: 'medium' as const, symbols: ['META', 'AAPL'] },
      { text: "⚕️ Johnson & Johnson drug approval ahead of timeline - Healthcare rally", impact: 'medium' as const, symbols: ['JNJ', 'PFE', 'MRK'] },
      { text: "🚗 Ford electric vehicle sales jump 60% - Legacy auto transformation", impact: 'medium' as const, symbols: ['F', 'GM', 'TSLA'] }
    ];

    const newsItem = headlines[Math.floor(Math.random() * headlines.length)];
    
    return {
      id: Date.now().toString() + Math.random(),
      headline: newsItem.text,
      impact: newsItem.impact,
      symbols: newsItem.symbols,
      timestamp: Date.now()
    };
  };

  // Update data streams
  useEffect(() => {
    // Connect to real AI thoughts service
    aiThoughtsService.onThought((thought: AIThought) => {
      setAIThoughts(prev => [...prev, thought].slice(-8)); // Keep last 8
    });

    // Initial data - generate multiple items to ensure visibility
    const initialTrades = Array.from({ length: 5 }, () => generateCelebrityTrade());
    const initialNews = Array.from({ length: 4 }, () => generateFinancialNews());
    
    setCelebrityTrades(initialTrades);
    setNewsItems(initialNews);

    // Celebrity trades - every 5-8 seconds (more frequent)
    const tradeInterval = setInterval(() => {
      setCelebrityTrades(prev => {
        const newTrade = generateCelebrityTrade();
        return [...prev, newTrade].slice(-8); // Keep last 8
      });
    }, Math.random() * 3000 + 5000); // 5-8 seconds

    // Financial news - every 4-7 seconds (more frequent)
    const newsInterval = setInterval(() => {
      setNewsItems(prev => {
        const newNews = generateFinancialNews();
        return [...prev, newNews].slice(-8); // Keep last 8
      });
    }, Math.random() * 3000 + 4000); // 4-7 seconds

    return () => {
      clearInterval(tradeInterval);
      clearInterval(newsInterval);
    };
  }, []);

  const getThoughtColor = (type: string) => {
    switch (type) {
      case 'monitoring': return 'text-blue-400';
      case 'analyzing': return 'text-purple-400';
      case 'deciding': return 'text-yellow-400';
      case 'executing': return 'text-green-400';
      case 'learning': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`${className}`}> {/* Removed fixed positioning - will be positioned by parent */}

      {/* WHALE MOVES TICKER - CELEBRITY TRADES - Single Line Compact */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-neural-panel/95 to-neural-surface/95 backdrop-blur-md border-b border-neon-mint/30"
        style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neon-green/10 to-neon-mint/10 px-2 py-0.5 border-b border-neon-mint/20">
          <div className="flex items-center justify-center space-x-1">
            <motion.span 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs"
            >
              🐋
            </motion.span>
            <span className="text-neon-mint font-bold text-xs tracking-wide">
              WHALE MOVES
            </span>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 bg-neon-green rounded-full"
            />
          </div>
        </div>

        {/* Ticker content - Single line, very compact with smaller fonts */}
        <div className="relative h-6 overflow-hidden">
          <div className="h-full flex items-center">
            <motion.div
              key={celebrityTrades.length}
              animate={{ x: '-100%' }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="flex items-center space-x-4 whitespace-nowrap"
              style={{ x: '100vw' }}
            >
              {celebrityTrades.map((trade, index) => (
                <motion.div
                  key={trade.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-1 rounded px-1.5 py-0.5 border"
                  style={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderColor: 'rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <span className="text-xs">🐋</span>
                  <span className="text-neon-mint font-medium text-xs">{trade.celebrity.split(' ')[0]}</span>
                  <span className={`text-xs ${
                    trade.action.includes('BOUGHT') || trade.action.includes('INCREASED') 
                      ? 'text-trading-bullish' : 'text-trading-bearish'
                  }`}>
                    {trade.action} {trade.symbol}
                  </span>
                  <span className="text-neon-yellow text-xs font-bold">{trade.amount}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimeSquareTickerSystem;
