'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { aiThoughtsService, type HumanReadableThought } from '@/services/ai-thoughts-translator';

interface AIThoughtsTickerProps {
  className?: string;
}

const AIThoughtsTicker: React.FC<AIThoughtsTickerProps> = ({ className = '' }) => {
  const [aiThoughts, setAIThoughts] = useState<HumanReadableThought[]>([]);

  // Connect to AI thoughts service
  useEffect(() => {
    aiThoughtsService.onThought((thought: HumanReadableThought) => {
      setAIThoughts(prev => [...prev, thought].slice(-8)); // Keep last 8 thoughts
    });
  }, []);

  const getThoughtColor = (type: string) => {
    switch (type) {
      case 'monitoring': return 'text-blue-400';
      case 'analyzing': return 'text-purple-400';
      case 'deciding': return 'text-yellow-400';
      case 'executing': return 'text-green-400';
      case 'learning': return 'text-cyan-400';
      case 'thinking': return 'text-yellow-300';
      case 'selling': return 'text-red-400';
      case 'buying': return 'text-green-300';
      case 'risk': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getThoughtBgColor = (type: string) => {
    switch (type) {
      case 'monitoring': return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)' };
      case 'analyzing': return { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)' };
      case 'deciding': return { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)' };
      case 'executing': return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' };
      case 'learning': return { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)' };
      case 'thinking': return { bg: 'rgba(252, 211, 77, 0.15)', border: 'rgba(252, 211, 77, 0.4)' };
      case 'selling': return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' };
      case 'buying': return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)' };
      case 'risk': return { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)' };
      default: return { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)' };
    }
  };

  return (
    <div className={`${className}`}>
      {/* AI THOUGHTS TICKER - Matches other ticker styles */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-neural-panel/95 to-neural-surface/95 backdrop-blur-md border-b border-neon-lavender/30"
        style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }}
      >
        {/* Header - Left aligned, smaller, smarter */}
        <div className="bg-gradient-to-r from-neon-purple/10 to-neon-lavender/10 px-4 py-0.5 border-b border-neon-lavender/20">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center"
            >
              <span className="text-white text-xs">🧠</span>
            </motion.div>
            <span className="text-neon-lavender font-bold text-sm tracking-wide">
              🚨 LIVE AI THOUGHTS
            </span>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-red-400 rounded-full"
            />
            <span className="text-red-400 font-bold text-xs">LIVE</span>
          </div>
        </div>

        {/* Scrolling ticker content - Single line, very compact with smaller fonts */}
        <div className="relative h-6 overflow-hidden">
          <div className="h-full flex items-center">
            <motion.div
              key={aiThoughts.length}
              animate={{ x: '-100%' }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="flex items-center space-x-6 whitespace-nowrap"
              style={{ x: '100vw' }}
            >
              {aiThoughts.map((thought, index) => (
                <motion.div
                  key={thought.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-1 rounded px-2 py-0.5 border flex-shrink-0"
                  style={{ 
                    backgroundColor: getThoughtBgColor(thought.type).bg,
                    borderColor: getThoughtBgColor(thought.type).border
                  }}
                >
                  {/* Pulsing indicator */}
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-neon-purple rounded-full"
                  />
                  
                  {/* Compact thought content */}
                  <span className="text-xs bg-neon-purple/30 px-1 py-0.5 rounded text-neon-lavender font-medium">
                    {thought.type.toUpperCase()}
                  </span>
                  {thought.symbol && (
                    <span className="text-xs bg-neon-blue/30 px-1 py-0.5 rounded text-neon-blue font-medium">
                      {thought.symbol}
                    </span>
                  )}
                  <span className={`text-xs font-medium ${getThoughtColor(thought.type)} max-w-48 truncate`}>
                    {thought.humanMessage}
                  </span>
                  
                  {/* Confidence indicator */}
                  {thought.confidence && (
                    <span className="text-neon-lavender font-bold text-xs bg-neon-purple/20 px-1 py-0.5 rounded">
                      {(thought.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIThoughtsTicker;
