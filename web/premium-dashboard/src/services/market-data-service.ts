// Neural Core Alpha-7 - Market Data Service for IPCA Training
// Fetches real historical and current market data for ML model training

interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  returns: number;
}

interface MarketDataResponse {
  returns: number[][]; // [time x assets] matrix
  prices: number[][];
  volumes: number[][];
  timestamps: Date[];
  symbols: string[];
}

export class MarketDataService {
  private alpacaApiKey: string;
  private alpacaSecret: string;
  private alpacaBaseUrl: string;

  constructor() {
    this.alpacaApiKey = process.env.ALPACA_API_KEY || '';
    this.alpacaSecret = process.env.ALPACA_SECRET_KEY || '';
    
    // Use data API for historical data (works for both paper and live)
    this.alpacaBaseUrl = 'https://data.alpaca.markets';
  }

  /**
   * Fetch historical market data for IPCA training
   */
  async getHistoricalData(
    symbols: string[], 
    startDate: Date, 
    endDate: Date
  ): Promise<MarketDataResponse> {
    console.log(`📊 Fetching historical data for ${symbols.length} symbols from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    try {
      // Fetch data from Alpaca API
      const historicalData = await this.fetchFromAlpaca(symbols, startDate, endDate);
      
      if (historicalData) {
        return this.processHistoricalData(historicalData, symbols);
      }
    } catch (error) {
      console.warn('⚠️ Alpaca API unavailable, using synthetic data for IPCA training:', error);
    }

    // 🚨 LIVE TRADING CHECK: Allow synthetic fallback for demo purposes
    const isLiveMode = process.env.NEXT_PUBLIC_ALPACA_PAPER_TRADING === 'false';
    
    if (isLiveMode) {
      console.warn('🚨 LIVE TRADING: Real historical data unavailable, using synthetic for DEMO purposes');
      console.warn('⚠️ Note: In production, ensure real historical data is available');
    }
    
    // 🔧 FALLBACK: Use synthetic data (temporary for demo)
    console.warn('⚠️ Using synthetic data generation for demonstration');
    return this.generateSyntheticData(symbols, startDate, endDate);
  }

  /**
   * Fetch data from Alpaca Markets API
   */
  private async fetchFromAlpaca(
    symbols: string[], 
    startDate: Date, 
    endDate: Date
  ): Promise<any> {
    if (!this.alpacaApiKey || !this.alpacaSecret) {
      throw new Error('Alpaca API credentials not configured');
    }

    const headers = {
      'APCA-API-KEY-ID': this.alpacaApiKey,
      'APCA-API-SECRET-KEY': this.alpacaSecret,
      'Content-Type': 'application/json'
    };

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    // Fetch bars data for all symbols
    const url = `${this.alpacaBaseUrl}/v2/stocks/bars`;
    const params = new URLSearchParams({
      symbols: symbols.join(','),
      timeframe: '1Day',
      start: startStr,
      end: endStr,
      limit: '1000',
      adjustment: 'all'
    });

    console.log(`🔗 Fetching from Alpaca: ${url}?${params.toString()}`);

    const response = await fetch(`${url}?${params.toString()}`, { 
      headers
    });

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched ${Object.keys(data.bars || {}).length} symbols from Alpaca`);
    return data;
  }

  /**
   * Process real Alpaca data into IPCA format
   */
  private processHistoricalData(alpacaData: any, symbols: string[]): MarketDataResponse {
    const bars = alpacaData.bars || {};
    const processedData: { [symbol: string]: HistoricalDataPoint[] } = {};

    // Process each symbol's data
    for (const symbol of symbols) {
      const symbolBars = bars[symbol] || [];
      processedData[symbol] = symbolBars.map((bar: any, index: number) => {
        const close = parseFloat(bar.c);
        const prevClose = index > 0 ? parseFloat(symbolBars[index - 1].c) : close;
        const returns = index > 0 ? (close - prevClose) / prevClose : 0;

        return {
          date: new Date(bar.t),
          open: parseFloat(bar.o),
          high: parseFloat(bar.h),
          low: parseFloat(bar.l),
          close: close,
          volume: parseInt(bar.v),
          returns: returns
        };
      });
    }

    // Convert to matrix format
    return this.formatDataForIPCA(processedData, symbols);
  }

  /**
   * Generate synthetic market data for testing/fallback
   */
  private generateSyntheticData(
    symbols: string[], 
    startDate: Date, 
    endDate: Date
  ): MarketDataResponse {
    console.log('🎲 Generating synthetic market data for IPCA training...');

    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const processedData: { [symbol: string]: HistoricalDataPoint[] } = {};

    for (const symbol of symbols) {
      const symbolData: HistoricalDataPoint[] = [];
      let currentPrice = 100 + Math.random() * 200; // Start price between $100-300
      
      // Generate realistic price series with correlation to market
      const marketBeta = 0.8 + Math.random() * 0.4; // Beta between 0.8-1.2
      const volatility = 0.15 + Math.random() * 0.25; // Volatility 15-40%
      const drift = -0.05 + Math.random() * 0.15; // Annual drift -5% to +10%
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        
        // Market factor (common to all stocks)
        const marketReturn = (Math.random() - 0.5) * 0.04; // ±2% daily market moves
        
        // Idiosyncratic return
        const idiosyncraticReturn = (Math.random() - 0.5) * 0.06; // ±3% stock-specific
        
        // Total return = market beta * market return + idiosyncratic + drift
        const dailyReturn = marketBeta * marketReturn + idiosyncraticReturn + drift / 252;
        
        const prevPrice = i > 0 ? symbolData[i - 1].close : currentPrice;
        const newPrice = prevPrice * (1 + dailyReturn);
        
        // Add some realistic intraday variation
        const dayRange = newPrice * volatility * 0.5;
        const open = newPrice + (Math.random() - 0.5) * dayRange * 0.3;
        const high = Math.max(open, newPrice) + Math.random() * dayRange * 0.2;
        const low = Math.min(open, newPrice) - Math.random() * dayRange * 0.2;
        const volume = Math.floor(1000000 + Math.random() * 5000000); // 1-6M volume
        
        symbolData.push({
          date,
          open,
          high,
          low,
          close: newPrice,
          volume,
          returns: i > 0 ? dailyReturn : 0
        });
      }
      
      processedData[symbol] = symbolData;
    }

