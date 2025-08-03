'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TruthBannerProps {
  className?: string;
}

const TruthBanner: React.FC<TruthBannerProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const trustMessages = [
    {
      icon: '🏆',
      title: 'COMPLETE TRANSPARENCY',
      message: 'See EXACTLY what our AI is thinking in real-time',
      detail: 'Every decision, every analysis, every pattern - nothing hidden from you',
      color: 'neon-blue'
    },
    {
      icon: '📊',
      title: 'HONEST PERFORMANCE',
      message: 'Real 2-3% daily returns - no inflated promises',
      detail: 'We show losses too. Real trading results, not marketing hype',
      color: 'neon-green'
    },
    {
      icon: '💰',
      title: '$300 MAXIMUM DEPOSIT',
      message: 'We limit deposits to prove we care about education',
      detail: 'Not about your money - about your learning and long-term success',
      color: 'neon-yellow'
    },
    {
      icon: '🛡️',
      title: 'TRUST OVER PROFIT',
      message: 'We could ask for more money - we choose not to',
      detail: 'Building trust and teaching real AI trading, not extracting maximum deposits',
      color: 'neon-purple'
    }
  ];

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trustMessages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = trustMessages[currentSlide];

  return (
    <div className={`${className}`}>
      {/* Main Banner */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm border border-neon-blue/30 rounded-lg overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 p-3 border-b border-neon-blue/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center"
              >
                <span className="text-white font-bold text-sm">AI</span>
              </motion.div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  🏆 WHY WE'RE DIFFERENT FROM OTHER TRADING APPS
                </h2>
                <p className="text-xs text-gray-300">
                  The only 100% transparent AI trading platform
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neon-blue hover:text-white text-sm px-3 py-1 rounded border border-neon-blue/30 hover:bg-neon-blue/10 transition-colors"
            >
              {isExpanded ? 'Hide' : 'Learn More'}
            </button>
          </div>
        </div>

        {/* Rotating Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-4"
            >
              <div className={`text-4xl`}>
                {currentMessage.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold text-${currentMessage.color} mb-1`}>
                  {currentMessage.title}
                </h3>
                <p className="text-white font-medium mb-1">
                  {currentMessage.message}
                </p>
                <p className="text-sm text-gray-400">
                  {currentMessage.detail}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Live indicator */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-neon-green rounded-full"
                />
                <span className="text-neon-green text-sm font-medium">LIVE</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-3">
            {trustMessages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-neon-blue' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-neon-blue/30 bg-gray-800/50"
            >
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {trustMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border border-${msg.color}/20 bg-${msg.color}/5`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{msg.icon}</span>
                      <h4 className={`font-bold text-${msg.color} text-sm`}>
                        {msg.title}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-300 mb-1">{msg.message}</p>
                    <p className="text-xs text-gray-400">{msg.detail}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Call to Action */}
              <div className="p-4 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border-t border-neon-blue/20">
                <div className="text-center">
                  <p className="text-white font-bold mb-2">
                    ✨ Experience True AI Trading Transparency
                  </p>
                  <p className="text-sm text-gray-300 mb-3">
                    Join the only platform that shows you EXACTLY what AI is thinking
                  </p>
                  <div className="flex justify-center space-x-4">
                    <div className="bg-green-500/20 border border-green-500/40 rounded px-3 py-1">
                      <span className="text-green-400 text-xs font-medium">✓ 100% Transparent</span>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500/40 rounded px-3 py-1">
                      <span className="text-blue-400 text-xs font-medium">✓ Honest Returns</span>
                    </div>
                    <div className="bg-yellow-500/20 border border-yellow-500/40 rounded px-3 py-1">
                      <span className="text-yellow-400 text-xs font-medium">✓ $300 Max Deposit</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TruthBanner;