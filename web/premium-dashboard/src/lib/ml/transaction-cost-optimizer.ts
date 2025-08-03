// Neural Core Alpha-7 - Transaction Cost-Aware Portfolio Optimization
// Implements advanced portfolio optimization considering real trading costs
// Based on research: Almgren-Chriss model, adaptive TWAP, and market impact modeling

interface TransactionCost {
  spreadCost: number;
  marketImpact: number;
  commissionCost: number;
  slippageCost: number;
  financingCost: number;
  totalCost: number;
}

interface TradingConstraints {
  maxPositionSize: number;
  maxTurnover: number;
  maxLeverage: number;
  maxDrawdown: number;
  minLiquidity: number;
  allowedSectors: string[];
  forbiddenAssets: string[];
}

interface OptimizationResult {
  portfolioWeights: Record<string, number>;
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio: number;
  expectedCosts: TransactionCost;
  turnover: number;
  rebalanceRecommendation: 'EXECUTE' | 'DEFER' | 'PARTIAL';
  optimalExecutionPlan: ExecutionPlan[];
}

interface ExecutionPlan {
  symbol: string;
  targetWeight: number;
  currentWeight: number;
  tradingVolume: number;
  executionStrategy: 'TWAP' | 'VWAP' | 'IMPLEMENTATION_SHORTFALL' | 'ARRIVAL_PRICE';
  timeHorizon: number; // minutes
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedCost: number;
}

interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  spread: number;
  volatility: number;
  marketCap: number;
  averageDailyVolume: number;
  liquidityScore: number;
}

export class TransactionCostOptimizer {
  private riskModel: CovarianceMatrix;
  private costModel: CostModel;
  private constraints: TradingConstraints;
  private currentPortfolio: Record<string, number>;
  private marketData: Map<string, MarketData> = new Map();

  constructor(constraints: Partial<TradingConstraints> = {}) {
    this.constraints = {
      maxPositionSize: 0.1, // 10% max per position
      maxTurnover: 1.0, // 100% annual turnover
      maxLeverage: 1.0, // No leverage
      maxDrawdown: 0.15, // 15% max drawdown
      minLiquidity: 1000000, // $1M minimum daily volume
      allowedSectors: [], // Empty = all sectors allowed
      forbiddenAssets: [],
      ...constraints
    };

    this.riskModel = new CovarianceMatrix();
    this.costModel = new CostModel();
    this.currentPortfolio = {};
  }

  /**
   * Optimize portfolio considering transaction costs
   */
  async optimize(
    predictions: Record<string, number>, // Expected returns
    currentWeights: Record<string, number>,
    marketData: MarketData[],
    riskAversion: number = 3.0
  ): Promise<OptimizationResult> {
    console.log('🎯 Optimizing portfolio with transaction cost awareness...');

    // Update market data
    this.updateMarketData(marketData);
    this.currentPortfolio = { ...currentWeights };

    // Step 1: Screen assets for liquidity and constraints
    const eligibleAssets = this.screenAssets(Object.keys(predictions), marketData);
    console.log(`📊 Eligible assets: ${eligibleAssets.length}/${Object.keys(predictions).length}`);

    // Step 2: Estimate covariance matrix
    const covarianceMatrix = await this.riskModel.estimate(eligibleAssets, marketData);

    // Step 3: Solve optimization with transaction costs
    const optimization = await this.solveOptimization(
      predictions,
      covarianceMatrix,
      currentWeights,
      riskAversion,
      eligibleAssets
    );

    // Step 4: Generate execution plan
    const executionPlan = await this.generateExecutionPlan(
      optimization.weights,
      currentWeights
    );

    // Step 5: Decide on rebalancing
    const rebalanceDecision = this.evaluateRebalancing(
      optimization,
      executionPlan
    );

    const result: OptimizationResult = {
      portfolioWeights: optimization.weights,
      expectedReturn: optimization.expectedReturn,
      expectedRisk: optimization.expectedRisk,
      sharpeRatio: optimization.expectedReturn / optimization.expectedRisk,
      expectedCosts: optimization.expectedCosts,
      turnover: optimization.turnover,
      rebalanceRecommendation: rebalanceDecision,
      optimalExecutionPlan: executionPlan
    };

    console.log(`✅ Portfolio optimization complete - Expected Sharpe: ${result.sharpeRatio.toFixed(3)}`);
    return result;
  }

