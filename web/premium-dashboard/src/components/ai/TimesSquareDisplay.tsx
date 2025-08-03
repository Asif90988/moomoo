'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiThoughtsService, type HumanReadableThought } from '@/services/ai-thoughts-translator';

interface TimesSquareDisplayProps {
  className?: string;
}

const TimesSquareDisplay: React.FC<TimesSquareDisplayProps> = ({ className = '' }) => {
  const [currentThought, setCurrentThought] = useState<HumanReadableThought | null>(null);
  const [allThoughts, setAllThoughts] = useState<HumanReadableThought[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Connect to AI thoughts and build round-robin queue
  useEffect(() => {
    aiThoughtsService.onThought((thought: HumanReadableThought) => {
      setAllThoughts(prev => {
        const updated = [...prev, thought];
        return updated.slice(-20); // Keep last 20 thoughts for round-robin
      });
    });
  }, []);

  // Round-robin display - cycle through thoughts every 5 seconds
  useEffect(() => {
    if (allThoughts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % allThoughts.length;
        setCurrentThought(allThoughts[nextIndex]);
        return nextIndex;
      });
    }, 5000); // Show each thought for 5 seconds

    // Set initial thought
    if (allThoughts.length > 0 && !currentThought) {
      setCurrentThought(allThoughts[0]);
    }

    return () => clearInterval(interval);
  }, [allThoughts, currentThought]);

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

  const getThoughtIcon = (type: string) => {
    switch (type) {
      case 'monitoring': return '👁️';
      case 'analyzing': return '🧮';
      case 'deciding': return '🤔';
      case 'executing': return '✅';
      case 'learning': return '🧠';
      default: return '🤖';
    }
  };

  if (!currentThought) {
    return (
      <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
        <div className="bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-md border-b-2 border-purple-400/50 shadow-2xl">
          <div className="h-20 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center mr-4"
            >
              <span className="text-white">🧠</span>
            </motion.div>
            <span className="text-purple-200 font-bold text-lg">
              Connecting to AI Thoughts...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* AI LIVE THOUGHTS - Times Square Round-Robin Display */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-md border-b-2 border-purple-400/50 shadow-2xl"
      >
        {/* Attention-grabbing header */}
        <motion.div 
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 px-4 py-2 border-b border-purple-400/30"
        >
          <div className="flex items-center justify-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center"
            >
              <span className="text-white text-xs">🧠</span>
            </motion.div>
            <motion.span 
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-purple-200 font-bold text-lg tracking-wide"
            >
              🚨 LIVE AI THOUGHTS - ROUND ROBIN DISPLAY 🚨
            </motion.span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"
            />
            <span className="text-red-400 font-bold text-sm">LIVE</span>
          </div>
          
          {/* Thought counter */}
          <div className="text-center mt-1">
            <span className="text-xs text-purple-300">
              Thought {currentIndex + 1} of {allThoughts.length} • Next in 5s
            </span>
          </div>
        </motion.div>

        {/* Main thought display - Full width like Times Square */}
        <div className="relative h-24 overflow-hidden">
          {/* Animated background effects */}
          <motion.div
            animate={{ 
              background: [
                'linear-gradient(90deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0"
          />
          
          {/* Current thought display */}
          <div className="h-full flex items-center justify-center px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentThought.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex items-center space-x-6 bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-xl px-8 py-4 border-2 border-purple-400/40 shadow-2xl shadow-purple-500/20 max-w-6xl"
              >
                {/* Thought type icon */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  {getThoughtIcon(currentThought.type)}
                </motion.div>
                
                {/* Thought content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs bg-purple-500/30 px-2 py-1 rounded text-purple-300 font-medium">
                      {currentThought.type.toUpperCase()}
                    </span>
                    {currentThought.symbol && (
                      <span className="text-xs bg-blue-500/30 px-2 py-1 rounded text-blue-300 font-medium">
                        {currentThought.symbol}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(currentThought.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {/* Main message - Large and readable */}
                  <motion.p 
                    animate={{ opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`text-xl font-bold leading-relaxed ${getThoughtColor(currentThought.type)}`}
                  >
                    {currentThought.humanMessage}
                  </motion.p>
                </div>
                
                {/* Confidence indicator */}
                {currentThought.confidence && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex flex-col items-center"
                  >
                    <div className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 px-4 py-2 rounded-full border border-purple-400/50">
                      <span className="text-purple-200 font-bold text-lg">
                        {(currentThought.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">Confidence</span>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar showing time until next thought */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <motion.div
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimesSquareDisplay;