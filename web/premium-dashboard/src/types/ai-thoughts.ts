// Neural Core Alpha-7 - AI Thoughts Type Definitions

export type ThoughtType = 
  | 'ANALYSIS' 
  | 'PREDICTION' 
  | 'RISK_ASSESSMENT' 
  | 'OPPORTUNITY' 
  | 'WARNING' 
  | 'EXECUTION' 
  | 'OPTIMIZATION'
  | 'MARKET_INSIGHT'
  | 'SENTIMENT_ANALYSIS';

export interface AIThought {
  id: string;
  agent: string;
  type: ThoughtType;
  message: string;
  confidence: number;
  reasoning: string[];
  timestamp: Date;
  symbol?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: {
    model?: string;
    accuracy?: number;
    dataSource?: string;
    riskLevel?: number;
    expectedReturn?: number;
    timeHorizon?: string;
    correlations?: string[];
  };
}

export interface ThoughtStream {
  thoughts: AIThought[];
  totalCount: number;
  activeAgents: string[];
  lastUpdate: Date;
}

export interface AIAgent {
  name: string;
  type: string;
  status: 'ACTIVE' | 'IDLE' | 'ERROR' | 'UPDATING';
  lastThought?: Date;
  thoughtCount: number;
  accuracy: number;
  specialization: string[];
}

export interface ThoughtAnalytics {
  totalThoughts: number;
  thoughtsByType: Record<ThoughtType, number>;
  thoughtsByAgent: Record<string, number>;
  averageConfidence: number;
  highConfidenceThoughts: number;
  criticalThoughts: number;
  recentActivity: {
    last1h: number;
    last24h: number;
    last7d: number;
  };
}