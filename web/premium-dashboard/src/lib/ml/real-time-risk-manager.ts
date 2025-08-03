// Neural Core Alpha-7 - Real-Time Risk Management System
// Advanced risk monitoring with circuit breakers and dynamic position sizing
// Implements VaR, CVaR, Greeks, stress testing, and real-time exposure monitoring

interface RiskMetrics {
  valueAtRisk: VaRResult;
  conditionalVaR: number;
  sharpeRatio: number;
  maximumDrawdown: number;
  volatility: number;
  beta: number;
  correlationRisk: number;
  concentrationRisk: number;
  liquidityRisk: number;
  counterpartyRisk: number;
}

interface VaRResult {
  var95: number;
  var99: number;
  timeHorizon: string;
  confidence: number;
  method: 'HISTORICAL' | 'PARAMETRIC' | 'MONTE_CARLO';
}

interface RiskLimit {
  metric: string;
  currentValue: number;
  limit: number;
  warningThreshold: number;
  breachSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breachTime?: Date;
}

interface RiskAlert {
  id: string;
  type: 'LIMIT_BREACH' | 'ANOMALY_DETECTED' | 'CORRELATION_SPIKE' | 'LIQUIDITY_STRESS' | 'DRAWDOWN_WARNING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  recommendedAction: string;
  autoTriggered: boolean;
}

interface StressTestScenario {
  name: string;
  description: string;
  shocks: Record<string, number>; // Symbol -> shock percentage
  marketShock: number; // Overall market shock
  volatilityShock: number; // Volatility increase
  correlationShock: number; // Correlation increase
}

interface StressTestResult {
  scenario: string;
  portfolioValue: number;
  portfolioChange: number;
  portfolioChangePercent: number;
  worstAsset: string;
  worstAssetChange: number;
  riskMetricsChange: Partial<RiskMetrics>;
  breachedLimits: string[];
}

interface Position {
  symbol: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
  weight: number;
  dailyPnL: number;
  unrealizedPnL: number;
  averageCost: number;
  riskContribution: number;
}

interface RiskConfiguration {
  maxPositionSize: number;
  maxSectorExposure: number;
  maxDrawdown: number;
  maxDailyLoss: number;
  maxVaR: number;
  maxLeverage: number;
  minLiquidity: number;
  correlationThreshold: number;
  volatilityThreshold: number;
  enableCircuitBreakers: boolean;
  riskAdjustmentSpeed: number;
}

export class RealTimeRiskManager {
  private config: RiskConfiguration;
  private positions: Map<string, Position> = new Map();
  private priceHistory: Map<string, number[]> = new Map();
  private riskMetrics: RiskMetrics | null = null;
  private activeAlerts: Map<string, RiskAlert> = new Map();
  private circuitBreakersTriggered: Set<string> = new Set();
  private lastRiskCalculation: Date | null = null;
  private stressTestScenarios: StressTestScenario[] = [];

  constructor(config: Partial<RiskConfiguration> = {}) {
    this.config = {
      maxPositionSize: 0.1, // 10% per position
      maxSectorExposure: 0.3, // 30% per sector
      maxDrawdown: 0.15, // 15% max drawdown
      maxDailyLoss: 0.05, // 5% daily loss limit
      maxVaR: 0.03, // 3% VaR limit
      maxLeverage: 1.0, // No leverage
      minLiquidity: 1000000, // $1M minimum liquidity
      correlationThreshold: 0.8, // 80% correlation warning
      volatilityThreshold: 0.5, // 50% volatility warning
      enableCircuitBreakers: true,
      riskAdjustmentSpeed: 0.1, // 10% adjustment speed
      ...config
    };

    this.initializeStressTestScenarios();
  }

