// Neural Core Alpha-7 - Portfolio Optimization API
// Transaction cost-aware portfolio optimization endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TransactionCostOptimizer } from '@/lib/ml/transaction-cost-optimizer';
import { mlEngine } from '@/services/ml-engine';

interface OptimizationRequest {
  currentPortfolio: Record<string, number>;
  riskAversion?: number;
  constraints?: {
    maxPositionSize?: number;
    maxTurnover?: number;
    maxLeverage?: number;
    maxDrawdown?: number;
    minLiquidity?: number;
  };
  rebalanceThreshold?: number;
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

    const body: OptimizationRequest = await req.json();
    const { 
      currentPortfolio, 
      riskAversion = 3.0, 
      constraints = {}, 
      rebalanceThreshold = 0.05 
    } = body;

    if (!currentPortfolio || Object.keys(currentPortfolio).length === 0) {
      return NextResponse.json(
        { error: 'Current portfolio is required' },
        { status: 400 }
      );
    }

    console.log('🎯 Starting portfolio optimization...');

    // Get symbols from current portfolio
    const symbols = Object.keys(currentPortfolio);

    // Generate ML predictions for all symbols
    const predictions = await mlEngine.generatePredictions(symbols);
    
    // Convert predictions to expected returns map
    const expectedReturns: Record<string, number> = {};
    for (const pred of predictions) {
      expectedReturns[pred.symbol] = pred.expectedReturn;
    }

    // Create mock market data (in production, this would come from real market data)
    const marketData = symbols.map(symbol => {
      const prediction = predictions.find(p => p.symbol === symbol);
      return {
        symbol,
        price: 100 + Math.random() * 400, // Mock price $100-500
        volume: 1000000 + Math.random() * 10000000, // Mock volume
        spread: 0.01 + Math.random() * 0.02, // 1-3 cents spread
        volatility: prediction?.riskScore ? prediction.riskScore / 10 * 0.3 : 0.2, // Convert risk score to volatility
        marketCap: 1e9 + Math.random() * 100e9, // $1B - $100B market cap
        averageDailyVolume: 5000000 + Math.random() * 50000000,
        liquidityScore: Math.max(0.1, 1 - (prediction?.riskScore || 5) / 10) // Inverse of risk score
      };
    });

    // Initialize optimizer with constraints
    const optimizer = new TransactionCostOptimizer({
      maxPositionSize: constraints.maxPositionSize || 0.1,
      maxTurnover: constraints.maxTurnover || 1.0,
      maxLeverage: constraints.maxLeverage || 1.0,
      maxDrawdown: constraints.maxDrawdown || 0.15,
      minLiquidity: constraints.minLiquidity || 1000000,
      allowedSectors: [],
      forbiddenAssets: []
    });

    // Run optimization
    const optimizationResult = await optimizer.optimize(
      expectedReturns,
      currentPortfolio,
      marketData,
      riskAversion
    );

    // Calculate portfolio changes
    const portfolioChanges = calculatePortfolioChanges(currentPortfolio, optimizationResult.portfolioWeights);
    const totalTurnover = optimizationResult.turnover;

    // Determine if rebalancing is recommended
    const shouldRebalance = optimizationResult.rebalanceRecommendation === 'EXECUTE' || 
                           (optimizationResult.rebalanceRecommendation === 'PARTIAL' && totalTurnover > rebalanceThreshold);

    // Prepare response
    const response = {
      optimization: {
        currentPortfolio,
        optimizedPortfolio: optimizationResult.portfolioWeights,
        expectedReturn: optimizationResult.expectedReturn,
        expectedRisk: optimizationResult.expectedRisk,
        sharpeRatio: optimizationResult.sharpeRatio,
        turnover: optimizationResult.turnover
      },
      costs: {
        transactionCosts: optimizationResult.expectedCosts,
        costBreakdown: {
          spread: optimizationResult.expectedCosts.spreadCost,
          marketImpact: optimizationResult.expectedCosts.marketImpact,
          commission: optimizationResult.expectedCosts.commissionCost,
          slippage: optimizationResult.expectedCosts.slippageCost,
          financing: optimizationResult.expectedCosts.financingCost
        },
        costAsPercentOfReturn: optimizationResult.expectedCosts.totalCost / Math.abs(optimizationResult.expectedReturn)
      },
      rebalancing: {
        recommendation: optimizationResult.rebalanceRecommendation,
        shouldExecute: shouldRebalance,
        executionPlan: optimizationResult.optimalExecutionPlan,
        estimatedExecutionTime: calculateTotalExecutionTime(optimizationResult.optimalExecutionPlan),
        priorityTrades: optimizationResult.optimalExecutionPlan.filter(p => p.urgency === 'HIGH')
      },
      changes: portfolioChanges,
      riskMetrics: {
        currentRisk: calculatePortfolioRisk(currentPortfolio, marketData),
        optimizedRisk: optimizationResult.expectedRisk,
        riskReduction: calculatePortfolioRisk(currentPortfolio, marketData) - optimizationResult.expectedRisk,
        concentrationRisk: calculateConcentrationRisk(optimizationResult.portfolioWeights),
        liquidityRisk: calculateLiquidityRisk(optimizationResult.portfolioWeights, marketData)
      },
      metadata: {
        optimizationTime: new Date().toISOString(),
        riskAversion,
        constraints,
        modelVersion: 'TCAO-1.0', // Transaction Cost Aware Optimization
        totalAssets: symbols.length,
        activePositions: Object.values(optimizationResult.portfolioWeights).filter(w => w > 0.001).length
      }
    };

