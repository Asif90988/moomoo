'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Brain, Target, BarChart3 } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  prediction: number;
  confidence: number;
  chartData: CandlestickData[];
}

interface CandlestickData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

const Enhanced3DCylindricalDisplay: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate realistic candlestick data
  const generateCandlestickData = (basePrice: number): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < 30; i++) {
      const volatility = 0.02; // 2% volatility
      const trend = (Math.random() - 0.5) * 0.01; // Small trend
      
      const open = currentPrice;
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      const close = open + change + (trend * currentPrice);
      
      const high = Math.max(open, close) + (Math.random() * 0.01 * currentPrice);
      const low = Math.min(open, close) - (Math.random() * 0.01 * currentPrice);
      
      data.push({
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000000,
        timestamp: Date.now() - (29 - i) * 60000 // 1 minute intervals
      });
      
      currentPrice = close;
    }
    
    return data;
  };

  useEffect(() => {
    // Generate realistic market data with candlestick charts
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX'];
    const data = symbols.map(symbol => {
      const basePrice = 100 + Math.random() * 400;
      return {
        symbol,
        price: basePrice,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        prediction: (Math.random() - 0.5) * 0.08, // -4% to +4%
        confidence: 0.65 + Math.random() * 0.3, // 65-95%
        chartData: generateCandlestickData(basePrice)
      };
    });
    setMarketData(data);

    // Auto-rotate through data
    const interval = setInterval(() => {
      if (isRotating) {
        setCurrentIndex((prev) => (prev + 1) % data.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isRotating]);

  // Draw 3D candlestick chart inside cylinder
  useEffect(() => {
    if (!canvasRef.current || !marketData[currentIndex]) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { chartData } = marketData[currentIndex];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up 3D perspective
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const depth = 100;
    
    // Draw cylindrical grid lines
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (ellipses for 3D effect)
    for (let i = 0; i < 5; i++) {
      const y = (canvas.height / 6) * (i + 1);
      ctx.beginPath();
      ctx.ellipse(centerX, y, canvas.width * 0.35, 15, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Vertical grid lines (curved for cylinder effect)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle) * canvas.width * 0.35;
      const x2 = centerX + Math.cos(angle) * canvas.width * 0.35;
      
      ctx.beginPath();
      ctx.moveTo(x1, 50);
      ctx.lineTo(x2, canvas.height - 50);
      ctx.stroke();
    }

    // Draw candlesticks in 3D
    const candleWidth = (canvas.width * 0.7) / chartData.length;
    const maxPrice = Math.max(...chartData.map(d => d.high));
    const minPrice = Math.min(...chartData.map(d => d.low));
    const priceRange = maxPrice - minPrice;
    
    chartData.forEach((candle, index) => {
      const x = (canvas.width * 0.15) + (index * candleWidth);
      const depth3D = Math.sin((index / chartData.length) * Math.PI) * 20; // 3D depth effect
      
      // Calculate heights
      const openY = canvas.height - 50 - ((candle.open - minPrice) / priceRange) * (canvas.height - 100);
      const closeY = canvas.height - 50 - ((candle.close - minPrice) / priceRange) * (canvas.height - 100);
      const highY = canvas.height - 50 - ((candle.high - minPrice) / priceRange) * (canvas.height - 100);
      const lowY = canvas.height - 50 - ((candle.low - minPrice) / priceRange) * (canvas.height - 100);
      
      const isGreen = candle.close > candle.open;
      
      // Draw 3D shadow first
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x + depth3D, Math.min(openY, closeY) + depth3D, candleWidth * 0.8, Math.abs(closeY - openY));
      
      // Draw high-low line
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth * 0.4, highY);
      ctx.lineTo(x + candleWidth * 0.4, lowY);
      ctx.stroke();
      
      // Draw candle body with 3D effect
      const gradient = ctx.createLinearGradient(x, 0, x + candleWidth * 0.8, 0);
      if (isGreen) {
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.5, '#34d399');
        gradient.addColorStop(1, '#10b981');
      } else {
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(0.5, '#f87171');
        gradient.addColorStop(1, '#ef4444');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, Math.min(openY, closeY), candleWidth * 0.8, Math.abs(closeY - openY) || 2);
      
      // Add volume bars at bottom (smaller, translucent)
      const volumeHeight = (candle.volume / Math.max(...chartData.map(d => d.volume))) * 30;
      ctx.fillStyle = `rgba(${isGreen ? '16, 185, 129' : '239, 68, 68'}, 0.3)`;
      ctx.fillRect(x, canvas.height - 20, candleWidth * 0.8, -volumeHeight);
    });
    
    // Add glowing effect
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(centerX, canvas.height - 30, canvas.width * 0.35, 15, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }, [currentIndex, marketData]);

  const currentData = marketData[currentIndex];

  return (
    <div className="relative flex items-center justify-center min-h-[700px] bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main Cylindrical Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative"
        onMouseEnter={() => setIsRotating(false)}
        onMouseLeave={() => setIsRotating(true)}
      >
        {/* 3D Cylinder Structure */}
        <div className="relative w-96 h-[500px] mx-auto" style={{ perspective: '1000px' }}>
          {/* Cylinder Top Ellipse */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-80 h-12 bg-gradient-to-r from-slate-700/80 via-slate-600/60 to-slate-700/80 rounded-full shadow-2xl border border-slate-500/50 backdrop-blur-sm" 
               style={{ transform: 'translateX(-50%) rotateX(60deg)' }} />
          
          {/* Cylinder Bottom Ellipse */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-12 bg-gradient-to-r from-slate-800/90 via-slate-700/70 to-slate-800/90 rounded-full shadow-2xl border border-slate-600/50" 
               style={{ transform: 'translateX(-50%) rotateX(-60deg)' }} />
          
          {/* Main Cylinder Body */}
          <div className="absolute inset-x-8 top-6 bottom-6 bg-gradient-to-b from-slate-900/30 via-slate-800/10 to-slate-900/30 backdrop-blur-xl border-l border-r border-slate-600/20 shadow-2xl overflow-hidden">
            {/* Glass reflection effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/10 to-transparent" />
            
            {/* 3D Chart Canvas */}
            <canvas
              ref={canvasRef}
              width={300}
              height={400}
              className="absolute inset-0 w-full h-full opacity-60"
            />
            
            {/* Stock Information Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
              <AnimatePresence mode="wait">
                {currentData && (
                  <motion.div
                    key={currentData.symbol}
                    initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="text-center space-y-4 bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-600/30"
                  >
                    {/* Symbol */}
                    <div className="text-4xl font-bold text-white tracking-wider drop-shadow-lg">
                      {currentData.symbol}
                    </div>
                    
                    {/* Price */}
                    <div className="text-5xl font-bold text-blue-400 drop-shadow-lg">
                      ${currentData.price.toFixed(2)}
                    </div>
                    
                    {/* Change */}
                    <div className={`flex items-center justify-center space-x-2 text-xl font-semibold ${
                      currentData.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {currentData.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span>{currentData.change >= 0 ? '+' : ''}{currentData.change.toFixed(2)}</span>
                      <span>({currentData.changePercent >= 0 ? '+' : ''}{currentData.changePercent.toFixed(2)}%)</span>
                    </div>
                    
                    {/* Separator Line */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent" />
                    
                    {/* AI Prediction */}
                    <div className="pt-2">
                      <div className="flex items-center justify-center space-x-2 text-purple-400 mb-2">
                        <Brain className="w-4 h-4" />
                        <span className="text-sm font-medium">AI PREDICTION</span>
                      </div>
                      <div className={`text-2xl font-bold ${
                        currentData.prediction >= 0 ? 'text-green-400' : 'text-red-400'
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
            
            {/* Floating Data Points */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-400 rounded-full"
                  animate={{
                    y: [0, -120, 0],
                    x: [0, Math.sin(i * 0.8) * 30, 0],
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: i * 0.6
                  }}
                  style={{
                    left: `${15 + i * 10}%`,
                    top: '85%'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Navigation Dots */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {marketData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-400 shadow-lg shadow-blue-400/50 scale-125' 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Ambient Lighting Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/3 via-transparent to-transparent pointer-events-none" />
      
      {/* Side Action Icons */}
      <div className="absolute left-12 top-1/2 transform -translate-y-1/2 space-y-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 flex items-center justify-center backdrop-blur-sm"
        >
          <TrendingUp className="w-8 h-8 text-green-400" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 flex items-center justify-center backdrop-blur-sm"
        >
          <Brain className="w-8 h-8 text-purple-400" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm"
        >
          <BarChart3 className="w-8 h-8 text-blue-400" />
        </motion.div>
      </div>
      
      <div className="absolute right-12 top-1/2 transform -translate-y-1/2 space-y-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 flex items-center justify-center backdrop-blur-sm"
        >
          <Zap className="w-8 h-8 text-yellow-400" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 2 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 flex items-center justify-center backdrop-blur-sm"
        >
          <Target className="w-8 h-8 text-red-400" />
        </motion.div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600/50 rounded-lg px-6 py-3">
          <div className="text-slate-400 text-xs mb-1">TOTAL ASSETS</div>
          <div className="text-white font-bold text-lg">$24,567.89</div>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600/50 rounded-lg px-6 py-3">
          <div className="text-slate-400 text-xs mb-1">OPEN POSITIONS</div>
          <div className="text-white font-bold text-lg">8</div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DCylindricalDisplay;
