// Neural Core Alpha-7 - Characteristics Service for IPCA Factor Model
// Generates stock characteristics used for time-varying factor loadings

interface StockCharacteristics {
  // Valuation characteristics
  marketCap: number;
  bookToMarket: number;
  earningsYield: number;
  priceToSales: number;
  
  // Profitability characteristics
  roe: number;
  roa: number;
  grossMargin: number;
  operatingMargin: number;
  
  // Growth characteristics
  revenueGrowth: number;
  earningsGrowth: number;
  assetGrowth: number;
  
  // Technical characteristics
  momentum1M: number;
  momentum3M: number;
  momentum12M: number;
  volatility: number;
  beta: number;
  
  // Quality characteristics
  debtToEquity: number;
  currentRatio: number;
  assetTurnover: number;
  
  // Momentum characteristics
  rsi: number;
  macdSignal: number;
  volumeRatio: number;
}

interface CharacteristicsResponse {
  data: number[][]; // [time x (assets * characteristics)] matrix - flattened for IPCA
  characteristics: string[]; // Names of characteristics
  timestamps: Date[];
  symbols: string[];
}

export class CharacteristicsService {
  private alpacaApiKey: string;
  private alpacaSecret: string;
  private alpacaBaseUrl: string;

  // Characteristic names in order
  private readonly characteristicNames = [
    'marketCap', 'bookToMarket', 'earningsYield', 'priceToSales',
    'roe', 'roa', 'grossMargin', 'operatingMargin',
    'revenueGrowth', 'earningsGrowth', 'assetGrowth',
    'momentum1M', 'momentum3M', 'momentum12M', 'volatility', 'beta',
    'debtToEquity', 'currentRatio', 'assetTurnover',
    'rsi', 'macdSignal', 'volumeRatio'
  ];

  constructor() {
    this.alpacaApiKey = process.env.ALPACA_API_KEY || '';
    this.alpacaSecret = process.env.ALPACA_SECRET_KEY || '';
    this.alpacaBaseUrl = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';
  }

  /**
   * Get historical characteristics for IPCA training
   */
  async getCharacteristics(
    symbols: string[], 
    startDate: Date, 
    endDate: Date
  ): Promise<CharacteristicsResponse> {
    console.log(`📊 Generating characteristics for ${symbols.length} symbols...`);

    try {
      // Try to fetch real fundamental data
      const fundamentalData = await this.fetchFundamentalData(symbols);
      
      if (fundamentalData && Object.keys(fundamentalData).length > 0) {
        return this.processRealCharacteristics(fundamentalData, symbols, startDate, endDate);
      }
    } catch (error) {
      console.warn('⚠️ Real fundamental data unavailable, using synthetic characteristics:', error);
    }

    // Fallback to synthetic characteristics
    return this.generateSyntheticCharacteristics(symbols, startDate, endDate);
  }

  /**
   * Fetch fundamental data from Alpaca or other sources
   */
  private async fetchFundamentalData(symbols: string[]): Promise<any> {
    if (!this.alpacaApiKey) {
      throw new Error('API credentials not available');
    }

    // Note: Alpaca doesn't provide fundamental data in paper trading
    // In production, you'd use services like Alpha Vantage, Financial Modeling Prep, etc.
    
    console.log('📈 Fundamental data not available in paper trading mode');
    return null;
  }

  /**
   * Process real fundamental data into characteristics matrix
   */
  private processRealCharacteristics(
    fundamentalData: any,
    symbols: string[],
    startDate: Date,
    endDate: Date
  ): CharacteristicsResponse {
    // Implementation for real fundamental data processing
    // This would parse actual financial statements and ratios
    
    throw new Error('Real fundamental data processing not yet implemented');
  }

  /**
   * Generate synthetic but realistic stock characteristics
   */
  private generateSyntheticCharacteristics(
    symbols: string[],
    startDate: Date,
    endDate: Date
  ): CharacteristicsResponse {
    console.log('🎲 Generating synthetic stock characteristics based on market patterns...');

    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const timestamps: Date[] = [];
    
    // Generate timestamps (daily updates to match market data)
    for (let i = 0; i < days; i++) {
      timestamps.push(new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000));
    }

    const characteristicsData: number[][][] = []; // [symbol][time][characteristic]

    for (const symbol of symbols) {
      const symbolCharacteristics: number[][] = [];
      
      // Generate base characteristics for this symbol
      const baseCharacteristics = this.generateBaseCharacteristics(symbol);
      
      for (let t = 0; t < timestamps.length; t++) {
        // Add time-varying elements to characteristics
        const timeVaryingCharacteristics = this.addTimeVariation(baseCharacteristics, t, timestamps.length);
        symbolCharacteristics.push(this.characteristicsToArray(timeVaryingCharacteristics));
      }
      
      characteristicsData.push(symbolCharacteristics);
    }

    // Convert to [time x (assets * characteristics)] format for IPCA
    // IPCA expects flattened characteristics: [time x (asset1_char1, asset1_char2, ..., asset2_char1, asset2_char2, ...)]
    const data: number[][] = [];
    
    for (let t = 0; t < timestamps.length; t++) {
      const timeRow: number[] = [];
      
      // For each time period, flatten all assets' characteristics
      for (let s = 0; s < symbols.length; s++) {
        const assetChars = characteristicsData[s][t];
        timeRow.push(...assetChars);
      }
      
      data.push(timeRow);
    }

    const totalCharacteristics = symbols.length * this.characteristicNames.length;
    console.log(`✅ Generated ${timestamps.length} time periods of characteristics for ${symbols.length} symbols`);
    console.log(`📊 Data structure: ${timestamps.length} time periods × ${totalCharacteristics} total characteristics (${symbols.length} assets × ${this.characteristicNames.length} chars each)`);

    return {
      data,
      characteristics: this.characteristicNames,
      timestamps,
      symbols
    };
  }

  /**
   * Generate realistic base characteristics for a symbol
   */
  private generateBaseCharacteristics(symbol: string): StockCharacteristics {
    // Different sector characteristics based on symbol
    const sector = this.inferSector(symbol);
    const sectorMultipliers = this.getSectorMultipliers(sector);

    return {
      // Valuation (vary by sector)
      marketCap: (1 + Math.random() * 9) * 1e9 * sectorMultipliers.marketCap, // $1B - $10B
      bookToMarket: (0.2 + Math.random() * 0.8) * sectorMultipliers.bookToMarket, // 0.2 - 1.0
      earningsYield: (0.02 + Math.random() * 0.08) * sectorMultipliers.earningsYield, // 2% - 10%
      priceToSales: (0.5 + Math.random() * 4.5) * sectorMultipliers.priceToSales, // 0.5x - 5x

      // Profitability
      roe: (0.05 + Math.random() * 0.25) * sectorMultipliers.roe, // 5% - 30%
      roa: (0.02 + Math.random() * 0.15) * sectorMultipliers.roa, // 2% - 17%
      grossMargin: (0.20 + Math.random() * 0.60) * sectorMultipliers.grossMargin, // 20% - 80%
      operatingMargin: (0.05 + Math.random() * 0.25) * sectorMultipliers.operatingMargin, // 5% - 30%

      // Growth
      revenueGrowth: (-0.05 + Math.random() * 0.25) * sectorMultipliers.revenueGrowth, // -5% to +20%
      earningsGrowth: (-0.10 + Math.random() * 0.40) * sectorMultipliers.earningsGrowth, // -10% to +30%
      assetGrowth: (-0.02 + Math.random() * 0.12) * sectorMultipliers.assetGrowth, // -2% to +10%

      // Technical momentum
      momentum1M: -0.05 + Math.random() * 0.10, // -5% to +5%
      momentum3M: -0.15 + Math.random() * 0.30, // -15% to +15%
      momentum12M: -0.30 + Math.random() * 0.60, // -30% to +30%
      volatility: (0.10 + Math.random() * 0.40) * sectorMultipliers.volatility, // 10% - 50%
      beta: (0.5 + Math.random() * 1.5) * sectorMultipliers.beta, // 0.5 - 2.0

      // Quality
      debtToEquity: Math.random() * 2.0 * sectorMultipliers.debtToEquity, // 0 - 2.0
      currentRatio: (0.8 + Math.random() * 2.2) * sectorMultipliers.currentRatio, // 0.8 - 3.0
      assetTurnover: (0.3 + Math.random() * 1.7) * sectorMultipliers.assetTurnover, // 0.3 - 2.0

      // Technical indicators
      rsi: 20 + Math.random() * 60, // 20 - 80
      macdSignal: -2 + Math.random() * 4, // -2 to +2
      volumeRatio: 0.5 + Math.random() * 1.5, // 0.5x - 2.0x
    };
  }

  /**
   * Infer sector from symbol for realistic characteristics
   */
  private inferSector(symbol: string): string {
    const techSymbols = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'META', 'NFLX', 'AMD'];
    const autoSymbols = ['TSLA'];
    const retailSymbols = ['AMZN'];
    
    if (techSymbols.includes(symbol)) return 'technology';
    if (autoSymbols.includes(symbol)) return 'automotive';
    if (retailSymbols.includes(symbol)) return 'retail';
    
    return 'general';
  }

  /**
   * Get sector-specific multipliers for realistic characteristics
   */
  private getSectorMultipliers(sector: string): any {
    const multipliers: { [key: string]: any } = {
      technology: {
        marketCap: 2.0, // Tech companies typically larger
        bookToMarket: 0.5, // Lower book-to-market (growth stocks)
        earningsYield: 0.8, // Lower earnings yield
        priceToSales: 2.0, // Higher P/S ratios
        roe: 1.2, // Higher ROE
        roa: 1.1, // Higher ROA
        grossMargin: 1.3, // Higher gross margins
        operatingMargin: 1.2, // Higher operating margins
        revenueGrowth: 1.5, // Higher growth
        earningsGrowth: 1.4, // Higher earnings growth
        assetGrowth: 1.3, // Higher asset growth
        volatility: 1.2, // Higher volatility
        beta: 1.1, // Slightly higher beta
        debtToEquity: 0.7, // Lower debt
        currentRatio: 1.0, // Normal liquidity
        assetTurnover: 0.8, // Lower asset turnover
      },
      automotive: {
        marketCap: 1.5,
        bookToMarket: 0.6,
        earningsYield: 0.7,
        priceToSales: 1.2,
        roe: 0.9,
        roa: 0.8,
        grossMargin: 0.9,
        operatingMargin: 0.8,
        revenueGrowth: 1.8,
        earningsGrowth: 2.0,
        assetGrowth: 1.5,
        volatility: 1.8,
        beta: 1.4,
        debtToEquity: 0.8,
        currentRatio: 0.9,
        assetTurnover: 1.2,
      },
      retail: {
        marketCap: 1.5,
        bookToMarket: 0.8,
        earningsYield: 1.0,
        priceToSales: 1.0,
        roe: 1.0,
        roa: 1.0,
        grossMargin: 0.8,
        operatingMargin: 0.9,
        revenueGrowth: 1.2,
        earningsGrowth: 1.1,
        assetGrowth: 1.1,
        volatility: 1.0,
        beta: 1.0,
        debtToEquity: 1.2,
        currentRatio: 1.1,
        assetTurnover: 1.4,
      },
      general: {
        marketCap: 1.0,
        bookToMarket: 1.0,
        earningsYield: 1.0,
        priceToSales: 1.0,
        roe: 1.0,
        roa: 1.0,
        grossMargin: 1.0,
        operatingMargin: 1.0,
        revenueGrowth: 1.0,
        earningsGrowth: 1.0,
        assetGrowth: 1.0,
        volatility: 1.0,
        beta: 1.0,
        debtToEquity: 1.0,
        currentRatio: 1.0,
        assetTurnover: 1.0,
      }
    };

    return multipliers[sector] || multipliers.general;
  }

  /**
   * Add time variation to characteristics
   */
  private addTimeVariation(
    baseCharacteristics: StockCharacteristics, 
    timeIndex: number, 
    totalPeriods: number
  ): StockCharacteristics {
    const timeRatio = timeIndex / totalPeriods;
    const seasonality = Math.sin(timeRatio * 2 * Math.PI * 4); // Quarterly seasonality
    const trend = (timeRatio - 0.5) * 0.1; // Linear trend component

    return {
      ...baseCharacteristics,
      // Add time variation to key characteristics
      momentum1M: baseCharacteristics.momentum1M + seasonality * 0.02,
      momentum3M: baseCharacteristics.momentum3M + seasonality * 0.05,
      momentum12M: baseCharacteristics.momentum12M + trend * 0.1,
      volatility: baseCharacteristics.volatility * (1 + seasonality * 0.1),
      rsi: Math.max(10, Math.min(90, baseCharacteristics.rsi + seasonality * 5)),
      volumeRatio: baseCharacteristics.volumeRatio * (1 + seasonality * 0.2),
      // Fundamental characteristics change more slowly
      revenueGrowth: baseCharacteristics.revenueGrowth + trend * 0.02,
      earningsGrowth: baseCharacteristics.earningsGrowth + trend * 0.03,
    };
  }

  /**
   * Convert characteristics object to array
   */
  private characteristicsToArray(characteristics: StockCharacteristics): number[] {
    return [
      characteristics.marketCap / 1e9, // Normalize to billions
      characteristics.bookToMarket,
      characteristics.earningsYield,
      characteristics.priceToSales,
      characteristics.roe,
      characteristics.roa,
      characteristics.grossMargin,
      characteristics.operatingMargin,
      characteristics.revenueGrowth,
      characteristics.earningsGrowth,
      characteristics.assetGrowth,
      characteristics.momentum1M,
      characteristics.momentum3M,
      characteristics.momentum12M,
      characteristics.volatility,
      characteristics.beta,
      characteristics.debtToEquity,
      characteristics.currentRatio,
      characteristics.assetTurnover,
      characteristics.rsi / 100, // Normalize to 0-1
      characteristics.macdSignal,
      characteristics.volumeRatio,
    ];
  }

  /**
   * Get current characteristics for real-time prediction
   */
  async getCurrentCharacteristics(symbols: string[]): Promise<number[][]> {
    console.log(`📊 Generating current characteristics for ${symbols.length} symbols...`);

    const currentCharacteristics: number[][] = [];

    for (const symbol of symbols) {
      // Generate current characteristics (in production, fetch from real-time data)
      const baseChars = this.generateBaseCharacteristics(symbol);
      
      // Add some current market conditions
      const currentChars = this.addTimeVariation(baseChars, Date.now() % 1000, 1000);
      currentCharacteristics.push(this.characteristicsToArray(currentChars));
    }

    return currentCharacteristics;
  }

  /**
   * Get characteristic names
   */
  getCharacteristicNames(): string[] {
    return [...this.characteristicNames];
  }

  /**
   * Validate characteristics data
   */
  validateCharacteristics(data: number[][]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.length === 0) {
      errors.push('Characteristics data is empty');
      return { valid: false, errors };
    }

    const expectedLength = this.characteristicNames.length;
    for (let i = 0; i < data.length; i++) {
      if (data[i].length !== expectedLength) {
        errors.push(`Row ${i} has ${data[i].length} characteristics, expected ${expectedLength}`);
      }

      // Check for invalid values
      for (let j = 0; j < data[i].length; j++) {
        if (!isFinite(data[i][j])) {
          errors.push(`Invalid value at row ${i}, column ${j}: ${data[i][j]}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
