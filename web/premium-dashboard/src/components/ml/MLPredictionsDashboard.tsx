// Neural Core Alpha-7 - ML Predictions Dashboard Component
// Displays IPCA factor model predictions with advanced visualizations

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, AlertCircle, Brain, Target, Zap, BarChart3 } from 'lucide-react';

interface MLPrediction {
  symbol: string;
  expectedReturn: number;
  confidence: number;
  riskScore: number;
  timeHorizon: string;
  timestamp: string;
  factorExposures?: number[];
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

interface MLMetadata {
  modelType: string;
  totalSymbols: number;
  filteredCount: number;
  averageConfidence: number;
  timestamp: string;
  performanceMetrics: {
    sharpeRatio: number;
    informationRatio: number;
    maxDrawdown: number;
    hitRate: number;
    avgAccuracy: number;
  } | null;
}

interface PredictionResponse {
  predictions: MLPrediction[];
  metadata: MLMetadata;
}

const MLPredictionsDashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [metadata, setMetadata] = useState<MLMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState<'1h' | '4h' | '1d' | '1w'>('1d');
  const [minConfidence, setMinConfidence] = useState(0.1);
  const [showFactorAnalysis, setShowFactorAnalysis] = useState(false);

  // Sample symbols for demo
  const watchlistSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX', 'AMD', 'SPY'];

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ml/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: watchlistSymbols,
          timeHorizon: selectedTimeHorizon,
          includeFactorAnalysis: showFactorAnalysis,
          minConfidence
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PredictionResponse = await response.json();
      setPredictions(data.predictions);
      setMetadata(data.metadata);

    } catch (err) {
      console.error('Failed to fetch ML predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  }, [selectedTimeHorizon, minConfidence, showFactorAnalysis]);

  useEffect(() => {
    fetchPredictions();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPredictions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPredictions]);

  const getPredictionColor = (prediction: MLPrediction) => {
    if (prediction.recommendation === 'BUY') {
      return prediction.strength === 'STRONG' ? 'text-green-400' : 'text-green-300';
    } else if (prediction.recommendation === 'SELL') {
      return prediction.strength === 'STRONG' ? 'text-red-400' : 'text-red-300';
    }
    return 'text-gray-400';
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return <TrendingUp className="w-4 h-4" />;
      case 'SELL': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

  if (loading && predictions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="text-lg font-medium text-slate-300">Training IPCA Factor Model...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 backdrop-blur-xl border border-red-700/50 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-red-300">ML Prediction Error</h3>
        </div>
        <p className="text-red-200 mb-4">{error}</p>
        <button
          onClick={fetchPredictions}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">IPCA Factor Model</h2>
              <p className="text-slate-400">Revolutionary time-varying factor predictions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchPredictions}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Time Horizon</label>
            <select
              value={selectedTimeHorizon}
              onChange={(e) => setSelectedTimeHorizon(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Min Confidence</label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-slate-400">{(minConfidence * 100).toFixed(0)}%</span>
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2 text-slate-300">
              <input
                type="checkbox"
                checked={showFactorAnalysis}
                onChange={(e) => setShowFactorAnalysis(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Show Factor Analysis</span>
            </label>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-400">Last Update</div>
            <div className="text-white font-mono text-xs">
              {metadata?.timestamp ? new Date(metadata.timestamp).toLocaleTimeString() : '--:--:--'}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {metadata?.performanceMetrics && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Model Performance</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {metadata.performanceMetrics.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Sharpe Ratio</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {formatPercentage(metadata.performanceMetrics.hitRate)}
              </div>
              <div className="text-sm text-slate-400">Hit Rate</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {formatPercentage(metadata.performanceMetrics.avgAccuracy)}
              </div>
              <div className="text-sm text-slate-400">Avg Accuracy</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {metadata.performanceMetrics.informationRatio.toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Info Ratio</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">
                {formatPercentage(metadata.performanceMetrics.maxDrawdown)}
              </div>
              <div className="text-sm text-slate-400">Max Drawdown</div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Grid */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Target className="w-6 h-6 text-blue-400" />
            <span>ML Predictions ({predictions.length})</span>
          </h3>
          
          <div className="text-sm text-slate-400">
            Avg Confidence: {metadata ? formatPercentage(metadata.averageConfidence) : '--'}
          </div>
        </div>

        <div className="grid gap-4">
          <AnimatePresence>
            {predictions.map((prediction, index) => (
              <motion.div
                key={prediction.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className={`${getPredictionColor(prediction)} flex items-center space-x-1`}>
                        {getRecommendationIcon(prediction.recommendation)}
                        <span className="font-bold text-lg">{prediction.symbol}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prediction.strength === 'STRONG' ? 'bg-blue-600 text-white' :
                        prediction.strength === 'MODERATE' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {prediction.strength}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        prediction.expectedReturn > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPercentage(prediction.expectedReturn)}
                      </div>
                      <div className="text-sm text-slate-400">Expected Return</div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">
                        {formatPercentage(prediction.confidence)}
                      </div>
                      <div className="text-sm text-slate-400">Confidence</div>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        prediction.riskScore > 7 ? 'text-red-400' :
                        prediction.riskScore > 4 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {prediction.riskScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-slate-400">Risk Score</div>
                    </div>
                  </div>
                </div>

                {/* Factor Exposures */}
                {showFactorAnalysis && prediction.factorExposures && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="text-sm text-slate-400 mb-2">Factor Exposures:</div>
                    <div className="flex space-x-4">
                      {prediction.factorExposures.slice(0, 5).map((exposure, i) => (
                        <div key={i} className="text-center">
                          <div className={`text-lg font-bold ${
                            Math.abs(exposure) > 0.5 ? 'text-yellow-400' : 'text-slate-400'
                          }`}>
                            {exposure.toFixed(3)}
                          </div>
                          <div className="text-xs text-slate-500">F{i + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {predictions.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <div className="text-xl font-medium text-slate-400 mb-2">No Predictions Available</div>
            <div className="text-slate-500">Try adjusting the confidence threshold or time horizon</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLPredictionsDashboard;
