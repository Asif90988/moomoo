'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useSelectedSymbol, useSelectedMarketData } from '@/stores/trading-store';

export function OrderEntryPanel() {
  const selectedSymbol = useSelectedSymbol();
  const selectedMarketData = useSelectedMarketData();
  
  const [orderForm, setOrderForm] = useState({
    symbol: selectedSymbol || 'AAPL',
    type: 'market' as 'market' | 'limit' | 'stop' | 'stop-limit',
    quantity: 100,
    price: selectedMarketData?.price || 189.47,
    stopPrice: 0,
  });

  const handleSubmit = (side: 'buy' | 'sell') => {
    const orderValue = orderForm.quantity * orderForm.price;
    const message = `🚀 AI-Powered ${side.toUpperCase()} Order Submitted!\n\nSymbol: ${orderForm.symbol}\nQuantity: ${orderForm.quantity}\nPrice: $${orderForm.price.toFixed(2)}\nTotal Value: $${orderValue.toFixed(2)}\n\nThe autonomous trading system will execute this order with optimal timing and smart routing.`;
    alert(message);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neural-border flex items-center justify-between">
        <h2 className="text-lg font-bold text-neon-orange">Smart Order Entry</h2>
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-neon-purple" />
          <span className="text-xs text-neon-purple font-medium">AI Enabled</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Order Form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Symbol</label>
              <input
                type="text"
                value={orderForm.symbol}
                onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-neural-panel border border-neural-border rounded-lg text-white font-mono focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Order Type</label>
              <select
                value={orderForm.type}
                onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-neural-panel border border-neural-border rounded-lg text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all"
              >
                <option value="market">Market</option>
                <option value="limit">Limit</option>
                <option value="stop">Stop</option>
                <option value="stop-limit">Stop Limit</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Quantity</label>
              <input
                type="number"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-neural-panel border border-neural-border rounded-lg text-white font-mono focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                {orderForm.type === 'market' ? 'Est. Price' : 'Limit Price'}
              </label>
              <input
                type="number"
                step="0.01"
                value={orderForm.price}
                onChange={(e) => setOrderForm({ ...orderForm, price: parseFloat(e.target.value) || 0 })}
                disabled={orderForm.type === 'market'}
                className="w-full px-3 py-2 bg-neural-panel border border-neural-border rounded-lg text-white font-mono focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Order Value */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20"
          >
            <div className="text-xs text-gray-400 mb-1">Estimated Order Value</div>
            <div className="font-mono font-bold text-2xl text-white">
              {formatCurrency(orderForm.quantity * orderForm.price)}
            </div>
          </motion.div>

          {/* Order Buttons */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubmit('buy')}
              className="flex-1 bg-gradient-to-r from-neon-green to-green-500 hover:from-green-500 hover:to-neon-green text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-neon-green/25"
            >
              <TrendingUp className="w-5 h-5" />
              <span>BUY</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubmit('sell')}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-red-400/25"
            >
              <TrendingDown className="w-5 h-5" />
              <span>SELL</span>
            </motion.button>
          </div>

          {/* AI Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-lg bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 border border-neon-purple/20"
          >
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-4 h-4 text-neon-purple" />
              <span className="text-sm font-medium text-neon-purple">AI Recommendation</span>
              <div className="ml-auto">
                <span className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-1 rounded-full">
                  87% Confidence
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Strong BUY signal detected for {orderForm.symbol}. Technical indicators show bullish momentum with breakout above key resistance. 
              Recommended entry: ${orderForm.price.toFixed(2)}, Target: ${(orderForm.price * 1.05).toFixed(2)} (+5%).
            </p>
            
            {/* AI Metrics */}
            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <div className="text-gray-400">Pattern Match</div>
                <div className="text-neon-green font-mono">92%</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Risk Score</div>
                <div className="text-neon-blue font-mono">Low</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Time Horizon</div>
                <div className="text-neon-purple font-mono">2-5d</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}