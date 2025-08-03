// Neural Core Alpha-7 - Risk Management Dashboard
// Real-time risk monitoring with VaR, stress testing, and circuit breakers

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Activity, TrendingDown, Zap, BarChart3, Target } from 'lucide-react';

interface RiskMetrics {
  valueAtRisk95: number;
  valueAtRisk99: number;
  conditionalVaR: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
  correlationRisk: number;
  concentrationRisk: number;
  liquidityRisk: number;
}

interface RiskAlert {
  id: string;
  type: 'LIMIT_BREACH' | 'ANOMALY_DETECTED' | 'CORRELATION_SPIKE' | 'LIQUIDITY_STRESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

interface StressTestResult {
  scenario: string;
  portfolioChange: number;
  worstAsset: string;
  worstAssetChange: number;
  breachedLimits: string[];
}

interface CircuitBreaker {
  metric: string;
  triggered: boolean;
  triggerTime?: Date;
  threshold: number;
  currentValue: number;
}

const RiskManagementDashboard: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<RiskAlert[]>([]);
  const [stressTestResults, setStressTestResults] = useState<StressTestResult[]>([]);
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreaker[]>([]);
  const [isStressTesting, setIsStressTesting] = useState(false);

  useEffect(() => {
    generateMockRiskData();
    const interval = setInterval(generateMockRiskData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const generateMockRiskData = () => {
    // Generate mock risk metrics
    const metrics: RiskMetrics = {
      valueAtRisk95: 0.02 + Math.random() * 0.03, // 2-5%
      valueAtRisk99: 0.04 + Math.random() * 0.04, // 4-8%
      conditionalVaR: 0.06 + Math.random() * 0.04, // 6-10%
      sharpeRatio: 1.2 + Math.random() * 0.8, // 1.2-2.0
      maxDrawdown: 0.05 + Math.random() * 0.15, // 5-20%
      volatility: 0.15 + Math.random() * 0.15, // 15-30%
      beta: 0.8 + Math.random() * 0.4, // 0.8-1.2
      correlationRisk: 0.4 + Math.random() * 0.4, // 40-80%
      concentrationRisk: 0.2 + Math.random() * 0.3, // 20-50%
      liquidityRisk: 0.1 + Math.random() * 0.2 // 10-30%
    };

    setRiskMetrics(metrics);

    // Generate mock alerts
    const possibleAlerts: Omit<RiskAlert, 'id' | 'timestamp' | 'acknowledged'>[] = [
      {
        type: 'LIMIT_BREACH',
        severity: 'HIGH',
        message: 'VaR 95% approaching limit',
        metric: 'Value at Risk',
        currentValue: metrics.valueAtRisk95,
        threshold: 0.03
      },
      {
        type: 'CORRELATION_SPIKE',
        severity: 'MEDIUM',
        message: 'Portfolio correlation increased significantly',
        metric: 'Correlation Risk',
        currentValue: metrics.correlationRisk,
        threshold: 0.7
      },
      {
        type: 'LIQUIDITY_STRESS',
        severity: 'LOW',
        message: 'Reduced liquidity in small-cap positions',
        metric: 'Liquidity Risk',
        currentValue: metrics.liquidityRisk,
        threshold: 0.25
      }
    ];

    // Add alerts if thresholds are breached
    const newAlerts: RiskAlert[] = possibleAlerts
      .filter(alert => alert.currentValue > alert.threshold)
      .map(alert => ({
        ...alert,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        acknowledged: false
      }));

    setActiveAlerts(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const filteredNew = newAlerts.filter(alert => !existingIds.has(alert.id));
      return [...prev.slice(-5), ...filteredNew]; // Keep last 5 + new ones
    });

    // Generate circuit breaker status
    const breakers: CircuitBreaker[] = [
      {
        metric: 'VaR Limit',
        triggered: metrics.valueAtRisk95 > 0.05,
        triggerTime: metrics.valueAtRisk95 > 0.05 ? new Date() : undefined,
        threshold: 0.05,
        currentValue: metrics.valueAtRisk95
      },
      {
        metric: 'Max Drawdown',
        triggered: metrics.maxDrawdown > 0.15,
        triggerTime: metrics.maxDrawdown > 0.15 ? new Date() : undefined,
        threshold: 0.15,
        currentValue: metrics.maxDrawdown
      },
      {
        metric: 'Concentration Risk',
        triggered: metrics.concentrationRisk > 0.4,
        triggerTime: metrics.concentrationRisk > 0.4 ? new Date() : undefined,
        threshold: 0.4,
        currentValue: metrics.concentrationRisk
      }
    ];

    setCircuitBreakers(breakers);
  };

  const runStressTest = async () => {
    setIsStressTesting(true);
    
    // Simulate stress test execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scenarios = [
      '2008 Financial Crisis',
      'COVID-19 Market Crash', 
      'Interest Rate Shock',
      'Sector Rotation',
      'Liquidity Crisis'
    ];

    const results: StressTestResult[] = scenarios.map(scenario => ({
      scenario,
      portfolioChange: -0.15 - Math.random() * 0.25, // -15% to -40%
      worstAsset: ['AAPL', 'GOOGL', 'TSLA', 'NVDA'][Math.floor(Math.random() * 4)],
      worstAssetChange: -0.25 - Math.random() * 0.35, // -25% to -60%
      breachedLimits: Math.random() > 0.5 ? ['Position Size Limit', 'Daily Loss Limit'] : []
    }));

    setStressTestResults(results);
    setIsStressTesting(false);
  };

  const acknowledgeAlert = (alertId: string) => {
    setActiveAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getRiskLevel = (metrics: RiskMetrics): { level: string; color: string } => {
    const var95 = metrics.valueAtRisk95;
    const drawdown = metrics.maxDrawdown;
    
    if (var95 > 0.05 || drawdown > 0.2) return { level: 'CRITICAL', color: 'red' };
    if (var95 > 0.03 || drawdown > 0.15) return { level: 'HIGH', color: 'orange' };
    if (var95 > 0.02 || drawdown > 0.1) return { level: 'MEDIUM', color: 'yellow' };
    return { level: 'LOW', color: 'green' };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-600/20 border-red-500/40';
      case 'HIGH': return 'text-orange-400 bg-orange-600/20 border-orange-500/40';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-600/20 border-yellow-500/40';
      default: return 'text-blue-400 bg-blue-600/20 border-blue-500/40';
    }
  };

  const riskLevel = riskMetrics ? getRiskLevel(riskMetrics) : { level: 'UNKNOWN', color: 'gray' };
  const activeAlertsCount = activeAlerts.filter(a => !a.acknowledged).length;
  const triggeredBreakers = circuitBreakers.filter(b => b.triggered).length;

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-900/50 to-orange-900/30 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Risk Management System</h2>
              <p className="text-slate-400">Real-time VaR, Stress Testing & Circuit Breakers</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg border font-bold ${
              riskLevel.color === 'green' ? 'bg-green-600/20 text-green-400 border-green-500/40' :
              riskLevel.color === 'yellow' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/40' :
              riskLevel.color === 'orange' ? 'bg-orange-600/20 text-orange-400 border-orange-500/40' :
              'bg-red-600/20 text-red-400 border-red-500/40'
            }`}>
              {riskLevel.level} RISK
            </div>
          </div>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">
              {activeAlertsCount}
            </div>
            <div className="text-sm text-slate-400">Active Alerts</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-400">
              {triggeredBreakers}
            </div>
            <div className="text-sm text-slate-400">Circuit Breakers</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {riskMetrics ? (riskMetrics.valueAtRisk95 * 100).toFixed(2) : '--'}%
            </div>
            <div className="text-sm text-slate-400">VaR 95%</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">
              {riskMetrics ? riskMetrics.sharpeRatio.toFixed(2) : '--'}
            </div>
            <div className="text-sm text-slate-400">Sharpe Ratio</div>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      {riskMetrics && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Risk Metrics</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-red-400">
                {(riskMetrics.valueAtRisk95 * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-slate-400">VaR 95%</div>
              <div className="text-xs text-slate-500 mt-1">1-day, 95% confidence</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-red-500">
                {(riskMetrics.conditionalVaR * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-slate-400">CVaR (ES)</div>
              <div className="text-xs text-slate-500 mt-1">Expected shortfall</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-orange-400">
                {(riskMetrics.maxDrawdown * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Max Drawdown</div>
              <div className="text-xs text-slate-500 mt-1">Historical peak-to-trough</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-yellow-400">
                {(riskMetrics.volatility * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Volatility</div>
              <div className="text-xs text-slate-500 mt-1">Annualized standard deviation</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-blue-400">
                {riskMetrics.beta.toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Beta</div>
              <div className="text-xs text-slate-500 mt-1">Market sensitivity</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-purple-400">
                {(riskMetrics.correlationRisk * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-400">Correlation Risk</div>
              <div className="text-xs text-slate-500 mt-1">Cross-asset dependency</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-cyan-400">
                {(riskMetrics.concentrationRisk * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-400">Concentration</div>
              <div className="text-xs text-slate-500 mt-1">Position size risk</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-green-400">
                {(riskMetrics.liquidityRisk * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-400">Liquidity Risk</div>
              <div className="text-xs text-slate-500 mt-1">Exit difficulty</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-green-400">
                {riskMetrics.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Sharpe Ratio</div>
              <div className="text-xs text-slate-500 mt-1">Risk-adjusted return</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-pink-400">
                {((1 - riskMetrics.maxDrawdown / riskMetrics.volatility) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-400">Risk Score</div>
              <div className="text-xs text-slate-500 mt-1">Overall assessment</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span>Risk Alerts ({activeAlertsCount} active)</span>
          </h3>
        </div>

        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Shield className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <div className="text-lg">No active risk alerts</div>
              <div className="text-sm">All risk metrics within acceptable ranges</div>
            </div>
          ) : (
            activeAlerts.map(alert => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: alert.acknowledged ? 0.5 : 1, x: 0 }}
                className={`bg-slate-800/50 rounded-lg p-4 border ${
                  alert.acknowledged ? 'border-slate-600/30' : getSeverityColor(alert.severity).split(' ')[2]
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.acknowledged ? 'bg-slate-500' : 
                      alert.severity === 'CRITICAL' ? 'bg-red-400 animate-pulse' :
                      alert.severity === 'HIGH' ? 'bg-orange-400' :
                      alert.severity === 'MEDIUM' ? 'bg-yellow-400' :
                      'bg-blue-400'
                    }`} />
                    <div>
                      <div className={`font-semibold ${alert.acknowledged ? 'text-slate-400' : 'text-white'}`}>
                        {alert.message}
                      </div>
                      <div className="text-sm text-slate-400">
                        {alert.metric}: {(alert.currentValue * 100).toFixed(2)}% (limit: {(alert.threshold * 100).toFixed(2)}%)
                      </div>
                      <div className="text-xs text-slate-500">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Circuit Breakers */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          <span>Circuit Breakers</span>
        </h3>

        <div className="grid gap-4">
          {circuitBreakers.map(breaker => (
            <div
              key={breaker.metric}
              className={`bg-slate-800/50 rounded-lg p-4 border ${
                breaker.triggered ? 'border-red-500/50 bg-red-900/20' : 'border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    breaker.triggered ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                  }`} />
                  <div>
                    <div className="font-semibold text-white">{breaker.metric}</div>
                    <div className="text-sm text-slate-400">
                      Current: {(breaker.currentValue * 100).toFixed(2)}% | Limit: {(breaker.threshold * 100).toFixed(2)}%
                    </div>
                    {breaker.triggered && breaker.triggerTime && (
                      <div className="text-xs text-red-400">
                        Triggered at {breaker.triggerTime.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  breaker.triggered 
                    ? 'bg-red-600/20 text-red-400 border border-red-500/40' 
                    : 'bg-green-600/20 text-green-400 border border-green-500/40'
                }`}>
                  {breaker.triggered ? 'TRIGGERED' : 'NORMAL'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stress Testing */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <TrendingDown className="w-6 h-6 text-purple-400" />
            <span>Stress Testing</span>
          </h3>
          
          <button
            onClick={runStressTest}
            disabled={isStressTesting}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Target className="w-4 h-4" />
            <span>{isStressTesting ? 'Running Tests...' : 'Run Stress Tests'}</span>
          </button>
        </div>

        {stressTestResults.length > 0 && (
          <div className="grid gap-4">
            {stressTestResults.map(result => (
              <div key={result.scenario} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-white text-lg">{result.scenario}</div>
                  <div className={`text-xl font-bold ${
                    result.portfolioChange > -0.15 ? 'text-yellow-400' :
                    result.portfolioChange > -0.25 ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {(result.portfolioChange * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Portfolio Impact</div>
                    <div className="text-lg font-semibold text-red-400">
                      {(result.portfolioChange * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Worst Asset</div>
                    <div className="text-lg font-semibold text-white">
                      {result.worstAsset} ({(result.worstAssetChange * 100).toFixed(1)}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Breached Limits</div>
                    <div className="text-lg font-semibold text-orange-400">
                      {result.breachedLimits.length} limits
                    </div>
                  </div>
                </div>

                {result.breachedLimits.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="text-sm text-slate-400 mb-2">Breached Limits:</div>
                    <div className="flex flex-wrap gap-2">
                      {result.breachedLimits.map(limit => (
                        <span key={limit} className="px-2 py-1 bg-red-600/20 text-red-400 border border-red-500/40 rounded text-xs">
                          {limit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {stressTestResults.length === 0 && !isStressTesting && (
          <div className="text-center py-8 text-slate-400">
            <TrendingDown className="w-12 h-12 mx-auto mb-3" />
            <div className="text-lg">No stress test results</div>
            <div className="text-sm">Run stress tests to analyze portfolio resilience</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskManagementDashboard;