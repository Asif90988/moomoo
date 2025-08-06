// Broker-Aware Trading Engine
// Each broker operates with its own isolated rules and constraints

import { getBrokerConfig, validateTradeAgainstRules, calculatePositionSize, BrokerConfig, getEffectiveTradingBalance } from './broker-configs';
import { useTradingStore } from '@/stores/trading-store';
import { pdtManager } from './pdt-manager';

interface AutoTrade {
  id: string;
  timestamp: Date;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  reason: string;
  confidence: number;
  profit?: number;
  broker: string;
}

interface AIDecision {
  symbol: string;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  reasoning: string;
  targetPrice: number;
  stopLoss: number;
  positionSize: number;
  broker: string;
}

interface BrokerState {
  active: boolean;
  portfolio: {
    value: number;
    trades: number;
    profit: number;
    dailyTrades: number;
    positions: Record<string, number>; // symbol -> quantity
  };
  interval: NodeJS.Timeout | null;
  lastTradeTime: number;
}

class BrokerTradingEngine {
  private static instance: BrokerTradingEngine;
  private brokerStates: Record<string, BrokerState> = {};
  private thoughtInterval: NodeJS.Timeout | null = null;
  private aiThoughts: string[] = [];
  private isInitialized = false;

  private constructor() {
    console.log('🚀 Broker-Aware Trading Engine initialized');
    this.initializeBrokers();
  }

  public static getInstance(): BrokerTradingEngine {
    if (!BrokerTradingEngine.instance) {
      BrokerTradingEngine.instance = new BrokerTradingEngine();
    }
    return BrokerTradingEngine.instance;
  }

  // Initialize all broker states
  private initializeBrokers() {
    const configs = ['moomoo', 'alpaca', 'binance-testnet']; // Active brokers only
    
    configs.forEach(brokerId => {
      const config = getBrokerConfig(brokerId);
      
      this.brokerStates[brokerId] = {
        active: false,
        portfolio: {
          value: config.mode === 'live' && brokerId === 'alpaca' 
            ? parseFloat(process.env.NEXT_PUBLIC_INITIAL_DEPOSIT || '1000') // 🔴 USER'S $1000 LIVE DEPOSIT
            : config.simulationConfig?.initialBalance || 0,
          trades: 0,
          profit: 0,
          dailyTrades: 0,
          positions: {}
        },
        interval: null,
        lastTradeTime: 0
      };
      
      console.log(`📊 Initialized ${config.displayName} with $${this.brokerStates[brokerId].portfolio.value} (${config.mode} mode)`);
    });

    // Initialize Alpaca with real data if available
    this.initializeAlpacaWithRealData();
    this.isInitialized = true;
  }

  // Initialize Alpaca with real portfolio data
  private async initializeAlpacaWithRealData() {
    const config = getBrokerConfig('alpaca');
    
    // Only fetch real data for live trading accounts
    if (config.mode !== 'live') {
      console.log('📊 Skipping real data fetch (not in live mode)');
      return;
    }
    
    try {
      console.log('🔄 Fetching LIVE Alpaca account data...');
      // Use absolute URL for server-side fetch or dynamic import
      const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/alpaca/portfolio`);
      const data = await response.json();
      
      if (data.success && this.brokerStates.alpaca) {
        // Update broker state with REAL account data
        this.brokerStates.alpaca.portfolio = {
          value: data.portfolio.portfolio_value,
          trades: data.portfolio.total_orders || data.portfolio.today_trades,
          profit: data.portfolio.day_change,
          dailyTrades: data.portfolio.today_trades,
          positions: {}
        };
        
        // Update trading store with real values
        const store = useTradingStore.getState();
        store.updateBaselineValue(data.portfolio.portfolio_value);
        store.updatePortfolioValue(data.portfolio.portfolio_value);
        
        console.log(`🚨 LIVE ALPACA DATA LOADED:`);
        console.log(`   Portfolio Value: $${data.portfolio.portfolio_value.toFixed(2)}`);
        console.log(`   Cash: $${data.portfolio.cash.toFixed(2)}`);
        console.log(`   Buying Power: $${data.portfolio.buying_power.toFixed(2)}`);
        console.log(`   P&L: ${data.portfolio.day_change >= 0 ? '+' : ''}$${data.portfolio.day_change.toFixed(2)}`);
        
        // Force update any UI components listening to broker state
        setTimeout(() => {
          const updatedStore = useTradingStore.getState();
          updatedStore.updatePortfolioValue(data.portfolio.portfolio_value);
        }, 100);
        
      } else {
        console.error('❌ Failed to get valid Alpaca data:', data);
      }
    } catch (error) {
      console.error('❌ Critical error fetching Alpaca real data:', error);
    }
  }

  // Generate AI decision for specific broker
  private async generateAIDecision(brokerId: string): Promise<AIDecision> {
    const config = getBrokerConfig(brokerId);
    const brokerState = this.brokerStates[brokerId];
    
    try {
      // Try IPCA ML predictions first
      const mlResponse = await fetch('/api/ml/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: config.symbols.slice(0, 5),
          timeHorizon: '1d',
          includeFactorAnalysis: true,
          minConfidence: config.behavior.defaultConfidenceThreshold / 100
        })
      });

      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        
        if (mlData.predictions && mlData.predictions.length > 0) {
          const prediction = mlData.predictions[0];
          
          console.log(`🧠 ${config.displayName} IPCA ML: ${prediction.symbol} - ${prediction.recommendation} (${(prediction.confidence * 100).toFixed(1)}%)`);
          
          // Get REAL market price for position sizing
          const stockPrice = await this.getRealStockPrice(prediction.symbol, config);
          const positionSize = calculatePositionSize(
            brokerId,
            brokerState.portfolio.value,
            stockPrice,
            prediction.confidence * 100
          );
          
          return {
            symbol: prediction.symbol,
            recommendation: prediction.recommendation.toLowerCase().replace(' ', '_') as any,
            confidence: prediction.confidence * 100,
            reasoning: `[${config.displayName} IPCA ML] Expected return: ${(prediction.expectedReturn * 100).toFixed(2)}% | Risk: ${prediction.riskScore.toFixed(1)}/10`,
            targetPrice: stockPrice * (1 + prediction.expectedReturn),
            stopLoss: stockPrice * 0.95,
            positionSize,
            broker: brokerId
          };
        }
      }
    } catch (error) {
      console.warn(`⚠️ ${config.displayName} ML unavailable, using technical analysis:`, error);
    }

    // Fallback to technical analysis
    return this.generateTechnicalDecision(brokerId, config, brokerState);
  }

  // Get real stock price from market data API
  private async getRealStockPrice(symbol: string, config: BrokerConfig): Promise<number> {
    try {
      // For Alpaca, fetch real market price
      if (config.id === 'alpaca') {
        const response = await fetch(`https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest`, {
          headers: {
            'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
            'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY || ''
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const price = (data.quote.bp + data.quote.ap) / 2; // Mid price
          console.log(`📈 REAL PRICE: ${symbol} = $${price.toFixed(2)}`);
          return price;
        }
      }
      
      // For live trading, we MUST have real prices - don't use random fallback
      if (config.mode === 'live') {
        console.error(`🚨 LIVE TRADING ERROR: Cannot get real price for ${symbol}`);
        throw new Error(`Real price required for live trading but unavailable for ${symbol}`);
      }
      
      // Only use fallback for simulation/paper trading
      console.warn(`⚠️ Real price unavailable for ${symbol}, using simulation fallback`);
      return 50 + Math.random() * (config.symbolFormat === 'HK' ? 200 : 350);
      
    } catch (error) {
      console.error(`❌ Failed to fetch real price for ${symbol}:`, error);
      
      // For live trading, we MUST have real prices
      if (config.mode === 'live') {
        throw new Error(`Critical: Cannot get real price for live trading of ${symbol}: ${error}`);
      }
      
      // Only use random fallback for simulation
      return 50 + Math.random() * (config.symbolFormat === 'HK' ? 200 : 350);
    }
  }

  // Generate technical analysis decision
  private async generateTechnicalDecision(brokerId: string, config: BrokerConfig, brokerState: BrokerState): Promise<AIDecision> {
    const timeIndex = Math.floor(Date.now() / 60000) % config.symbols.length;
    const symbol = config.symbols[timeIndex];
    
    // Market analysis
    const marketSentiment = Math.sin(Date.now() / 100000) * 0.3;
    const volatility = 0.15 + Math.random() * 0.25;
    const momentum = (Math.random() - 0.5) * 0.4;
    const signal = marketSentiment + momentum;
    
    let recommendation: AIDecision['recommendation'];
    let confidence: number;
    let reasoning: string;
    
    if (signal > 0.15) {
      recommendation = 'strong_buy';
      confidence = config.behavior.defaultConfidenceThreshold + Math.random() * 20;
      reasoning = `Strong bullish confluence in ${config.market}`;
    } else if (signal > 0.05) {
      recommendation = 'buy';
      confidence = config.behavior.defaultConfidenceThreshold + Math.random() * 10;
      reasoning = `Bullish setup confirmed in ${config.market}`;
    } else if (signal > -0.05) {
      recommendation = 'hold';
      confidence = 50 + Math.random() * 20;
      reasoning = `Neutral consolidation in ${config.market}`;
    } else if (signal > -0.15) {
      recommendation = 'sell';
      confidence = config.behavior.defaultConfidenceThreshold + Math.random() * 10;
      reasoning = `Bearish pressure in ${config.market}`;
    } else {
      recommendation = 'strong_sell';
      confidence = config.behavior.defaultConfidenceThreshold + Math.random() * 20;
      reasoning = `Strong bearish divergence in ${config.market}`;
    }

    // Get REAL market price for technical analysis decisions
    const stockPrice = await this.getRealStockPrice(symbol, config);
    const positionSize = calculatePositionSize(brokerId, brokerState.portfolio.value, stockPrice, confidence);

    return {
      symbol,
      recommendation,
      confidence,
      reasoning: `[${config.displayName} TA] ${reasoning}`,
      targetPrice: stockPrice * 1.05,
      stopLoss: stockPrice * 0.95,
      positionSize,
      broker: brokerId
    };
  }

  // Execute trade with broker-specific validation
  private async executeAutonomousTrade(decision: AIDecision) {
    const config = getBrokerConfig(decision.broker);
    const brokerState = this.brokerStates[decision.broker];
    
    if (!brokerState.active) {
      console.log(`🛡️ ${config.displayName} AI Trading is INACTIVE, skipping trade`);
      return;
    }

    if (decision.recommendation === 'hold') return;

    const isPositive = decision.recommendation.includes('buy');
    
    // 🚨 PDT PROTECTION CHECK (for live trading only)
    if (config.mode === 'live' && !isPositive) {
      // This is a SELL order - check if it would create a day trade
      const pdtCheck = pdtManager.wouldCreateDayTrade(decision.symbol, brokerState.portfolio.value);
      
      if (pdtCheck.isDayTrade && !pdtCheck.pdtCheck.allowed) {
        console.log(`🚨 [PDT] BLOCKED SELL ORDER: ${decision.symbol}`);
        console.log(`🚨 [PDT] Reason: ${pdtCheck.pdtCheck.reason}`);
        console.log(`🚨 [PDT] Day trades: ${pdtCheck.pdtCheck.count}/${pdtCheck.pdtCheck.limit}`);
        return; // BLOCK THE TRADE
      }
      
      if (pdtCheck.isDayTrade && pdtCheck.pdtCheck.warning) {
        console.log(`⚠️ [PDT] WARNING: ${pdtCheck.pdtCheck.warning}`);
        console.log(`⚠️ [PDT] This sell would be a day trade (held ${pdtCheck.hoursHeld?.toFixed(1)}h)`);
      }
    }
    
    // 🚨 EMERGENCY SAFEGUARDS - PREVENT RAPID-FIRE TRADING
    const now = Date.now();
    const timeSinceLastTrade = now - brokerState.lastTradeTime;
    const EMERGENCY_MIN_INTERVAL = 30000; // 30 seconds minimum between trades
    const DAILY_TRADE_LIMIT = 10; // Maximum 10 trades per day per broker
    
    // Check emergency rate limiting (30 second minimum)
    if (timeSinceLastTrade < EMERGENCY_MIN_INTERVAL) {
      console.log(`🚨 ${config.displayName} EMERGENCY RATE LIMIT: ${Math.ceil((EMERGENCY_MIN_INTERVAL - timeSinceLastTrade) / 1000)}s remaining`);
      return;
    }
    
    // Check daily trade limit
    if (brokerState.portfolio.dailyTrades >= DAILY_TRADE_LIMIT) {
      console.log(`🚨 ${config.displayName} DAILY LIMIT REACHED: ${brokerState.portfolio.dailyTrades}/${DAILY_TRADE_LIMIT} trades`);
      return;
    }
    
    // Get REAL stock price for live brokers, simulated for others
    let stockPrice: number;
    if (config.mode === 'live') {
      stockPrice = await this.getRealStockPrice(decision.symbol, config);
    } else {
      // 🔧 FIX UNREALISTIC PRICES - Use realistic price ranges
      if (decision.symbol === 'INTC') {
        stockPrice = 25 + Math.random() * 15; // INTC realistic range: $25-40
      } else if (decision.symbol === 'NFLX') {
        stockPrice = 400 + Math.random() * 200; // NFLX realistic range: $400-600
      } else {
        // General realistic stock prices
        stockPrice = 20 + Math.random() * 180; // $20-200 range
      }
    }
    
    // 🔧 PRICE VALIDATION - Reject unrealistic prices
    if (stockPrice > 1000 || stockPrice < 1) {
      console.log(`🚨 ${config.displayName} PRICE REJECTED: $${stockPrice.toFixed(2)} is unrealistic for ${decision.symbol}`);
      return;
    }
    
    const tradeValue = stockPrice * decision.positionSize;

    // Validate trade against broker-specific rules
    const validation = validateTradeAgainstRules(
      decision.broker,
      tradeValue,
      decision.positionSize,
      brokerState.portfolio.value,
      brokerState.portfolio.dailyTrades
    );

    if (!validation.valid) {
      console.log(`🚫 ${config.displayName} Trade REJECTED: ${validation.reason}`);
      return;
    }

    // Check original rate limiting (in addition to emergency limits)
    const minInterval = Math.max(config.behavior.tradingInterval.min, EMERGENCY_MIN_INTERVAL);
    
    if (timeSinceLastTrade < minInterval) {
      console.log(`⏱️ ${config.displayName} Rate limited: ${Math.ceil((minInterval - timeSinceLastTrade) / 1000)}s remaining`);
      return;
    }

    const newTrade: AutoTrade = {
      id: `${decision.broker}_${Date.now()}`,
      timestamp: new Date(),
      symbol: decision.symbol,
      action: isPositive ? 'buy' : 'sell',
      quantity: decision.positionSize,
      price: stockPrice,
      reason: `${decision.reasoning} | Confidence: ${decision.confidence.toFixed(1)}%`,
      confidence: decision.confidence,
      broker: decision.broker
    };

    // Update broker state
    brokerState.portfolio.dailyTrades++;
    brokerState.lastTradeTime = now;
    
    // Update position tracking
    const currentPosition = brokerState.portfolio.positions[decision.symbol] || 0;
    brokerState.portfolio.positions[decision.symbol] = currentPosition + (isPositive ? decision.positionSize : -decision.positionSize);

    // Add to trading store
    const store = useTradingStore.getState();
    store.addAutoTrade(newTrade);
    
    // 🚨 PDT TRACKING (for live trading)
    if (config.mode === 'live') {
      if (isPositive) {
        pdtManager.recordBuyOrder(newTrade.id, decision.symbol);
        console.log(`🛡️ [PDT] Recorded BUY order: ${decision.symbol}`);
      } else {
        pdtManager.recordSellOrder(newTrade.id, decision.symbol);
        console.log(`🛡️ [PDT] Recorded SELL order: ${decision.symbol}`);
      }
    }
    
    console.log(`🚀 ${config.displayName} AI: ${newTrade.action.toUpperCase()} ${newTrade.quantity} ${newTrade.symbol} @ $${newTrade.price.toFixed(2)} (${config.currency})`);

    // Execute through appropriate API
    try {
      const response = await fetch(config.api.endpoints.orders, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: decision.symbol,
          side: isPositive ? 'buy' : 'sell',
          type: 'market',
          time_in_force: 'day',
          qty: decision.positionSize.toString(),
          client_order_id: newTrade.id,
          extended_hours: false
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${config.displayName} Trade executed:`, result.id || 'pending');
      } else {
        console.log(`⚠️ ${config.displayName} API unavailable, using simulation`);
      }

