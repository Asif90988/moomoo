'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Zap,
  Target,
  Shield,
  Clock,
  Globe,
  Coins,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
}

interface BinanceCryptoPanelProps {
  className?: string;
}

export default function BinanceCryptoPanel({ className }: BinanceCryptoPanelProps) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'prices' | 'trading'>('overview');

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/binance/test');
      const result = await response.json();
      
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
      
      if (result.success) {
        // Simulate crypto prices (in real implementation, fetch from Binance API)
        const mockPrices: CryptoPrice[] = [
          {
            symbol: 'BTCUSDT',
            price: 43250.50 + (Math.random() - 0.5) * 1000,
            change24h: (Math.random() - 0.5) * 10,
            volume: 28450000000,
            high24h: 44100.00,
            low24h: 42800.00
          },
          {
            symbol: 'ETHUSDT',
            price: 2650.75 + (Math.random() - 0.5) * 100,
            change24h: (Math.random() - 0.5) * 8,
            volume: 15200000000,
            high24h: 2720.00,
            low24h: 2580.00
          },
          {
            symbol: 'ADAUSDT',
            price: 0.485 + (Math.random() - 0.5) * 0.05,
            change24h: (Math.random() - 0.5) * 12,
            volume: 850000000,
            high24h: 0.52,
            low24h: 0.46
          },
          {
            symbol: 'DOTUSDT',
            price: 7.25 + (Math.random() - 0.5) * 0.5,
            change24h: (Math.random() - 0.5) * 15,
            volume: 420000000,
            high24h: 7.85,
            low24h: 6.95
          },
          {
            symbol: 'LINKUSDT',
            price: 14.85 + (Math.random() - 0.5) * 1,
            change24h: (Math.random() - 0.5) * 9,
            volume: 680000000,
            high24h: 15.50,
            low24h: 14.20
          },
          {
            symbol: 'BNBUSDT',
            price: 315.20 + (Math.random() - 0.5) * 20,
            change24h: (Math.random() - 0.5) * 6,
            volume: 1200000000,
            high24h: 325.00,
            low24h: 305.00
          }
        ];
        setCryptoPrices(mockPrices);
      }
    } catch (error) {
      console.error('Failed to check Binance connection:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('BNB')) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getCryptoIcon = (symbol: string) => {
    if (symbol.includes('BTC')) return '₿';
    if (symbol.includes('ETH')) return 'Ξ';
    if (symbol.includes('ADA')) return '₳';
    if (symbol.includes('DOT')) return '●';
    if (symbol.includes('LINK')) return '🔗';
    if (symbol.includes('BNB')) return '🟡';
    return '🪙';
  };

  if (loading) {
    return (
      <div className={`h-full overflow-y-auto p-4 ${className}`}>
        <div className="glass border border-neural-border/30 rounded-lg p-6">
          <div className="flex items-center justify-center h-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="h-8 w-8 text-neon-orange" />
            </motion.div>
            <span className="ml-3 text-neon-orange font-medium">Connecting to Binance Testnet...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto p-4 space-y-6 ${className}`}>
      {/* Header */}
      <div className="glass border border-neural-border/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-orange/20 to-neon-pink/20 border border-neon-orange/30 flex items-center justify-center"
            >
              <span className="text-2xl">₿</span>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-neon-orange via-neon-pink to-neon-purple bg-clip-text text-transparent">
                BINANCE CRYPTO COMMAND CENTER
              </h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-neon-green animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-neon-yellow animate-pulse' :
                  'bg-neon-red'
                }`}></div>
                <p className="text-sm text-neon-orange font-mono">
                  {connectionStatus === 'connected' ? 'TESTNET ACTIVE • 24/7 TRADING' :
                   connectionStatus === 'connecting' ? 'CONNECTING...' :
                   'DISCONNECTED'}
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={checkConnection}
            disabled={refreshing}
            className="glass border border-neural-border/30 rounded-lg px-4 py-2 flex items-center space-x-2 hover:bg-neon-orange/10 transition-all"
          >
            <RefreshCw className={`h-4 w-4 text-neon-orange ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-neon-orange font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Connection Status Banner */}
      {connectionStatus === 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-neon-green/30 rounded-lg p-4 bg-neon-green/5"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-neon-green" />
            <div>
              <h3 className="font-bold text-neon-green">Connected to Binance Testnet</h3>
              <p className="text-sm text-gray-300">Paper trading active • Virtual funds • 24/7 crypto markets</p>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-neon-green">24/7</div>
                <div className="text-xs text-gray-400">Trading</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-neon-orange">6</div>
                <div className="text-xs text-gray-400">Cryptos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-neon-purple">∞</div>
                <div className="text-xs text-gray-400">Liquidity</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="glass border border-neural-border/30 rounded-lg p-1">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'prices', label: 'Live Prices', icon: LineChart },
            { id: 'trading', label: 'AI Trading', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange/30'
                  : 'text-gray-400 hover:text-neon-orange hover:bg-neon-orange/10'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass border border-neural-border/30 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-green/20 to-neon-blue/20 border border-neon-green/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="font-bold text-neon-green">24/7 Trading</h3>
                  <p className="text-xs text-gray-400">Never sleeps</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                Crypto markets never close. Your AI trades around the clock, capturing opportunities while you sleep.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass border border-neural-border/30 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-orange/20 to-neon-pink/20 border border-neon-orange/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-neon-orange" />
                </div>
                <div>
                  <h3 className="font-bold text-neon-orange">High Volatility</h3>
                  <p className="text-xs text-gray-400">More opportunities</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                Crypto's higher volatility means more profit opportunities for your sophisticated AI algorithms.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass border border-neural-border/30 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-neon-purple" />
                </div>
                <div>
                  <h3 className="font-bold text-neon-purple">No PDT Rules</h3>
                  <p className="text-xs text-gray-400">Trade freely</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                No pattern day trading restrictions. Your AI can trade as frequently as it wants with any capital amount.
              </p>
            </motion.div>
          </div>

          {/* Crypto Assets */}
          <div className="glass border border-neural-border/30 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Coins className="w-6 h-6 text-neon-orange" />
              <h2 className="text-xl font-bold text-neon-orange">SUPPORTED CRYPTO ASSETS</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', desc: 'Digital Gold' },
                { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', desc: 'Smart Contracts' },
                { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳', desc: 'Proof of Stake' },
                { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●', desc: 'Interoperability' },
                { symbol: 'LINKUSDT', name: 'Chainlink', icon: '🔗', desc: 'Oracle Network' },
                { symbol: 'BNBUSDT', name: 'Binance Coin', icon: '🟡', desc: 'Exchange Token' }
              ].map((crypto, index) => (
                <motion.div
                  key={crypto.symbol}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-4 hover:bg-neon-orange/5 transition-all"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{crypto.icon}</span>
                    <div>
                      <h4 className="font-bold text-white">{crypto.name}</h4>
                      <p className="text-xs text-gray-400">{crypto.desc}</p>
                    </div>
                  </div>
                  <div className="text-sm font-mono text-neon-orange">{crypto.symbol}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Prices Tab */}
      {activeTab === 'prices' && (
        <div className="space-y-6">
          <div className="glass border border-neural-border/30 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <LineChart className="w-6 h-6 text-neon-green" />
              <h2 className="text-xl font-bold text-neon-green">LIVE CRYPTO PRICES</h2>
              <div className="ml-auto text-xs text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            <div className="space-y-3">
              {cryptoPrices.map((crypto, index) => (
                <motion.div
                  key={crypto.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-4 hover:bg-neon-blue/5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{getCryptoIcon(crypto.symbol)}</span>
                      <div>
                        <h4 className="font-bold text-white text-lg">{crypto.symbol}</h4>
                        <div className="text-sm text-gray-400">
                          Vol: {formatVolume(crypto.volume)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neon-blue">
                        {formatPrice(crypto.price, crypto.symbol)}
                      </div>
                      <div className={`text-sm font-mono ${
                        crypto.change24h >= 0 ? 'text-neon-green' : 'text-neon-red'
                      }`}>
                        {formatPercent(crypto.change24h)}
                      </div>
                    </div>
                    
                    <div className="text-right text-xs text-gray-400">
                      <div>H: {formatPrice(crypto.high24h, crypto.symbol)}</div>
                      <div>L: {formatPrice(crypto.low24h, crypto.symbol)}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Trading Tab */}
      {activeTab === 'trading' && (
        <div className="space-y-6">
          <div className="glass border border-neural-border/30 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="w-6 h-6 text-neon-yellow" />
              <h2 className="text-xl font-bold text-neon-yellow">AI CRYPTO TRADING ENGINE</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Trading Features</h3>
                
                <div className="space-y-3">
                  {[
                    { icon: '🧠', title: 'IPCA ML Model', desc: 'Advanced factor analysis for crypto patterns' },
                    { icon: '⚡', title: 'Real-time Execution', desc: 'Millisecond order placement and management' },
                    { icon: '🎯', title: 'Risk Management', desc: 'Position sizing and stop-loss automation' },
                    { icon: '📊', title: 'Technical Analysis', desc: '22 characteristics adapted for crypto markets' }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 glass rounded-lg"
                    >
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <h4 className="font-bold text-neon-blue">{feature.title}</h4>
                        <p className="text-sm text-gray-400">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Trading Status</h3>
                
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">AI Trading Engine</span>
                    <span className="px-3 py-1 bg-neon-yellow/20 text-neon-yellow text-sm rounded-full border border-neon-yellow/30">
                      READY
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mode:</span>
                      <span className="text-neon-orange">Paper Trading</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Market Hours:</span>
                      <span className="text-neon-green">24/7 Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Supported Assets:</span>
                      <span className="text-neon-blue">6 Crypto Pairs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Position Size:</span>
                      <span className="text-neon-purple">20% per trade</span>
                    </div>
                  </div>
                </div>
                
                <div className="glass rounded-lg p-4">
                  <h4 className="font-bold text-neon-pink mb-3">Next Steps</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      <span className="text-gray-300">Binance Testnet Connected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      <span className="text-gray-300">AI Algorithms Loaded</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      <span className="text-gray-300">Enable in Trading Panel</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      <span className="text-gray-300">Start Autonomous Trading</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