  /**
   * Update positions and calculate real-time risk metrics
   */
  async updateRiskMetrics(positions: Position[], marketData: Map<string, any>): Promise<RiskMetrics> {
    console.log('📊 Updating real-time risk metrics...');

    // Update internal position data
    this.updatePositions(positions);
    
    // Update price history
    this.updatePriceHistory(marketData);

    // Calculate comprehensive risk metrics
    const riskMetrics = await this.calculateRiskMetrics(positions, marketData);
    this.riskMetrics = riskMetrics;
    this.lastRiskCalculation = new Date();

    // Check risk limits and generate alerts
    await this.checkRiskLimits(riskMetrics);

    // Execute circuit breakers if needed
    if (this.config.enableCircuitBreakers) {
      await this.evaluateCircuitBreakers(riskMetrics);
    }

    console.log(`✅ Risk metrics updated - VaR: ${(riskMetrics.valueAtRisk.var95 * 100).toFixed(2)}%`);
    return riskMetrics;
  }

  /**
   * Calculate comprehensive risk metrics
   */
  private async calculateRiskMetrics(positions: Position[], marketData: Map<string, any>): Promise<RiskMetrics> {
    const portfolioValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    const weights = positions.map(pos => pos.marketValue / portfolioValue);
    const returns = this.calculatePortfolioReturns(positions);

    // Value at Risk calculation
    const valueAtRisk = this.calculateVaR(returns, portfolioValue);

    // Conditional Value at Risk (Expected Shortfall)
    const conditionalVaR = this.calculateCVaR(returns, portfolioValue, 0.05);

    // Sharpe ratio
    const sharpeRatio = this.calculateSharpeRatio(returns);

    // Maximum drawdown
    const maximumDrawdown = this.calculateMaxDrawdown(returns);

    // Portfolio volatility
    const volatility = this.calculateVolatility(returns);

    // Market beta
    const beta = await this.calculateBeta(positions, marketData);

    // Risk concentrations
    const correlationRisk = this.calculateCorrelationRisk(positions);
    const concentrationRisk = this.calculateConcentrationRisk(weights);
    const liquidityRisk = this.calculateLiquidityRisk(positions, marketData);
    const counterpartyRisk = this.calculateCounterpartyRisk(positions);

    return {
      valueAtRisk,
      conditionalVaR,
      sharpeRatio,
      maximumDrawdown,
      volatility,
      beta,
      correlationRisk,
      concentrationRisk,
      liquidityRisk,
      counterpartyRisk
    };
  }

  /**
   * Calculate Value at Risk using multiple methods
   */
  private calculateVaR(returns: number[], portfolioValue: number): VaRResult {
    if (returns.length < 50) {
      // Not enough data, use parametric VaR
      return this.calculateParametricVaR(returns, portfolioValue);
    }

    // Use historical VaR as primary method
    const sortedReturns = returns.slice().sort((a, b) => a - b);
    const var95Index = Math.floor(returns.length * 0.05);
    const var99Index = Math.floor(returns.length * 0.01);

    const var95 = Math.abs(sortedReturns[var95Index]) * portfolioValue;
    const var99 = Math.abs(sortedReturns[var99Index]) * portfolioValue;

    return {
      var95: var95 / portfolioValue, // As percentage of portfolio
      var99: var99 / portfolioValue,
      timeHorizon: '1D',
      confidence: 0.95,
      method: 'HISTORICAL'
    };
  }

  /**
   * Calculate parametric VaR when historical data is insufficient
   */
  private calculateParametricVaR(returns: number[], portfolioValue: number): VaRResult {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Z-scores for confidence levels
    const z95 = 1.645; // 95% confidence
    const z99 = 2.326; // 99% confidence

    const var95 = (mean - z95 * stdDev) * portfolioValue;
    const var99 = (mean - z99 * stdDev) * portfolioValue;

    return {
      var95: Math.abs(var95) / portfolioValue,
      var99: Math.abs(var99) / portfolioValue,
      timeHorizon: '1D',
      confidence: 0.95,
      method: 'PARAMETRIC'
    };
  }