  /**
   * Screen assets for eligibility
   */
  private screenAssets(symbols: string[], marketData: MarketData[]): string[] {
    const eligible: string[] = [];

    for (const symbol of symbols) {
      const data = marketData.find(d => d.symbol === symbol);
      if (!data) continue;

      // Liquidity check
      if (data.averageDailyVolume < this.constraints.minLiquidity) continue;

      // Forbidden assets check
      if (this.constraints.forbiddenAssets.includes(symbol)) continue;

      // Sector constraints (if specified)
      if (this.constraints.allowedSectors.length > 0) {
        // This would require sector mapping data
        // For now, assume all pass sector constraints
      }

      eligible.push(symbol);
    }

    return eligible;
  }

  /**
   * Solve portfolio optimization with transaction costs
   */
  private async solveOptimization(
    predictions: Record<string, number>,
    covarianceMatrix: number[][],
    currentWeights: Record<string, number>,
    riskAversion: number,
    eligibleAssets: string[]
  ): Promise<{
    weights: Record<string, number>;
    expectedReturn: number;
    expectedRisk: number;
    expectedCosts: TransactionCost;
    turnover: number;
  }> {
    const n = eligibleAssets.length;
    
    // Initialize optimization variables
    let weights = new Array(n).fill(1 / n); // Equal weight starting point
    const expectedReturns = eligibleAssets.map(asset => predictions[asset] || 0);
    
    // Iterative optimization using gradient descent with cost penalty
    const learningRate = 0.01;
    const maxIterations = 1000;
    const convergenceThreshold = 1e-6;

    let prevObjective = Infinity;

    for (let iter = 0; iter < maxIterations; iter++) {
      // Calculate portfolio metrics
      const portfolioReturn = this.dot(weights, expectedReturns);
      const portfolioRisk = Math.sqrt(
        this.quadraticForm(weights, covarianceMatrix)
      );

      // Calculate transaction costs
      const newWeights: Record<string, number> = {};
      eligibleAssets.forEach((asset, i) => {
        newWeights[asset] = weights[i];
      });

      const costs = this.calculateTransactionCosts(newWeights, currentWeights);
      const turnover = this.calculateTurnover(newWeights, currentWeights);

      // Objective function: return - risk_penalty - cost_penalty
      const objective = portfolioReturn 
        - riskAversion * portfolioRisk * portfolioRisk
        - this.getTotalCostPenalty(costs, turnover);

      // Check convergence
      if (Math.abs(prevObjective - objective) < convergenceThreshold) {
        console.log(`📈 Optimization converged at iteration ${iter}`);
        break;
      }
      prevObjective = objective;

      // Calculate gradients and update weights
      const gradients = this.calculateGradients(
        weights,
        expectedReturns,
        covarianceMatrix,
        currentWeights,
        riskAversion,
        eligibleAssets
      );

      // Update weights with constraints
      for (let i = 0; i < n; i++) {
        weights[i] += learningRate * gradients[i];
        weights[i] = Math.max(0, Math.min(this.constraints.maxPositionSize, weights[i]));
      }

      // Normalize weights to sum to 1
      const weightSum = weights.reduce((sum, w) => sum + w, 0);
      if (weightSum > 0) {
        weights = weights.map(w => w / weightSum);
      }
    }

    // Final calculations
    const finalWeights: Record<string, number> = {};
    eligibleAssets.forEach((asset, i) => {
      finalWeights[asset] = weights[i];
    });

    const expectedReturn = this.dot(weights, expectedReturns);
    const expectedRisk = Math.sqrt(this.quadraticForm(weights, covarianceMatrix));
    const expectedCosts = this.calculateTransactionCosts(finalWeights, currentWeights);
    const turnover = this.calculateTurnover(finalWeights, currentWeights);

    return {
      weights: finalWeights,
      expectedReturn,
      expectedRisk,
      expectedCosts,
      turnover
    };
  }

