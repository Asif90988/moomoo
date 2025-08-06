// AI Thoughts Translator - Converts real AI backend thoughts to human language

export interface RustAIThought {
  id: string;
  timestamp: string;
  agent: 'MarketIntelligence' | 'RiskManager' | 'LearningEngine' | 'MasterCoordinator' | 'ExecutionEngine';
  thought_type: 'Analysis' | 'Decision' | 'Learning' | 'RiskCheck' | 'PatternFound' | 'StrategyUpdate' | 'Execution' | 'Rebalancing' | 'Sentiment' | 'Educational';
  message: string;
  confidence: number;
  confidence_level: 'VeryLow' | 'Low' | 'Medium' | 'High' | 'VeryHigh';
  reasoning: string[];
  supporting_data: Record<string, any>;
  symbols: string[];
  tags: string[];
  impact_level: string;
  educational: boolean;
}

export interface HumanReadableThought {
  id: string;
  humanMessage: string;
  type: 'monitoring' | 'analyzing' | 'deciding' | 'executing' | 'learning';
  confidence: number;
  symbol?: string;
  timestamp: number;
  originalThought: RustAIThought;
}

export class AIThoughtsTranslator {
  /**
   * Translates Rust AI thoughts into human-readable language
   * This is where we convert the technical AI thoughts into natural language
   */
  static translateToHuman(rustThought: RustAIThought): HumanReadableThought {
    const humanMessage = this.generateHumanMessage(rustThought);
    const type = this.mapToHumanType(rustThought.thought_type, rustThought.agent);
    
    return {
      id: rustThought.id,
      humanMessage,
      type,
      confidence: rustThought.confidence,
      symbol: rustThought.symbols[0],
      timestamp: new Date(rustThought.timestamp).getTime(),
      originalThought: rustThought
    };
  }

  /**
   * Generates natural human language from AI thoughts
   */
  private static generateHumanMessage(thought: RustAIThought): string {
    const symbols = thought.symbols.join(', ');
    const confidence = Math.round(thought.confidence * 100);
    
    // Get key data points
    const price = thought.supporting_data.current_price as number;
    const volume = thought.supporting_data.volume as number;
    const change = thought.supporting_data.price_change as number;
    const rsi = thought.supporting_data.rsi as number;
    const position_size = thought.supporting_data.position_size as number;

    switch (thought.thought_type) {
      case 'Analysis':
        return this.generateAnalysisMessage(thought, symbols, confidence, price, volume, rsi);
        
      case 'Decision':
        return this.generateDecisionMessage(thought, symbols, confidence, price, position_size);
        
      case 'Learning':
        return this.generateLearningMessage(thought, symbols, confidence);
        
      case 'RiskCheck':
        return this.generateRiskMessage(thought, symbols, confidence);
        
      case 'PatternFound':
        return this.generatePatternMessage(thought, symbols, confidence, price);
        
      case 'Execution':
        return this.generateExecutionMessage(thought, symbols, confidence, price, position_size);
        
      case 'Rebalancing':
        return this.generateRebalancingMessage(thought, symbols, confidence);
        
      case 'Sentiment':
        return this.generateSentimentMessage(thought, symbols, confidence);
        
      default:
        return `🤖 ${thought.agent}: ${thought.message} (${confidence}% confidence)`;
    }
  }