    return this.formatDataForIPCA(processedData, symbols);
  }

  /**
   * Format processed data for IPCA model
   */
  private formatDataForIPCA(
    processedData: { [symbol: string]: HistoricalDataPoint[] },
    symbols: string[]
  ): MarketDataResponse {
    // Find common dates across all symbols
    const allDates = new Set<string>();
    for (const symbol of symbols) {
      if (processedData[symbol]) {
        for (const point of processedData[symbol]) {
          allDates.add(point.date.toISOString().split('T')[0]);
        }
      }
    }

    const sortedDates = Array.from(allDates).sort();
    const timestamps = sortedDates.map(dateStr => new Date(dateStr));

    // Create matrices: [time x assets]
    const returns: number[][] = [];
    const prices: number[][] = [];
    const volumes: number[][] = [];

    for (let t = 0; t < timestamps.length; t++) {
      const dateStr = timestamps[t].toISOString().split('T')[0];
      const timeReturns: number[] = [];
      const timePrices: number[] = [];
      const timeVolumes: number[] = [];

      for (const symbol of symbols) {
        const symbolData = processedData[symbol] || [];
        const dataPoint = symbolData.find(d => 
          d.date.toISOString().split('T')[0] === dateStr
        );

        if (dataPoint) {
          timeReturns.push(dataPoint.returns);
          timePrices.push(dataPoint.close);
          timeVolumes.push(dataPoint.volume);
        } else {
          // Fill missing data with zeros/previous values
          timeReturns.push(0);
          timePrices.push(timePrices.length > 0 ? timePrices[timePrices.length - 1] : 100);
          timeVolumes.push(1000000);
        }
      }

      returns.push(timeReturns);
      prices.push(timePrices);
      volumes.push(timeVolumes);
    }

    console.log(`📈 Formatted market data: ${returns.length} time periods x ${symbols.length} assets`);

    return {
      returns,
      prices,
      volumes,
      timestamps,
      symbols
    };
  }

  /**
   * Get current market data for real-time predictions
   */
  async getCurrentMarketData(symbols: string[]): Promise<{ [symbol: string]: number }> {
    // 🚨 LIVE TRADING CHECK: Prevent synthetic data in live mode
    const isLiveMode = process.env.NEXT_PUBLIC_ALPACA_PAPER_TRADING === 'false';
    
    try {
      if (!this.alpacaApiKey) {
        throw new Error('Alpaca API not configured');
      }

      const headers = {
        'APCA-API-KEY-ID': this.alpacaApiKey,
        'APCA-API-SECRET-KEY': this.alpacaSecret,
      };

      const url = `${this.alpacaBaseUrl}/v2/stocks/quotes/latest`;
      const params = new URLSearchParams({
        symbols: symbols.join(',')
      });

      const response = await fetch(`${url}?${params.toString()}`, { headers });
      
      if (!response.ok) {
        throw new Error(`Alpaca quotes API error: ${response.status}`);
      }

      const data = await response.json();
      const currentPrices: { [symbol: string]: number } = {};

      for (const symbol of symbols) {
        const quote = data.quotes?.[symbol];
        if (quote) {
          currentPrices[symbol] = (parseFloat(quote.ap) + parseFloat(quote.bp)) / 2; // Mid price
        }
      }

      return currentPrices;
    } catch (error) {
      console.error('❌ Market data API failed:', error);
      
      // 🚨 LIVE TRADING: No synthetic fallback allowed
      if (isLiveMode) {
        console.error('🚨 LIVE TRADING ERROR: Real market data required but API failed');
        throw new Error(`Critical: Live trading requires real market data but API failed: ${error}`);
      }
      
      // 🔧 SIMULATION FALLBACK (only for paper trading)
      console.warn('⚠️ Using synthetic current prices (PAPER TRADING ONLY):', error);
      const syntheticPrices: { [symbol: string]: number } = {};
      for (const symbol of symbols) {
        syntheticPrices[symbol] = 100 + Math.random() * 200;
      }
      return syntheticPrices;
    }
  }

  /**
   * Calculate technical indicators for characteristics
   */
  calculateTechnicalIndicators(prices: number[], volumes: number[]): {
    sma20: number;
    rsi14: number;
    volatility: number;
    momentum: number;
    volumeRatio: number;
  } {
    const length = Math.min(prices.length, 20);
    const recentPrices = prices.slice(-length);
    const recentVolumes = volumes.slice(-length);

    // Simple Moving Average (20-day)
    const sma20 = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;

    // RSI (14-day approximation)
    let gains = 0, losses = 0;
    for (let i = 1; i < Math.min(recentPrices.length, 14); i++) {
      const change = recentPrices[i] - recentPrices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    const rs = avgGain / (avgLoss || 0.01);
    const rsi14 = 100 - (100 / (1 + rs));

    // Volatility (standard deviation of returns)
    const returns = recentPrices.slice(1).map((price, i) => 
      (price - recentPrices[i]) / recentPrices[i]
    );
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    );

    // Price momentum (20-day)
    const momentum = recentPrices.length >= 20 
      ? (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0]
      : 0;

    // Volume ratio (current vs average)
    const avgVolume = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
    const volumeRatio = recentVolumes[recentVolumes.length - 1] / (avgVolume || 1000000);

    return {
      sma20,
      rsi14,
      volatility,
      momentum,
      volumeRatio
    };
  }
}