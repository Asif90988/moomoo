// Core Trading Types for Neural Core Alpha-7 Dashboard

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
  timestamp: number;
  exchange: string;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  side: 'long' | 'short';
  openTime: number;
  lastUpdate: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop-limit' | 'trailing-stop' | 'oco' | 'bracket' | 'iceberg';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce: 'GTC' | 'IOC' | 'FOK' | 'DAY';
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';
  filled: number;
  remaining: number;
  avgFillPrice?: number;
  timestamp: number;
  executionTime?: number;
}

export interface Portfolio {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  positions: Position[];
  orders: Order[];
  cash: number;
  buyingPower: number;
  marginUsed: number;
  marginAvailable: number;
}

export interface AIInsight {
  id: string;
  type: 'market_analysis' | 'trade_signal' | 'risk_alert' | 'news_impact' | 'pattern_recognition';
  symbol?: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timestamp: number;
  actionable: boolean;
  suggestedAction?: {
    type: 'buy' | 'sell' | 'hold' | 'reduce' | 'increase';
    quantity?: number;
    price?: number;
    reasoning: string;
  };
  tags: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  timestamp: number;
  impact: 'low' | 'medium' | 'high';
  symbols: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  url?: string;
}

export interface ChartData {
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
  data: OHLCV[];
  indicators?: ChartIndicator[];
  aiSignals?: AITradingSignal[];
}

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartIndicator {
  name: string;
  type: 'overlay' | 'oscillator' | 'volume';
  data: number[];
  config: Record<string, any>;
  color?: string;
}

export interface AITradingSignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  strength: number; // 0-100
  price: number;
  timestamp: number;
  reasoning: string;
  indicators: string[];
  riskReward: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface RiskMetrics {
  portfolioVaR: number;
  maxDrawdown: number;
  sharpeRatio: number;
  beta: number;
  alpha: number;
  volatility: number;
  correlation: Record<string, number>;
  exposureBySymbol: Record<string, number>;
  exposureBySector: Record<string, number>;
}

export interface SystemStatus {
  tradingEngine: 'online' | 'offline' | 'error';
  marketData: 'connected' | 'disconnected' | 'delayed';
  aiEngine: 'active' | 'learning' | 'offline';
  riskManager: 'monitoring' | 'alert' | 'halt';
  orderExecution: 'ready' | 'throttled' | 'suspended';
  lastUpdate: number;
  latency: {
    marketData: number;
    orderExecution: number;
    aiProcessing: number;
  };
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  layout: 'compact' | 'standard' | 'wide';
  charts: {
    defaultTimeframe: string;
    indicators: string[];
    theme: 'dark' | 'light';
  };
  notifications: {
    trades: boolean;
    priceAlerts: boolean;
    aiInsights: boolean;
    news: boolean;
  };
  trading: {
    confirmOrders: boolean;
    defaultOrderType: string;
    defaultTimeInForce: string;
  };
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'market_data' | 'portfolio_update' | 'ai_insight' | 'news' | 'system_status' | 'order_update';
  data: any;
  timestamp: number;
}

export interface MarketDataMessage extends WebSocketMessage {
  type: 'market_data';
  data: MarketData[];
}

export interface PortfolioUpdateMessage extends WebSocketMessage {
  type: 'portfolio_update';
  data: Portfolio;
}

export interface AIInsightMessage extends WebSocketMessage {
  type: 'ai_insight';
  data: AIInsight;
}

export interface NewsMessage extends WebSocketMessage {
  type: 'news';
  data: NewsItem;
}

export interface SystemStatusMessage extends WebSocketMessage {
  type: 'system_status';
  data: SystemStatus;
}

export interface OrderUpdateMessage extends WebSocketMessage {
  type: 'order_update';    
  data: Order;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'trader' | 'viewer';
  permissions: string[];
  preferences: UserPreferences;
  lastLogin: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}