  private static generateAnalysisMessage(thought: RustAIThought, symbols: string, confidence: number, price?: number, volume?: number, rsi?: number): string {
    const templates = [
      `📊 I'm analyzing ${symbols} at $${price?.toFixed(2)} - volume is ${volume ? (volume > 1000000 ? 'high' : 'normal') : 'unclear'}, RSI shows ${rsi ? (rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral') : 'mixed'} conditions`,
      `🔍 Scanning ${symbols} technicals: Price action at $${price?.toFixed(2)} with ${confidence}% confidence - ${thought.reasoning[0] || 'evaluating patterns'}`,
      `📈 Monitoring ${symbols}: Current price $${price?.toFixed(2)}, I'm seeing ${thought.tags.includes('bullish') ? 'bullish signals' : thought.tags.includes('bearish') ? 'bearish signals' : 'mixed signals'}`,
      `🎯 ${symbols} analysis: ${thought.reasoning[0] || thought.message} - My confidence: ${confidence}%`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static generateDecisionMessage(thought: RustAIThought, symbols: string, confidence: number, price?: number, position_size?: number): string {
    const action = thought.tags.includes('buy') ? 'buying' : thought.tags.includes('sell') ? 'selling' : 'evaluating';
    const size = position_size ? `${position_size}%` : '5%';
    
    const templates = [
      `🤔 I'm thinking of ${action} ${symbols} at $${price?.toFixed(2)} - allocating ${size} of portfolio with ${confidence}% confidence`,
      `💭 Decision time: ${action} ${symbols}? Price looks good at $${price?.toFixed(2)}, risk/reward calculation gives me ${confidence}% confidence`,
      `⚖️ Considering ${symbols}: ${thought.reasoning[0] || 'Weighing the options'} - leaning towards ${action} with ${confidence}% certainty`,
      `🎯 My decision on ${symbols}: ${action} position, targeting ${size} allocation - ${confidence}% confident this is right move`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static generateLearningMessage(thought: RustAIThought, symbols: string, confidence: number): string {
    const templates = [
      `🧠 Learning: ${thought.reasoning[0] || thought.message} - updating my strategy with ${confidence}% confidence`,
      `📚 New insight on ${symbols}: ${thought.message} - this improves my accuracy by incorporating this pattern`,
      `🎓 Pattern recognition update: ${thought.reasoning[0] || 'New market behavior identified'} - adapting my models`,
      `🔄 Strategy evolution: ${thought.message} - ${confidence}% sure this will improve my performance`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static generateRiskMessage(thought: RustAIThought, symbols: string, confidence: number): string {
    const templates = [
      `🛡️ Risk check on ${symbols}: ${thought.reasoning[0] || 'Evaluating position sizing'} - staying within limits`,
      `⚠️ Risk assessment: ${thought.message} - ${confidence}% confident this is the safe approach`,
      `🚨 Portfolio protection: ${symbols} position needs attention - ${thought.reasoning[0] || 'adjusting risk parameters'}`,
      `🔒 Risk management: ${thought.message} - keeping your capital safe with ${confidence}% confidence`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static generatePatternMessage(thought: RustAIThought, symbols: string, confidence: number, price?: number): string {
    const templates = [
      `🔍 Pattern discovered in ${symbols}: ${thought.reasoning[0] || thought.message} - ${confidence}% match to historical data`,
      `📊 New pattern at $${price?.toFixed(2)}: ${thought.message} - this could be significant for ${symbols}`,
      `🎯 Pattern recognition: ${symbols} showing ${thought.reasoning[0] || 'familiar setup'} - ${confidence}% confidence in this signal`,
      `⚡ Market pattern alert: ${thought.message} - ${symbols} fitting classic pattern with ${confidence}% accuracy`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static generateExecutionMessage(thought: RustAIThought, symbols: string, confidence: number, price?: number, position_size?: number): string {
    const action = thought.tags.includes('buy') ? 'BUYING' : thought.tags.includes('sell') ? 'SELLING' : 'EXECUTING';
    const templates = [
      `✅ ${action}: ${position_size || 100} shares of ${symbols} at $${price?.toFixed(2)} - ${thought.reasoning[0] || 'executing planned trade'}`,
      `💸 TRADE EXECUTION: ${action} ${symbols} at $${price?.toFixed(2)} - ${confidence}% confident this is the right moment`,
      `🚀 EXECUTING: ${symbols} ${action.toLowerCase()} order at $${price?.toFixed(2)} - ${thought.reasoning[0] || 'timing looks optimal'}`,
      `⚡ ACTION: ${action} ${symbols} now! Price: $${price?.toFixed(2)}, Size: ${position_size || 5}% - ${confidence}% execution confidence`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static generateRebalancingMessage(thought: RustAIThought, symbols: string, confidence: number): string {
    const templates = [
      `⚖️ Portfolio rebalancing: ${thought.message} - adjusting ${symbols} allocation with ${confidence}% confidence`,
      `🔄 Rebalancing portfolio: ${thought.reasoning[0] || 'Optimizing asset allocation'} for better risk/return`,
      `📊 Position adjustment: ${symbols} weighting needs tweaking - ${thought.message}`,
      `🎯 Portfolio optimization: ${thought.reasoning[0] || 'Rebalancing based on market conditions'} - ${confidence}% confident`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static generateSentimentMessage(thought: RustAIThought, symbols: string, confidence: number): string {
    const sentiment = thought.tags.includes('bullish') ? 'bullish' : thought.tags.includes('bearish') ? 'bearish' : 'neutral';
    const templates = [
      `📰 Market sentiment on ${symbols}: ${sentiment} - ${thought.reasoning[0] || 'analyzing news and options flow'}`,
      `🌊 Sentiment analysis: ${symbols} showing ${sentiment} bias - ${confidence}% confidence in this reading`,
      `📊 Market mood: ${thought.message} - ${symbols} sentiment is ${sentiment} based on multiple indicators`,
      `🎭 Sentiment shift detected: ${symbols} moving ${sentiment} - ${thought.reasoning[0] || 'monitoring social and technical indicators'}`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static mapToHumanType(thoughtType: RustAIThought['thought_type'], agent: RustAIThought['agent']): HumanReadableThought['type'] {
    switch (thoughtType) {
      case 'Analysis':
      case 'PatternFound':
      case 'Sentiment':
        return 'analyzing';
      case 'Decision':
      case 'StrategyUpdate':
        return 'deciding';
      case 'Execution':
      case 'Rebalancing':
        return 'executing';
      case 'Learning':
        return 'learning';
      case 'RiskCheck':
        return 'monitoring';
      default:
        return 'analyzing';
    }
  }

  /**
   * Simulates real AI thoughts for development
   * In production, this would fetch from the Rust backend WebSocket
   */
  static generateSimulatedRustThought(): RustAIThought {
    const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'AMZN', 'META'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const agents: RustAIThought['agent'][] = ['MarketIntelligence', 'RiskManager', 'LearningEngine', 'MasterCoordinator', 'ExecutionEngine'];
    const thoughtTypes: RustAIThought['thought_type'][] = ['Analysis', 'Decision', 'Learning', 'RiskCheck', 'PatternFound', 'StrategyUpdate', 'Execution', 'Rebalancing', 'Sentiment'];
    
    const price = 150 + Math.random() * 200;
    const confidence = Math.random() * 0.4 + 0.6; // 60-100%
    
    return {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toISOString(),
      agent: agents[Math.floor(Math.random() * agents.length)],
      thought_type: thoughtTypes[Math.floor(Math.random() * thoughtTypes.length)],
      message: `Evaluating ${symbol} market conditions and position sizing`,
      confidence,
      confidence_level: confidence > 0.8 ? 'VeryHigh' : confidence > 0.6 ? 'High' : 'Medium',
      reasoning: [
        'RSI showing oversold conditions',
        'Volume spike detected in last 15 minutes',
        'Technical pattern completion near support'
      ],
      supporting_data: {
        current_price: price,
        volume: Math.floor(Math.random() * 5000000 + 1000000),
        price_change: (Math.random() - 0.5) * 10,
        rsi: Math.random() * 100,
        position_size: Math.floor(Math.random() * 10 + 1)
      },
      symbols: [symbol],
      tags: ['technical-analysis', Math.random() > 0.5 ? 'bullish' : 'bearish'],
      impact_level: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
      educational: Math.random() > 0.7
    };
  }
}

/**
 * WebSocket service to connect to Rust AI thoughts backend
 * This will connect to ws://localhost:3001/ai-thoughts in production
 */
export class AIThoughtsService {
  private ws: WebSocket | null = null;
  private listeners: ((thought: HumanReadableThought) => void)[] = [];
  
  constructor() {
    // In development, simulate with real AI thought structure
    this.simulateRealAIThoughts();
  }

  onThought(callback: (thought: HumanReadableThought) => void) {
    this.listeners.push(callback);
  }

  private simulateRealAIThoughts() {
    // Generate initial thoughts
    setTimeout(() => {
      this.broadcastThought();
    }, 1000);

    // Continue generating thoughts every 2-4 seconds
    setInterval(() => {
      this.broadcastThought();
    }, Math.random() * 2000 + 2000);
  }

  private broadcastThought() {
    const rustThought = AIThoughtsTranslator.generateSimulatedRustThought();
    const humanThought = AIThoughtsTranslator.translateToHuman(rustThought);
    
    this.listeners.forEach(listener => {
      try {
        listener(humanThought);
      } catch (error) {
        console.error('Error in AI thoughts listener:', error);
      }
    });
  }

  // Future: Connect to actual Rust backend
  connectToRustBackend() {
    // Temporarily disabled to prevent WebSocket timeout errors
    console.log('🧠 AI Thoughts WebSocket connection disabled for development');
    return;
    
    try {
      this.ws = new WebSocket('ws://localhost:3001/ai-thoughts');
      
      this.ws!.onmessage = (event) => {
        const rustThought: RustAIThought = JSON.parse(event.data);
        const humanThought = AIThoughtsTranslator.translateToHuman(rustThought);
        
        this.listeners.forEach(listener => listener(humanThought));
      };
      
      this.ws!.onopen = () => {
        console.log('🧠 Connected to Rust AI Thoughts backend');
      };
      
      this.ws!.onerror = (error) => {
        console.error('AI Thoughts WebSocket error:', error);
        // Fallback to simulation
        this.simulateRealAIThoughts();
      };
    } catch (error) {
      console.error('Failed to connect to Rust backend:', error);
      // Use simulation
      this.simulateRealAIThoughts();
    }
  }
}

// Singleton instance
export const aiThoughtsService = new AIThoughtsService();
