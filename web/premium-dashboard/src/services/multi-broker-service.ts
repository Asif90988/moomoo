// Multi-Broker Trading Service
// Manages multiple trading brokers (MooMoo, Alpaca) with unified interface

import { alpacaAPI, AlpacaAccount, AlpacaPosition, AlpacaOrder } from './alpaca-api';
import { moomooAPI } from './moomoo-api';

export type BrokerType = 'moomoo' | 'alpaca' | 'binance-testnet';

export interface UnifiedAccount {
  broker: BrokerType;
  id: string;
  accountNumber: string;
  status: string;
  currency: string;
  buyingPower: number;
  cash: number;
  portfolioValue: number;
  equity: number;
  dayTradingBuyingPower?: number;
  patternDayTrader?: boolean;
  tradingBlocked?: boolean;
  paperTrading: boolean;
}

export interface UnifiedPosition {
  broker: BrokerType;
  symbol: string;
  quantity: number;
  side: 'long' | 'short';
  marketValue: number;
  costBasis: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  currentPrice: number;
  changeToday: number;
}

export interface UnifiedOrder {
  broker: BrokerType;
  id: string;
  clientOrderId?: string;
  symbol: string;
  quantity: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  status: string;
  filledQuantity: number;
  averagePrice?: number;
  limitPrice?: number;
  stopPrice?: number;
  timeInForce: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedQuote {
  broker: BrokerType;
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  timestamp: string;
}

export interface BrokerStatus {
  broker: BrokerType;
  connected: boolean;
  configured: boolean;
  paperTrading: boolean;
  message: string;
  account?: UnifiedAccount;
}

class MultiBrokerService {
  private activeBrokers: Set<BrokerType> = new Set();
  private primaryBroker: BrokerType = 'alpaca'; // Default primary broker

  constructor() {
    console.log('🔄 [MULTI-BROKER] Initializing multi-broker service...');
    this.initializeBrokers();
  }

  private async initializeBrokers() {
    // Test Alpaca connection
    if (alpacaAPI.isConfigured()) {
      try {
        const result = await alpacaAPI.testConnection();
        if (result.success) {
          this.activeBrokers.add('alpaca');
          console.log('✅ [MULTI-BROKER] Alpaca broker activated');
        }
      } catch (error) {
        console.warn('⚠️ [MULTI-BROKER] Alpaca broker not available:', error);
      }
    }

    // Test MooMoo connection (if available)
    try {
      // MooMoo test would go here when available
      console.log('🔍 [MULTI-BROKER] MooMoo broker check (placeholder)');
    } catch (error) {
      console.warn('⚠️ [MULTI-BROKER] MooMoo broker not available:', error);
    }

    console.log(`🔄 [MULTI-BROKER] Active brokers: ${Array.from(this.activeBrokers).join(', ')}`);
  }

  // Broker Management
  getActiveBrokers(): BrokerType[] {
    return Array.from(this.activeBrokers);
  }

  setPrimaryBroker(broker: BrokerType) {
    if (this.activeBrokers.has(broker)) {
      this.primaryBroker = broker;
      console.log(`🎯 [MULTI-BROKER] Primary broker set to: ${broker}`);
    } else {
      throw new Error(`Broker ${broker} is not active`);
    }
  }

  getPrimaryBroker(): BrokerType {
    return this.primaryBroker;
  }

