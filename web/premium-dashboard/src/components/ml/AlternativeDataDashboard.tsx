// Neural Core Alpha-7 - Alternative Data Dashboard
// Multi-source alternative data analytics and signal generation

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, TrendingUp, MessageSquare, Newspaper, Globe, BarChart3, Zap, Activity } from 'lucide-react';

interface SentimentData {
  symbol: string;
  sentiment: number;
  volume: number;
  momentum: number;
  sources: {
    twitter: number;
    reddit: number;
    news: number;
    blogs: number;
  };
  keywords: string[];
}

interface NewsAnalytics {
  symbol: string;
  headline: string;
  sentiment: number;
  relevance: number;
  impact: number;
  category: string;
  source: string;
  publishedAt: Date;
}

interface DataSource {
  name: string;
  type: string;
  enabled: boolean;
  confidence: number;
  latency: number;
  cost: number;
  lastUpdated: Date;
  status: 'ACTIVE' | 'WARNING' | 'ERROR';
}

interface AlternativeSignal {
  symbol: string;
  signal: number;
  strength: number;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  sources: string[];
}

const AlternativeDataDashboard: React.FC = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [newsAnalytics, setNewsAnalytics] = useState<NewsAnalytics[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [alternativeSignals, setAlternativeSignals] = useState<AlternativeSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('ALL');

  const watchlistSymbols = ['ALL', 'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX'];

  useEffect(() => {
    initializeDataSources();
    generateMockData();
    const interval = setInterval(generateMockData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const initializeDataSources = () => {
    const sources: DataSource[] = [
      {
        name: 'Twitter Sentiment',
        type: 'SENTIMENT',
        enabled: true,
        confidence: 0.7,
        latency: 5000,
        cost: 0.01,
        lastUpdated: new Date(),
        status: 'ACTIVE'
      },
      {
        name: 'Reddit Analytics',
        type: 'SOCIAL',
        enabled: true,
        confidence: 0.6,
        latency: 10000,
        cost: 0.005,
        lastUpdated: new Date(),
        status: 'ACTIVE'
      },
      {
        name: 'Financial News',
        type: 'NEWS',
        enabled: true,
        confidence: 0.8,
        latency: 3000,
        cost: 0.02,
        lastUpdated: new Date(),
        status: 'ACTIVE'
      },
      {
        name: 'Google Trends',
        type: 'SENTIMENT',
        enabled: true,
        confidence: 0.65,
        latency: 15000,
        cost: 0.0,
        lastUpdated: new Date(),
        status: 'ACTIVE'
      },
      {
        name: 'Economic Indicators',
        type: 'ECONOMIC',
        enabled: true,
        confidence: 0.95,
        latency: 2000,
        cost: 0.0,
        lastUpdated: new Date(),
        status: 'ACTIVE'
      },
      {
        name: 'Satellite Data',
        type: 'SATELLITE',
        enabled: false,
        confidence: 0.9,
        latency: 300000,
        cost: 1.0,
        lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'WARNING'
      },
      {
        name: 'Corporate Transcripts',
        type: 'CORPORATE',
        enabled: false,
        confidence: 0.85,
        latency: 30000,
        cost: 0.5,
        lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000),
        status: 'ERROR'
      }
    ];

    setDataSources(sources);
  };

  const generateMockData = () => {
    const symbols = selectedSymbol === 'ALL' ? watchlistSymbols.slice(1) : [selectedSymbol];

    // Generate sentiment data
    const sentiment: SentimentData[] = symbols.map(symbol => ({
      symbol,
      sentiment: (Math.random() - 0.5) * 2, // -1 to 1
      volume: Math.floor(Math.random() * 1000) + 100,
      momentum: (Math.random() - 0.5) * 0.5,
      sources: {
        twitter: (Math.random() - 0.5) * 2,
        reddit: (Math.random() - 0.5) * 2,
        news: (Math.random() - 0.5) * 2,
        blogs: (Math.random() - 0.5) * 2
      },
      keywords: ['earnings', 'growth', 'bullish', 'bearish', 'upgrade', 'downgrade'][Math.floor(Math.random() * 6)]
        ? ['earnings', 'growth', 'bullish']
        : ['bearish', 'downgrade', 'sell-off']
    }));

    setSentimentData(sentiment);

    // Generate news analytics
    const news: NewsAnalytics[] = symbols.flatMap(symbol => [
      {
        symbol,
        headline: `${symbol} reports strong quarterly earnings beat`,
        sentiment: 0.3 + Math.random() * 0.4,
        relevance: 0.8 + Math.random() * 0.2,
        impact: 0.6 + Math.random() * 0.3,
        category: 'EARNINGS',
        source: 'Reuters',
        publishedAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000)
      },
      {
        symbol,
        headline: `Analyst upgrades ${symbol} price target`,
        sentiment: 0.2 + Math.random() * 0.3,
        relevance: 0.7 + Math.random() * 0.3,
        impact: 0.4 + Math.random() * 0.4,
        category: 'ANALYST',
        source: 'Bloomberg',
        publishedAt: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000)
      }
    ]).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    setNewsAnalytics(news);

    // Generate alternative signals
    const signals: AlternativeSignal[] = symbols.map(symbol => {
      const signal = (Math.random() - 0.5) * 0.1; // -5% to +5%
      const strength = Math.abs(signal);
      const direction = signal > 0.01 ? 'BUY' : signal < -0.01 ? 'SELL' : 'HOLD';
      const confidence = Math.min(strength * 20, 1.0);

      return {
        symbol,
        signal,
        strength,
        direction,
        confidence,
        sources: dataSources.filter(s => s.enabled).map(s => s.name).slice(0, 3)
      };
    }).sort((a, b) => b.strength - a.strength);

    setAlternativeSignals(signals);
  };

  const refreshDataSource = async (sourceName: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setDataSources(prev => prev.map(source => 
      source.name === sourceName 
        ? { ...source, lastUpdated: new Date(), status: 'ACTIVE' as const }
        : source
    ));
    
    setLoading(false);
  };

  const toggleDataSource = (sourceName: string) => {
    setDataSources(prev => prev.map(source => 
      source.name === sourceName 
        ? { ...source, enabled: !source.enabled }
        : source
    ));
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-green-400';
    if (sentiment < -0.2) return 'text-red-400';
    return 'text-gray-400';
  };

  const getSentimentEmoji = (sentiment: number) => {
    if (sentiment > 0.5) return '🚀';
    if (sentiment > 0.2) return '📈';
    if (sentiment > -0.2) return '😐';
    if (sentiment > -0.5) return '📉';
    return '💥';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400 bg-green-600/20 border-green-500/40';
      case 'WARNING': return 'text-yellow-400 bg-yellow-600/20 border-yellow-500/40';
      case 'ERROR': return 'text-red-400 bg-red-600/20 border-red-500/40';
      default: return 'text-gray-400 bg-gray-600/20 border-gray-500/40';
    }
  };

  const getSignalColor = (direction: string) => {
    switch (direction) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const activeSources = dataSources.filter(s => s.enabled).length;
  const avgConfidence = dataSources.filter(s => s.enabled).reduce((sum, s) => sum + s.confidence, 0) / activeSources || 0;
  const strongSignals = alternativeSignals.filter(s => s.strength > 0.02).length;

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/30 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Alternative Data Pipeline</h2>
              <p className="text-slate-400">Multi-source data analytics and signal generation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {watchlistSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Pipeline Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">
              {activeSources}
            </div>
            <div className="text-sm text-slate-400">Active Sources</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {(avgConfidence * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-slate-400">Avg Confidence</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {strongSignals}
            </div>
            <div className="text-sm text-slate-400">Strong Signals</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {newsAnalytics.length}
            </div>
            <div className="text-sm text-slate-400">News Articles</div>
          </div>
        </div>
      </div>

      {/* Data Sources Status */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Activity className="w-6 h-6 text-blue-400" />
          <span>Data Sources ({activeSources} active)</span>
        </h3>

        <div className="grid gap-4">
          {dataSources.map(source => (
            <div key={source.name} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={source.enabled}
                        onChange={() => toggleDataSource(source.name)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                    <div>
                      <div className="font-semibold text-white">{source.name}</div>
                      <div className="text-sm text-slate-400">
                        {source.type} • Confidence: {(source.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">
                      {source.latency < 1000 ? `${source.latency}ms` : `${(source.latency / 1000).toFixed(1)}s`}
                    </div>
                    <div className="text-sm text-slate-400">Latency</div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-400">
                      ${source.cost.toFixed(3)}
                    </div>
                    <div className="text-sm text-slate-400">Cost/req</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-slate-400">Last Updated</div>
                    <div className="text-xs text-slate-400">
                      {source.lastUpdated.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(source.status)}`}>
                    {source.status}
                  </div>

                  <button
                    onClick={() => refreshDataSource(source.name)}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded text-xs transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Signals */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          <span>Alternative Data Signals</span>
        </h3>

        <div className="grid gap-4">
          {alternativeSignals.map(signal => (
            <motion.div
              key={signal.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="font-bold text-white text-lg">{signal.symbol}</div>
                    <div className="text-sm text-slate-400">
                      Sources: {signal.sources.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getSignalColor(signal.direction)}`}>
                      {(signal.signal * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-slate-400">Signal Strength</div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">
                      {(signal.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-slate-400">Confidence</div>
                  </div>

                  <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                    signal.direction === 'BUY' ? 'bg-green-600/20 text-green-400 border border-green-500/40' :
                    signal.direction === 'SELL' ? 'bg-red-600/20 text-red-400 border border-red-500/40' :
                    'bg-gray-600/20 text-gray-400 border border-gray-500/40'
                  }`}>
                    {signal.direction}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <MessageSquare className="w-6 h-6 text-green-400" />
          <span>Social Sentiment Analysis</span>
        </h3>

        <div className="grid gap-4">
          {sentimentData.map(sentiment => (
            <div key={sentiment.symbol} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getSentimentEmoji(sentiment.sentiment)}</span>
                  <div>
                    <div className="font-bold text-white text-lg">{sentiment.symbol}</div>
                    <div className="text-sm text-slate-400">
                      {sentiment.volume} mentions • Momentum: {(sentiment.momentum * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold ${getSentimentColor(sentiment.sentiment)}`}>
                    {(sentiment.sentiment * 100).toFixed(0)}
                  </div>
                  <div className="text-sm text-slate-400">Overall Sentiment</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getSentimentColor(sentiment.sources.twitter)}`}>
                    {(sentiment.sources.twitter * 100).toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-400">Twitter</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getSentimentColor(sentiment.sources.reddit)}`}>
                    {(sentiment.sources.reddit * 100).toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-400">Reddit</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getSentimentColor(sentiment.sources.news)}`}>
                    {(sentiment.sources.news * 100).toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-400">News</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getSentimentColor(sentiment.sources.blogs)}`}>
                    {(sentiment.sources.blogs * 100).toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-400">Blogs</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="text-sm text-slate-400 mb-2">Trending Keywords:</div>
                <div className="flex flex-wrap gap-2">
                  {sentiment.keywords.map(keyword => (
                    <span key={keyword} className="px-2 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/40 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* News Analytics */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Newspaper className="w-6 h-6 text-orange-400" />
          <span>News Analytics</span>
        </h3>

        <div className="space-y-4">
          {newsAnalytics.slice(0, 10).map((news, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <div className="font-semibold text-white mb-2">{news.headline}</div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span>{news.source}</span>
                    <span>•</span>
                    <span>{news.symbol}</span>
                    <span>•</span>
                    <span>{news.category}</span>
                    <span>•</span>
                    <span>{news.publishedAt.toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getSentimentColor(news.sentiment)}`}>
                      {(news.sentiment * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-slate-400">Sentiment</div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">
                      {(news.relevance * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-400">Relevance</div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-400">
                      {(news.impact * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-400">Impact</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlternativeDataDashboard;