// Moomoo API Service for Real Trading Integration
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { 
  MarketData, 
  Order, 
  Position, 
  Portfolio, 
  ApiResponse,
  ChartData,
  OHLCV 
} from '@/types/trading';

export interface MoomooConfig {
  baseUrl: string;
  timeout: number;
  paperTrading: boolean;
  // Note: Moomoo uses session-based authentication via OpenD GUI login
  // No API keys needed for localhost connection
}

export class MoomooAPIService {
  private client: AxiosInstance;
  private config: MoomooConfig;

  constructor(config: MoomooConfig) {
    this.config = config;
    
    // Moomoo OpenD uses session-based authentication
    // Authentication is handled externally via GUI login into OpenD
    // The application connects to localhost:11111 without API keys
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Paper-Trading': config.paperTrading.toString(),
      },
    });

    // Request interceptor for authentication and logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 Moomoo API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Moomoo API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Moomoo API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Moomoo API Error:', error.response?.status, error.message);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;
      return new Error(`Moomoo API Error ${status}: ${data.message || 'Unknown error'}`);
    } else if (error.request) {
      return new Error('Moomoo API: No response received');
    } else {
      return new Error(`Moomoo API: ${error.message}`);
    }
  }

  // Market Data Methods
  async getMarketData(symbols: string[]): Promise<ApiResponse<MarketData[]>> {
    try {
      const response = await this.client.post('/market/quotes', {
        symbols,
        fields: ['price', 'change', 'volume', 'high', 'low', 'marketCap']
      });

      const marketData: MarketData[] = response.data.data.map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.name || quote.symbol,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        marketCap: quote.marketCap,
        high24h: quote.high,
        low24h: quote.low,
        timestamp: Date.now(),
        exchange: quote.exchange || 'NASDAQ'
      }));

      return {
        success: true,
        data: marketData,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }

  async getChartData(symbol: string, timeframe: string, limit: number = 500): Promise<ApiResponse<ChartData>> {
    try {
      const response = await this.client.get('/market/chart', {
        params: {
          symbol,
          timeframe,
          limit
        }
      });

      const ohlcvData: OHLCV[] = response.data.data.map((bar: any) => ({
        timestamp: bar.timestamp,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume
      }));

      const chartData: ChartData = {
        symbol,
        timeframe: timeframe as any,
        data: ohlcvData
      };

      return {
        success: true,
        data: chartData,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }

  // Portfolio Methods
  async getPortfolio(): Promise<ApiResponse<Portfolio>> {
    try {
      const response = await this.client.get('/account/portfolio');
      
      const portfolio: Portfolio = {
        totalValue: response.data.totalValue,
        totalPnl: response.data.totalPnl,
        totalPnlPercent: response.data.totalPnlPercent,
        dayPnl: response.data.dayPnl,
        dayPnlPercent: response.data.dayPnlPercent,
        cash: response.data.cash,
        buyingPower: response.data.buyingPower,
        marginUsed: response.data.marginUsed,
        marginAvailable: response.data.marginAvailable,
        positions: response.data.positions.map((pos: any) => ({
          id: pos.id,
          symbol: pos.symbol,
          quantity: pos.quantity,
          avgCost: pos.avgCost,
          marketValue: pos.marketValue,
          pnl: pos.pnl,
          pnlPercent: pos.pnlPercent,
          side: pos.side,
          openTime: pos.openTime,
          lastUpdate: Date.now()
        })),
        orders: response.data.orders.map((order: any) => ({
          id: order.id,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          quantity: order.quantity,
          price: order.price,
          stopPrice: order.stopPrice,
          timeInForce: order.timeInForce,
          status: order.status,
          filled: order.filled,
          remaining: order.remaining,
          avgFillPrice: order.avgFillPrice,
          timestamp: order.timestamp,
          executionTime: order.executionTime
        }))
      };

      return {
        success: true,
        data: portfolio,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }

  // Order Management Methods
  async submitOrder(order: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const orderPayload = {
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        quantity: order.quantity,
        price: order.price,
        stopPrice: order.stopPrice,
        timeInForce: order.timeInForce || 'GTC'
      };

      const response = await this.client.post('/orders', orderPayload);

      const submittedOrder: Order = {
        id: response.data.orderId,
        symbol: response.data.symbol,
        side: response.data.side,
        type: response.data.type,
        quantity: response.data.quantity,
        price: response.data.price,
        stopPrice: response.data.stopPrice,
        timeInForce: response.data.timeInForce,
        status: response.data.status,
        filled: 0,
        remaining: response.data.quantity,
        timestamp: Date.now()
      };

      return {
        success: true,
        data: submittedOrder,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<boolean>> {
    try {
      await this.client.delete(`/orders/${orderId}`);
      
      return {
        success: true,
        data: true,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }

  async getOrderStatus(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const response = await this.client.get(`/orders/${orderId}`);
      
      const order: Order = {
        id: response.data.id,
        symbol: response.data.symbol,
        side: response.data.side,
        type: response.data.type,
        quantity: response.data.quantity,
        price: response.data.price,
        stopPrice: response.data.stopPrice,
        timeInForce: response.data.timeInForce,
        status: response.data.status,
        filled: response.data.filled,
        remaining: response.data.remaining,
        avgFillPrice: response.data.avgFillPrice,
        timestamp: response.data.timestamp,
        executionTime: response.data.executionTime
      };

      return {
        success: true,
        data: order,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }

  // Account Information
  async getAccountInfo(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/account/info');
      
      return {
        success: true,
        data: response.data,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }

  // Market Status
  async getMarketStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/market/status');
      
      return {
        success: true,
        data: response.data,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }

  // Connection test using JSON-RPC protocol (OpenD standard)
  async testConnection(): Promise<boolean> {
    try {
      // OpenD uses JSON-RPC protocol
      const rpcRequest = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "get_user_info",
        params: {}
      };
      
      const response = await this.client.post('/', rpcRequest, { 
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200 && response.data) {
        console.log('✅ OpenD connected successfully via JSON-RPC');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Moomoo OpenD connection test failed:', error);
      return false;
    }
  }
}

// Create Moomoo API service instance
export const createMoomooAPI = (config: MoomooConfig) => {
  return new MoomooAPIService(config);
};

// Moomoo OpenD Configuration - Session-based authentication
export const defaultMoomooConfig: MoomooConfig = {
  baseUrl: process.env.MOOMOO_BASE_URL || 'http://127.0.0.1:11111',
  timeout: parseInt(process.env.API_TIMEOUT || '5000'),
  paperTrading: process.env.TRADING_MODE !== 'live'
};

// Export singleton instance
export const moomooAPI = createMoomooAPI(defaultMoomooConfig);

// Also export the class for type checking
export { MoomooAPIService as MoomooAPI };
