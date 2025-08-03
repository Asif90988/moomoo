// Neural Core Alpha-7 - Demo Data Generator
// Generates realistic demo data for live platform demonstration

export interface DemoPortfolioData {
  symbol: string;
  shares: number;
  currentPrice: number;
  avgCost: number;
  marketValue: number;
  weight: number;
  dailyPnL: number;
  totalPnL: number;
  dayChangePercent: number;
}

export interface DemoPerformanceData {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weekChange: number;
  monthChange: number;
  yearToDateChange: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
}

export class DemoDataGenerator {
  private baseTimestamp: number;
  private priceHistory: Map<string, number[]> = new Map();

  constructor() {
    this.baseTimestamp = Date.now();
    this.initializePriceHistory();
  }

  private initializePriceHistory() {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX', 'AMD', 'SPY'];
    const basePrices = {
      'AAPL': 175,
      'GOOGL': 140,
      'MSFT': 420,
      'TSLA': 245,
      'NVDA': 875,
      'AMZN': 145,
      'META': 485,
      'NFLX': 450,
      'AMD': 140,
      'SPY': 435
    };

    symbols.forEach(symbol => {
      const basePrice = basePrices[symbol as keyof typeof basePrices];
      const history = [];
      let currentPrice = basePrice;

      // Generate 252 days of price history (1 trading year)
      for (let i = 0; i < 252; i++) {
        const dailyReturn = (Math.random() - 0.5) * 0.04; // ±2% daily volatility
        currentPrice = currentPrice * (1 + dailyReturn);
        history.push(currentPrice);
      }

      this.priceHistory.set(symbol, history);
    });
  }

  getCurrentPrice(symbol: string): number {
    const history = this.priceHistory.get(symbol);
    if (!history) return 100; // Default price
    
    // Add some real-time variation
    const lastPrice = history[history.length - 1];
    const variation = (Math.random() - 0.5) * 0.002; // ±0.1% real-time variation
    return lastPrice * (1 + variation);
  }

  getDemoPortfolio(): DemoPortfolioData[] {
    const holdings = [
      { symbol: 'AAPL', shares: 57 },
      { symbol: 'GOOGL', shares: 71 },
      { symbol: 'MSFT', shares: 24 },
      { symbol: 'TSLA', shares: 41 },
      { symbol: 'NVDA', shares: 11 },
      { symbol: 'AMZN', shares: 69 },
      { symbol: 'META', shares: 21 },
      { symbol: 'NFLX', shares: 22 },
      { symbol: 'AMD', shares: 71 },
      { symbol: 'SPY', shares: 23 }
    ];

    const portfolio: DemoPortfolioData[] = holdings.map(holding => {
      const currentPrice = this.getCurrentPrice(holding.symbol);
      const avgCost = currentPrice * (0.85 + Math.random() * 0.3); // Some profit/loss variation
      const marketValue = holding.shares * currentPrice;
      const totalPnL = holding.shares * (currentPrice - avgCost);
      const dayChangePercent = (Math.random() - 0.5) * 0.06; // ±3% daily change
      const dailyPnL = marketValue * dayChangePercent;

      return {
        symbol: holding.symbol,
        shares: holding.shares,
        currentPrice: Math.round(currentPrice * 100) / 100,
        avgCost: Math.round(avgCost * 100) / 100,
        marketValue: Math.round(marketValue * 100) / 100,
        weight: 0, // Will be calculated later
        dailyPnL: Math.round(dailyPnL * 100) / 100,
        totalPnL: Math.round(totalPnL * 100) / 100,
        dayChangePercent: Math.round(dayChangePercent * 10000) / 100
      };
    });

    // Calculate weights
    const totalValue = portfolio.reduce((sum, holding) => sum + holding.marketValue, 0);
    portfolio.forEach(holding => {
      holding.weight = Math.round((holding.marketValue / totalValue) * 10000) / 100;
    });

    return portfolio.sort((a, b) => b.marketValue - a.marketValue);
  }

