'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsight {
  id: string;
  type: 'neural' | 'prediction' | 'analysis' | 'learning';
  icon: string;
  title: string;
  value: string;
  description: string;
  confidence: number;
  color: string;
  bgGradient: string;
  borderColor: string;
  animated?: boolean;
}

interface RotatingTrustBannerProps {
  className?: string;
}

const RotatingTrustBanner: React.FC<RotatingTrustBannerProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [neuralActivity, setNeuralActivity] = useState(0);

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'neural',
      icon: '🧠',
      title: 'Neural Network Status',
      value: '847,293 Active Pathways',
      description: 'AI processing 12.4K market signals per second',
      confidence: 94,
      color: 'text-neon-blue',
      bgGradient: 'from-neon-blue/20 to-neon-purple/20',
      borderColor: 'border-neon-blue/40',
      animated: true
    },
    {
      id: '2',
      type: 'prediction',
      icon: '🔮',
      title: 'Market Prediction Engine',
      value: '73.2% Accuracy Rate',
      description: 'Next 4H: Bullish momentum expected (+2.1%)',
      confidence: 87,
      color: 'text-neon-green',
      bgGradient: 'from-neon-green/20 to-neon-mint/20',
      borderColor: 'border-neon-green/40',
      animated: false
    },
    {
      id: '3',
      type: 'analysis',
      icon: '📡',
      title: 'Real-Time Analysis',
      value: '156 Patterns Detected',
      description: 'Scanning 2,847 assets across 12 exchanges',
      confidence: 91,
      color: 'text-neon-yellow',
      bgGradient: 'from-neon-yellow/20 to-neon-orange/20',
      borderColor: 'border-neon-yellow/40',
      animated: false
    },
    {
      id: '4',
      type: 'learning',
      icon: '⚡',
      title: 'Adaptive Learning',
      value: '2.3M Data Points',
      description: 'AI evolving strategies from market feedback',
      confidence: 89,
      color: 'text-neon-purple',
      bgGradient: 'from-neon-purple/20 to-neon-lavender/20',
      borderColor: 'border-neon-purple/40',
      animated: true
    }
  ];

  // Auto-rotate slides every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % aiInsights.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [aiInsights.length]);

  // Neural activity animation
  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralActivity(Math.random() * 100);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const currentInsight = aiInsights[currentSlide];

  return (
    <div className={`${className}`}>
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`relative bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-md border rounded-lg overflow-hidden shadow-xl ${currentInsight.borderColor}`}
      >
        {/* Neural Activity Background */}
        {currentInsight.animated && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 bg-neon-blue/30 rounded-full"
                animate={{
                  x: [0, Math.random() * 200, 0],
                  y: [0, Math.random() * 50, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className={`relative bg-gradient-to-r ${currentInsight.bgGradient} p-4`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex items-center justify-between"
            >
              {/* Left Side - Icon and Info */}
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ 
                    rotate: currentInsight.animated ? [0, 360] : 0,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  className={`w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border ${currentInsight.borderColor} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-xl">{currentInsight.icon}</span>
                </motion.div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">
                    {currentInsight.title}
                  </h3>
                  <p className={`text-lg font-bold ${currentInsight.color}`}>
                    {currentInsight.value}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentInsight.description}
                  </p>
                </div>
              </div>

              {/* Right Side - Confidence Meter */}
              <div className="flex flex-col items-end space-y-2">
                <div className="text-right">
                  <span className="text-xs text-gray-400">Confidence</span>
                  <p className={`text-sm font-bold ${currentInsight.color}`}>
                    {currentInsight.confidence}%
                  </p>
                </div>
                
                {/* Confidence Bar */}
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentInsight.confidence}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${currentInsight.color.replace('text-', 'bg-')} rounded-full`}
                  />
                </div>

                {/* Live Indicator for Neural Activity */}
                {currentInsight.type === 'neural' && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex items-center space-x-1"
                  >
                    <div className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                    <span className="text-xs text-neon-green font-medium">LIVE</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Compact Slide Indicators */}
          <div className="flex justify-center space-x-1.5 mt-3">
            {aiInsights.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? `${currentInsight.color.replace('text-', 'bg-')} shadow-sm` 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Subtle Border Glow */}
        <motion.div
          className={`absolute inset-0 rounded-lg border ${currentInsight.borderColor} opacity-30`}
          animate={{ 
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
};

export default RotatingTrustBanner;
