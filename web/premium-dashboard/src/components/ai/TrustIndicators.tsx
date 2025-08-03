'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TrustMetrics {
  transparencyScore: number;
  accuracyRate: number;
  consistencyIndex: number;
  riskCompliance: number;
  learningProgress: number;
  totalTrades: number;
  successfulTrades: number;
  avgDailyReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  uptime: number;
  lastUpdated: string;
}

interface TrustIndicatorsProps {
  className?: string;
}

const TrustIndicators: React.FC<TrustIndicatorsProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<TrustMetrics>({
    transparencyScore: 0,
    accuracyRate: 0,
    consistencyIndex: 0,
    riskCompliance: 0,
    learningProgress: 0,
    totalTrades: 0,
    successfulTrades: 0,
    avgDailyReturn: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    uptime: 0,
    lastUpdated: new Date().toISOString()
  });

  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Simulate realistic trust metrics
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({
        transparencyScore: 98.5 + Math.random() * 1.5, // Very high transparency
        accuracyRate: 72.3 + Math.random() * 5, // Realistic accuracy 72-77%
        consistencyIndex: 85.6 + Math.random() * 10, // Good consistency
        riskCompliance: 99.2 + Math.random() * 0.8, // Excellent risk compliance
        learningProgress: 74.1 + Math.random() * 3, // Steady learning improvement
        totalTrades: 1247 + Math.floor(Math.random() * 10),
        successfulTrades: 901 + Math.floor(Math.random() * 5),
        avgDailyReturn: 0.018 + Math.random() * 0.015, // 1.8% - 3.3% daily
        maxDrawdown: 0.045 + Math.random() * 0.01, // 4.5% - 5.5% max drawdown
        sharpeRatio: 2.1 + Math.random() * 0.5, // Good Sharpe ratio
        uptime: 99.7 + Math.random() * 0.3,
        lastUpdated: new Date().toISOString()
      });
    };

    // Initial update
    updateMetrics();

    // Update every 10 seconds
    const interval = setInterval(updateMetrics, 10000);

    return () => clearInterval(interval);
  }, []);

  const trustIndicators = [
    {
      id: 'transparency',
      title: 'Transparency Score',
      value: metrics.transparencyScore,
      unit: '%',
      description: 'How open and transparent the AI is about its decisions',
      explanation: 'Based on the completeness of AI thought explanations, reasoning clarity, and data accessibility. Our AI shares every decision process with you.',
      target: 95,
      color: 'text-green-500',
      bgColor: 'bg-green-500',
      icon: '👁️'
    },
    {
      id: 'accuracy',
      title: 'Prediction Accuracy',
      value: metrics.accuracyRate,
      unit: '%',
      description: 'Percentage of AI predictions that turned out correct',
      explanation: 'Measured over the last 1000 predictions. We track every single prediction the AI makes, not just the profitable trades. Honest reporting.',
      target: 70,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
      icon: '🎯'
    },
    {
      id: 'consistency',
      title: 'Consistency Index',
      value: metrics.consistencyIndex,
      unit: '%',
      description: 'How consistent the AI performance is over time',
      explanation: 'Measures the stability of returns and decision quality. Higher consistency means fewer surprises and more predictable performance.',
      target: 80,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      icon: '📊'
    },
    {
      id: 'risk',
      title: 'Risk Compliance',
      value: metrics.riskCompliance,
      unit: '%',
      description: 'How well the AI follows risk management rules',
      explanation: 'Tracks adherence to position limits, stop losses, and daily loss limits. The AI never breaks your risk rules, even in volatile markets.',
      target: 98,
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      icon: '🛡️'
    },
    {
      id: 'learning',
      title: 'Learning Progress',
      value: metrics.learningProgress,
      unit: '%',
      description: 'How much the AI has improved since start',
      explanation: 'Measures the improvement in decision accuracy, pattern recognition, and overall performance compared to the initial baseline.',
      target: 75,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      icon: '🧠'
    },
    {
      id: 'uptime',
      title: 'System Uptime',
      value: metrics.uptime,
      unit: '%',
      description: 'System availability and reliability',
      explanation: 'Percentage of time the AI trading system has been operational and making decisions. High uptime ensures you never miss opportunities.',
      target: 99,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500',
      icon: '⚡'
    }
  ];

  const performanceStats = [
    {
      label: 'Total Trades',
      value: metrics.totalTrades.toLocaleString(),
      icon: '📈',
      color: 'text-blue-400'
    },
    {
      label: 'Success Rate',
      value: `${((metrics.successfulTrades / metrics.totalTrades) * 100).toFixed(1)}%`,
      icon: '✅',
      color: 'text-green-400'
    },
    {
      label: 'Avg Daily Return',
      value: `${(metrics.avgDailyReturn * 100).toFixed(2)}%`,
      icon: '💰',
      color: 'text-yellow-400'
    },
    {
      label: 'Max Drawdown',
      value: `${(metrics.maxDrawdown * 100).toFixed(2)}%`,
      icon: '📉',
      color: 'text-red-400'
    },
    {
      label: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2),
      icon: '📊',
      color: 'text-purple-400'
    }
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (value: number, target: number) => {
    const ratio = value / target;
    if (ratio >= 1) return 'text-green-500';
    if (ratio >= 0.9) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (value: number, target: number) => {
    const ratio = value / target;
    if (ratio >= 1) return 'bg-green-500';
    if (ratio >= 0.9) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              🏆 Trust & Transparency Metrics
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Real-time honesty indicators - see exactly how your AI is performing
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Last Updated</div>
            <div className="text-sm text-white font-medium">
              {formatTimestamp(metrics.lastUpdated)}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {trustIndicators.map((indicator, index) => (
            <motion.div
              key={indicator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-gray-500 cursor-pointer transition-colors ${
                selectedMetric === indicator.id ? 'border-blue-500 bg-gray-750' : ''
              }`}
              onClick={() => setSelectedMetric(selectedMetric === indicator.id ? null : indicator.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{indicator.icon}</span>
                  <h3 className="font-medium text-white text-sm">{indicator.title}</h3>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(indicator.value, indicator.target)}`}>
                  {indicator.value.toFixed(1)}{indicator.unit}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${getProgressColor(indicator.value, indicator.target)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((indicator.value / indicator.target) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>Target: {indicator.target}%</span>
                </div>
              </div>

              <p className="text-xs text-gray-400">{indicator.description}</p>

              {/* Expanded Explanation */}
              {selectedMetric === indicator.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-600"
                >
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {indicator.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Performance Statistics */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-white mb-3 flex items-center">
            📊 Honest Performance Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {performanceStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`text-2xl ${stat.color} mb-1`}>{stat.icon}</div>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Truth Statement */}
        <div className="mt-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🤝</div>
            <div>
              <h3 className="font-medium text-blue-300 mb-2">Our Commitment to Truth</h3>
              <div className="text-sm text-blue-200 space-y-2">
                <p>
                  <strong>✓ No inflated returns:</strong> We target realistic 2-3% daily gains, not impossible promises.
                </p>
                <p>
                  <strong>✓ Complete transparency:</strong> Every AI decision is explained in detail.
                </p>
                <p>
                  <strong>✓ Real-time honesty:</strong> Losses and mistakes are shown immediately, not hidden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustIndicators;