  /**
   * Calculate transaction costs using multiple models
   */
  private calculateTransactionCosts(
    newWeights: Record<string, number>,
    currentWeights: Record<string, number>
  ): TransactionCost {
    let totalSpread = 0;
    let totalImpact = 0;
    let totalCommission = 0;
    let totalSlippage = 0;
    let totalFinancing = 0;

    for (const [symbol, newWeight] of Object.entries(newWeights)) {
      const currentWeight = currentWeights[symbol] || 0;
      const weightChange = Math.abs(newWeight - currentWeight);
      
      if (weightChange < 0.001) continue; // Skip tiny changes

      const marketData = this.marketData.get(symbol);
      if (!marketData) continue;

      // Spread cost
      const spreadCost = weightChange * marketData.spread / marketData.price;
      totalSpread += spreadCost;

      // Market impact (square root law)
      const volumeFraction = weightChange / (marketData.averageDailyVolume / marketData.price);
      const impactCost = this.costModel.calculateMarketImpact(
        volumeFraction,
        marketData.volatility,
        marketData.liquidityScore
      );
      totalImpact += impactCost;

      // Commission cost (basis points)
      const commissionRate = this.getCommissionRate(marketData.price);
      totalCommission += weightChange * commissionRate;

      // Slippage cost
      const slippageCost = this.costModel.calculateSlippage(
        weightChange,
        marketData.volatility,
        marketData.volume
      );
      totalSlippage += slippageCost;

      // Financing cost (for leverage)
      if (newWeight > 1) {
        const financingCost = (newWeight - 1) * 0.03 / 365; // 3% annual rate
        totalFinancing += financingCost;
      }
    }

    return {
      spreadCost: totalSpread,
      marketImpact: totalImpact,
      commissionCost: totalCommission,
      slippageCost: totalSlippage,
      financingCost: totalFinancing,
      totalCost: totalSpread + totalImpact + totalCommission + totalSlippage + totalFinancing
    };
  }

  /**
   * Generate optimal execution plan
   */
  private async generateExecutionPlan(
    targetWeights: Record<string, number>,
    currentWeights: Record<string, number>
  ): Promise<ExecutionPlan[]> {
    const executionPlan: ExecutionPlan[] = [];

    for (const [symbol, targetWeight] of Object.entries(targetWeights)) {
      const currentWeight = currentWeights[symbol] || 0;
      const weightChange = targetWeight - currentWeight;
      
      if (Math.abs(weightChange) < 0.001) continue; // Skip tiny changes

      const marketData = this.marketData.get(symbol);
      if (!marketData) continue;

      // Determine optimal execution strategy
      const executionStrategy = this.selectExecutionStrategy(
        Math.abs(weightChange),
        marketData
      );

      // Calculate time horizon
      const timeHorizon = this.calculateOptimalTimeHorizon(
        Math.abs(weightChange),
        marketData
      );

      // Determine urgency
      const urgency = this.determineUrgency(weightChange, marketData);

      // Estimate execution cost
      const expectedCost = this.estimateExecutionCost(
        Math.abs(weightChange),
        executionStrategy,
        timeHorizon,
        marketData
      );

      executionPlan.push({
        symbol,
        targetWeight,
        currentWeight,
        tradingVolume: Math.abs(weightChange),
        executionStrategy,
        timeHorizon,
        urgency,
        expectedCost
      });
    }

    // Sort by urgency and expected cost
    executionPlan.sort((a, b) => {
      const urgencyOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return a.expectedCost - b.expectedCost;
    });

    return executionPlan;
  }

