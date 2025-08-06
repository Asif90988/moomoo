// Neural Core Alpha-7 - Alternative Data Integration Pipeline
// Integrates multiple alternative data sources for enhanced prediction accuracy
// Sources: Social sentiment, satellite data, corporate earnings calls, news analytics, etc.

interface DataSource {
  name: string;
  type: 'SENTIMENT' | 'SATELLITE' | 'NEWS' | 'ECONOMIC' | 'SOCIAL' | 'CORPORATE' | 'TECHNICAL';
  provider: string;
  endpoint: string;
  enabled: boolean;
  confidence: number;
  latency: number; // milliseconds
  cost: number; // per request
  updateFrequency: number; // minutes
  lastUpdated?: Date;
}

interface AlternativeDataPoint {
  source: string;
  symbol: string;
  timestamp: Date;
  value: number;
  confidence: number;
  metadata: Record<string, any>;
  processed: boolean;
}

interface SentimentData {
  symbol: string;
  sentiment: number; // -1 to 1
  volume: number; // mention count
  momentum: number; // sentiment change
  sources: {
    twitter: number;
    reddit: number;
    news: number;
    blogs: number;
  };
  keywords: string[];
  timestamp: Date;
}

interface SatelliteData {
  symbol: string;
  company: string;
  metric: 'PARKING_LOT_ACTIVITY' | 'SHIPPING_TRAFFIC' | 'CONSTRUCTION_ACTIVITY' | 'STORE_VISITS';
  value: number;
  change: number; // vs previous period
  confidence: number;
  location: string;
  timestamp: Date;
}

interface NewsAnalytics {
  symbol: string;
  headline: string;
  sentiment: number;
  relevance: number;
  impact: number;
  category: string;
  source: string;
  publishedAt: Date;
  entities: string[];
}

interface EconomicIndicator {
  indicator: string;
  value: number;
  change: number;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sectors: string[];
  timestamp: Date;
}

interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  timeliness: number;
  consistency: number;
  relevance: number;
  overallScore: number;
}

class AlternativeDataPipeline {
  private dataSources: Map<string, DataSource> = new Map();
  private dataBuffer: Map<string, AlternativeDataPoint[]> = new Map();
  private processingQueue: AlternativeDataPoint[] = [];
  private qualityMetrics: Map<string, DataQualityMetrics> = new Map();
  private isProcessing: boolean = false;

  constructor() {
    this.initializeDataSources();
    this.startProcessingLoop();
  }