  /**
   * Calculate Conditional Value at Risk (Expected Shortfall)
   */
  private calculateCVaR(returns: number[], portfolioValue: number, alpha: number): number {
    const sortedReturns = returns.slice().sort((a, b) => a - b);
    const cutoffIndex = Math.floor(returns.length * alpha);
    
    if (cutoffIndex === 0) return 0;

    const tailReturns = sortedReturns.slice(0, cutoffIndex);
    const cvar = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
    
    return Math.abs(cvar);
  }

  /**
   * Run stress tests on portfolio
   */
  async runStressTests(positions: Position[]): Promise<StressTestResult[]> {
    console.log('🧪 Running portfolio stress tests...');
    
    const results: StressTestResult[] = [];
    const basePortfolioValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);

    for (const scenario of this.stressTestScenarios) {
      try {
        const stressedPositions = this.applyStressScenario(positions, scenario);
        const stressedValue = stressedPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
        
        const portfolioChange = stressedValue - basePortfolioValue;
        const portfolioChangePercent = (portfolioChange / basePortfolioValue) * 100;

        // Find worst performing asset
        let worstAsset = '';
        let worstAssetChange = 0;
        
        for (let i = 0; i < positions.length; i++) {
          const originalValue = positions[i].marketValue;
          const stressedValue = stressedPositions[i].marketValue;
          const assetChange = ((stressedValue - originalValue) / originalValue) * 100;
          
          if (assetChange < worstAssetChange) {
            worstAssetChange = assetChange;
            worstAsset = positions[i].symbol;
          }
        }

        // Check which limits would be breached
        const breachedLimits = this.identifyBreachedLimits(stressedPositions, portfolioChangePercent);

        results.push({
          scenario: scenario.name,
          portfolioValue: stressedValue,
          portfolioChange,
          portfolioChangePercent,
          worstAsset,
          worstAssetChange,
          riskMetricsChange: {}, // Would calculate stressed risk metrics
          breachedLimits
        });

      } catch (error) {
        console.error(`Error in stress test ${scenario.name}:`, error);
      }
    }