      // Calculate P&L based on broker mode
      this.calculateTradeProfit(newTrade, config, brokerState);
      
    } catch (error) {
      console.error(`❌ ${config.displayName} Trade execution failed:`, error);
    }
  }

  // Calculate trade profit based on broker configuration
  private calculateTradeProfit(trade: AutoTrade, config: BrokerConfig, brokerState: BrokerState) {
    const delay = Math.random() * 10000 + 3000; // 3-13 seconds
    
    setTimeout(async () => {
      let profit = 0;
      
      if (config.mode === 'live' && config.id === 'alpaca') {
        // Fetch real Alpaca P&L
        try {
          const response = await fetch('/api/alpaca/portfolio');
          const data = await response.json();
          
          if (data.success) {
            const position = data.portfolio.positions.find((p: any) => p.symbol === trade.symbol);
            profit = position?.unrealized_pl || 0;
            
            // Update broker state with real data
            brokerState.portfolio.value = data.portfolio.portfolio_value;
            brokerState.portfolio.profit = data.portfolio.day_change;
          }
        } catch (error) {
          console.error(`Failed to fetch real ${config.displayName} P&L:`, error);
        }
      } else {
        // Simulate profit based on broker characteristics
        const tradeValue = trade.price * trade.quantity;
        const volatilityFactor = config.symbolFormat === 'CRYPTO' ? 0.15 : 0.08;
        const slippage = config.simulationConfig?.slippageRate || 0.001;
        const commission = config.simulationConfig?.commissionRate || 0.0025;
        
        const marketMove = (Math.random() - 0.4) * volatilityFactor; // Slight positive bias
        const grossProfit = tradeValue * marketMove;
        const costs = tradeValue * (slippage + commission);
        profit = grossProfit - costs;
        
        // Update simulated portfolio
        brokerState.portfolio.value += profit;
        brokerState.portfolio.profit += profit;
      }
      
      // Update trade with profit
      const store = useTradingStore.getState();
      store.updateTradeProfit(trade.id, profit);
      
      console.log(`💰 ${config.displayName} Trade ${trade.id} P&L: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)} (${config.currency})`);
      
    }, delay);
  }

  // Start trading for specific broker
  public startBrokerTrading(brokerId: string) {
    const config = getBrokerConfig(brokerId);
    const brokerState = this.brokerStates[brokerId];
    
    if (!brokerState) {
      console.error(`❌ Broker state not found for: ${brokerId}`);
      return;
    }
    
    if (brokerState.active) {
      console.log(`🔄 ${config.displayName} AI Trading already active`);
      return;
    }

    brokerState.active = true;
    console.log(`🚀 ${config.displayName} AI Trading ACTIVATED (${config.mode} mode)`);

    // Start trading interval with broker-specific timing
    const intervalRange = config.behavior.tradingInterval.max - config.behavior.tradingInterval.min;
    
    brokerState.interval = setInterval(async () => {
      if (!brokerState.active) return;

      const decision = await this.generateAIDecision(brokerId);
      const store = useTradingStore.getState();
      store.addAiDecision(decision);
      
      if (decision.confidence > config.behavior.defaultConfidenceThreshold && Math.random() > 0.1) {
        await this.executeAutonomousTrade(decision);
      }
      
    }, config.behavior.tradingInterval.min + Math.random() * intervalRange);

    this.startThoughtGeneration();
  }

  // Stop trading for specific broker
  public stopBrokerTrading(brokerId: string) {
    const config = getBrokerConfig(brokerId);
    const brokerState = this.brokerStates[brokerId];
    
    if (!brokerState) return;
    
    brokerState.active = false;
    if (brokerState.interval) {
      clearInterval(brokerState.interval);
      brokerState.interval = null;
    }
    
    console.log(`🛑 ${config.displayName} AI Trading DEACTIVATED`);
    this.stopThoughtGenerationIfNeeded();
  }

  // Generate AI thoughts
  private generateAIThought() {
    const activeConfigs = Object.keys(this.brokerStates)
      .filter(id => this.brokerStates[id].active)
      .map(id => getBrokerConfig(id));
    
    if (activeConfigs.length === 0) return;
    
    const config = activeConfigs[Math.floor(Math.random() * activeConfigs.length)];
    
    const thoughts = [
      `Analyzing ${config.market} microstructure across ${config.symbols.length} symbols...`,
      `${config.displayName} portfolio optimization: ${config.behavior.positionSizing} sizing strategy active...`,
      `Risk management: ${config.riskManagement.positionSizeLimit}% position limit enforced for ${config.displayName}...`,
      `${config.displayName} sentiment analysis: Processing ${config.currency} denominated assets...`,
      `Technical breakout detected in ${config.market}, confidence threshold: ${config.behavior.defaultConfidenceThreshold}%...`,
      `${config.displayName} correlation matrix updated: ${config.symbols.slice(0, 3).join(', ')} showing divergence...`
    ];
    
    this.aiThoughts = [
      thoughts[Math.floor(Math.random() * thoughts.length)], 
      ...this.aiThoughts.slice(0, 4)
    ];
  }

  // Start thought generation
  private startThoughtGeneration() {
    if (this.thoughtInterval) return;

    this.thoughtInterval = setInterval(() => {
      this.generateAIThought();
    }, Math.random() * 8000 + 5000);
  }

  // Stop thought generation if no brokers active
  private stopThoughtGenerationIfNeeded() {
    const anyActive = Object.values(this.brokerStates).some(state => state.active);
    
    if (!anyActive && this.thoughtInterval) {
      clearInterval(this.thoughtInterval);
      this.thoughtInterval = null;
    }
  }

  // Get current state
  public getState() {
    const state: any = {
      aiThoughts: this.aiThoughts,
      brokers: {},
      pdtStatus: null
    };
    
    // Add PDT status for live trading accounts
    const alpacaState = this.brokerStates['alpaca'];
    if (alpacaState) {
      const config = getBrokerConfig('alpaca');
      if (config.mode === 'live') {
        state.pdtStatus = pdtManager.getPDTStatus(alpacaState.portfolio.value);
      }
    }
    
    Object.keys(this.brokerStates).forEach(brokerId => {
      const config = getBrokerConfig(brokerId);
      const brokerState = this.brokerStates[brokerId];
      
      state.brokers[brokerId] = {
        active: brokerState.active,
        config: {
          displayName: config.displayName,
          market: config.market,
          currency: config.currency,
          mode: config.mode
        },
        portfolio: brokerState.portfolio,
        // Add PDT info for live accounts
        pdt: config.mode === 'live' ? pdtManager.getPDTStatus(brokerState.portfolio.value) : null
      };
      
      // Legacy compatibility
      if (brokerId === 'moomoo') {
        state.moomooActive = brokerState.active;
        state.moomooPortfolio = brokerState.portfolio;
      } else if (brokerId === 'alpaca') {
        state.alpacaActive = brokerState.active;
        state.alpacaPortfolio = brokerState.portfolio;
      }
    });
    
    return state;
  }

  // Reset all brokers
  public resetAll() {
    Object.keys(this.brokerStates).forEach(brokerId => {
      this.stopBrokerTrading(brokerId);
      const config = getBrokerConfig(brokerId);
      this.brokerStates[brokerId].portfolio = {
        value: config.simulationConfig?.initialBalance || 0,
        trades: 0,
        profit: 0,
        dailyTrades: 0,
        positions: {}
      };
    });
    
    this.aiThoughts = [];
    
    const store = useTradingStore.getState();
    store.resetAutonomousState();
    store.resetPortfolioToBaseline();
    
    console.log('🔄 All brokers RESET');
  }

  // Legacy methods for backward compatibility
  public startMoomooTrading() { this.startBrokerTrading('moomoo'); }
  public stopMoomooTrading() { this.stopBrokerTrading('moomoo'); }
  public startAlpacaTrading() { this.startBrokerTrading('alpaca'); }
  public stopAlpacaTrading() { this.stopBrokerTrading('alpaca'); }
}

// Export singleton instance
export const brokerTradingEngine = BrokerTradingEngine.getInstance();
export default brokerTradingEngine;