  async getBrokerStatus(broker: BrokerType): Promise<BrokerStatus> {
    switch (broker) {
      case 'alpaca':
        const alpacaConfigured = alpacaAPI.isConfigured();
        if (!alpacaConfigured) {
          return {
            broker: 'alpaca',
            connected: false,
            configured: false,
            paperTrading: alpacaAPI.isPaperTrading(),
            message: 'Alpaca API keys not configured'
          };
        }

        try {
          const result = await alpacaAPI.testConnection();
          const account = result.account ? this.convertAlpacaAccount(result.account) : undefined;
          
          return {
            broker: 'alpaca',
            connected: result.success,
            configured: true,
            paperTrading: alpacaAPI.isPaperTrading(),
            message: result.message,
            account
          };
        } catch (error) {
          return {
            broker: 'alpaca',
            connected: false,
            configured: true,
            paperTrading: alpacaAPI.isPaperTrading(),
            message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }

      case 'moomoo':
        // MooMoo status check would go here
        return {
          broker: 'moomoo',
          connected: false,
          configured: false,
          paperTrading: true,
          message: 'MooMoo integration pending'
        };

      case 'binance-testnet':
        try {
          const response = await fetch('/api/binance/test');
          const result = await response.json();
          
          return {
            broker: 'binance-testnet',
            connected: result.success,
            configured: true,
            paperTrading: true,
            message: result.success ? 'Connected to Binance Testnet' : result.error || 'Connection failed'
          };
        } catch (error) {
          return {
            broker: 'binance-testnet',
            connected: false,
            configured: true,
            paperTrading: true,
            message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }

      default:
        throw new Error(`Unknown broker: ${broker}`);
    }
  }

  async getAllBrokerStatuses(): Promise<BrokerStatus[]> {
    const brokers: BrokerType[] = ['alpaca', 'moomoo', 'binance-testnet'];
    const statuses = await Promise.all(
      brokers.map(broker => this.getBrokerStatus(broker))
    );
    return statuses;
  }

  // Account Management
  async getAccount(broker?: BrokerType): Promise<UnifiedAccount> {
    const targetBroker = broker || this.primaryBroker;
    
    switch (targetBroker) {
      case 'alpaca':
        const alpacaAccount = await alpacaAPI.getAccount();
        return this.convertAlpacaAccount(alpacaAccount);
      
      case 'moomoo':
        // MooMoo account fetch would go here
        throw new Error('MooMoo account fetch not implemented yet');
      
      default:
        throw new Error(`Unknown broker: ${targetBroker}`);
    }
  }

  async getAllAccounts(): Promise<UnifiedAccount[]> {
    const accounts: UnifiedAccount[] = [];
    
    for (const broker of Array.from(this.activeBrokers)) {
      try {
        const account = await this.getAccount(broker);
        accounts.push(account);
      } catch (error) {
        console.warn(`⚠️ [MULTI-BROKER] Failed to fetch ${broker} account:`, error);
      }
    }
    
    return accounts;
  }

  // Position Management
  async getPositions(broker?: BrokerType): Promise<UnifiedPosition[]> {
    const targetBroker = broker || this.primaryBroker;
    
    switch (targetBroker) {
      case 'alpaca':
        const alpacaPositions = await alpacaAPI.getPositions();
        return alpacaPositions.map(pos => this.convertAlpacaPosition(pos));
      
      case 'moomoo':
        // MooMoo positions fetch would go here
        throw new Error('MooMoo positions fetch not implemented yet');
      
      default:
        throw new Error(`Unknown broker: ${targetBroker}`);
    }
  }

  async getAllPositions(): Promise<UnifiedPosition[]> {
    const allPositions: UnifiedPosition[] = [];
    
    for (const broker of Array.from(this.activeBrokers)) {
      try {
        const positions = await this.getPositions(broker);
        allPositions.push(...positions);
      } catch (error) {
        console.warn(`⚠️ [MULTI-BROKER] Failed to fetch ${broker} positions:`, error);
      }
    }
    
    return allPositions;
  }

  // Order Management
  async placeOrder(orderData: {
    broker?: BrokerType;
    symbol: string;
    quantity: number;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop' | 'stop_limit';
    limitPrice?: number;
    stopPrice?: number;
    timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok';
    extendedHours?: boolean;
  }): Promise<UnifiedOrder> {
    const targetBroker = orderData.broker || this.primaryBroker;
    
    console.log(`📝 [MULTI-BROKER] Placing ${orderData.side} order for ${orderData.symbol} via ${targetBroker}`);
    
    switch (targetBroker) {
      case 'alpaca':
        const alpacaOrderData = {
          symbol: orderData.symbol,
          qty: orderData.quantity,
          side: orderData.side,
          type: orderData.type,
          time_in_force: (orderData.timeInForce || 'day') as 'day' | 'gtc' | 'ioc' | 'fok',
          limit_price: orderData.limitPrice,
          stop_price: orderData.stopPrice,
          extended_hours: orderData.extendedHours || false
        };
        
        const alpacaOrder = await alpacaAPI.placeOrder(alpacaOrderData);
        return this.convertAlpacaOrder(alpacaOrder);
      
      case 'moomoo':
        // MooMoo order placement would go here
        throw new Error('MooMoo order placement not implemented yet');
      
      default:
        throw new Error(`Unknown broker: ${targetBroker}`);
    }
  }

  async getOrders(broker?: BrokerType, status?: string): Promise<UnifiedOrder[]> {
    const targetBroker = broker || this.primaryBroker;
    
    switch (targetBroker) {
      case 'alpaca':
        const alpacaOrders = await alpacaAPI.getOrders(status);
        return alpacaOrders.map(order => this.convertAlpacaOrder(order));
      
      case 'moomoo':
        // MooMoo orders fetch would go here
        throw new Error('MooMoo orders fetch not implemented yet');
      
      default:
        throw new Error(`Unknown broker: ${targetBroker}`);
    }
  }

  async getAllOrders(): Promise<UnifiedOrder[]> {
    const allOrders: UnifiedOrder[] = [];
    
    for (const broker of Array.from(this.activeBrokers)) {
      try {
        const orders = await this.getOrders(broker);
        allOrders.push(...orders);
      } catch (error) {
        console.warn(`⚠️ [MULTI-BROKER] Failed to fetch ${broker} orders:`, error);
      }
    }
    
    return allOrders;
  }

  async cancelOrder(orderId: string, broker?: BrokerType): Promise<void> {
    const targetBroker = broker || this.primaryBroker;
    
    switch (targetBroker) {
      case 'alpaca':
        await alpacaAPI.cancelOrder(orderId);
        break;
      
      case 'moomoo':
        // MooMoo order cancellation would go here
        throw new Error('MooMoo order cancellation not implemented yet');
      
      default:
        throw new Error(`Unknown broker: ${targetBroker}`);
    }
  }

  // Market Data
  async getQuote(symbol: string, broker?: BrokerType): Promise<UnifiedQuote> {
    const targetBroker = broker || this.primaryBroker;
    
    switch (targetBroker) {
      case 'alpaca':
        const [quote, trade] = await Promise.all([
          alpacaAPI.getLatestQuote(symbol),
          alpacaAPI.getLatestTrade(symbol)
        ]);
        
        return {
          broker: 'alpaca',
          symbol: symbol,
          bid: quote.bid,
          ask: quote.ask,
          last: trade.price,
          volume: trade.size,
          timestamp: trade.timestamp
        };
      
      case 'moomoo':
        // MooMoo quote fetch would go here
        throw new Error('MooMoo quote fetch not implemented yet');
      
      default:
        throw new Error(`Unknown broker: ${targetBroker}`);
    }
  }

  // Conversion Methods
  private convertAlpacaAccount(account: AlpacaAccount): UnifiedAccount {
    return {
      broker: 'alpaca',
      id: account.id,
      accountNumber: account.account_number,
      status: account.status,
      currency: account.currency,
      buyingPower: parseFloat(account.buying_power),
      cash: parseFloat(account.cash),
      portfolioValue: parseFloat(account.portfolio_value),
      equity: parseFloat(account.equity),
      dayTradingBuyingPower: parseFloat(account.daytrading_buying_power),
      patternDayTrader: account.pattern_day_trader,
      tradingBlocked: account.trading_blocked,
      paperTrading: alpacaAPI.isPaperTrading()
    };
  }

  private convertAlpacaPosition(position: AlpacaPosition): UnifiedPosition {
    return {
      broker: 'alpaca',
      symbol: position.symbol,
      quantity: parseFloat(position.qty),
      side: position.side,
      marketValue: parseFloat(position.market_value),
      costBasis: parseFloat(position.cost_basis),
      unrealizedPL: parseFloat(position.unrealized_pl),
      unrealizedPLPercent: parseFloat(position.unrealized_plpc),
      currentPrice: parseFloat(position.current_price),
      changeToday: parseFloat(position.change_today)
    };
  }

  private convertAlpacaOrder(order: AlpacaOrder): UnifiedOrder {
    return {
      broker: 'alpaca',
      id: order.id,
      clientOrderId: order.client_order_id,
      symbol: order.symbol,
      quantity: parseFloat(order.qty || '0'),
      side: order.side,
      type: order.type,
      status: order.status,
      filledQuantity: parseFloat(order.filled_qty),
      averagePrice: order.filled_avg_price ? parseFloat(order.filled_avg_price) : undefined,
      limitPrice: order.limit_price ? parseFloat(order.limit_price) : undefined,
      stopPrice: order.stop_price ? parseFloat(order.stop_price) : undefined,
      timeInForce: order.time_in_force,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };
  }

  // Portfolio Analytics
  async getPortfolioSummary(): Promise<{
    totalValue: number;
    totalCash: number;
    totalEquity: number;
    totalUnrealizedPL: number;
    brokerBreakdown: Array<{
      broker: BrokerType;
      value: number;
      cash: number;
      equity: number;
      paperTrading: boolean;
    }>;
  }> {
    const accounts = await this.getAllAccounts();
    
    let totalValue = 0;
    let totalCash = 0;
    let totalEquity = 0;
    let totalUnrealizedPL = 0;
    
    const brokerBreakdown = accounts.map(account => {
      totalValue += account.portfolioValue;
      totalCash += account.cash;
      totalEquity += account.equity;
      
      return {
        broker: account.broker,
        value: account.portfolioValue,
        cash: account.cash,
        equity: account.equity,
        paperTrading: account.paperTrading
      };
    });
    
    // Calculate total unrealized P&L from positions
    const allPositions = await this.getAllPositions();
    totalUnrealizedPL = allPositions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);
    
    return {
      totalValue,
      totalCash,
      totalEquity,
      totalUnrealizedPL,
      brokerBreakdown
    };
  }
}

// Export singleton instance
export const multiBrokerService = new MultiBrokerService();
export default multiBrokerService;
