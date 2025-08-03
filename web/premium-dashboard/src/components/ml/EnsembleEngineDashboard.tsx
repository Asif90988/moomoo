// Neural Core Alpha-7 - Ensemble Engine Dashboard
// Shows the 7-model ensemble prediction system

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, BarChart3, TrendingUp, Activity, AlertCircle, Target, Brain } from 'lucide-react';

interface ModelPrediction {
  modelName: string;
  prediction: number;
  confidence: number;
  weight: number;
  executionTime: number;
  status: 'active' | 'training' | 'error';
}

interface EnsembleMetrics {
  modelCount: number;
  activeModels: string[];
  avgAccuracy: number;
  bestModel: string;
  worstModel: string;
  consensusStrength: number;
  disagreementIndex: number;
}

const EnsembleEngineDashboard: React.FC = () => {
  const [modelPredictions, setModelPredictions] = useState<ModelPrediction[]>([]);
  const [ensembleMetrics, setEnsembleMetrics] = useState<EnsembleMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  // Mock model data
  const models = [
    { name: 'XGBoost_Predictor', type: 'Gradient Boosting', weight: 0.25, color: 'neon-blue' },
    { name: 'LSTM_TimeSeriesPredictor', type: 'Deep Learning', weight: 0.20, color: 'neon-green' },
    { name: 'Transformer_AttentionPredictor', type: 'Attention Mechanism', weight: 0.20, color: 'neon-purple' },
    { name: 'RandomForest_EnsemblePredictor', type: 'Bootstrap Aggregation', weight: 0.15, color: 'neon-yellow' },
    { name: 'SVM_KernelPredictor', type: 'Support Vector Machine', weight: 0.10, color: 'neon-cyan' },
    { name: 'LinearRegression_BaselinePredictor', type: 'Linear Model', weight: 0.05, color: 'neon-orange' },
    { name: 'NeuralNetwork_DeepPredictor', type: 'Multi-layer Perceptron', weight: 0.05, color: 'neon-pink' }
  ];

  const watchlistSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX'];

  useEffect(() => {
    generateMockData();
    const interval = setInterval(generateMockData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const generateMockData = () => {
    // Generate mock model predictions
    const predictions: ModelPrediction[] = models.map(model => ({
      modelName: model.name,
      prediction: (Math.random() - 0.5) * 0.08, // -4% to +4%
      confidence: 0.6 + Math.random() * 0.35, // 60-95%
      weight: model.weight,
      executionTime: 50 + Math.random() * 200, // 50-250ms
      status: Math.random() > 0.95 ? 'error' : Math.random() > 0.9 ? 'training' : 'active'
    }));

    setModelPredictions(predictions);

    // Generate ensemble metrics
    const activeModels = predictions.filter(p => p.status === 'active');
    const avgPrediction = activeModels.reduce((sum, p) => sum + p.prediction, 0) / activeModels.length;
    const variance = activeModels.reduce((sum, p) => sum + Math.pow(p.prediction - avgPrediction, 2), 0) / activeModels.length;
    
    setEnsembleMetrics({
      modelCount: models.length,
      activeModels: activeModels.map(m => m.modelName),
      avgAccuracy: 0.72 + Math.random() * 0.15, // 72-87%
      bestModel: activeModels.sort((a, b) => b.confidence - a.confidence)[0]?.modelName || 'XGBoost_Predictor',
      worstModel: activeModels.sort((a, b) => a.confidence - b.confidence)[0]?.modelName || 'LinearRegression_BaselinePredictor',
      consensusStrength: Math.max(0, 1 - Math.sqrt(variance) * 10), // 0-1 scale
      disagreementIndex: Math.min(1, Math.sqrt(variance) * 10) // 0-1 scale
    });
  };

  const getEnsemblePrediction = () => {
    const activeModels = modelPredictions.filter(p => p.status === 'active');
    if (activeModels.length === 0) return 0;

    return activeModels.reduce((sum, model) => sum + model.prediction * model.weight, 0) / 
           activeModels.reduce((sum, model) => sum + model.weight, 0);
  };

  const getEnsembleConfidence = () => {
    const activeModels = modelPredictions.filter(p => p.status === 'active');
    if (activeModels.length === 0) return 0;

    return activeModels.reduce((sum, model) => sum + model.confidence * model.weight, 0) / 
           activeModels.reduce((sum, model) => sum + model.weight, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-neon-green';
      case 'training': return 'text-neon-yellow';
      case 'error': return 'text-neon-red';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'training': return '🔄';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const ensemblePrediction = getEnsemblePrediction();
  const ensembleConfidence = getEnsembleConfidence();

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/30 backdrop-blur-xl border border-yellow-500/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Ensemble Prediction Engine</h2>
              <p className="text-slate-400">7-Model AI Ensemble with Weighted Voting</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {watchlistSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ensemble Result */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {(ensemblePrediction * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-slate-400">Ensemble Prediction</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {(ensembleConfidence * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">Consensus Confidence</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {ensembleMetrics?.consensusStrength ? (ensembleMetrics.consensusStrength * 100).toFixed(0) : '--'}%
            </div>
            <div className="text-sm text-slate-400">Model Agreement</div>
          </div>
        </div>
      </div>

      {/* Model Performance Overview */}
      {ensembleMetrics && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Ensemble Performance</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {ensembleMetrics.activeModels.length}/{ensembleMetrics.modelCount}
              </div>
              <div className="text-sm text-slate-400">Active Models</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {(ensembleMetrics.avgAccuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Avg Accuracy</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {ensembleMetrics.bestModel.split('_')[0]}
              </div>
              <div className="text-sm text-slate-400">Best Model</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">
                {(ensembleMetrics.disagreementIndex * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-400">Disagreement</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">
                {Math.floor(modelPredictions.reduce((sum, m) => sum + m.executionTime, 0) / modelPredictions.length) || 0}ms
              </div>
              <div className="text-sm text-slate-400">Avg Latency</div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Model Predictions */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Target className="w-6 h-6 text-blue-400" />
          <span>Individual Model Predictions</span>
        </h3>

        <div className="grid gap-4">
          {modelPredictions.map((model, index) => {
            const modelInfo = models.find(m => m.name === model.modelName);
            return (
              <motion.div
                key={model.modelName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getStatusIcon(model.status)}</span>
                      <div>
                        <div className="font-bold text-white text-lg">
                          {model.modelName.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-slate-400">
                          {modelInfo?.type} • Weight: {(model.weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        model.prediction > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(model.prediction * 100).toFixed(2)}%
                      </div>
                      <div className="text-sm text-slate-400">Prediction</div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">
                        {(model.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-400">Confidence</div>
                    </div>

                    <div className="text-right">
                      <div className={`text-lg font-bold ${getStatusColor(model.status)}`}>
                        {model.executionTime.toFixed(0)}ms
                      </div>
                      <div className="text-sm text-slate-400">Execution</div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      model.status === 'active' ? 'bg-green-600 text-white' :
                      model.status === 'training' ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {model.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Model Weight Visualization */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Weight in Ensemble</span>
                    <span className="text-sm text-white font-mono">{(model.weight * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${modelInfo?.color || 'gray-400'}`}
                      style={{ width: `${model.weight * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Consensus Analysis */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-400" />
          <span>Consensus Analysis</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Model Agreement</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Strong Consensus (&gt;80%)</span>
                <span className="text-green-400">
                  {modelPredictions.filter(m => m.confidence > 0.8).length} models
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Moderate Consensus (60-80%)</span>
                <span className="text-yellow-400">
                  {modelPredictions.filter(m => m.confidence >= 0.6 && m.confidence <= 0.8).length} models
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Low Consensus (&lt;60%)</span>
                <span className="text-red-400">
                  {modelPredictions.filter(m => m.confidence < 0.6).length} models
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Prediction Distribution</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Bullish (&gt;1%)</span>
                <span className="text-green-400">
                  {modelPredictions.filter(m => m.prediction > 0.01).length} models
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Neutral (-1% to 1%)</span>
                <span className="text-gray-400">
                  {modelPredictions.filter(m => Math.abs(m.prediction) <= 0.01).length} models
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Bearish (&lt;-1%)</span>
                <span className="text-red-400">
                  {modelPredictions.filter(m => m.prediction < -0.01).length} models
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnsembleEngineDashboard;