    console.log(`✅ Portfolio optimization complete - Sharpe: ${optimizationResult.sharpeRatio.toFixed(3)}, Turnover: ${(totalTurnover * 100).toFixed(1)}%`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Portfolio optimization error:', error);
    
    return NextResponse.json(
      { 
        error: 'Portfolio optimization failed',
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

    // Return optimizer status and capabilities
    return NextResponse.json({
      status: 'operational',
      capabilities: {
        transactionCostModeling: true,
        multipleExecutionStrategies: ['TWAP', 'VWAP', 'IMPLEMENTATION_SHORTFALL', 'ARRIVAL_PRICE'],
        riskModels: ['COVARIANCE_MATRIX', 'FACTOR_MODEL'],
        constraints: ['POSITION_SIZE', 'TURNOVER', 'LEVERAGE', 'DRAWDOWN', 'LIQUIDITY'],
        optimizationMethods: ['GRADIENT_DESCENT', 'QUADRATIC_PROGRAMMING']
      },
      defaultConstraints: {
        maxPositionSize: 0.1,
        maxTurnover: 1.0,
        maxLeverage: 1.0,
        maxDrawdown: 0.15,
        minLiquidity: 1000000
      },
      costModels: {
        spreadCost: 'PROPORTIONAL_TO_BID_ASK_SPREAD',
        marketImpact: 'SQUARE_ROOT_LAW',
        slippage: 'VOLATILITY_VOLUME_BASED',
        commission: 'PROGRESSIVE_RATE_STRUCTURE'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Portfolio optimization status error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get optimization status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Utility functions
function calculatePortfolioChanges(
  currentPortfolio: Record<string, number>,
  optimizedPortfolio: Record<string, number>
) {
  const changes: Array<{
    symbol: string;
    currentWeight: number;
    targetWeight: number;
    change: number;
    changePercent: number;
    action: 'BUY' | 'SELL' | 'HOLD';
  }> = [];

  const allSymbols = new Set([...Object.keys(currentPortfolio), ...Object.keys(optimizedPortfolio)]);

  for (const symbol of allSymbols) {
    const currentWeight = currentPortfolio[symbol] || 0;
    const targetWeight = optimizedPortfolio[symbol] || 0;
    const change = targetWeight - currentWeight;
    const changePercent = currentWeight > 0 ? (change / currentWeight) * 100 : (targetWeight > 0 ? 100 : 0);

    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    if (Math.abs(change) > 0.001) {
      action = change > 0 ? 'BUY' : 'SELL';
    }

    changes.push({
      symbol,
      currentWeight,
      targetWeight,
      change,
      changePercent,
      action
    });
  }

  return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

function calculateTotalExecutionTime(executionPlan: any[]): number {
  if (executionPlan.length === 0) return 0;
  
  // Assume parallel execution, so total time is the maximum time horizon
  return Math.max(...executionPlan.map(p => p.timeHorizon));
}

function calculatePortfolioRisk(
  portfolio: Record<string, number>,
  marketData: any[]
): number {
  // Simplified portfolio risk calculation
  let totalRisk = 0;
  let totalWeight = 0;

  for (const [symbol, weight] of Object.entries(portfolio)) {
    const data = marketData.find(d => d.symbol === symbol);
    if (data) {
      totalRisk += weight * weight * data.volatility * data.volatility;
      totalWeight += weight;
    }
  }

  // Add correlation effects (simplified)
  const correlationAdjustment = 0.3; // Assume 30% average correlation
  totalRisk += correlationAdjustment * totalWeight * totalWeight * 0.04; // 20% average volatility

  return Math.sqrt(totalRisk);
}

function calculateConcentrationRisk(portfolio: Record<string, number>): number {
  // Calculate Herfindahl-Hirschman Index
  const weights = Object.values(portfolio);
  const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
  
  // Convert to concentration risk score (0-1, where 1 is maximum concentration)
  return hhi;
}

function calculateLiquidityRisk(
  portfolio: Record<string, number>,
  marketData: any[]
): number {
  let weightedLiquidityRisk = 0;
  let totalWeight = 0;

  for (const [symbol, weight] of Object.entries(portfolio)) {
    const data = marketData.find(d => d.symbol === symbol);
    if (data) {
      const liquidityRisk = 1 - data.liquidityScore; // Convert liquidity score to risk
      weightedLiquidityRisk += weight * liquidityRisk;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? weightedLiquidityRisk / totalWeight : 0;
}