  /**
   * Initialize alternative data sources
   */
  private initializeDataSources(): void {
    const sources: DataSource[] = [
      {
        name: 'Twitter Sentiment',
        type: 'SENTIMENT',
        provider: 'Twitter API',
        endpoint: 'https://api.twitter.com/2/tweets/search/recent',
        enabled: true,
        confidence: 0.7,
        latency: 5000,
        cost: 0.01,
        updateFrequency: 15
      },
      {
        name: 'Reddit Sentiment',
        type: 'SOCIAL',
        provider: 'Reddit API',
        endpoint: 'https://www.reddit.com/r/wallstreetbets.json',
        enabled: true,
        confidence: 0.6,
        latency: 10000,
        cost: 0.005,
        updateFrequency: 30
      },
      {
        name: 'Financial News Analytics',
        type: 'NEWS',
        provider: 'NewsAPI',
        endpoint: 'https://newsapi.org/v2/everything',
        enabled: true,
        confidence: 0.8,
        latency: 3000,
        cost: 0.02,
        updateFrequency: 10
      },
      {
        name: 'Satellite Parking Analytics',
        type: 'SATELLITE',
        provider: 'Orbital Insight',
        endpoint: 'https://api.orbitalinsight.com/v2/analytics',
        enabled: false, // Disabled by default (expensive)
        confidence: 0.9,
        latency: 300000, // 5 minutes
        cost: 1.0,
        updateFrequency: 1440 // Daily
      },
      {
        name: 'Economic Indicators',
        type: 'ECONOMIC',
        provider: 'FRED API',
        endpoint: 'https://api.stlouisfed.org/fred/series',
        enabled: true,
        confidence: 0.95,
        latency: 2000,
        cost: 0.0,
        updateFrequency: 60
      },
      {
        name: 'Corporate Earnings Calls',
        type: 'CORPORATE',
        provider: 'AlphaSense',
        endpoint: 'https://api.alphasense.com/v1/transcripts',
        enabled: false, // Premium service
        confidence: 0.85,
        latency: 30000,
        cost: 0.5,
        updateFrequency: 720 // Twice daily
      },
      {
        name: 'Google Trends',
        type: 'SENTIMENT',
        provider: 'Google Trends API',
        endpoint: 'https://trends.googleapis.com/trends/api',
        enabled: true,
        confidence: 0.65,
        latency: 15000,
        cost: 0.0,
        updateFrequency: 120
      },
      {
        name: 'Supply Chain Analytics',
        type: 'ECONOMIC',
        provider: 'Sourcemap',
        endpoint: 'https://api.sourcemap.com/v1/supply-chain',
        enabled: false,
        confidence: 0.75,
        latency: 60000,
        cost: 0.3,
        updateFrequency: 360
      }
    ];

    for (const source of sources) {
      this.dataSources.set(source.name, source);
      this.dataBuffer.set(source.name, []);
      this.qualityMetrics.set(source.name, {
        completeness: 0.8,
        accuracy: 0.8,
        timeliness: 0.8,
        consistency: 0.8,
        relevance: 0.8,
        overallScore: 0.8
      });
    }

    console.log(`📊 Initialized ${sources.length} alternative data sources`);
  }

  /**
   * Fetch data from all enabled sources
   */
  async fetchAllData(symbols: string[]): Promise<Map<string, AlternativeDataPoint[]>> {
    console.log('🔍 Fetching alternative data from all sources...');
    
    const dataMap = new Map<string, AlternativeDataPoint[]>();
    const fetchPromises: Promise<void>[] = [];

    for (const [sourceName, source] of Array.from(this.dataSources)) {
      if (!source.enabled) continue;

      const promise = this.fetchDataFromSource(source, symbols)
        .then(data => {
          if (data.length > 0) {
            dataMap.set(sourceName, data);
            this.updateDataBuffer(sourceName, data);
          }
        })
        .catch(error => {
          console.error(`❌ Failed to fetch from ${sourceName}:`, error);
        });

      fetchPromises.push(promise);
    }

    await Promise.all(fetchPromises);
    
    console.log(`✅ Fetched data from ${dataMap.size} sources`);
    return dataMap;
  }

  /**
   * Get sentiment data aggregated from multiple sources
   */
  async getSentimentData(symbols: string[]): Promise<SentimentData[]> {
    const sentimentData: SentimentData[] = [];

    for (const symbol of symbols) {
      try {
        // Fetch Twitter sentiment
        const twitterSentiment = await this.fetchTwitterSentiment(symbol);
        
        // Fetch Reddit sentiment
        const redditSentiment = await this.fetchRedditSentiment(symbol);
        
        // Fetch news sentiment
        const newsSentiment = await this.fetchNewsSentiment(symbol);
        
        // Fetch Google Trends
        const trendsMomentum = await this.fetchGoogleTrends(symbol);

        // Aggregate sentiment data
        const aggregatedSentiment: SentimentData = {
          symbol,
          sentiment: this.aggregateSentiment({
            twitter: twitterSentiment.sentiment,
            reddit: redditSentiment.sentiment,
            news: newsSentiment.sentiment,
            trends: trendsMomentum.sentiment
          }),
          volume: twitterSentiment.volume + redditSentiment.volume + newsSentiment.volume,
          momentum: trendsMomentum.momentum,
          sources: {
            twitter: twitterSentiment.sentiment,
            reddit: redditSentiment.sentiment,
            news: newsSentiment.sentiment,
            blogs: 0 // Placeholder
          },
          keywords: [...twitterSentiment.keywords, ...redditSentiment.keywords, ...newsSentiment.keywords],
          timestamp: new Date()
        };

        sentimentData.push(aggregatedSentiment);

      } catch (error) {
        console.error(`Error fetching sentiment for ${symbol}:`, error);
      }
    }

    return sentimentData;
  }

  /**
   * Get economic indicators relevant to trading
   */
  async getEconomicIndicators(): Promise<EconomicIndicator[]> {
    const indicators: EconomicIndicator[] = [];

    try {
      // Fetch key economic indicators
      const indicatorTypes = [
        'GDP', 'UNEMPLOYMENT', 'INFLATION', 'INTEREST_RATES', 
        'CONSUMER_CONFIDENCE', 'MANUFACTURING_PMI', 'YIELD_CURVE'
      ];

      for (const indicatorType of indicatorTypes) {
        const data = await this.fetchEconomicIndicator(indicatorType);
        if (data) {
          indicators.push(data);
        }
      }

    } catch (error) {
      console.error('Error fetching economic indicators:', error);
    }

    return indicators;
  }

  /**
   * Get news analytics for symbols
   */
  async getNewsAnalytics(symbols: string[]): Promise<NewsAnalytics[]> {
    const newsAnalytics: NewsAnalytics[] = [];

    for (const symbol of symbols) {
      try {
        const articles = await this.fetchNewsForSymbol(symbol);
        
        for (const article of articles) {
          const analytics: NewsAnalytics = {
            symbol,
            headline: article.title,
            sentiment: this.analyzeNewsSentiment(article.content),
            relevance: this.calculateNewsRelevance(article, symbol),
            impact: this.estimateNewsImpact(article),
            category: this.categorizeNews(article),
            source: article.source,
            publishedAt: new Date(article.publishedAt),
            entities: this.extractEntities(article.content)
          };

          newsAnalytics.push(analytics);
        }

      } catch (error) {
        console.error(`Error fetching news analytics for ${symbol}:`, error);
      }
    }

    return newsAnalytics.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Process alternative data and generate signals
   */
  async processDataForSignals(symbols: string[]): Promise<Record<string, number>> {
    console.log('🔬 Processing alternative data for trading signals...');
    
    const signals: Record<string, number> = {};

    // Fetch all alternative data
    const [sentimentData, economicData, newsData] = await Promise.all([
      this.getSentimentData(symbols),
      this.getEconomicIndicators(),
      this.getNewsAnalytics(symbols)
    ]);

    for (const symbol of symbols) {
      let signal = 0;
      let confidence = 0;

      // Sentiment signal
      const sentiment = sentimentData.find(s => s.symbol === symbol);
      if (sentiment) {
        const sentimentSignal = sentiment.sentiment * 0.3; // 30% weight
        const sentimentConfidence = Math.min(sentiment.volume / 1000, 1.0) * 0.8;
        signal += sentimentSignal * sentimentConfidence;
        confidence += sentimentConfidence * 0.3;
      }

      // News signal
      const recentNews = newsData.filter(n => 
        n.symbol === symbol && 
        Date.now() - n.publishedAt.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
      );
      
      if (recentNews.length > 0) {
        const newsSignal = recentNews.reduce((sum, news) => 
          sum + news.sentiment * news.relevance * news.impact, 0) / recentNews.length;
        signal += newsSignal * 0.4; // 40% weight
        confidence += 0.4;
      }

      // Economic signal
      const relevantEconomic = economicData.filter(econ => 
        econ.sectors.includes(this.getSymbolSector(symbol))
      );
      
      if (relevantEconomic.length > 0) {
        const economicSignal = relevantEconomic.reduce((sum, econ) => {
          const impact = econ.impact === 'POSITIVE' ? 1 : econ.impact === 'NEGATIVE' ? -1 : 0;
          return sum + impact * Math.abs(econ.change);
        }, 0) / relevantEconomic.length;
        
        signal += economicSignal * 0.3; // 30% weight
        confidence += 0.3;
      }

      // Normalize signal
      signals[symbol] = confidence > 0.5 ? Math.tanh(signal) : 0; // Only use if confident
    }

    console.log(`📈 Generated signals for ${Object.keys(signals).length} symbols`);
    return signals;
  }

  /**
   * Data quality assessment
   */
  assessDataQuality(sourceName: string): DataQualityMetrics {
    const buffer = this.dataBuffer.get(sourceName) || [];
    const source = this.dataSources.get(sourceName);
    
    if (!source) {
      return {
        completeness: 0,
        accuracy: 0,
        timeliness: 0,
        consistency: 0,
        relevance: 0,
        overallScore: 0
      };
    }

    // Calculate completeness
    const expectedDataPoints = 100; // Expected data points
    const actualDataPoints = buffer.length;
    const completeness = Math.min(actualDataPoints / expectedDataPoints, 1.0);

    // Calculate timeliness
    const now = Date.now();
    const recentData = buffer.filter(d => now - d.timestamp.getTime() < source.updateFrequency * 60 * 1000);
    const timeliness = recentData.length / Math.max(buffer.length, 1);

    // Calculate consistency (variance in data quality)
    const confidences = buffer.map(d => d.confidence);
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const consistency = avgConfidence || 0.5;

    // Static values for now (would be calculated based on validation)
    const accuracy = source.confidence;
    const relevance = 0.8;

    const overallScore = (completeness + accuracy + timeliness + consistency + relevance) / 5;

    const metrics: DataQualityMetrics = {
      completeness,
      accuracy,
      timeliness,
      consistency,
      relevance,
      overallScore
    };

    this.qualityMetrics.set(sourceName, metrics);
    return metrics;
  }

  // Private implementation methods
  private async fetchDataFromSource(source: DataSource, symbols: string[]): Promise<AlternativeDataPoint[]> {
    // Simulate data fetching with mock data
    const dataPoints: AlternativeDataPoint[] = [];

    for (const symbol of symbols) {
      const dataPoint: AlternativeDataPoint = {
        source: source.name,
        symbol,
        timestamp: new Date(),
        value: (Math.random() - 0.5) * 0.1, // Random signal between -0.05 and 0.05
        confidence: source.confidence + (Math.random() - 0.5) * 0.2,
        metadata: {
          provider: source.provider,
          type: source.type,
          latency: source.latency
        },
        processed: false
      };

      dataPoints.push(dataPoint);
    }

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * source.latency));

    return dataPoints;
  }

  private async fetchTwitterSentiment(symbol: string): Promise<{ sentiment: number; volume: number; keywords: string[] }> {
    // Mock Twitter sentiment analysis
    return {
      sentiment: (Math.random() - 0.5) * 2, // -1 to 1
      volume: Math.floor(Math.random() * 1000) + 100,
      keywords: [`$${symbol}`, 'bullish', 'earnings', 'growth']
    };
  }

  private async fetchRedditSentiment(symbol: string): Promise<{ sentiment: number; volume: number; keywords: string[] }> {
    // Mock Reddit sentiment analysis
    return {
      sentiment: (Math.random() - 0.5) * 2,
      volume: Math.floor(Math.random() * 500) + 50,
      keywords: [`$${symbol}`, 'moon', 'diamond hands', 'to the moon']
    };
  }

  private async fetchNewsSentiment(symbol: string): Promise<{ sentiment: number; volume: number; keywords: string[] }> {
    // Mock news sentiment analysis
    return {
      sentiment: (Math.random() - 0.5) * 2,
      volume: Math.floor(Math.random() * 200) + 20,
      keywords: [`${symbol}`, 'quarterly', 'revenue', 'outlook']
    };
  }

  private async fetchGoogleTrends(symbol: string): Promise<{ sentiment: number; momentum: number }> {
    // Mock Google Trends data
    return {
      sentiment: (Math.random() - 0.5) * 1.5,
      momentum: (Math.random() - 0.5) * 0.5
    };
  }

  private async fetchEconomicIndicator(type: string): Promise<EconomicIndicator | null> {
    // Mock economic indicator data
    const indicators = {
      'GDP': { value: 2.1, change: 0.1, impact: 'POSITIVE' as const, sectors: ['ALL'] },
      'UNEMPLOYMENT': { value: 3.7, change: -0.1, impact: 'POSITIVE' as const, sectors: ['CONSUMER', 'RETAIL'] },
      'INFLATION': { value: 2.4, change: 0.2, impact: 'NEGATIVE' as const, sectors: ['ALL'] },
      'INTEREST_RATES': { value: 5.25, change: 0.25, impact: 'NEGATIVE' as const, sectors: ['FINANCIAL', 'REAL_ESTATE'] }
    };

    const data = indicators[type as keyof typeof indicators];
    if (!data) return null;

    return {
      indicator: type,
      value: data.value,
      change: data.change,
      impact: data.impact,
      sectors: data.sectors,
      timestamp: new Date()
    };
  }

  private async fetchNewsForSymbol(symbol: string): Promise<any[]> {
    // Mock news articles
    return [
      {
        title: `${symbol} reports strong quarterly earnings`,
        content: `${symbol} exceeded analyst expectations with strong revenue growth...`,
        source: 'Reuters',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        title: `Analyst upgrades ${symbol} to buy rating`,
        content: `Wall Street analyst raises price target for ${symbol}...`,
        source: 'Bloomberg',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      }
    ];
  }

  private aggregateSentiment(sentiments: Record<string, number>): number {
    const weights = { twitter: 0.3, reddit: 0.2, news: 0.4, trends: 0.1 };
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [source, sentiment] of Object.entries(sentiments)) {
      const weight = weights[source as keyof typeof weights] || 0;
      weightedSum += sentiment * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private analyzeNewsSentiment(content: string): number {
    // Simple sentiment analysis (would use NLP in production)
    const positiveWords = ['growth', 'profit', 'beat', 'strong', 'upgrade', 'bullish'];
    const negativeWords = ['loss', 'decline', 'miss', 'weak', 'downgrade', 'bearish'];

    let sentiment = 0;
    const words = content.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (positiveWords.includes(word)) sentiment += 1;
      if (negativeWords.includes(word)) sentiment -= 1;
    }

    return Math.tanh(sentiment / words.length * 100); // Normalize to [-1, 1]
  }

  private calculateNewsRelevance(article: any, symbol: string): number {
    const title = article.title.toLowerCase();
    const content = article.content.toLowerCase();
    const symbolLower = symbol.toLowerCase();

    let relevance = 0;
    if (title.includes(symbolLower)) relevance += 0.5;
    if (content.includes(symbolLower)) relevance += 0.3;
    
    // Add time decay
    const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    const timeFactor = Math.exp(-hoursOld / 24); // Decay over 24 hours
    
    return Math.min(relevance * timeFactor, 1.0);
  }

  private estimateNewsImpact(article: any): number {
    // Estimate impact based on source credibility and content
    const sourceCredibility = {
      'Reuters': 0.9,
      'Bloomberg': 0.9,
      'WSJ': 0.85,
      'CNBC': 0.7,
      'MarketWatch': 0.6
    };

    const baseImpact = sourceCredibility[article.source as keyof typeof sourceCredibility] || 0.5;
    
    // Adjust based on content keywords
    const highImpactKeywords = ['earnings', 'merger', 'acquisition', 'FDA approval', 'bankruptcy'];
    const content = article.content.toLowerCase();
    
    let impactMultiplier = 1.0;
    for (const keyword of highImpactKeywords) {
      if (content.includes(keyword)) {
        impactMultiplier += 0.2;
      }
    }

    return Math.min(baseImpact * impactMultiplier, 1.0);
  }

  private categorizeNews(article: any): string {
    const content = article.content.toLowerCase();
    const title = article.title.toLowerCase();
    const text = `${title} ${content}`;

    if (text.includes('earnings') || text.includes('revenue')) return 'EARNINGS';
    if (text.includes('merger') || text.includes('acquisition')) return 'M&A';
    if (text.includes('fda') || text.includes('approval')) return 'REGULATORY';
    if (text.includes('lawsuit') || text.includes('investigation')) return 'LEGAL';
    if (text.includes('analyst') || text.includes('rating')) return 'ANALYST';
    
    return 'GENERAL';
  }

  private extractEntities(content: string): string[] {
    // Simple entity extraction (would use NER in production)
    const entities: string[] = [];
    const words = content.split(/\s+/);
    
    for (const word of words) {
      if (word.match(/^\$[A-Z]{1,5}$/)) { // Stock symbols
        entities.push(word);
      }
      if (word.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/)) { // Person names
        entities.push(word);
      }
    }

    return Array.from(new Set(entities)); // Remove duplicates
  }

  private getSymbolSector(symbol: string): string {
    // Simplified sector mapping (would use actual sector data)
    const sectorMap: Record<string, string> = {
      'AAPL': 'TECHNOLOGY',
      'GOOGL': 'TECHNOLOGY', 
      'MSFT': 'TECHNOLOGY',
      'TSLA': 'AUTOMOTIVE',
      'JPM': 'FINANCIAL',
      'XOM': 'ENERGY',
      'PG': 'CONSUMER',
      'JNJ': 'HEALTHCARE'
    };

    return sectorMap[symbol] || 'GENERAL';
  }

  private updateDataBuffer(sourceName: string, data: AlternativeDataPoint[]): void {
    const buffer = this.dataBuffer.get(sourceName) || [];
    buffer.push(...data);
    
    // Keep only last 1000 data points per source
    if (buffer.length > 1000) {
      buffer.splice(0, buffer.length - 1000);
    }
    
    this.dataBuffer.set(sourceName, buffer);
    
    // Add to processing queue
    this.processingQueue.push(...data.filter(d => !d.processed));
  }

  private startProcessingLoop(): void {
    setInterval(() => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        this.processQueuedData();
      }
    }, 5000); // Process every 5 seconds
  }

  private async processQueuedData(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      const batchSize = 50;
      const batch = this.processingQueue.splice(0, batchSize);
      
      for (const dataPoint of batch) {
        // Perform data validation and enrichment
        dataPoint.processed = true;
        
        // Update quality metrics
        this.assessDataQuality(dataPoint.source);
      }
      
    } catch (error) {
      console.error('Error processing queued data:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Public interface methods
  getDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }

  enableDataSource(sourceName: string): boolean {
    const source = this.dataSources.get(sourceName);
    if (source) {
      source.enabled = true;
      return true;
    }
    return false;
  }

  disableDataSource(sourceName: string): boolean {
    const source = this.dataSources.get(sourceName);
    if (source) {
      source.enabled = false;
      return true;
    }
    return false;
  }

  getQualityMetrics(): Map<string, DataQualityMetrics> {
    return new Map(this.qualityMetrics);
  }

  getDataBuffer(sourceName: string): AlternativeDataPoint[] {
    return this.dataBuffer.get(sourceName) || [];
  }
}

// Export main class and interfaces
export {
  AlternativeDataPipeline,
}

export type {
  DataSource,
  AlternativeDataPoint,
  SentimentData,
  NewsAnalytics,
  EconomicIndicator,
  DataQualityMetrics
};