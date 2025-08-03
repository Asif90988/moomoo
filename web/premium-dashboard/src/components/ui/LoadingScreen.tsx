'use client';

import { motion } from 'framer-motion';
import { Brain, Activity } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-neural-dark flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 neural-grid opacity-20" />
      <div className="absolute inset-0 holographic opacity-10" />
      
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Neural Core Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 relative"
          >
            <Brain className="w-20 h-20 text-neon-blue" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-neon-green rounded-full flex items-center justify-center"
            >
              <Activity className="w-4 h-4 text-neural-dark" />
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green bg-clip-text text-transparent mb-2">
            NEURAL CORE ALPHA-7
          </h1>
          <p className="text-lg text-gray-400">Advanced AI Trading System</p>
        </motion.div>
        
        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col items-center space-y-4"
        >
          {/* Neural Network Animation */}
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                className="w-1.5 h-8 bg-gradient-to-t from-neon-blue to-neon-green rounded-full"
              />
            ))}
          </div>
          
          {/* Loading Text */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-neon-blue font-medium text-lg"
          >
            Initializing Neural Networks...
          </motion.div>
          
          {/* Progress Steps */}
          <div className="space-y-2 text-sm text-gray-400 min-w-64">
            <LoadingStep text="Connecting to Moomoo API..." delay={0} />
            <LoadingStep text="Loading market data..." delay={1} />
            <LoadingStep text="Initializing AI engine..." delay={2} />
            <LoadingStep text="Calibrating risk parameters..." delay={3} />
            <LoadingStep text="Starting neural processing..." delay={4} />
          </div>
        </motion.div>
        
        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-xs text-gray-500 text-center"
        >
          <div>Neural Core Alpha-7 v1.0.0</div>
          <div>Institutional Grade AI Trading Platform</div>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingStep({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.5 }}
      className="flex items-center space-x-2"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-3 h-3 border border-neon-blue border-t-transparent rounded-full"
      />
      <span>{text}</span>
    </motion.div>
  );
}