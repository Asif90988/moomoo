// Neural Core Alpha-7 - Portfolio Optimizer Dashboard
// Transaction cost-aware portfolio optimization with Almgren-Chriss execution

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, DollarSign, Clock, AlertTriangle, BarChart3, Zap } from 'lucide-react';

interface PortfolioPosition {
  symbol: string;
  currentWeight: number;
  targetWeight: number;
  change: number;
  changePercent: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  executionCost: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface OptimizationResult {
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio: number;
  turnover: number;
  totalCosts: number;
  recommendation: 'EXECUTE' | 'DEFER' | 'PARTIAL';
}

interface ExecutionPlan {
  symbol: string;
  strategy: 'TWAP' | 'VWAP' | 'IMPLEMENTATION_SHORTFALL' | 'ARRIVAL_PRICE';
  timeHorizon: number;
  expectedCost: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

const PortfolioOptimizerDashboard: React.FC = () => {
  const [portfolioChanges, setPortfolioChanges] = useState<PortfolioPosition[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [riskAversion, setRiskAversion] = useState(3.0);
  const [rebalanceThreshold, setRebalanceThreshold] = useState(0.05);

  useEffect(() => {
    generateMockOptimization();
  }, [riskAversion, rebalanceThreshold]);

  const generateMockOptimization = () => {
    setLoading(true);

    // Generate mock portfolio changes
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX', 'AMD', 'SPY'];
    const changes: PortfolioPosition[] = symbols.map(symbol => {
      const currentWeight = Math.random() * 0.15; // 0-15% current weight
      const targetWeight = Math.random() * 0.15;  // 0-15% target weight
      const change = targetWeight - currentWeight;
      const changePercent = currentWeight > 0 ? (change / currentWeight) * 100 : 0;
      
      return {
        symbol,
        currentWeight,
        targetWeight,
        change,
        changePercent,
        action: Math.abs(change) < 0.001 ? 'HOLD' : change > 0 ? 'BUY' : 'SELL',
        executionCost: Math.abs(change) * 0.002 * (1 + Math.random()), // 0.2-0.4% execution cost
        urgency: Math.abs(change) > 0.05 ? 'HIGH' : Math.abs(change) > 0.02 ? 'MEDIUM' : 'LOW'
      };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    setPortfolioChanges(changes);

    // Generate optimization result
    const totalTurnover = changes.reduce((sum, c) => sum + Math.abs(c.change), 0) / 2;
    const totalCosts = changes.reduce((sum, c) => sum + c.executionCost, 0);
    const expectedReturn = 0.08 + (Math.random() - 0.5) * 0.04; // 6-10% expected return
    const expectedRisk = 0.15 + Math.random() * 0.1; // 15-25% expected risk
    
    setOptimizationResult({
      expectedReturn,
      expectedRisk,
      sharpeRatio: expectedReturn / expectedRisk,
      turnover: totalTurnover,
      totalCosts,
      recommendation: totalCosts / expectedReturn < 0.2 ? 'EXECUTE' : 
                     totalCosts / expectedReturn < 0.5 ? 'PARTIAL' : 'DEFER'
    });

    // Generate execution plan
    const plan: ExecutionPlan[] = changes
      .filter(c => c.action !== 'HOLD')
      .map(change => ({
        symbol: change.symbol,
        strategy: change.urgency === 'HIGH' ? 'IMPLEMENTATION_SHORTFALL' :
                 change.urgency === 'MEDIUM' ? 'TWAP' : 
                 Math.abs(change.change) > 0.03 ? 'VWAP' : 'ARRIVAL_PRICE',
        timeHorizon: change.urgency === 'HIGH' ? 120 : 
                    change.urgency === 'MEDIUM' ? 240 : 60, // minutes
        expectedCost: change.executionCost,
        urgency: change.urgency
      }))
      .sort((a, b) => {
        const urgencyOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      });

    setExecutionPlan(plan);
    setLoading(false);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return '📈';
      case 'SELL': return '📉';
      default: return '⏸️';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'text-red-400 bg-red-600/20 border-red-500/40';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-600/20 border-yellow-500/40';
      default: return 'text-green-400 bg-green-600/20 border-green-500/40';
    }
  };

  const getStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case 'TWAP': return 'Time-Weighted Average Price';
      case 'VWAP': return 'Volume-Weighted Average Price';
      case 'IMPLEMENTATION_SHORTFALL': return 'Implementation Shortfall';
      case 'ARRIVAL_PRICE': return 'Arrival Price';
      default: return strategy;
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-900/50 to-blue-900/30 backdrop-blur-xl border border-green-500/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-green-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Portfolio Optimizer</h2>
              <p className="text-slate-400">Transaction Cost-Aware Optimization (Almgren-Chriss)</p>
            </div>
          </div>
          
          <button
            onClick={generateMockOptimization}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>{loading ? 'Optimizing...' : 'Run Optimization'}</span>
          </button>
        </div>

        {/* Optimization Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Risk Aversion</label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={riskAversion}
              onChange={(e) => setRiskAversion(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-slate-400">{riskAversion.toFixed(1)} (1=Aggressive, 10=Conservative)</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Rebalance Threshold</label>
            <input
              type="range"
              min="0.01"
              max="0.1"
              step="0.01"
              value={rebalanceThreshold}
              onChange={(e) => setRebalanceThreshold(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-slate-400">{(rebalanceThreshold * 100).toFixed(0)}% minimum change</span>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-400">Last Optimization</div>
            <div className="text-white font-mono text-sm">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Optimization Results</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {(optimizationResult.expectedReturn * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Expected Return</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {(optimizationResult.expectedRisk * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Expected Risk</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {optimizationResult.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Sharpe Ratio</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {(optimizationResult.turnover * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Turnover</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">
                {(optimizationResult.totalCosts * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-slate-400">Total Costs</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className={`text-2xl font-bold ${
                optimizationResult.recommendation === 'EXECUTE' ? 'text-green-400' :
                optimizationResult.recommendation === 'PARTIAL' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {optimizationResult.recommendation}
              </div>
              <div className="text-sm text-slate-400">Recommendation</div>
            </div>
          </div>

          {/* Cost-Benefit Analysis */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Cost-Benefit Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {((optimizationResult.expectedReturn - optimizationResult.totalCosts) * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-slate-400">Net Expected Return</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {((optimizationResult.totalCosts / optimizationResult.expectedReturn) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-slate-400">Cost as % of Return</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  optimizationResult.totalCosts / optimizationResult.expectedReturn < 0.2 ? 'text-green-400' :
                  optimizationResult.totalCosts / optimizationResult.expectedReturn < 0.5 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {optimizationResult.totalCosts / optimizationResult.expectedReturn < 0.2 ? 'EXCELLENT' :
                   optimizationResult.totalCosts / optimizationResult.expectedReturn < 0.5 ? 'ACCEPTABLE' :
                   'EXPENSIVE'}
                </div>
                <div className="text-sm text-slate-400">Cost Efficiency</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Changes */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <span>Recommended Portfolio Changes</span>
        </h3>

        <div className="grid gap-4">
          {portfolioChanges.filter(change => change.action !== 'HOLD').map((change, index) => (
            <motion.div
              key={change.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getActionIcon(change.action)}</span>
                    <div>
                      <div className="font-bold text-white text-lg">{change.symbol}</div>
                      <div className="text-sm text-slate-400">
                        {change.currentWeight.toFixed(1)}% → {change.targetWeight.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getActionColor(change.action)}`}>
                      {change.change > 0 ? '+' : ''}{(change.change * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-400">Weight Change</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-red-400">
                      {(change.executionCost * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-slate-400">Execution Cost</div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(change.urgency)}`}>
                    {change.urgency}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Execution Plan */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Clock className="w-6 h-6 text-purple-400" />
          <span>Optimal Execution Plan</span>
        </h3>

        <div className="grid gap-4">
          {executionPlan.map((plan, index) => (
            <motion.div
              key={plan.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="font-bold text-white text-lg">{plan.symbol}</div>
                    <div className="text-sm text-slate-400">
                      {getStrategyDescription(plan.strategy)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-400">
                      {plan.timeHorizon}min
                    </div>
                    <div className="text-sm text-slate-400">Time Horizon</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-400">
                      {(plan.expectedCost * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-slate-400">Expected Cost</div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(plan.urgency)}`}>
                    {plan.strategy}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {executionPlan.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.max(...executionPlan.map(p => p.timeHorizon))}min
                </div>
                <div className="text-sm text-slate-400">Total Execution Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {executionPlan.length}
                </div>
                <div className="text-sm text-slate-400">Trades to Execute</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {executionPlan.filter(p => p.urgency === 'HIGH').length}
                </div>
                <div className="text-sm text-slate-400">High Priority</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioOptimizerDashboard;