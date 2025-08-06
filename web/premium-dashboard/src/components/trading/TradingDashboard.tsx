'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Target,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Eye,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TradeOrder {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  quantity: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'partial';
  timestamp: Date;
  aiRecommendation?: boolean;
}

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  aiScore: number;
  aiSignal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
}

const TradingDashboard: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aiTradingEnabled, setAiTradingEnabled] = useState<boolean>(true);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Demo market data - HK stocks (you have LV1 access)
  const demoMarketData: MarketData[] = [
    {
      symbol: '00700',
      name: 'Tencent Holdings Ltd',
      price: 368.20,
      change: 8.40,
      changePercent: 2.34,
      volume: 18231000,
      aiScore: 8.7,
      aiSignal: 'buy'
    },
    {
      symbol: '00941',
      name: 'China Mobile Ltd',
      price: 64.85,
      change: -0.95,
      changePercent: -1.44,
      volume: 12451000,
      aiScore: 7.3,
      aiSignal: 'hold'
    },
    {
      symbol: '03690',
      name: 'Meituan',
      price: 142.50,
      change: 3.20,
      changePercent: 2.30,
      volume: 21245000,
      aiScore: 9.1,
      aiSignal: 'strong_buy'
    },
    {
      symbol: '00388',
      name: 'Hong Kong Exchanges',
      price: 285.60,
      change: -4.80,
      changePercent: -1.65,
      volume: 8834000,
      aiScore: 4.2,
      aiSignal: 'sell'
    },
    {
      symbol: '02318',
      name: 'Ping An Insurance',
      price: 45.75,
      change: 2.15,
      changePercent: 4.93,
      volume: 19123000,
      aiScore: 9.4,
      aiSignal: 'strong_buy'
    }
  ];

  // CLEARED: Starting fresh with no demo orders - AI will create the trading history
  const demoOrders: TradeOrder[] = [];

  useEffect(() => {
    // Simulate loading market data
    const timer = setTimeout(() => {
      setMarketData(demoMarketData);
      setOrders(demoOrders);
      setLoading(false);
    }, 1500);

    // Simulate real-time price updates
    const priceUpdateInterval = setInterval(() => {
      setMarketData(prev => prev.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 2,
        change: stock.change + (Math.random() - 0.5) * 0.5,
        changePercent: stock.changePercent + (Math.random() - 0.5) * 0.2
      })));
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(priceUpdateInterval);
    };
  }, []);

  const handlePlaceOrder = () => {
    if (!quantity || parseFloat(quantity) <= 0) return;

    const newOrder: TradeOrder = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      type: orderSide,
      orderType,
      quantity: parseFloat(quantity),
      price: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
      status: 'pending',
      timestamp: new Date(),
      aiRecommendation: aiTradingEnabled
    };

    setOrders(prev => [newOrder, ...prev]);
    setQuantity('');
    setLimitPrice('');

    // Simulate order execution
    setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === newOrder.id 
          ? { ...order, status: Math.random() > 0.1 ? 'filled' : 'cancelled' }
          : order
      ));
    }, Math.random() * 3000 + 1000);
  };

  const getAISignalColor = (signal: string) => {
    switch (signal) {
      case 'strong_buy': return 'text-neon-green';
      case 'buy': return 'text-green-400';
      case 'hold': return 'text-yellow-400';
      case 'sell': return 'text-orange-400';
      case 'strong_sell': return 'text-neon-red';
      default: return 'text-gray-400';
    }
  };

  const getAISignalBg = (signal: string) => {
    switch (signal) {
      case 'strong_buy': return 'bg-neon-green/20 border-neon-green/40';
      case 'buy': return 'bg-green-400/20 border-green-400/40';
      case 'hold': return 'bg-yellow-400/20 border-yellow-400/40';
      case 'sell': return 'bg-orange-400/20 border-orange-400/40';
      case 'strong_sell': return 'bg-neon-red/20 border-neon-red/40';
      default: return 'bg-gray-400/20 border-gray-400/40';
    }
  };

  const filteredMarketData = marketData.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStock = marketData.find(stock => stock.symbol === selectedSymbol);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mx-auto"></div>
          <p className="text-neon-blue font-medium">Loading Trading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-neural-dark text-white p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Live Trading
          </h1>
          <p className="text-gray-400 mt-1">Execute trades with AI-powered insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">AI Trading</span>
            <button
              onClick={() => setAiTradingEnabled(!aiTradingEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                aiTradingEnabled ? 'bg-neon-green' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                aiTradingEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          <button className="p-2 glass rounded-lg border border-neon-blue/20 hover:border-neon-blue/40 transition-colors">
            <RefreshCw className="w-5 h-5 text-neon-blue" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Watch */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-xl border border-neural-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Market Watch</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredMarketData.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => setSelectedSymbol(stock.symbol)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedSymbol === stock.symbol
                      ? 'border-neon-blue/40 bg-neon-blue/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-400 truncate">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-white">${stock.price.toFixed(2)}</p>
                      <p className={`text-sm ${stock.change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getAISignalBg(stock.aiSignal)} ${getAISignalColor(stock.aiSignal)}`}>
                      AI: {stock.aiSignal.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                      <span className="text-xs text-gray-400">Score: {stock.aiScore}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-xl border border-neural-border p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Place Order</h3>
            
            {selectedStock && (
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{selectedStock.symbol}</span>
                  <span className="font-mono text-white">${selectedStock.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm px-2 py-1 rounded-full border ${getAISignalBg(selectedStock.aiSignal)} ${getAISignalColor(selectedStock.aiSignal)}`}>
                    AI: {selectedStock.aiSignal.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`text-sm ${selectedStock.change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Order Side */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Order Side</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderSide('buy')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      orderSide === 'buy'
                        ? 'bg-neon-green/20 border-neon-green/40 text-neon-green'
                        : 'border-white/20 text-gray-400 hover:border-white/40'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setOrderSide('sell')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      orderSide === 'sell'
                        ? 'bg-neon-red/20 border-neon-red/40 text-neon-red'
                        : 'border-white/20 text-gray-400 hover:border-white/40'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Order Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderType('market')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      orderType === 'market'
                        ? 'bg-neon-blue/20 border-neon-blue/40 text-neon-blue'
                        : 'border-white/20 text-gray-400 hover:border-white/40'
                    }`}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => setOrderType('limit')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      orderType === 'limit'
                        ? 'bg-neon-blue/20 border-neon-blue/40 text-neon-blue'
                        : 'border-white/20 text-gray-400 hover:border-white/40'
                    }`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue/40 focus:outline-none"
                />
              </div>

              {/* Limit Price */}
              {orderType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Limit Price</label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue/40 focus:outline-none"
                  />
                </div>
              )}

              {/* AI Recommendation */}
              {aiTradingEnabled && selectedStock && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border border-neon-purple/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-neon-purple" />
                    <span className="text-sm font-medium text-neon-purple">AI Recommendation</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Based on current market conditions and technical analysis, the AI suggests a{' '}
                    <span className={getAISignalColor(selectedStock.aiSignal)}>
                      {selectedStock.aiSignal.replace('_', ' ').toUpperCase()}
                    </span>{' '}
                    signal for {selectedStock.symbol}.
                  </p>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={!quantity || parseFloat(quantity) <= 0}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  orderSide === 'buy'
                    ? 'bg-gradient-to-r from-neon-green to-green-500 hover:from-green-500 hover:to-neon-green text-white'
                    : 'bg-gradient-to-r from-neon-red to-red-500 hover:from-red-500 hover:to-neon-red text-white'
                }`}
              >
                Place {orderSide.toUpperCase()} Order
              </button>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-xl border border-neural-border p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orders.map((order) => (
                <div key={order.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">{order.symbol}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.type === 'buy' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'
                      }`}>
                        {order.type.toUpperCase()}
                      </span>
                      {order.aiRecommendation && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/40">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {order.status === 'filled' && <CheckCircle className="w-4 h-4 text-neon-green" />}
                      {order.status === 'cancelled' && <XCircle className="w-4 h-4 text-neon-red" />}
                      {order.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
                      <span className={`text-xs ${
                        order.status === 'filled' ? 'text-neon-green' :
                        order.status === 'cancelled' ? 'text-neon-red' :
                        'text-yellow-400'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{order.quantity} shares @ {order.orderType}</span>
                    <span>{order.timestamp.toLocaleTimeString()}</span>
                  </div>
                  {order.price && (
                    <div className="text-sm text-gray-400 mt-1">
                      Limit: ${order.price.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;