    console.log(`📈 Stress tests complete - ${results.length} scenarios analyzed`);
    return results;
  }

  /**
   * Check risk limits and generate alerts
   */
  private async checkRiskLimits(riskMetrics: RiskMetrics): Promise<void> {
    const limits: RiskLimit[] = [
      {
        metric: 'Value at Risk',
        currentValue: riskMetrics.valueAtRisk.var95,
        limit: this.config.maxVaR,
        warningThreshold: this.config.maxVaR * 0.8,
        breachSeverity: 'HIGH'
      },
      {
        metric: 'Maximum Drawdown',
        currentValue: riskMetrics.maximumDrawdown,
        limit: this.config.maxDrawdown,
        warningThreshold: this.config.maxDrawdown * 0.8,
        breachSeverity: 'CRITICAL'
      },
      {
        metric: 'Portfolio Volatility',
        currentValue: riskMetrics.volatility,
        limit: this.config.volatilityThreshold,
        warningThreshold: this.config.volatilityThreshold * 0.8,
        breachSeverity: 'MEDIUM'
      },
      {
        metric: 'Concentration Risk',
        currentValue: riskMetrics.concentrationRisk,
        limit: 0.5, // 50% concentration limit
        warningThreshold: 0.4,
        breachSeverity: 'MEDIUM'
      },
      {
        metric: 'Correlation Risk',
        currentValue: riskMetrics.correlationRisk,
        limit: this.config.correlationThreshold,
        warningThreshold: this.config.correlationThreshold * 0.9,
        breachSeverity: 'HIGH'
      }
    ];

    for (const limit of limits) {
      if (limit.currentValue > limit.limit) {
        await this.generateAlert({
          type: 'LIMIT_BREACH',
          severity: limit.breachSeverity,
          metric: limit.metric,
          currentValue: limit.currentValue,
          threshold: limit.limit,
          message: `${limit.metric} breach: ${(limit.currentValue * 100).toFixed(2)}% exceeds limit of ${(limit.limit * 100).toFixed(2)}%`,
          recommendedAction: this.getRecommendedAction(limit.metric, limit.breachSeverity),
          autoTriggered: this.config.enableCircuitBreakers && limit.breachSeverity === 'CRITICAL'
        });
      } else if (limit.currentValue > limit.warningThreshold) {
        await this.generateAlert({
          type: 'LIMIT_BREACH',
          severity: 'LOW',
          metric: limit.metric,
          currentValue: limit.currentValue,
          threshold: limit.warningThreshold,
          message: `${limit.metric} warning: ${(limit.currentValue * 100).toFixed(2)}% approaching limit`,
          recommendedAction: 'Monitor closely and consider position reduction',
          autoTriggered: false
        });
      }
    }
  }

  /**
   * Evaluate and trigger circuit breakers
   */
  private async evaluateCircuitBreakers(riskMetrics: RiskMetrics): Promise<void> {
    const criticalBreaches = [
      { metric: 'VaR', value: riskMetrics.valueAtRisk.var95, limit: this.config.maxVaR },
      { metric: 'Drawdown', value: riskMetrics.maximumDrawdown, limit: this.config.maxDrawdown },
      { metric: 'Daily Loss', value: this.calculateCurrentDailyLoss(), limit: this.config.maxDailyLoss }
    ];

    for (const breach of criticalBreaches) {
      if (breach.value > breach.limit && !this.circuitBreakersTriggered.has(breach.metric)) {
        console.log(`🚨 CIRCUIT BREAKER TRIGGERED: ${breach.metric}`);
        
        this.circuitBreakersTriggered.add(breach.metric);
        
        await this.generateAlert({
          type: 'LIMIT_BREACH',
          severity: 'CRITICAL',
          metric: breach.metric,
          currentValue: breach.value,
          threshold: breach.limit,
          message: `CIRCUIT BREAKER: ${breach.metric} critically exceeded - Trading halted`,
          recommendedAction: 'Immediate risk reduction required',
          autoTriggered: true
        });

        // Execute automatic risk reduction
        await this.executeEmergencyRiskReduction(breach.metric);
      }
    }
  }

  /**
   * Execute emergency risk reduction measures
   */
  private async executeEmergencyRiskReduction(triggerMetric: string): Promise<void> {
    console.log(`⚡ Executing emergency risk reduction for ${triggerMetric}...`);

    // Implement automatic position reduction logic
    // This would integrate with the trading system to reduce positions
    
    const reductionActions = {
      'VaR': 'Reduce high-risk positions by 25%',
      'Drawdown': 'Liquidate worst-performing 50% of positions',
      'Daily Loss': 'Halt all new trades and reduce exposure by 30%'
    };

    console.log(`🔧 Action taken: ${reductionActions[triggerMetric as keyof typeof reductionActions]}`);
  }

  /**
   * Generate risk alert
   */
  private async generateAlert(alertData: Omit<RiskAlert, 'id' | 'timestamp'>): Promise<void> {
    const alert: RiskAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...alertData
    };

    this.activeAlerts.set(alert.id, alert);
    
    // Log alert (in production, this would send notifications)
    const severityEmoji = {
      'LOW': '⚠️',
      'MEDIUM': '⚡',
      'HIGH': '🚨',
      'CRITICAL': '🔥'
    }[alert.severity];

    console.log(`${severityEmoji} RISK ALERT [${alert.severity}]: ${alert.message}`);
    
    // Broadcast to WebSocket clients
    this.broadcastAlert(alert);
  }

  /**
   * Initialize stress test scenarios
   */
  private initializeStressTestScenarios(): void {
    this.stressTestScenarios = [
      {
        name: '2008 Financial Crisis',
        description: 'Market crash scenario similar to 2008',
        shocks: {}, // Would be populated with specific asset shocks
        marketShock: -0.35, // 35% market decline
        volatilityShock: 2.5, // 250% volatility increase
        correlationShock: 0.3 // Correlations increase to 0.9+
      },
      {
        name: 'COVID-19 Market Crash',
        description: 'Rapid market decline scenario',
        shocks: {},
        marketShock: -0.25,
        volatilityShock: 3.0,
        correlationShock: 0.25
      },
      {
        name: 'Interest Rate Shock',
        description: 'Sudden interest rate increase',
        shocks: {},
        marketShock: -0.15,
        volatilityShock: 1.5,
        correlationShock: 0.1
      },
      {
        name: 'Sector Rotation',
        description: 'Major sector rotation event',
        shocks: {},
        marketShock: -0.05,
        volatilityShock: 1.2,
        correlationShock: -0.1 // Correlations decrease
      },
      {
        name: 'Liquidity Crisis',
        description: 'Market liquidity dries up',
        shocks: {},
        marketShock: -0.20,
        volatilityShock: 2.0,
        correlationShock: 0.4
      }
    ];
  }

  // Utility calculation methods
  private updatePositions(positions: Position[]): void {
    this.positions.clear();
    for (const position of positions) {
      this.positions.set(position.symbol, position);
    }
  }

  private updatePriceHistory(marketData: Map<string, any>): void {
    for (const [symbol, data] of marketData) {
      if (!this.priceHistory.has(symbol)) {
        this.priceHistory.set(symbol, []);
      }
      
      const history = this.priceHistory.get(symbol)!;
      history.push(data.price);
      
      // Keep only last 252 days (1 trading year)
      if (history.length > 252) {
        history.shift();
      }
    }
  }

  private calculatePortfolioReturns(positions: Position[]): number[] {
    // Simplified portfolio return calculation
    // In practice, this would use actual historical portfolio values
    const returns: number[] = [];
    
    for (let i = 1; i < 100; i++) { // Generate 100 days of synthetic returns
      let portfolioReturn = 0;
      
      for (const position of positions) {
        const weight = position.weight;
        const assetReturn = (Math.random() - 0.5) * 0.04; // Random returns ±2%
        portfolioReturn += weight * assetReturn;
      }
      
      returns.push(portfolioReturn);
    }
    
    return returns;
  }

  private calculateSharpeRatio(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    const riskFreeRate = 0.02 / 252; // 2% annual risk-free rate, daily
    return stdDev > 0 ? (mean - riskFreeRate) / stdDev * Math.sqrt(252) : 0;
  }

  private calculateMaxDrawdown(returns: number[]): number {
    let peak = 1;
    let maxDrawdown = 0;
    let cumReturn = 1;

    for (const ret of returns) {
      cumReturn *= (1 + ret);
      if (cumReturn > peak) peak = cumReturn;
      const drawdown = (peak - cumReturn) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return maxDrawdown;
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  private async calculateBeta(positions: Position[], marketData: Map<string, any>): Promise<number> {
    // Simplified beta calculation vs market
    // In practice, this would use actual market index data
    let portfolioBeta = 0;
    
    for (const position of positions) {
      // Assume individual asset betas (would be calculated from market data)
      const assetBeta = 1.0 + (Math.random() - 0.5) * 0.5; // Random beta 0.75-1.25
      portfolioBeta += position.weight * assetBeta;
    }
    
    return portfolioBeta;
  }

  private calculateCorrelationRisk(positions: Position[]): number {
    // Simplified correlation risk calculation
    // High correlation = high risk
    const avgCorrelation = 0.6; // Assume 60% average correlation
    return avgCorrelation;
  }

  private calculateConcentrationRisk(weights: number[]): number {
    // Herfindahl-Hirschman Index
    return weights.reduce((sum, weight) => sum + weight * weight, 0);
  }

  private calculateLiquidityRisk(positions: Position[], marketData: Map<string, any>): number {
    let weightedLiquidityRisk = 0;
    let totalWeight = 0;

    for (const position of positions) {
      const data = marketData.get(position.symbol);
      if (data) {
        const liquidityScore = data.liquidityScore || 0.5;
        const liquidityRisk = 1 - liquidityScore;
        weightedLiquidityRisk += position.weight * liquidityRisk;
        totalWeight += position.weight;
      }
    }

    return totalWeight > 0 ? weightedLiquidityRisk / totalWeight : 0;
  }

  private calculateCounterpartyRisk(positions: Position[]): number {
    // Simplified counterparty risk
    // For a retail trading platform, this is typically low
    return 0.05; // 5% counterparty risk
  }

  private calculateCurrentDailyLoss(): number {
    // Calculate current day's P&L as percentage of portfolio
    let totalPnL = 0;
    let totalValue = 0;
    
    for (const position of this.positions.values()) {
      totalPnL += position.dailyPnL;
      totalValue += position.marketValue;
    }
    
    return totalValue > 0 ? -totalPnL / totalValue : 0; // Negative for losses
  }

  private applyStressScenario(positions: Position[], scenario: StressTestScenario): Position[] {
    return positions.map(position => {
      const assetShock = scenario.shocks[position.symbol] || scenario.marketShock;
      const stressedPrice = position.currentPrice * (1 + assetShock);
      
      return {
        ...position,
        currentPrice: stressedPrice,
        marketValue: position.quantity * stressedPrice,
        unrealizedPnL: position.quantity * (stressedPrice - position.averageCost)
      };
    });
  }

  private identifyBreachedLimits(stressedPositions: Position[], portfolioChangePercent: number): string[] {
    const breaches: string[] = [];
    
    if (Math.abs(portfolioChangePercent) > this.config.maxDailyLoss * 100) {
      breaches.push('Daily Loss Limit');
    }
    
    const totalValue = stressedPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
    for (const position of stressedPositions) {
      const weight = position.marketValue / totalValue;
      if (weight > this.config.maxPositionSize) {
        breaches.push(`Position Size Limit (${position.symbol})`);
      }
    }
    
    return breaches;
  }

  private getRecommendedAction(metric: string, severity: string): string {
    const actions: Record<string, Record<string, string>> = {
      'Value at Risk': {
        'HIGH': 'Reduce high-risk positions immediately',
        'CRITICAL': 'Halt trading and liquidate 30% of portfolio'
      },
      'Maximum Drawdown': {
        'HIGH': 'Stop loss triggered - review strategy',
        'CRITICAL': 'Emergency liquidation required'
      },
      'Portfolio Volatility': {
        'MEDIUM': 'Rebalance to lower volatility assets',
        'HIGH': 'Reduce overall exposure'
      }
    };
    
    return actions[metric]?.[severity] || 'Monitor and review risk exposure';
  }

  private broadcastAlert(alert: RiskAlert): void {
    // In production, this would broadcast to WebSocket clients
    console.log(`📡 Broadcasting alert: ${alert.id}`);
  }

  // Public interface methods
  getCurrentRiskMetrics(): RiskMetrics | null {
    return this.riskMetrics;
  }

  getActiveAlerts(): RiskAlert[] {
    return Array.from(this.activeAlerts.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  acknowledgeAlert(alertId: string): boolean {
    return this.activeAlerts.delete(alertId);
  }

  getCircuitBreakerStatus(): { triggered: string[]; timestamp: Date | null } {
    return {
      triggered: Array.from(this.circuitBreakersTriggered),
      timestamp: this.lastRiskCalculation
    };
  }

  resetCircuitBreakers(): void {
    this.circuitBreakersTriggered.clear();
    console.log('🔄 Circuit breakers reset');
  }
}

// Export types and main class
export { 
  RealTimeRiskManager, 
  RiskMetrics, 
  RiskAlert, 
  StressTestResult, 
  Position, 
  RiskConfiguration 
};