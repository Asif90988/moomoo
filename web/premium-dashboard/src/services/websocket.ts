// WebSocket Service for Real-time Trading Data
import { io, Socket } from 'socket.io-client';
import type { 
  WebSocketMessage, 
  MarketData, 
  Portfolio, 
  AIInsight, 
  NewsItem, 
  SystemStatus,
  Order 
} from '@/types/trading';

export class TradingWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor(private url: string = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'ws://localhost:3001') {
    this.connect(); // Enable real-time connection
    console.log('🚀 Neural Core WebSocket service initialized and connecting to:', this.url);
  }

  private connect() {
    try {
      this.socket = io(this.url, {
        transports: ['websocket'],
        timeout: 5000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('🚀 Neural Core WebSocket Connected');
        this.reconnectAttempts = 0;
        this.emit('connection_status', { status: 'connected', timestamp: Date.now() });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('⚠️ Neural Core WebSocket Disconnected:', reason);
        this.emit('connection_status', { status: 'disconnected', reason, timestamp: Date.now() });
        this.handleReconnect();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Neural Core WebSocket Connection Error:', error);
        this.emit('connection_status', { status: 'error', error: error.message, timestamp: Date.now() });
        this.handleReconnect();
      });

      // Market data updates
      this.socket.on('market_data', (data: MarketData[]) => {
        this.emit('market_data', data);
      });

      // Portfolio updates
      this.socket.on('portfolio_update', (data: Portfolio) => {
        this.emit('portfolio_update', data);
      });

      // AI insights
      this.socket.on('ai_insight', (data: AIInsight) => {
        this.emit('ai_insight', data);
      });

      // News updates
      this.socket.on('news', (data: NewsItem) => {
        this.emit('news', data);
      });

      // System status
      this.socket.on('system_status', (data: SystemStatus) => {
        this.emit('system_status', data);
      });

      // Order updates
      this.socket.on('order_update', (data: Order) => {
        this.emit('order_update', data);
      });

      // Chart data updates
      this.socket.on('chart_data', (data: any) => {
        this.emit('chart_data', data);
      });

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Please refresh the page.');
      this.emit('connection_status', { 
        status: 'failed', 
        message: 'Max reconnection attempts reached', 
        timestamp: Date.now() 
      });
    }
  }

  // Subscribe to specific events
  public on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Unsubscribe from events
  public off(event: string, callback?: (data: any) => void) {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.set(event, []);
    }
  }

  // Emit events to listeners
  private emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Send messages to server
  public send(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected. Message not sent:', event, data);
    }
  }

  // Subscribe to market data for specific symbols
  public subscribeToMarketData(symbols: string[]) {
    this.send('subscribe_market_data', { symbols });
  }

  // Unsubscribe from market data
  public unsubscribeFromMarketData(symbols: string[]) {
    this.send('unsubscribe_market_data', { symbols });
  }

  // Subscribe to chart data for a symbol
  public subscribeToChartData(symbol: string, timeframe: string) {
    this.send('subscribe_chart_data', { symbol, timeframe });
  }

  // Request AI analysis for a symbol
  public requestAIAnalysis(symbol: string, timeframe?: string) {
    this.send('request_ai_analysis', { symbol, timeframe });
  }

  // Send order to execution engine
  public submitOrder(order: Partial<Order>) {
    this.send('submit_order', order);
  }

  // Cancel order
  public cancelOrder(orderId: string) {
    this.send('cancel_order', { orderId });
  }

  // Get connection status
  public isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }

  // Disconnect
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Get connection stats
  public getConnectionStats() {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      listenerCount: Array.from(this.listeners.values()).reduce((total, arr) => total + arr.length, 0),
    };
  }
}

// Singleton instance
export const wsService = new TradingWebSocketService();

// WebSocket Hook for React components
export const useWebSocket = () => {
  return wsService;
};