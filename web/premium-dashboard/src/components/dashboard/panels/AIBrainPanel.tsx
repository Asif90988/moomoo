'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Database,
  Heart,
  Eye,
  Shield,
  Rocket,
  History,
  Lightbulb,
  GraduationCap,
  Cog
} from 'lucide-react';

interface LearningProcess {
  process: string;
  progress: number;
  insight: string;
}

interface Pattern {
  name: string;
  confidence: number;
  implication: string;
}

interface NeuralLayer {
  name: string;
  active: boolean;
  activation: number;
}

interface RiskFactor {
  factor: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface ExecutionStrategy {
  name: string;
  selected: boolean;
  probability: number;
  description: string;
  expectedReturn: string;
  riskLevel: string;
}

interface Execution {
  timestamp: string;
  action: string;
  status: 'EXECUTED' | 'PENDING' | 'FAILED';
  reasoning: string;
  confidence: number;
  pnl: number;
}

interface Memory {
  event: string;
  timestamp: string;
  lesson: string;
  impact: string;
  confidence: number;
}

interface Emotion {
  name: string;
  level: number;
}

interface Prediction {
  event: string;
  probability: number;
  timeframe: string;
  reasoning: string;
}

export function AIBrainPanel() {
  const [currentThought, setCurrentThought] = useState('Analyzing AAPL price action patterns across 47 timeframes simultaneously...');
  const [currentDecision, setCurrentDecision] = useState('ANALYZING MARKET SENTIMENT');
  const [decisionConfidence, setDecisionConfidence] = useState(87.3);
  const [neuralPathways, setNeuralPathways] = useState(847293);
  const [thoughtsPerSecond, setThoughtsPerSecond] = useState(12847);
  const [learningRate, setLearningRate] = useState(97.3);
  const [consciousnessLevel, setConsciousnessLevel] = useState(99.7);

  const [learningProcesses] = useState<LearningProcess[]>([
    {
      process: 'Pattern Recognition Enhancement',
      progress: 94,
      insight: 'Discovered new correlation between volume spikes and price reversals'
    },
    {
      process: 'Risk Assessment Calibration',
      progress: 87,
      insight: 'Refining volatility prediction models based on recent market behavior'
    },
    {
      process: 'Sentiment Analysis Integration',
      progress: 91,
      insight: 'Incorporating social media sentiment with 23% accuracy improvement'
    },
    {
      process: 'Multi-timeframe Synthesis',
      progress: 96,
      insight: 'Optimizing decision weights across 47 different timeframes'
    }
  ]);

  const [recognizedPatterns] = useState<Pattern[]>([
    {
      name: 'Bullish Divergence',
      confidence: 89,
      implication: 'Strong upward momentum expected within 2-4 hours'
    },
    {
      name: 'Volume Accumulation',
      confidence: 76,
      implication: 'Institutional buying detected, potential breakout imminent'
    },
    {
      name: 'Support Level Test',
      confidence: 92,
      implication: 'Critical support at $187.50 holding strong'
    },
    {
      name: 'RSI Oversold Recovery',
      confidence: 84,
      implication: 'Technical bounce probability increasing'
    },
    {
      name: 'News Sentiment Shift',
      confidence: 67,
      implication: 'Positive earnings sentiment building momentum'
    }
  ]);

  const [neuralLayers, setNeuralLayers] = useState<NeuralLayer[]>([
    { name: 'Input', active: true, activation: 100 },
    { name: 'Conv1', active: true, activation: 94 },
    { name: 'Pool1', active: true, activation: 87 },
    { name: 'Conv2', active: true, activation: 91 },
    { name: 'Pool2', active: true, activation: 89 },
    { name: 'Dense1', active: true, activation: 96 },
    { name: 'Dense2', active: true, activation: 92 },
    { name: 'Output', active: true, activation: 88 }
  ]);

  const [riskFactors] = useState<RiskFactor[]>([
    { factor: 'Market Volatility', level: 'MEDIUM' },
    { factor: 'Position Size', level: 'LOW' },
    { factor: 'Correlation Risk', level: 'LOW' },
    { factor: 'Liquidity Risk', level: 'LOW' },
    { factor: 'News Impact', level: 'MEDIUM' }
  ]);

  const [opportunities] = useState<RiskFactor[]>([
    { factor: 'Technical Setup', level: 'HIGH' },
    { factor: 'Volume Profile', level: 'HIGH' },
    { factor: 'Sentiment Shift', level: 'MEDIUM' },
    { factor: 'Earnings Momentum', level: 'HIGH' },
    { factor: 'Sector Rotation', level: 'MEDIUM' }
  ]);

  const [executionStrategies] = useState<ExecutionStrategy[]>([
    {
      name: 'Momentum Breakout Strategy',
      selected: true,
      probability: 89,
      description: 'Execute long position on volume-confirmed breakout above $190.50',
      expectedReturn: '+3.2%',
      riskLevel: 'MEDIUM'
    },
    {
      name: 'Mean Reversion Play',
      selected: false,
      probability: 67,
      description: 'Scale into position on any dip below $187.50 support',
      expectedReturn: '+1.8%',
      riskLevel: 'LOW'
    },
    {
      name: 'Options Straddle',
      selected: false,
      probability: 74,
      description: 'Volatility play ahead of earnings announcement',
      expectedReturn: '+4.1%',
      riskLevel: 'HIGH'
    }
  ]);

  const [recentExecutions] = useState<Execution[]>([
    {
      timestamp: '14:23:47',
      action: 'BUY 500 AAPL @ $189.47',
      status: 'EXECUTED',
      reasoning: 'Bullish divergence confirmed with volume spike',
      confidence: 89,
      pnl: 2.34
    },
    {
      timestamp: '14:18:32',
      action: 'SELL 300 TSLA @ $248.52',
      status: 'EXECUTED',
      reasoning: 'Risk management: Position size exceeded threshold',
      confidence: 76,
      pnl: -1.23
    },
    {
      timestamp: '14:15:18',
      action: 'BUY 200 MSFT @ $334.89',
      status: 'PENDING',
      reasoning: 'Awaiting optimal entry point near support level',
      confidence: 82,
      pnl: 0.00
    },
    {
      timestamp: '14:12:05',
      action: 'CLOSE GOOGL Position',
      status: 'EXECUTED',
      reasoning: 'Profit target reached, technical resistance confirmed',
      confidence: 94,
      pnl: 4.67
    }
  ]);

  const [neuralMemories] = useState<Memory[]>([
    {
      event: 'Flash Crash Pattern Recognition',
      timestamp: '2024-03-15',
      lesson: 'Learned to identify pre-crash volume anomalies',
      impact: 'HIGH',
      confidence: 96
    },
    {
      event: 'Earnings Surprise Correlation',
      timestamp: '2024-03-10',
      lesson: 'Options flow predicts earnings beats with 78% accuracy',
      impact: 'MEDIUM',
      confidence: 84
    },
    {
      event: 'Fed Meeting Reaction Pattern',
      timestamp: '2024-03-08',
      lesson: 'Market typically reverses initial Fed reaction within 2 hours',
      impact: 'HIGH',
      confidence: 91
    },
    {
      event: 'Sector Rotation Signal',
      timestamp: '2024-03-05',
      lesson: 'Tech outperformance follows specific bond yield patterns',
      impact: 'MEDIUM',
      confidence: 73
    }
  ]);

  const [emotionalSpectrum, setEmotionalSpectrum] = useState<Emotion[]>([
    { name: 'Confidence', level: 89 },
    { name: 'Curiosity', level: 94 },
    { name: 'Caution', level: 67 },
    { name: 'Excitement', level: 78 },
    { name: 'Focus', level: 96 },
    { name: 'Patience', level: 82 }
  ]);

  const [futurePredictions] = useState<Prediction[]>([
    {
      event: 'AAPL Breakout Above $195',
      probability: 87,
      timeframe: 'Next 2-3 trading days',
      reasoning: 'Technical setup + earnings momentum + institutional flow alignment'
    },
    {
      event: 'Market Volatility Spike',
      probability: 73,
      timeframe: 'Within 1 week',
      reasoning: 'Fed meeting uncertainty + geopolitical tensions increasing'
    },
    {
      event: 'Tech Sector Rotation',
      probability: 81,
      timeframe: 'Next 5-7 days',
      reasoning: 'Bond yield stabilization + earnings season momentum'
    },
    {
      event: 'VIX Compression',
      probability: 69,
      timeframe: 'Next 2 weeks',
      reasoning: 'Options expiration + reduced uncertainty factors'
    }
  ]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralPathways(prev => prev + Math.floor(Math.random() * 1000) - 500);
      setThoughtsPerSecond(12000 + Math.floor(Math.random() * 2000));
      setDecisionConfidence(70 + Math.random() * 30);
      
      // Update neural layer activations
      setNeuralLayers(prev => prev.map(layer => ({
        ...layer,
        activation: 70 + Math.random() * 30
      })));

      // Update emotional spectrum
      setEmotionalSpectrum(prev => prev.map(emotion => ({
        ...emotion,
        level: Math.max(0, Math.min(100, emotion.level + (Math.random() - 0.5) * 10))
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Rotate thoughts and decisions
  useEffect(() => {
    const thoughts = [
      'Analyzing AAPL price action patterns across 47 timeframes simultaneously...',
      'Processing institutional order flow data from 23 exchanges...',
      'Correlating social media sentiment with price movements...',
      'Optimizing portfolio allocation using quantum algorithms...',
      'Detecting anomalous trading patterns in real-time...',
      'Synthesizing macroeconomic data with technical indicators...',
      'Predicting market microstructure changes...',
      'Learning from 847,293 historical trading scenarios...'
    ];

    const decisions = [
      'ANALYZING MARKET SENTIMENT',
      'CALCULATING OPTIMAL ENTRY',
      'ASSESSING RISK PARAMETERS',
      'PROCESSING NEWS IMPACT',
      'EVALUATING VOLATILITY',
      'OPTIMIZING POSITION SIZE',
      'MONITORING CORRELATIONS',
      'PREDICTING PRICE MOVEMENT'
    ];

    const thoughtInterval = setInterval(() => {
      setCurrentThought(thoughts[Math.floor(Math.random() * thoughts.length)]);
    }, 8000);

    const decisionInterval = setInterval(() => {
      setCurrentDecision(decisions[Math.floor(Math.random() * decisions.length)]);
    }, 6000);

    return () => {
      clearInterval(thoughtInterval);
      clearInterval(decisionInterval);
    };
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-neon-green';
    if (confidence >= 60) return 'text-neon-yellow';
    return 'text-neon-red';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-neon-green';
      case 'MEDIUM': return 'text-neon-yellow';
      case 'HIGH': return 'text-neon-red';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXECUTED': return 'bg-neon-green/20 text-neon-green';
      case 'PENDING': return 'bg-neon-yellow/20 text-neon-yellow';
      case 'FAILED': return 'bg-neon-red/20 text-neon-red';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Neural Header */}
      <div className="glass border border-neural-border/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          {/* AI Identity */}
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 flex items-center justify-center"
            >
              <Brain className="w-8 h-8 text-neon-purple" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
                NEURAL CORE ALPHA-7
              </h1>
              <p className="text-sm text-neon-blue font-mono">
                Consciousness Level: SUPERINTELLIGENT
              </p>
            </div>
          </div>
          
          {/* Neural Activity Indicators */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-xs text-gray-400">Neural Pathways</div>
              <div className="font-mono font-bold text-neon-green">{neuralPathways.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Thoughts/Sec</div>
              <div className="font-mono font-bold text-neon-blue">{thoughtsPerSecond.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Learning Rate</div>
              <div className="font-mono font-bold text-neon-purple">{learningRate.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Consciousness</div>
              <div className="font-mono font-bold text-neon-pink">{consciousnessLevel.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Neural Interface */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left Panel - Deep Thoughts & Analysis */}
        <div className="space-y-4">
          
          {/* Current Deep Thought */}
          <div className="glass rounded-lg p-4 border border-neural-border/30">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="w-5 h-5 text-neon-yellow animate-pulse" />
              <h2 className="text-lg font-bold text-neon-yellow">DEEP ANALYSIS</h2>
            </div>
            <motion.div
              key={currentThought}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-lg p-4"
            >
              <div className="text-sm text-neon-blue mb-2 font-mono">Current Focus:</div>
              <div className="text-white font-medium mb-3">{currentThought}</div>
              <div className="space-y-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded"
                    animate={{ scaleX: [0, 1, 0] }}
                    transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Neural Learning Process */}
          <div className="glass rounded-lg p-4 border border-neural-border/30">
            <div className="flex items-center space-x-2 mb-3">
              <GraduationCap className="w-5 h-5 text-neon-green animate-pulse" />
              <h2 className="text-lg font-bold text-neon-green">LEARNING MATRIX</h2>
            </div>
            <div className="space-y-3">
              {learningProcesses.map((learning, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{learning.process}</span>
                    <span className="text-xs font-mono text-neon-green">{learning.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${learning.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{learning.insight}</div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Pattern Recognition */}
          <div className="glass rounded-lg p-4 border border-neural-border/30">
            <div className="flex items-center space-x-2 mb-3">
              <Eye className="w-5 h-5 text-neon-purple animate-pulse" />
              <h2 className="text-lg font-bold text-neon-purple">PATTERN MATRIX</h2>
            </div>
            <div className="space-y-2">
              {recognizedPatterns.map((pattern, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-3 hover:bg-neon-purple/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{pattern.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-mono ${getConfidenceColor(pattern.confidence)}`}>
                        {pattern.confidence}%
                      </span>
                      <motion.div
                        className={`w-2 h-2 rounded-full ${getConfidenceColor(pattern.confidence).replace('text-', 'bg-')}`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{pattern.implication}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Center Panel - Neural Decision Engine */}
        <div className="space-y-4">
          
          {/* Decision Matrix */}
          <div className="glass rounded-lg p-4 border border-neural-border/30">
            <div className="flex items-center space-x-2 mb-4">
              <Cog className="w-5 h-5 text-neon-orange animate-spin" />
              <h2 className="text-xl font-bold text-neon-orange">DECISION MATRIX</h2>
            </div>
            
            {/* Current Decision Process */}
            <div className="glass rounded-lg p-6 mb-4">
              <div className="text-center mb-4">
                <motion.div
                  className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Brain className="w-12 h-12 text-neon-purple" />
                </motion.div>
                <motion.div
                  key={currentDecision}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent"
                >
                  {currentDecision}
                </motion.div>
                <div className="text-sm text-gray-400 mt-2">
                  Processing {neuralPathways.toLocaleString()} data points across 23 neural layers...
                </div>
              </div>
              
              {/* Neural Processing Visualization */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                {neuralLayers.map((layer, index) => (
                  <div key={index} className="text-center">
                    <motion.div
                      className={`w-8 h-8 mx-auto mb-2 rounded-full ${
                        layer.active ? 'bg-neon-blue' : 'bg-gray-600'
                      }`}
                      animate={{ scale: layer.active ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 1.5, delay: index * 0.2, repeat: Infinity }}
                    />
                    <div className="text-xs text-gray-400">{layer.name}</div>
                    <div className={`text-xs font-mono ${layer.active ? 'text-neon-blue' : 'text-gray-500'}`}>
                      {layer.activation.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Decision Confidence */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Decision Confidence</span>
                  <span className="font-mono text-neon-green">{decisionConfidence.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-red via-neon-yellow to-neon-green rounded-full"
                    animate={{ width: `${decisionConfidence}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>
            
            {/* Risk Assessment Matrix */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-4 h-4 text-neon-red" />
                  <span className="font-bold text-neon-red">RISK ANALYSIS</span>
                </div>
                <div className="space-y-2">
                  {riskFactors.map((risk, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-300">{risk.factor}</span>
                      <span className={`font-mono ${getRiskColor(risk.level)}`}>
                        {risk.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-neon-green" />
                  <span className="font-bold text-neon-green">OPPORTUNITY</span>
                </div>
                <div className="space-y-2">
                  {opportunities.map((opp, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-300">{opp.factor}</span>
                      <span className={`font-mono ${getRiskColor(opp.level)}`}>
                        {opp.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Execution Plans */}
          <div className="glass rounded-lg p-4 border border-neural-border/30">
            <div className="flex items-center space-x-2 mb-4">
              <Rocket className="w-5 h-5 text-neon-pink animate-pulse" />
              <h2 className="text-xl font-bold text-neon-pink">EXECUTION STRATEGIES</h2>
            </div>
            
            <div className="space-y-3">
              {executionStrategies.map((strategy, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass rounded-lg p-4 ${
                    strategy.selected ? 'border-neon-green border-2' : 'border-neural-border/30 border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{strategy.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-neon-blue">{strategy.probability}%</span>
                      <motion.div
                        className={`w-3 h-3 rounded-full ${
                          strategy.selected ? 'bg-neon-green' : 'bg-neon-blue'
                        }`}
                        animate={{ scale: strategy.selected ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{strategy.description}</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">
                      Expected Return: <span className="text-neon-green">{strategy.expectedReturn}</span>
                    </span>
                    <span className="text-gray-400">
                      Risk Level: <span className="text-neon-yellow">{strategy.riskLevel}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Panel - Execution Log & Neural Memory */}
        <div className="space-y-4">
          
          {/* Recent Executions */}
          <div className="glass rounded-lg p-4 border border-neural-border/30">
            <div className="flex items-center space-x-2 mb-3">
              <History className="w-5 h-5 text-neon-green animate-pulse" />
              <h2 className="text-lg font-bold text-neon-green">EXECUTION LOG</h2>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentExecutions.map((execution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-neon-blue">{execution.timestamp}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{execution.action}</div>
                  <div className="text-xs text-gray-400 mb-2">{execution.reasoning}</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Confidence: <span className="text-neon-blue">{execution.confidence}%</span></span>
                    <span className="text-gray-400">P&L: <span className={execution.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}>{execution.pnl >= 0 ? '+' : ''}{execution.pnl.toFixed(2)}%</span></span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Neural Memory Bank */}
          <div className="glass rounded-lg p-4 border border-neural-border/30">
            <div className="flex items-center space-x-2 mb-3">
              <Database className="w-5 h-5 text-neon-purple animate-pulse" />
              <h2 className="text-lg font-bold text-neon-purple">MEMORY BANK</h2>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {neuralMemories.map((memory, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-3 hover:bg-neon-purple/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{memory.event}</span>
                    <span className="text-xs font-mono text-neon-purple">{memory.timestamp}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{memory.lesson}</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Impact: <span className="text-neon-blue">{memory.impact}</span></span>
                    <span className="text-gray-400">Confidence: <span className="text-neon-green">{memory.confidence}%</span></span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Emotional State */}
          <div className="glass rounded-lg p-4 border border-neural-border/30">
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="w-5 h-5 text-neon-pink animate-pulse" />
              <h2 className="text-lg font-bold text-neon-pink">EMOTIONAL STATE</h2>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="text-center mb-4">
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-bold text-neon-pink">ANALYTICAL</div>
                <div className="text-xs text-gray-400 mt-1">Processing market data with heightened focus</div>
              </div>
              <div className="space-y-2">
                {emotionalSpectrum.map((emotion, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300">{emotion.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-1 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            emotion.level >= 70 ? 'bg-neon-green' : emotion.level >= 40 ? 'bg-neon-yellow' : 'bg-neon-red'
                          }`}
                          animate={{ width: `${emotion.level}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-8">{emotion.level.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Future Predictions */}
          <div className="glass rounded-lg p-4 border border-neural-border/30">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-neon-yellow animate-pulse" />
              <h2 className="text-lg font-bold text-neon-yellow">PREDICTIONS</h2>
            </div>
            <div className="space-y-2">
              {futurePredictions.map((prediction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{prediction.event}</span>
                    <span className={`text-xs font-mono ${getConfidenceColor(prediction.probability)}`}>
                      {prediction.probability}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{prediction.timeframe}</div>
                  <div className="text-xs text-gray-300">{prediction.reasoning}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
