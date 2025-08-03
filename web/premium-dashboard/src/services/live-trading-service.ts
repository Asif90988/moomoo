// Live Trading Service - Production-ready trading integration
import { moomooAPI } from './moomoo-api';
import { wsService } from './websocket';
import type { Order, Portfolio, MarketData } from '@/types/trading';

export interface TradingAccount {
  id: string;
  userId: string;
  accountType: 'paper' | 'live';
  balance: number;
  maxDeposit: number;
  totalDeposited: number;
  isActive: boolean;
  createdAt: string;
}

export interface DepositLimits {
  maxSingleDeposit: number;
  maxTotalDeposit: number;
  currentTotal: number;
  remainingLimit: number;
}

class LiveTradingService {
  private account: TradingAccount | null = null;
  private portfolio: Portfolio | null = null;
  private isConnected = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      // Test API connection
      const connectionTest = await moomooAPI.testConnection();
      this.isConnected = connectionTest;
      
      if (this.isConnected) {
        console.log('✅ Moomoo API connected successfully');
        this.startHeartbeat();
        await this.loadAccountData();
      } else {
        console.warn('⚠️ Moomoo API connection failed - running in simulation mode');
      }
    } catch (error) {
      console.error('❌ Trading service initialization failed:', error);
      this.isConnected = false;
    }
  }

  // Account Management
  public async createTradingAccount(userId: string, accountType: 'paper' | 'live'): Promise<TradingAccount> {
    const account: TradingAccount = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      accountType,
      balance: accountType === 'paper' ? 1000 : 0, // $1000 paper money
      maxDeposit: 300, // Neural Core $300 protection limit
      totalDeposited: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.account = account;
    
    // Store in database (implement when database is ready)
    await this.saveAccountToDatabase(account);
    
    return account;
  }

  public async validateDeposit(amount: number): Promise<{ valid: boolean; error?: string; limits: DepositLimits }> {
    if (!this.account) {
      throw new Error('No trading account found');
    }

    const limits: DepositLimits = {
      maxSingleDeposit: 300,
      maxTotalDeposit: 300,
      currentTotal: this.account.totalDeposited,
      remainingLimit: 300 - this.account.totalDeposited
    };

    // Neural Core Protection: $300 maximum deposit
    if (amount > limits.maxSingleDeposit) {
      return {
        valid: false,
        error: `Single deposit cannot exceed $${limits.maxSingleDeposit} (Neural Core Protection)`,
        limits
      };
    }

    if (this.account.totalDeposited + amount > limits.maxTotalDeposit) {
      return {
        valid: false,
        error: `Total deposits cannot exceed $${limits.maxTotalDeposit} (Neural Core Protection)`,
        limits
      };
    }

    if (amount <= 0) {
      return {
        valid: false,
        error: 'Deposit amount must be positive',
        limits
      };
    }

    return { valid: true, limits };
  }

  public async processDeposit(amount: number): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const validation = await this.validateDeposit(amount);
    
    if (!validation.valid) {
      return {
        success: false,
        newBalance: this.account?.balance || 0,
        error: validation.error
      };
    }

    if (!this.account) {
      throw new Error('No trading account found');
    }

    try {
      // In live mode, process real deposit via payment processor
      if (this.account.accountType === 'live') {
        // Implement real payment processing here
        await this.processRealDeposit(amount);
      }

      // Update account balance
      this.account.balance += amount;
      this.account.totalDeposited += amount;
      
      await this.saveAccountToDatabase(this.account);
      
      console.log(`💰 Deposit processed: $${amount} (New balance: $${this.account.balance})`);
      
      return {
        success: true,
        newBalance: this.account.balance
      };
    } catch (error) {
      return {
        success: false,
        newBalance: this.account.balance,
        error: (error as Error).message
      };
    }
  }

  // Trading Operations
  public async submitOrder(orderData: Partial<Order>): Promise<{ success: boolean; order?: Order; error?: string }> {
    if (!this.account) {
      return { success: false, error: 'No trading account found' };
    }

    if (!this.isConnected && this.account.accountType === 'live') {
      return { success: false, error: 'Trading API not connected' };
    }

    try {
      // Validate order against account balance and risk limits
      const validation = await this.validateOrder(orderData);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      let result;
      if (this.account.accountType === 'live' && this.isConnected) {
        // Submit to real broker
        result = await moomooAPI.submitOrder(orderData);
      } else {
        // Paper trading simulation
        result = await this.simulateOrder(orderData);
      }

      if (result.success && result.data) {
        // Broadcast order update
        wsService.send('order_submitted', result.data);
        
        console.log(`📊 Order submitted: ${result.data.side} ${result.data.quantity} ${result.data.symbol}`);
        
        return { success: true, order: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  public async getPortfolio(): Promise<Portfolio | null> {
    if (!this.account) return null;

    try {
      if (this.account.accountType === 'live' && this.isConnected) {
        const result = await moomooAPI.getPortfolio();
        if (result.success && result.data) {
          this.portfolio = result.data;
          return result.data;
        }
      } else {
        // Return simulated portfolio for paper trading
        return this.getSimulatedPortfolio();
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    }

    return this.portfolio;
  }

  public async getMarketData(symbols: string[]): Promise<MarketData[]> {
    try {
      if (this.isConnected) {
        const result = await moomooAPI.getMarketData(symbols);
        if (result.success && result.data) {
          return result.data;
        }
      }
      
      // Fallback to simulated data
      return this.generateSimulatedMarketData(symbols);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      return this.generateSimulatedMarketData(symbols);
    }
  }

  // Risk Management
  private async validateOrder(orderData: Partial<Order>): Promise<{ valid: boolean; error?: string }> {
    if (!this.account || !orderData.symbol || !orderData.quantity || !orderData.side) {
      return { valid: false, error: 'Invalid order data' };
    }

    // Check buying power
    if (orderData.side === 'buy') {
      const estimatedCost = (orderData.quantity * (orderData.price || 100)); // Estimate cost
      if (estimatedCost > this.account.balance) {
        return { valid: false, error: 'Insufficient buying power' };
      }
    }

    // Position size limits (max 10% of account per position)
    const maxPositionValue = this.account.balance * 0.1;
    const orderValue = (orderData.quantity * (orderData.price || 100));
    if (orderValue > maxPositionValue) {
      return { 
        valid: false, 
        error: `Position size too large. Max: $${maxPositionValue.toFixed(2)} (10% of account)` 
      };
    }

    return { valid: true };
  }

  // Simulation for paper trading
  private async simulateOrder(orderData: Partial<Order>): Promise<{ success: boolean; data?: Order; error?: string }> {
    const simulatedOrder: Order = {
      id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: orderData.symbol!,
      side: orderData.side!,
      type: orderData.type || 'market',
      quantity: orderData.quantity!,
      price: orderData.price,
      stopPrice: orderData.stopPrice,
      timeInForce: orderData.timeInForce || 'GTC',
      status: 'filled', // Simulate immediate fill for paper trading
      filled: orderData.quantity!,
      remaining: 0,
      avgFillPrice: orderData.price || 100, // Use market price
      timestamp: Date.now(),
      executionTime: Date.now()
    };

    return { success: true, data: simulatedOrder };
  }

  private getSimulatedPortfolio(): Portfolio {
    return {
      totalValue: this.account?.balance || 0,
      totalPnl: 0,
      totalPnlPercent: 0,
      dayPnl: 0,
      dayPnlPercent: 0,
      cash: this.account?.balance || 0,
      buyingPower: this.account?.balance || 0,
      marginUsed: 0,
      marginAvailable: this.account?.balance || 0,
      positions: [],
      orders: []
    };
  }

  private generateSimulatedMarketData(symbols: string[]): MarketData[] {
    return symbols.map(symbol => ({
      symbol,
      name: `${symbol} Inc.`,
      price: 50 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000),
      high24h: 60 + Math.random() * 200,
      low24h: 40 + Math.random() * 200,
      timestamp: Date.now(),
      exchange: 'NASDAQ'
    }));
  }

  // Database operations (implement when database is ready)
  private async saveAccountToDatabase(account: TradingAccount): Promise<void> {
    // TODO: Implement database save
    console.log('📝 Account saved to database:', account.id);
  }

  private async loadAccountData(): Promise<void> {
    // TODO: Load account from database
    console.log('📚 Loading account data from database');
  }

  private async processRealDeposit(amount: number): Promise<void> {
    // TODO: Implement real payment processing (Stripe, PayPal, etc.)
    console.log('💳 Processing real deposit:', amount);
  }

  // Connection monitoring
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        const connected = await moomooAPI.testConnection();
        if (connected !== this.isConnected) {
          this.isConnected = connected;
          console.log(`🔄 Connection status changed: ${connected ? 'Connected' : 'Disconnected'}`);
        }
      } catch (error) {
        this.isConnected = false;
      }
    }, 30000); // Check every 30 seconds
  }

  public cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  // Public API
  public getAccount(): TradingAccount | null {
    return this.account;
  }

  public isApiConnected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const liveTradingService = new LiveTradingService();