  /**
   * Evaluate whether to proceed with rebalancing
   */
  private evaluateRebalancing(
    optimization: any,
    executionPlan: ExecutionPlan[]
  ): 'EXECUTE' | 'DEFER' | 'PARTIAL' {
    const totalCost = optimization.expectedCosts.totalCost;
    const expectedBenefit = optimization.expectedReturn;
    const costBenefitRatio = totalCost / Math.abs(expectedBenefit);

    // Decision thresholds
    const EXECUTE_THRESHOLD = 0.2; // Execute if cost < 20% of expected benefit
    const DEFER_THRESHOLD = 0.8; // Defer if cost > 80% of expected benefit

    if (costBenefitRatio < EXECUTE_THRESHOLD) {
      return 'EXECUTE';
    } else if (costBenefitRatio > DEFER_THRESHOLD) {
      return 'DEFER';
    } else {
      // Check if partial rebalancing makes sense
      const highUrgencyTrades = executionPlan.filter(p => p.urgency === 'HIGH');
      if (highUrgencyTrades.length > 0) {
        return 'PARTIAL';
      }
      return 'DEFER';
    }
  }

  // Utility methods
  private updateMarketData(marketData: MarketData[]): void {
    this.marketData.clear();
    for (const data of marketData) {
      this.marketData.set(data.symbol, data);
    }
  }

  private calculateTurnover(
    newWeights: Record<string, number>,
    currentWeights: Record<string, number>
  ): number {
    let turnover = 0;
    const allSymbols = new Set([...Object.keys(newWeights), ...Object.keys(currentWeights)]);
    
    for (const symbol of allSymbols) {
      const newWeight = newWeights[symbol] || 0;
      const currentWeight = currentWeights[symbol] || 0;
      turnover += Math.abs(newWeight - currentWeight);
    }
    
    return turnover / 2; // One-way turnover
  }

  private getTotalCostPenalty(costs: TransactionCost, turnover: number): number {
    // Penalty increases with turnover to discourage excessive trading
    const basePenalty = costs.totalCost;
    const turnoverPenalty = turnover * 0.01; // 1% penalty per unit turnover
    return basePenalty + turnoverPenalty;
  }

  private calculateGradients(
    weights: number[],
    expectedReturns: number[],
    covarianceMatrix: number[][],
    currentWeights: Record<string, number>,
    riskAversion: number,
    eligibleAssets: string[]
  ): number[] {
    const n = weights.length;
    const gradients = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      // Return gradient
      gradients[i] += expectedReturns[i];

      // Risk gradient
      let riskGradient = 0;
      for (let j = 0; j < n; j++) {
        riskGradient += 2 * riskAversion * covarianceMatrix[i][j] * weights[j];
      }
      gradients[i] -= riskGradient;

      // Transaction cost gradient (simplified)
      const symbol = eligibleAssets[i];
      const currentWeight = currentWeights[symbol] || 0;
      const weightChange = weights[i] - currentWeight;
      const costGradient = Math.sign(weightChange) * 0.001; // Simplified cost gradient
      gradients[i] -= costGradient;
    }

