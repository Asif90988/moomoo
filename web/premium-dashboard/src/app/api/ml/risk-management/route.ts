// Neural Core Alpha-7 - Real-Time Risk Management API
// Provides risk metrics, alerts, and stress testing capabilities

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { RealTimeRiskManager, Position, RiskConfiguration } from '@/lib/ml/real-time-risk-manager';

// Singleton risk manager instance
let riskManager: RealTimeRiskManager | null = null;

function getRiskManager(): RealTimeRiskManager {
  if (!riskManager) {
    riskManager = new RealTimeRiskManager({
      maxPositionSize: 0.1,
      maxSectorExposure: 0.3,
      maxDrawdown: 0.15,
      maxDailyLoss: 0.05,
      maxVaR: 0.03,
      maxLeverage: 1.0,
      minLiquidity: 1000000,
      correlationThreshold: 0.8,
      volatilityThreshold: 0.5,
      enableCircuitBreakers: true,
      riskAdjustmentSpeed: 0.1
    });
  }
  return riskManager;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, data } = body;

    const manager = getRiskManager();

    switch (action) {
      case 'updateRisk':
        return await handleRiskUpdate(manager, data);
      
      case 'stressTest':
        return await handleStressTest(manager, data);
      
      case 'acknowledgeAlert':
        return await handleAcknowledgeAlert(manager, data);
      
      case 'resetCircuitBreakers':
        return await handleResetCircuitBreakers(manager);
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Risk management API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Risk management operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const dataType = searchParams.get('type') || 'overview';

    const manager = getRiskManager();

    switch (dataType) {
      case 'overview':
        return NextResponse.json({
          riskMetrics: manager.getCurrentRiskMetrics(),
          activeAlerts: manager.getActiveAlerts(),
          circuitBreakers: manager.getCircuitBreakerStatus(),
          timestamp: new Date().toISOString()
        });

      case 'alerts':
        return NextResponse.json({
          alerts: manager.getActiveAlerts(),
          totalAlerts: manager.getActiveAlerts().length,
          criticalAlerts: manager.getActiveAlerts().filter(a => a.severity === 'CRITICAL').length,
          timestamp: new Date().toISOString()
        });

      case 'metrics':
        return NextResponse.json({
          riskMetrics: manager.getCurrentRiskMetrics(),
          lastUpdated: new Date().toISOString()
        });

      case 'status':
        return NextResponse.json({
          status: 'operational',
          circuitBreakers: manager.getCircuitBreakerStatus(),
          riskCalculationEnabled: true,
          realTimeMonitoring: true,
          stressTestingEnabled: true,
          alertSystemEnabled: true,
          capabilities: {
            valueAtRisk: ['HISTORICAL', 'PARAMETRIC', 'MONTE_CARLO'],
            stressTests: ['MARKET_CRASH', 'INTEREST_RATE_SHOCK', 'SECTOR_ROTATION', 'LIQUIDITY_CRISIS'],
            riskMetrics: ['VAR', 'CVAR', 'SHARPE', 'DRAWDOWN', 'VOLATILITY', 'BETA', 'CORRELATION'],
            circuitBreakers: ['VAR_BREACH', 'DRAWDOWN_LIMIT', 'DAILY_LOSS_LIMIT'],
            alertTypes: ['LIMIT_BREACH', 'ANOMALY_DETECTED', 'CORRELATION_SPIKE', 'LIQUIDITY_STRESS']
          },
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: `Unknown data type: ${dataType}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Risk management GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve risk data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handler functions
async function handleRiskUpdate(manager: RealTimeRiskManager, data: any) {
  const { positions, marketData } = data;

  if (!positions || !Array.isArray(positions)) {
    return NextResponse.json(
      { error: 'Positions array is required' },
      { status: 400 }
    );
  }

  // Convert positions to required format
  const formattedPositions: Position[] = positions.map((pos: any) => ({
    symbol: pos.symbol,
    quantity: pos.quantity || 0,
    currentPrice: pos.currentPrice || pos.price || 0,
    marketValue: pos.marketValue || (pos.quantity * pos.currentPrice) || 0,
    weight: pos.weight || 0,
    dailyPnL: pos.dailyPnL || 0,
    unrealizedPnL: pos.unrealizedPnL || 0,
    averageCost: pos.averageCost || pos.currentPrice || 0,
    riskContribution: pos.riskContribution || 0
  }));

  // Create market data map
  const marketDataMap = new Map();
  if (marketData && Array.isArray(marketData)) {
    for (const data of marketData) {
      marketDataMap.set(data.symbol, data);
    }
  } else {
    // Generate mock market data if not provided
    for (const pos of formattedPositions) {
      marketDataMap.set(pos.symbol, {
        symbol: pos.symbol,
        price: pos.currentPrice,
        volume: 1000000 + Math.random() * 10000000,
        spread: 0.01 + Math.random() * 0.02,
        volatility: 0.15 + Math.random() * 0.25,
        liquidityScore: 0.5 + Math.random() * 0.5
      });
    }
  }

  // Update risk metrics
  const riskMetrics = await manager.updateRiskMetrics(formattedPositions, marketDataMap);
  const alerts = manager.getActiveAlerts();
  const circuitBreakers = manager.getCircuitBreakerStatus();

  return NextResponse.json({
    success: true,
    riskMetrics,
    newAlerts: alerts.filter(alert => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return alert.timestamp > fiveMinutesAgo;
    }),
    totalAlerts: alerts.length,
    circuitBreakers,
    summary: {
      riskLevel: getRiskLevel(riskMetrics),
      keyMetrics: {
        var95: `${(riskMetrics.valueAtRisk.var95 * 100).toFixed(2)}%`,
        sharpeRatio: riskMetrics.sharpeRatio.toFixed(2),
        maxDrawdown: `${(riskMetrics.maximumDrawdown * 100).toFixed(2)}%`,
        volatility: `${(riskMetrics.volatility * 100).toFixed(1)}%`
      },
      recommendations: generateRiskRecommendations(riskMetrics, alerts)
    },
    timestamp: new Date().toISOString()
  });
}

async function handleStressTest(manager: RealTimeRiskManager, data: any) {
  const { positions } = data;

  if (!positions || !Array.isArray(positions)) {
    return NextResponse.json(
      { error: 'Positions array is required for stress testing' },
      { status: 400 }
    );
  }

  const formattedPositions: Position[] = positions.map((pos: any) => ({
    symbol: pos.symbol,
    quantity: pos.quantity || 0,
    currentPrice: pos.currentPrice || pos.price || 0,
    marketValue: pos.marketValue || (pos.quantity * pos.currentPrice) || 0,
    weight: pos.weight || 0,
    dailyPnL: pos.dailyPnL || 0,
    unrealizedPnL: pos.unrealizedPnL || 0,
    averageCost: pos.averageCost || pos.currentPrice || 0,
    riskContribution: pos.riskContribution || 0
  }));

  const stressTestResults = await manager.runStressTests(formattedPositions);

  // Analyze stress test results
  const worstScenario = stressTestResults.reduce((worst, current) => 
    current.portfolioChangePercent < worst.portfolioChangePercent ? current : worst
  );

  const averageLoss = stressTestResults.reduce((sum, result) => 
    sum + Math.abs(result.portfolioChangePercent), 0) / stressTestResults.length;

  return NextResponse.json({
    success: true,
    stressTestResults,
    analysis: {
      worstScenario: {
        name: worstScenario.scenario,
        loss: `${Math.abs(worstScenario.portfolioChangePercent).toFixed(2)}%`,
        worstAsset: worstScenario.worstAsset,
        breachedLimits: worstScenario.breachedLimits
      },
      averageLoss: `${averageLoss.toFixed(2)}%`,
      scenariosWithBreaches: stressTestResults.filter(r => r.breachedLimits.length > 0).length,
      overallRiskAssessment: averageLoss > 15 ? 'HIGH' : averageLoss > 8 ? 'MEDIUM' : 'LOW'
    },
    recommendations: generateStressTestRecommendations(stressTestResults),
    timestamp: new Date().toISOString()
  });
}

async function handleAcknowledgeAlert(manager: RealTimeRiskManager, data: any) {
  const { alertId } = data;

  if (!alertId) {
    return NextResponse.json(
      { error: 'Alert ID is required' },
      { status: 400 }
    );
  }

  const acknowledged = manager.acknowledgeAlert(alertId);

  return NextResponse.json({
    success: acknowledged,
    message: acknowledged ? 'Alert acknowledged' : 'Alert not found',
    alertId,
    timestamp: new Date().toISOString()
  });
}

async function handleResetCircuitBreakers(manager: RealTimeRiskManager) {
  manager.resetCircuitBreakers();

  return NextResponse.json({
    success: true,
    message: 'Circuit breakers reset successfully',
    timestamp: new Date().toISOString()
  });
}

// Utility functions
function getRiskLevel(riskMetrics: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const var95 = riskMetrics.valueAtRisk.var95;
  const drawdown = riskMetrics.maximumDrawdown;
  
  if (var95 > 0.05 || drawdown > 0.2) return 'CRITICAL';
  if (var95 > 0.03 || drawdown > 0.15) return 'HIGH';
  if (var95 > 0.02 || drawdown > 0.1) return 'MEDIUM';
  return 'LOW';
}

function generateRiskRecommendations(riskMetrics: any, alerts: any[]): string[] {
  const recommendations: string[] = [];
  
  if (riskMetrics.valueAtRisk.var95 > 0.03) {
    recommendations.push('Consider reducing position sizes to lower VaR');
  }
  
  if (riskMetrics.concentrationRisk > 0.4) {
    recommendations.push('Diversify portfolio to reduce concentration risk');
  }
  
  if (riskMetrics.correlationRisk > 0.7) {
    recommendations.push('Add uncorrelated assets to reduce correlation risk');
  }
  
  if (alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL').length > 0) {
    recommendations.push('Address critical risk alerts immediately');
  }
  
  if (riskMetrics.volatility > 0.3) {
    recommendations.push('Consider lower volatility assets to reduce portfolio risk');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Portfolio risk levels are within acceptable ranges');
  }
  
  return recommendations;
}

function generateStressTestRecommendations(stressTestResults: any[]): string[] {
  const recommendations: string[] = [];
  
  const worstLoss = Math.max(...stressTestResults.map(r => Math.abs(r.portfolioChangePercent)));
  
  if (worstLoss > 25) {
    recommendations.push('Portfolio shows excessive sensitivity to stress scenarios - consider hedging');
  } else if (worstLoss > 15) {
    recommendations.push('Portfolio may benefit from additional diversification');
  }
  
  const breachCount = stressTestResults.reduce((sum, r) => sum + r.breachedLimits.length, 0);
  if (breachCount > 5) {
    recommendations.push('Multiple risk limits breached in stress tests - review risk framework');
  }
  
  const liquidityCrisisResult = stressTestResults.find(r => r.scenario.includes('Liquidity'));
  if (liquidityCrisisResult && Math.abs(liquidityCrisisResult.portfolioChangePercent) > 20) {
    recommendations.push('Portfolio vulnerable to liquidity crises - increase cash allocation');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Portfolio demonstrates good resilience across stress scenarios');
  }
  
  return recommendations;
}