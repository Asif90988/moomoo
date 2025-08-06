// Neural Core Alpha-7 - Sophisticated Cylindrical Market Display
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Brain, Target } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  prediction: number;
  confidence: number;
}

const CylindricalMarketDisplay: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    // Generate realistic market data
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX'];
    const data = symbols.map(symbol => ({
      symbol,
      price: 100 + Math.random() * 400,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      prediction: (Math.random() - 0.5) * 0.08, // -4% to +4%
      confidence: 0.65 + Math.random() * 0.3 // 65-95%
    }));
    setMarketData(data);

    // Auto-rotate through data
    const interval = setInterval(() => {
      if (isRotating) {
        setCurrentIndex((prev) => (prev + 1) % data.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isRotating]);

  const currentData = marketData[currentIndex];

  return (
    <div className="relative flex items-center justify-center min-h-[600px]">
      {/* Cylindrical Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
        onMouseEnter={() => setIsRotating(false)}
        onMouseLeave={() => setIsRotating(true)}
      >
        {/* Glass Cylinder */}
        <div className="relative w-80 h-96 mx-auto perspective-1000">
          {/* Cylinder Base */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-8 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full shadow-2xl border border-slate-600/50" />
          
          {/* Cylinder Top */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-72 h-8 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full shadow-inner border border-slate-500/50" />
          
          {/* Main Cylinder Body */}
          <div className="absolute inset-x-8 top-4 bottom-4 bg-gradient-to-b from-slate-900/40 via-slate-800/20 to-slate-900/40 backdrop-blur-xl border-l border-r border-slate-600/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            
            {/* Rotating Content Inside Cylinder */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <AnimatePresence mode="wait">
                {currentData && (
                  <motion.div
                    key={currentData.symbol}
                    initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="text-center space-y-4"
                  >
                    {/* Symbol */}
                    <div className="text-4xl font-bold text-white tracking-wider">
                      {currentData.symbol}
                    </div>
                    
                    {/* Price */}
                    <div className="text-6xl font-bold text-neon-blue">
                      ${currentData.price.toFixed(2)}
                    </div>
                    
                    {/* Change */}
                    <div className={`flex items-center justify-center space-x-2 text-2xl font-semibold ${
                      currentData.change >= 0 ? 'text-neon-green' : 'text-neon-red'
                    }`}>
                      {currentData.change >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                      <span>{currentData.change >= 0 ? '+' : ''}{currentData.change.toFixed(2)}</span>
                      <span>({currentData.changePercent >= 0 ? '+' : ''}{currentData.changePercent.toFixed(2)}%)</span>
                    </div>
                    
                    {/* AI Prediction */}
                    <div className="pt-4 border-t border-slate-600/50">
                      <div className="flex items-center justify-center space-x-2 text-neon-purple mb-2">
                        <Brain className="w-5 h-5" />
                        <span className="text-sm font-medium">AI PREDICTION</span>
                      </div>
                      <div className={`text-2xl font-bold ${
                        currentData.prediction >= 0 ? 'text-neon-green' : 'text-neon-red'
                      }`}>
                        {currentData.prediction >= 0 ? '+' : ''}{(currentData.prediction * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-400">
                        {(currentData.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-neon-blue rounded-full"
                  animate={{
                    y: [0, -100, 0],
                    x: [0, Math.sin(i) * 20, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.7
                  }}
                  style={{
                    left: `${20 + i * 12}%`,
                    top: '90%'
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Reflection Effects */}
          <div className="absolute inset-x-8 top-4 bottom-4 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30 pointer-events-none" />
          <div className="absolute left-8 top-4 bottom-4 w-2 bg-gradient-to-b from-white/20 via-transparent to-white/20 pointer-events-none" />
        </div>
        
        {/* Navigation Dots */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {marketData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-neon-blue shadow-lg shadow-neon-blue/50' 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-radial from-neon-blue/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Side Indicators */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 space-y-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-green/5 border border-neon-green/30 flex items-center justify-center"
        >
          <TrendingUp className="w-8 h-8 text-neon-green" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-purple/5 border border-neon-purple/30 flex items-center justify-center"
        >
          <Brain className="w-8 h-8 text-neon-purple" />
        </motion.div>
      </div>
      
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-yellow/20 to-neon-yellow/5 border border-neon-yellow/30 flex items-center justify-center"
        >
          <Zap className="w-8 h-8 text-neon-yellow" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-red/20 to-neon-red/5 border border-neon-red/30 flex items-center justify-center"
        >
          <Target className="w-8 h-8 text-neon-red" />
        </motion.div>
      </div>
    </div>
  );
};

export default CylindricalMarketDisplay;