    return gradients;
  }

  private selectExecutionStrategy(
    volumeFraction: number,
    marketData: MarketData
  ): 'TWAP' | 'VWAP' | 'IMPLEMENTATION_SHORTFALL' | 'ARRIVAL_PRICE' {
    if (volumeFraction > 0.1) {
      // Large trades need careful execution
      return 'IMPLEMENTATION_SHORTFALL';
    } else if (marketData.liquidityScore > 0.8) {
      // Highly liquid assets can use VWAP
      return 'VWAP';
    } else if (volumeFraction > 0.05) {
      // Medium trades use TWAP
      return 'TWAP';
    } else {
      // Small trades can use arrival price
      return 'ARRIVAL_PRICE';
    }
  }

  private calculateOptimalTimeHorizon(
    volumeFraction: number,
    marketData: MarketData
  ): number {
    // Almgren-Chriss optimal execution time
    const baseTime = 60; // 1 hour base
    const sizeMultiplier = Math.sqrt(volumeFraction * 100);
    const volatilityMultiplier = marketData.volatility * 10;
    
    return Math.min(480, baseTime * sizeMultiplier * volatilityMultiplier); // Max 8 hours
  }

  private determineUrgency(
    weightChange: number,
    marketData: MarketData
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    const absChange = Math.abs(weightChange);
    
    if (absChange > 0.05 || marketData.volatility > 0.3) {
      return 'HIGH';
    } else if (absChange > 0.02 || marketData.liquidityScore < 0.5) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  private estimateExecutionCost(
    volume: number,
    strategy: string,
    timeHorizon: number,
    marketData: MarketData
  ): number {
    const baseSpread = marketData.spread / marketData.price;
    const impactMultiplier = strategy === 'ARRIVAL_PRICE' ? 0.5 : 
                           strategy === 'TWAP' ? 0.7 :
                           strategy === 'VWAP' ? 0.6 : 0.8;
    
    const timeMultiplier = Math.sqrt(timeHorizon / 60); // Square root of time
    
    return volume * baseSpread * impactMultiplier * timeMultiplier;
  }

  private getCommissionRate(price: number): number {
    // Progressive commission structure
    if (price > 100) return 0.0005; // 5 bps for expensive stocks
    if (price > 10) return 0.001;   // 10 bps for mid-price stocks
    return 0.002; // 20 bps for penny stocks
  }

  // Linear algebra utilities
  private dot(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  private quadraticForm(x: number[], A: number[][]): number {
    let result = 0;
    for (let i = 0; i < x.length; i++) {
      for (let j = 0; j < x.length; j++) {
        result += x[i] * A[i][j] * x[j];
      }
    }
    return result;
  }
}

/**
 * Covariance matrix estimation
 */
class CovarianceMatrix {
  async estimate(symbols: string[], marketData: MarketData[]): Promise<number[][]> {
    const n = symbols.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));

    // Simplified covariance estimation
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          const data = marketData.find(d => d.symbol === symbols[i]);
          matrix[i][j] = data ? data.volatility * data.volatility : 0.04; // Default 20% vol
        } else {
          // Cross-correlations (simplified)
          const correlation = this.estimateCorrelation(symbols[i], symbols[j]);
          const vol_i = marketData.find(d => d.symbol === symbols[i])?.volatility || 0.2;
          const vol_j = marketData.find(d => d.symbol === symbols[j])?.volatility || 0.2;
          matrix[i][j] = correlation * vol_i * vol_j;
        }
      }
    }

    return matrix;
  }

  private estimateCorrelation(symbol1: string, symbol2: string): number {
    // Simplified correlation estimation
    // In practice, this would use historical price data
    if (symbol1 === symbol2) return 1.0;
    
    // Assume market-wide correlation of 0.3
    return 0.3;
  }
}

/**
 * Transaction cost models
 */
class CostModel {
  calculateMarketImpact(volumeFraction: number, volatility: number, liquidityScore: number): number {
    // Square root market impact model
    const baseImpact = 0.001; // 10 bps base impact
    const volumeComponent = Math.sqrt(volumeFraction);
    const volatilityComponent = volatility;
    const liquidityComponent = 1 / Math.max(0.1, liquidityScore);
    
    return baseImpact * volumeComponent * volatilityComponent * liquidityComponent;
  }

  calculateSlippage(weightChange: number, volatility: number, volume: number): number {
    // Slippage increases with volatility and decreases with volume
    const baseSlippage = 0.0005; // 5 bps base
    const volatilityFactor = 1 + volatility * 5;
    const volumeFactor = 1 / Math.sqrt(volume / 1000000); // Normalize by $1M
    const sizeFactor = 1 + Math.abs(weightChange) * 10;
    
    return baseSlippage * volatilityFactor * volumeFactor * sizeFactor;
  }
}

// Export main class and utilities
export { TransactionCostOptimizer, TradingConstraints, OptimizationResult, ExecutionPlan };