  getDemoPerformance(): DemoPerformanceData {
    const portfolio = this.getDemoPortfolio();
    const totalValue = portfolio.reduce((sum, h) => sum + h.marketValue, 0);
    const totalPnL = portfolio.reduce((sum, h) => sum + h.totalPnL, 0);
    const dayChange = portfolio.reduce((sum, h) => sum + h.dailyPnL, 0);

    // Generate realistic performance metrics
    const totalPnLPercent = (totalPnL / (totalValue - totalPnL)) * 100;
    const dayChangePercent = (dayChange / totalValue) * 100;

    return {
      totalValue: Math.round(totalValue * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      totalPnLPercent: Math.round(totalPnLPercent * 100) / 100,
      dayChange: Math.round(dayChange * 100) / 100,
      dayChangePercent: Math.round(dayChangePercent * 100) / 100,
      weekChange: Math.round(dayChange * 3.2 * 100) / 100, // Simulate weekly
      monthChange: Math.round(dayChange * 12.8 * 100) / 100, // Simulate monthly
      yearToDateChange: Math.round(totalPnL * 0.75 * 100) / 100, // Simulate YTD
      sharpeRatio: 1.85 + Math.random() * 0.3, // 1.85-2.15
      maxDrawdown: 0.08 + Math.random() * 0.07, // 8-15%
      winRate: 0.72 + Math.random() * 0.15, // 72-87%
      totalTrades: 248 + Math.floor(Math.random() * 50) // 248-298 trades
    };
  }

  getRecentTrades(count: number = 10) {
    const portfolio = this.getDemoPortfolio();
    const trades = [];

    for (let i = 0; i < count; i++) {
      const holding = portfolio[Math.floor(Math.random() * portfolio.length)];
      const isEntry = Math.random() > 0.5;
      const quantity = Math.floor(Math.random() * 50) + 1;
      const price = holding.currentPrice * (0.95 + Math.random() * 0.1);
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      trades.push({
        id: `trade_${i}_${Date.now()}`,
        symbol: holding.symbol,
        side: isEntry ? (Math.random() > 0.6 ? 'BUY' : 'SELL') : (Math.random() > 0.6 ? 'SELL' : 'BUY'),
        quantity,
        price: Math.round(price * 100) / 100,
        total: Math.round(quantity * price * 100) / 100,
        timestamp,
        status: 'FILLED',
        aiConfidence: 0.65 + Math.random() * 0.3,
        reasoning: [
          'Technical analysis indicates bullish momentum',
          'Earnings surprise expected based on alternative data',
          'Risk-adjusted return optimization',
          'Portfolio rebalancing requirement'
        ][Math.floor(Math.random() * 4)]
      });
    }

    return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getMarketData() {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX', 'AMD', 'SPY'];
    
    return symbols.map(symbol => {
      const currentPrice = this.getCurrentPrice(symbol);
      const dayChange = currentPrice * ((Math.random() - 0.5) * 0.04);
      const dayChangePercent = (dayChange / currentPrice) * 100;
      const volume = Math.floor(Math.random() * 50000000) + 10000000; // 10M-60M volume

      return {
        symbol,
        price: Math.round(currentPrice * 100) / 100,
        change: Math.round(dayChange * 100) / 100,
        changePercent: Math.round(dayChangePercent * 100) / 100,
        volume,
        high: Math.round(currentPrice * 1.025 * 100) / 100,
        low: Math.round(currentPrice * 0.975 * 100) / 100,
        open: Math.round(currentPrice * (0.98 + Math.random() * 0.04) * 100) / 100,
        marketCap: volume * currentPrice * (50 + Math.random() * 200), // Rough market cap
        pe: 15 + Math.random() * 25, // P/E ratio
        dividend: Math.random() * 3, // Dividend yield
        beta: 0.8 + Math.random() * 0.8 // Beta 0.8-1.6
      };
    });
  }

  getAIThoughts() {
    const thoughts = [
      {
        agent: 'MARKET_ANALYZER',
        message: 'Detecting bullish momentum in technology sector based on earnings revisions',
        confidence: 0.82,
        reasoning: [
          'Semiconductor stocks showing relative strength',
          'Analyst estimate revisions trending positive',
          'Alternative data suggests increased business activity'
        ]
      },
      {
        agent: 'RISK_MANAGER',
        message: 'Portfolio correlation risk elevated due to tech concentration',
        confidence: 0.91,
        reasoning: [
          'Cross-asset correlations above 0.75 threshold',
          'Sector concentration at 68% of portfolio',
          'Diversification recommendation: Add defensive sectors'
        ]
      },
      {
        agent: 'EXECUTION_ENGINE',
        message: 'Optimal execution window identified for NVDA position adjustment',
        confidence: 0.77,
        reasoning: [
          'Low volatility period detected',
          'Institutional flow indicates favorable liquidity',
          'Transaction cost model suggests 0.12% savings vs market order'
        ]
      },
      {
        agent: 'SENTIMENT_TRACKER',
        message: 'Social sentiment spike detected for renewable energy stocks',
        confidence: 0.69,
        reasoning: [
          'Twitter mentions up 340% in past 24 hours',
          'Reddit WSB community showing increased interest',
          'News sentiment analysis trending positive'
        ]
      },
      {
        agent: 'FACTOR_MODEL',
        message: 'IPCA model indicates momentum factor strength increasing',
        confidence: 0.88,
        reasoning: [
          'Time-varying factor loadings show momentum acceleration',
          '12-month momentum factor explaining 23% of cross-sectional returns',
          'Factor timing model suggests 2-week persistence'
        ]
      }
    ];

    return thoughts.map(thought => ({
      ...thought,
      id: `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'ANALYSIS'
    }));
  }

  // Method to generate real-time updates
  getRealtimeUpdate() {
    return {
      portfolio: this.getDemoPortfolio(),
      performance: this.getDemoPerformance(),
      marketData: this.getMarketData(),
      aiThoughts: this.getAIThoughts(),
      timestamp: new Date()
    };
  }
}

// Export singleton instance
export const demoDataGenerator = new DemoDataGenerator();