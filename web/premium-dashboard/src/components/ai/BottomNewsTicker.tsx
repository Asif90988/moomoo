'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BottomNewsItem {
  id: string;
  headline: string;
  category: 'BREAKING' | 'MARKET' | 'EARNINGS' | 'CRYPTO' | 'POLITICS' | 'TECH';
  symbols: string[];
  timestamp: number;
  urgent?: boolean;
}

interface BottomNewsTickerProps {
  className?: string;
}

const BottomNewsTicker: React.FC<BottomNewsTickerProps> = ({ className = '' }) => {
  const [newsItems, setNewsItems] = useState<BottomNewsItem[]>([]);

  // Generate breaking news items - Including the breaking news from top ticker
  const generateBreakingNews = (): BottomNewsItem => {
    const newsData = [
      // Breaking news from the original top ticker
      { headline: "🚨 BREAKING: Fed signals potential rate cut ahead of schedule - Markets surge", category: 'BREAKING' as const, symbols: ['SPY', 'QQQ', 'DIA'], urgent: true },
      { headline: "⚡ NVIDIA beats earnings by 15% - AI revolution accelerating", category: 'BREAKING' as const, symbols: ['NVDA', 'AMD', 'INTC'], urgent: true },
      { headline: "📈 Apple announces record iPhone sales in China - Supply chain optimized", category: 'BREAKING' as const, symbols: ['AAPL', 'TSMC'], urgent: true },
      { headline: "🛢️ Oil prices spike 3% on Middle East tensions - Energy sector rallies", category: 'BREAKING' as const, symbols: ['XOM', 'CVX', 'COP'], urgent: true },
      { headline: "💰 Tesla reports 40% increase in deliveries - Production milestones achieved", category: 'BREAKING' as const, symbols: ['TSLA'], urgent: true },
      { headline: "🏦 JPMorgan raises dividend 12% - Banking sector strength confirmed", category: 'BREAKING' as const, symbols: ['JPM', 'BAC', 'WFC'], urgent: true },
      { headline: "🔬 Microsoft AI partnership with OpenAI expands - Cloud dominance grows", category: 'BREAKING' as const, symbols: ['MSFT', 'GOOGL'], urgent: true },
      { headline: "📱 Meta launches new VR platform - Metaverse adoption accelerating", category: 'BREAKING' as const, symbols: ['META', 'AAPL'], urgent: true },
      { headline: "⚕️ Johnson & Johnson drug approval ahead of timeline - Healthcare rally", category: 'BREAKING' as const, symbols: ['JNJ', 'PFE', 'MRK'], urgent: true },
      { headline: "🚗 Ford electric vehicle sales jump 60% - Legacy auto transformation", category: 'BREAKING' as const, symbols: ['F', 'GM', 'TSLA'], urgent: true },
      // Additional market news
      { headline: "📈 MARKET ALERT: S&P 500 hits new all-time high - Bull run continues", category: 'MARKET' as const, symbols: ['SPY', 'VOO'] },
      { headline: "⚡ CRYPTO UPDATE: Bitcoin breaks $50K resistance - Institutional buying accelerates", category: 'CRYPTO' as const, symbols: ['BTC', 'ETH'] },
      { headline: "🏛️ POLITICS: New trade agreement signed - Export sectors rally", category: 'POLITICS' as const, symbols: ['XLE', 'XLI'] },
      { headline: "🌐 GLOBAL MARKETS: Asian markets surge overnight - Positive sentiment spreads", category: 'MARKET' as const, symbols: ['EWJ', 'FXI', 'EWY'] },
      { headline: "🏠 REAL ESTATE: Housing data beats expectations - REIT sector gains", category: 'MARKET' as const, symbols: ['VNQ', 'IYR'] },
      { headline: "⚖️ REGULATORY: SEC approves new trading rules - Fintech stocks react", category: 'POLITICS' as const, symbols: ['SQ', 'PYPL', 'V'] },
      { headline: "🚀 SPACE ECONOMY: SpaceX mission success - Aerospace stocks climb", category: 'TECH' as const, symbols: ['BA', 'LMT', 'NOC'] },
      { headline: "🌱 ESG FOCUS: Green energy investments surge - Clean tech rally", category: 'MARKET' as const, symbols: ['ICLN', 'PBW', 'QCLN'] }
    ];

    const newsItem = newsData[Math.floor(Math.random() * newsData.length)];
    
    return {
      id: Date.now().toString() + Math.random(),
      headline: newsItem.headline,
      category: newsItem.category,
      symbols: newsItem.symbols,
      timestamp: Date.now(),
      urgent: newsItem.urgent || Math.random() > 0.8 // 20% chance of urgent
    };
  };

  // Initialize and update news stream
  useEffect(() => {
    // Initial news items
    const initialNews = Array.from({ length: 8 }, () => generateBreakingNews());
    setNewsItems(initialNews);

    // Add new news every 6-10 seconds
    const newsInterval = setInterval(() => {
      setNewsItems(prev => {
        const newNews = generateBreakingNews();
        return [...prev, newNews].slice(-12); // Keep last 12 items
      });
    }, Math.random() * 4000 + 6000); // 6-10 seconds

    return () => clearInterval(newsInterval);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BREAKING': return 'text-neon-red bg-neon-red/20 border-neon-red/40';
      case 'MARKET': return 'text-neon-blue bg-neon-blue/20 border-neon-blue/40';
      case 'EARNINGS': return 'text-trading-profit bg-trading-profit/20 border-trading-profit/40';
      case 'CRYPTO': return 'text-neon-yellow bg-neon-yellow/20 border-neon-yellow/40';
      case 'POLITICS': return 'text-neon-purple bg-neon-purple/20 border-neon-purple/40';
      case 'TECH': return 'text-neon-cyan bg-neon-cyan/20 border-neon-cyan/40';
      default: return 'text-neural-muted bg-neural-muted/20 border-neural-muted/40';
    }
  };

  return (
    <div className={`${className}`}>
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-neural-panel/98 to-neural-darker/98 backdrop-blur-md border-t border-neural-border/40"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neural-surface/20 to-neural-panel/20 px-4 py-0.5 border-b border-neural-border/20">
          <div className="flex items-center justify-center space-x-2">
            <motion.span 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-lg"
            >
              📺
            </motion.span>
            <span className="text-gray-200 font-bold text-sm tracking-wide">
              LIVE MARKET NEWS & BREAKING UPDATES
            </span>
            <motion.div
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />
            <span className="text-red-400 font-bold text-xs">LIVE</span>
          </div>
        </div>

        {/* Scrolling ticker content - Single line, compact with smaller fonts */}
        <div className="relative h-6 overflow-hidden">
          <div className="h-full flex items-center">
            <motion.div
              key={newsItems.length}
              animate={{ x: '-100%' }}
              transition={{
                duration: 60, // Slower speed for bottom ticker - 60 seconds
                repeat: Infinity,
                ease: 'linear'
              }}
              className="flex items-center space-x-4 whitespace-nowrap"
              style={{ x: '100vw' }}
            >
              {newsItems.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-1 rounded px-1.5 py-0.5 border ${
                    news.urgent 
                      ? 'border-neon-red/60' 
                      : 'border-neural-border/40'
                  }`}
                  style={{ 
                    backgroundColor: news.urgent 
                      ? 'rgba(239, 68, 68, 0.15)' 
                      : 'rgba(107, 114, 128, 0.15)'
                  }}
                >
                  {/* Urgent indicator */}
                  {news.urgent && (
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-1 h-1 bg-neon-red rounded-full"
                    />
                  )}
                  
                  {/* Category badge */}
                  <span className={`text-xs px-1 py-0.5 rounded border font-medium ${getCategoryColor(news.category)}`}>
                    {news.category}
                  </span>
                  
                  {/* News headline - truncated */}
                  <span className="text-xs font-medium text-gray-100 max-w-32 truncate">
                    {news.headline}
                  </span>
                  
                  {/* Related symbols - max 2 */}
                  <div className="flex space-x-1">
                    {news.symbols.slice(0, 2).map(symbol => (
                      <span key={symbol} className="text-xs bg-neon-blue/30 px-1 py-0.5 rounded border border-neon-blue/30 text-neon-blue">
                        {symbol}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BottomNewsTicker;
