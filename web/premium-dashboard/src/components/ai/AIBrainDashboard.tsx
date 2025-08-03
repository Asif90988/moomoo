'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { aiThoughtsService, type HumanReadableThought } from '@/services/ai-thoughts-translator';

interface NeuralData {
  consciousnessLevel: number;
  learningRate: number;
  processingSpeed: number;
  memoryUtilization: number;
  emotionalState: string;
  currentThought: string;
  confidenceLevel: number;
  networkActivity: number;
  decisionMatrix: Array<{
    option: string;
    probability: number;
    risk: number;
    reward: number;
  }>;
  neuralConnections: Array<{
    from: string;
    to: string;
    strength: number;
    active: boolean;
  }>;
}

const AIBrainDashboard: React.FC = () => {
  const [neuralData, setNeuralData] = useState<NeuralData>({
    consciousnessLevel: 0,
    learningRate: 0,
    processingSpeed: 0,
    memoryUtilization: 0,
    emotionalState: 'neutral',
    currentThought: 'Initializing neural pathways...',
    confidenceLevel: 0,
    networkActivity: 0,
    decisionMatrix: [],
    neuralConnections: []
  });

  const [matrixChars, setMatrixChars] = useState<string[]>([]);
  const [recentThoughts, setRecentThoughts] = useState<HumanReadableThought[]>([]);

  // Generate matrix rain characters
  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const matrixArray = Array.from({ length: 50 }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    );
    setMatrixChars(matrixArray);
  }, []);

  // Connect to real AI thoughts service
  useEffect(() => {
    aiThoughtsService.onThought((thought: HumanReadableThought) => {
      setRecentThoughts(prev => [...prev, thought].slice(-10)); // Keep last 10 thoughts
      
      // Update neural data based on real AI thoughts
      setNeuralData(prev => ({
        ...prev,
        consciousnessLevel: Math.min(100, prev.consciousnessLevel + 1),
        currentThought: thought.humanMessage,
        confidenceLevel: (thought.confidence || 0) * 100,
        emotionalState: mapThoughtTypeToEmotion(thought.type),
        networkActivity: Math.min(100, prev.networkActivity + 10),
        decisionMatrix: generateDecisionMatrix(thought),
        neuralConnections: generateNeuralConnections()
      }));
    });

    // Initialize neural data
    const initInterval = setInterval(() => {
      setNeuralData(prev => ({
        ...prev,
        consciousnessLevel: Math.min(100, prev.consciousnessLevel + Math.random() * 2),
        learningRate: Math.random() * 100,
        processingSpeed: 85 + Math.random() * 15,
        memoryUtilization: Math.random() * 100,
        networkActivity: Math.max(0, prev.networkActivity - Math.random() * 5)
      }));
    }, 2000);

    return () => clearInterval(initInterval);
  }, []);

  // Helper functions for mapping AI thoughts to neural data
  const mapThoughtTypeToEmotion = (type: string): string => {
    switch (type) {
      case 'analyzing': return 'analytical';
      case 'deciding': return 'focused';
      case 'executing': return 'confident';
      case 'learning': return 'learning';
      case 'monitoring': return 'curious';
      default: return 'focused';
    }
  };

  const generateDecisionMatrix = (thought: HumanReadableThought) => {
    const symbol = thought.symbol || 'MARKET';
    const confidence = (thought.confidence || 0.7) * 100;
    
    return [
      { 
        option: `BUY ${symbol}`, 
        probability: thought.type === 'deciding' && thought.humanMessage.includes('buy') ? confidence : Math.random() * 100, 
        risk: Math.random() * 50, 
        reward: Math.random() * 100 
      },
      { 
        option: `SELL ${symbol}`, 
        probability: thought.type === 'deciding' && thought.humanMessage.includes('sell') ? confidence : Math.random() * 100, 
        risk: Math.random() * 50, 
        reward: Math.random() * 100 
      },
      { 
        option: `HOLD ${symbol}`, 
        probability: thought.type === 'monitoring' ? confidence : Math.random() * 100, 
        risk: Math.random() * 30, 
        reward: Math.random() * 60 
      },
      { 
        option: `ANALYZE ${symbol}`, 
        probability: thought.type === 'analyzing' ? confidence : Math.random() * 100, 
        risk: Math.random() * 20, 
        reward: Math.random() * 80 
      }
    ];
  };

  const generateNeuralConnections = () => {
    return [
      { from: 'Market Data', to: 'Pattern Recognition', strength: Math.random() * 100, active: Math.random() > 0.3 },
      { from: 'Pattern Recognition', to: 'Decision Engine', strength: Math.random() * 100, active: Math.random() > 0.3 },
      { from: 'Decision Engine', to: 'Risk Assessment', strength: Math.random() * 100, active: Math.random() > 0.3 },
      { from: 'Risk Assessment', to: 'Execution Layer', strength: Math.random() * 100, active: Math.random() > 0.3 },
      { from: 'Learning Module', to: 'Strategy Core', strength: Math.random() * 100, active: Math.random() > 0.3 }
    ];
  };

  const getEmotionalColor = (emotion: string) => {
    switch (emotion) {
      case 'curious': return 'text-blue-400';
      case 'focused': return 'text-green-400';
      case 'analytical': return 'text-purple-400';
      case 'confident': return 'text-yellow-400';
      case 'learning': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full bg-neural-dark text-white relative overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {matrixChars.map((char, index) => (
          <motion.div
            key={index}
            initial={{ y: -50, opacity: 0 }}
            animate={{ 
              y: '100vh', 
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear'
            }}
            className="absolute text-neon-green text-sm font-mono"
            style={{
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 8 + 8}px`
            }}
          >
            {char}
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="relative z-10 p-6 h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-2">
            AI NEURAL CONSCIOUSNESS
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full"
            />
            <span className="text-neon-blue">SYSTEM ONLINE</span>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Column - Consciousness Metrics */}
          <div className="space-y-4">
            {/* Consciousness Level */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-lg border border-neon-blue/20 p-4"
            >
              <h3 className="text-lg font-bold text-neon-blue mb-3">Consciousness Level</h3>
              <div className="relative">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${neuralData.consciousnessLevel}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                  />
                </div>
                <span className="text-neon-blue font-bold text-lg">
                  {neuralData.consciousnessLevel.toFixed(1)}%
                </span>
              </div>
            </motion.div>

            {/* Current Thought */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-lg border border-neon-purple/20 p-4"
            >
              <h3 className="text-lg font-bold text-neon-purple mb-3">Current Thought</h3>
              <motion.p
                key={neuralData.currentThought}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-sm"
              >
                {neuralData.currentThought}
              </motion.p>
            </motion.div>

            {/* Emotional State */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-lg border border-neon-green/20 p-4"
            >
              <h3 className="text-lg font-bold text-neon-green mb-3">Emotional State</h3>
              <motion.div
                key={neuralData.emotionalState}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`text-2xl font-bold capitalize ${getEmotionalColor(neuralData.emotionalState)}`}
              >
                {neuralData.emotionalState}
              </motion.div>
            </motion.div>

            {/* System Metrics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-lg border border-neon-yellow/20 p-4"
            >
              <h3 className="text-lg font-bold text-neon-yellow mb-3">System Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Learning Rate</span>
                  <span className="text-neon-yellow">{neuralData.learningRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing Speed</span>
                  <span className="text-neon-yellow">{neuralData.processingSpeed.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Memory Usage</span>
                  <span className="text-neon-yellow">{neuralData.memoryUtilization.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network Activity</span>
                  <span className="text-neon-yellow">{neuralData.networkActivity.toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Center Column - Neural Network Visualization */}
          <div className="space-y-4">
            {/* Neural Pathways */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-lg border border-neon-cyan/20 p-4 h-64"
            >
              <h3 className="text-lg font-bold text-neon-cyan mb-3">Neural Pathways</h3>
              <div className="relative h-48">
                {/* Neural nodes */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-full h-full">
                    {/* Neural connections */}
                    {neuralData.neuralConnections.map((connection, index) => (
                      <motion.line
                        key={index}
                        x1={`${20 + (index % 2) * 60}%`}
                        y1={`${30 + index * 15}%`}
                        x2={`${60 + (index % 2) * 20}%`}
                        y2={`${50 + index * 10}%`}
                        stroke={connection.active ? '#10B981' : '#374151'}
                        strokeWidth="2"
                        opacity={connection.strength / 100}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    ))}
                    
                    {/* Neural nodes */}
                    {[1, 2, 3, 4, 5].map((node, index) => (
                      <motion.circle
                        key={node}
                        cx={`${20 + (index % 3) * 30}%`}
                        cy={`${30 + Math.floor(index / 3) * 40}%`}
                        r="8"
                        fill="#06B6D4"
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Confidence Level */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-lg border border-neon-pink/20 p-4"
            >
              <h3 className="text-lg font-bold text-neon-pink mb-3">AI Confidence</h3>
              <div className="relative">
                <div className="text-center">
                  <motion.div
                    key={neuralData.confidenceLevel}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-neon-pink"
                  >
                    {neuralData.confidenceLevel.toFixed(1)}%
                  </motion.div>
                </div>
                <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${neuralData.confidenceLevel}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-neon-pink to-neon-purple rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Decision Matrix & Recent Thoughts */}
          <div className="space-y-4">
            {/* Decision Matrix */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-lg border border-neon-orange/20 p-4 h-64"
            >
              <h3 className="text-lg font-bold text-neon-orange mb-3">Decision Matrix</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {neuralData.decisionMatrix.map((decision, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass border border-gray-600/20 rounded p-2"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white text-sm">{decision.option}</span>
                      <span className="text-neon-orange text-xs">
                        {decision.probability.toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Risk:</span>
                        <div className="h-1 bg-gray-700 rounded mt-1">
                          <div 
                            className="h-full bg-red-400 rounded"
                            style={{ width: `${decision.risk}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Reward:</span>
                        <div className="h-1 bg-gray-700 rounded mt-1">
                          <div 
                            className="h-full bg-green-400 rounded"
                            style={{ width: `${decision.reward}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent AI Thoughts Stream */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-lg border border-neon-purple/20 p-4 h-64"
            >
              <h3 className="text-lg font-bold text-neon-purple mb-3">Recent AI Thoughts</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentThoughts.slice(-5).reverse().map((thought, index) => (
                  <motion.div
                    key={thought.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass border border-purple-600/20 rounded p-2"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        thought.type === 'analyzing' ? 'bg-purple-500/20 text-purple-400' :
                        thought.type === 'deciding' ? 'bg-yellow-500/20 text-yellow-400' :
                        thought.type === 'executing' ? 'bg-green-500/20 text-green-400' :
                        thought.type === 'learning' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {thought.type.toUpperCase()}
                      </span>
                      {thought.symbol && (
                        <span className="text-xs bg-neon-blue/20 px-1 py-0.5 rounded text-neon-blue">
                          {thought.symbol}
                        </span>
                      )}
                      {thought.confidence && (
                        <span className="text-xs text-neon-purple font-bold">
                          {(thought.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-tight">
                      {thought.humanMessage.substring(0, 120)}
                      {thought.humanMessage.length > 120 ? '...' : ''}
                    </p>
                  </motion.div>
                ))}
                {recentThoughts.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Waiting for AI thoughts...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBrainDashboard;