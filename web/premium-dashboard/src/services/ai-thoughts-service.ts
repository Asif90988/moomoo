// AI Thoughts Service - Real-time connection to Rust AI engine
import { wsService } from './websocket';

export interface AIThought {
  id: string;
  timestamp: string;
  agent: 'MarketIntelligence' | 'RiskManager' | 'LearningEngine' | 'MasterCoordinator' | 'ExecutionEngine';
  thought_type: 'Analysis' | 'Decision' | 'Learning' | 'RiskCheck' | 'PatternFound' | 'StrategyUpdate' | 'Execution';
  message: string;
  confidence: number;
  confidence_level: 'VeryLow' | 'Low' | 'Medium' | 'High' | 'VeryHigh';
  reasoning: string[];
  supporting_data: Record<string, any>;
  symbols: string[];
  tags: string[];
  impact_level: string;
  educational: boolean;
  planned_actions: string[];
}

export interface WhaleMove {
  id: string;
  timestamp: string;
  celebrity: string;
  action: 'BOUGHT' | 'SOLD' | 'ADDED' | 'REDUCED';
  symbol: string;
  amount: string;
  price?: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface NewsItem {
  id: string;
  timestamp: string;
  headline: string;
  summary: string;
  symbols: string[];
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  source: string;
}

class AIThoughtsService {
  private aiThoughts: AIThought[] = [];
  private whaleMoves: WhaleMove[] = [];
  private newsItems: NewsItem[] = [];
  private subscribers: Set<(thoughts: AIThought[]) => void> = new Set();
  private whaleSubscribers: Set<(moves: WhaleMove[]) => void> = new Set();
  private newsSubscribers: Set<(news: NewsItem[]) => void> = new Set();
  private isConnected = false;

  constructor() {
    this.initializeWebSocketListeners();
    this.startMockDataGeneration(); // Fallback for development
  }

  private initializeWebSocketListeners() {
    // Listen for connection status
    wsService.on('connection_status', (status: any) => {
      this.isConnected = status.status === 'connected';
      console.log('🧠 AI Engine connection:', status);
    });

    // Listen for AI thoughts from Rust backend
    wsService.on('ai_thought', (thought: AIThought) => {
      this.addAIThought(thought);
    });

    // Listen for whale moves
    wsService.on('whale_move', (move: WhaleMove) => {
      this.addWhaleMove(move);
    });

    // Listen for news updates
    wsService.on('news_update', (news: NewsItem) => {
      this.addNewsItem(news);
    });

    // Request historical data on connection
    wsService.on('connection_status', (status: any) => {
      if (status.status === 'connected') {
        wsService.send('get_recent_thoughts', { limit: 50 });
        wsService.send('get_recent_whale_moves', { limit: 20 });
        wsService.send('get_recent_news', { limit: 30 });
      }
    });
  }

  private addAIThought(thought: AIThought) {
    this.aiThoughts.unshift(thought);
    if (this.aiThoughts.length > 100) {
      this.aiThoughts.pop();
    }
    this.notifyAISubscribers();
  }

  private addWhaleMove(move: WhaleMove) {
    this.whaleMoves.unshift(move);
    if (this.whaleMoves.length > 50) {
      this.whaleMoves.pop();
    }
    this.notifyWhaleSubscribers();
  }

  private addNewsItem(news: NewsItem) {
    this.newsItems.unshift(news);
    if (this.newsItems.length > 50) {
      this.newsItems.pop();
    }
    this.notifyNewsSubscribers();
  }

  private notifyAISubscribers() {
    this.subscribers.forEach(callback => callback([...this.aiThoughts]));
  }

  private notifyWhaleSubscribers() {
    this.whaleSubscribers.forEach(callback => callback([...this.whaleMoves]));
  }

  private notifyNewsSubscribers() {
    this.newsSubscribers.forEach(callback => callback([...this.newsItems]));
  }

  // Public API
  public subscribeToAIThoughts(callback: (thoughts: AIThought[]) => void) {
    this.subscribers.add(callback);
    callback([...this.aiThoughts]); // Send current data immediately
    return () => this.subscribers.delete(callback);
  }

  public subscribeToWhaleMoves(callback: (moves: WhaleMove[]) => void) {
    this.whaleSubscribers.add(callback);
    callback([...this.whaleMoves]);
    return () => this.whaleSubscribers.delete(callback);
  }

  public subscribeToNews(callback: (news: NewsItem[]) => void) {
    this.newsSubscribers.add(callback);
    callback([...this.newsItems]);
    return () => this.newsSubscribers.delete(callback);
  }

  public getConnectionStatus() {
    return {
      connected: this.isConnected,
      aiThoughtsCount: this.aiThoughts.length,
      whaleMovesCount: this.whaleMoves.length,
      newsItemsCount: this.newsItems.length
    };
  }

  // Request specific AI analysis
  public requestAIAnalysis(symbol: string, timeframe?: string) {
    if (this.isConnected) {
      wsService.send('request_ai_analysis', { symbol, timeframe });
    }
  }

  // Mock data generation for development/fallback
  private startMockDataGeneration() {
    // Generate AI thoughts every 4-6 seconds
    setInterval(() => {
      if (!this.isConnected || this.aiThoughts.length < 5) {
        this.generateMockAIThought();
      }
    }, 5000);

    // Generate whale moves every 8-12 seconds
    setInterval(() => {
      if (!this.isConnected || this.whaleMoves.length < 3) {
        this.generateMockWhaleMove();
      }
    }, 10000);

    // Generate news every 6-10 seconds
    setInterval(() => {
      if (!this.isConnected || this.newsItems.length < 4) {
        this.generateMockNews();
      }
    }, 8000);
  }

  private generateMockAIThought() {
    const agents: AIThought['agent'][] = ['MarketIntelligence', 'RiskManager', 'LearningEngine', 'MasterCoordinator'];
    const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'AMZN', 'META', 'JPM'];
    const thoughts = [
      'Analyzing AAPL momentum patterns - detecting potential breakout above $180 resistance',
      'TSLA showing strong volume accumulation near support levels - institutional interest detected',
      'Risk assessment: Portfolio exposure within acceptable limits at 23.4% utilization',
      'Learning from previous NVDA trade: Enhanced pattern recognition accuracy to 87.3%',
      'Market sentiment shift detected: Technology sector showing signs of rotation',
      'MSFT earnings catalyst approaching - positioning for potential volatility spike',
      'Neural network confidence increasing on GOOGL technical setup - 91% probability',
      'Correlation analysis: META-SNAP relationship strengthening - monitor for synchronized moves'
    ];

    const thought: AIThought = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      agent: agents[Math.floor(Math.random() * agents.length)],
      thought_type: 'Analysis',
      message: thoughts[Math.floor(Math.random() * thoughts.length)],
      confidence: Math.random() * 0.4 + 0.6, // 60-100%
      confidence_level: 'High',
      reasoning: [
        'Technical indicators align with historical patterns',
        'Volume analysis supports current assessment',
        'Risk-reward ratio favorable for current setup'
      ],
      supporting_data: {},
      symbols: [symbols[Math.floor(Math.random() * symbols.length)]],
      tags: ['technical_analysis', 'momentum'],
      impact_level: 'Medium',
      educational: Math.random() > 0.7,
      planned_actions: ['Monitor for confirmation signals', 'Prepare position sizing']
    };

    this.addAIThought(thought);
  }

  private generateMockWhaleMove() {
    const celebrities = ['Warren Buffett', 'Elon Musk', 'Cathie Wood', 'Bill Ackman', 'Ray Dalio', 'Michael Burry'];
    const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'AMZN', 'META', 'JPM'];
    const actions: WhaleMove['action'][] = ['BOUGHT', 'SOLD', 'ADDED', 'REDUCED'];

    const move: WhaleMove = {
      id: `whale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      celebrity: celebrities[Math.floor(Math.random() * celebrities.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      amount: `$${(Math.random() * 500 + 50).toFixed(0)}M`,
      impact: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW'
    };

    this.addWhaleMove(move);
  }

  private generateMockNews() {
    const headlines = [
      'Fed signals potential rate cuts as inflation shows signs of cooling',
      'Tech earnings season kicks off with strong revenue expectations',
      'AI chip demand surge drives semiconductor sector rally',
      'Cryptocurrency market sees renewed institutional interest',
      'Energy stocks climb on production cut announcements',
      'Biotech breakthrough shows promise for rare disease treatment',
      'Consumer spending data beats expectations across all sectors'
    ];

    const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'AMZN', 'META', 'JPM'];

    const news: NewsItem = {
      id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      headline: headlines[Math.floor(Math.random() * headlines.length)],
      summary: 'Market impact analysis in progress...',
      symbols: [symbols[Math.floor(Math.random() * symbols.length)]],
      impact: Math.random() > 0.6 ? 'POSITIVE' : Math.random() > 0.3 ? 'NEUTRAL' : 'NEGATIVE',
      urgency: Math.random() > 0.7 ? 'HIGH' : 'MEDIUM',
      source: 'Neural Core Intelligence'
    };

    this.addNewsItem(news);
  }
}

// Export singleton instance
export const aiThoughtsService = new AIThoughtsService();