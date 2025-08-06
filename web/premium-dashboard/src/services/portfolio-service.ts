// Portfolio Service - Real-time portfolio and position tracking
import { wsService } from './websocket';
import { moomooAPI } from './moomoo-api';
import { db, updatePosition } from '@/lib/db';

export interface Portfolio {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  cash: number;
  buyingPower: number;
  marginUsed: number;
  marginAvailable: number;
  positions: Position[];
  orders: Order[];
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
  dayChange: number;
  dayChangePercent: number;
  lastUpdate: string;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce: 'GTC' | 'IOC' | 'FOK' | 'DAY';
  status: 'PENDING' | 'SUBMITTED' | 'PARTIAL_FILLED' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  filled: number;
  remaining: number;
  avgFillPrice?: number;
  timestamp: number;
  executionTime?: number;
}

export interface PortfolioUpdate {
  timestamp: number;
  totalValue: number;
  dayPnl: number;
  positions: Position[];
  newOrders?: Order[];
  filledOrders?: Order[];
  cancelledOrders?: string[];
}

class PortfolioService {
  private portfolio: Portfolio | null = null;
  private subscribers: Set<(portfolio: Portfolio) => void> = new Set();
  private updateSubscribers: Set<(update: PortfolioUpdate) => void> = new Set();
  private isTracking = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private lastUpdateTime = 0;

  constructor() {
    this.initializeWebSocketListeners();
  }

  private initializeWebSocketListeners() {
    // Listen for portfolio updates from backend
    wsService.on('portfolio_update', (data: Portfolio) => {
      this.updatePortfolio(data);
    });

    // Listen for position updates
    wsService.on('position_update', (position: Position) => {
      this.updatePosition(position);
    });

    // Listen for order updates
    wsService.on('order_update', (order: Order) => {
      this.updateOrder(order);
    });

    // Listen for market data updates to recalculate positions
    wsService.on('market_data', (marketData: any[]) => {
      this.updatePositionsFromMarketData(marketData);
    });
  }

  // Start real-time portfolio tracking
  public startTracking(userId: string, tradingAccountId: string) {
    if (this.isTracking) return;

    this.isTracking = true;
    console.log('📊 Starting real-time portfolio tracking');

    // Initial portfolio load
    this.loadPortfolio(userId, tradingAccountId);

    // Subscribe to real-time updates
    wsService.send('subscribe_portfolio', { userId, tradingAccountId });

    // Periodic updates every 5 seconds
    this.updateInterval = setInterval(() => {
      this.refreshPortfolio(userId, tradingAccountId);
    }, 5000);
  }

  public stopTracking() {
    if (!this.isTracking) return;

    this.isTracking = false;
    console.log('⏹️ Stopping portfolio tracking');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    wsService.send('unsubscribe_portfolio', {});
  }

  // Load initial portfolio data
  private async loadPortfolio(userId: string, tradingAccountId: string) {
    try {
      // In production, load from database
      const portfolio = await this.getPortfolioFromDatabase(tradingAccountId);
      
      if (portfolio) {
        this.portfolio = portfolio;
        this.notifySubscribers();
      } else {
        // Create initial empty portfolio - RESPECT $300 BASELINE
        this.portfolio = {
          totalValue: 300.00, // Fixed $300 baseline for autonomous trading
          totalPnl: 0,
          totalPnlPercent: 0,
          dayPnl: 0,
          dayPnlPercent: 0,
          cash: 300.00,
          buyingPower: 300.00,
          marginUsed: 0,
          marginAvailable: 300.00,
          positions: [],
          orders: []
        };
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  }

  // Refresh portfolio from API
  private async refreshPortfolio(userId: string, tradingAccountId: string) {
    try {
      // TODO: Implement when MoomooAPI getPortfolio is available
      // Type conflicts between trading and portfolio service Portfolio types
      // if (moomooAPI.isApiConnected?.()) {
      //   const result = await moomooAPI.getPortfolio();
      //   if (result.success && result.data) {
      //     this.updatePortfolio(result.data);
      //   }
      // DISABLED: Don't simulate portfolio updates - let AI trading handle portfolio changes
      // this.simulatePortfolioUpdate();
      console.log('📊 Portfolio service: Skipping mock updates - AI trading active');
    } catch (error) {
      console.error('Failed to refresh portfolio:', error);
    }
  }

  // Update portfolio data
  private updatePortfolio(newPortfolio: Portfolio) {
    const previousPortfolio = this.portfolio;
    this.portfolio = newPortfolio;
    this.lastUpdateTime = Date.now();

    // Notify subscribers
    this.notifySubscribers();

    // Create update notification
    if (previousPortfolio) {
      const update: PortfolioUpdate = {
        timestamp: this.lastUpdateTime,
        totalValue: newPortfolio.totalValue,
        dayPnl: newPortfolio.dayPnl,
        positions: newPortfolio.positions,
        newOrders: newPortfolio.orders.filter(order => 
          !previousPortfolio.orders.find(prevOrder => prevOrder.id === order.id)
        ),
        filledOrders: newPortfolio.orders.filter(order => 
          order.status === 'FILLED' && 
          previousPortfolio.orders.find(prevOrder => 
            prevOrder.id === order.id && prevOrder.status !== 'FILLED'
          )
        )
      };

      this.notifyUpdateSubscribers(update);
    }

    // Save to database
    this.savePortfolioToDatabase(newPortfolio);
  }

  // Update individual position
  private updatePosition(updatedPosition: Position) {
    if (!this.portfolio) return;

    const positionIndex = this.portfolio.positions.findIndex(
      pos => pos.symbol === updatedPosition.symbol
    );

    if (positionIndex >= 0) {
      this.portfolio.positions[positionIndex] = updatedPosition;
    } else {
      this.portfolio.positions.push(updatedPosition);
    }

    // Recalculate total portfolio value
    this.recalculatePortfolioTotals();
    this.notifySubscribers();
  }

  // Update individual order
  private updateOrder(updatedOrder: Order) {
    if (!this.portfolio) return;

    const orderIndex = this.portfolio.orders.findIndex(
      order => order.id === updatedOrder.id
    );

    if (orderIndex >= 0) {
      this.portfolio.orders[orderIndex] = updatedOrder;
    } else {
      this.portfolio.orders.push(updatedOrder);
    }

    this.notifySubscribers();
  }

  // Update positions based on market data
  private updatePositionsFromMarketData(marketData: any[]) {
    if (!this.portfolio) return;

    let updated = false;

    this.portfolio.positions.forEach(position => {
      const market = marketData.find(m => m.symbol === position.symbol);
      if (market && market.price !== position.currentPrice) {
        position.currentPrice = market.price;
        position.marketValue = position.quantity * market.price;
        position.unrealizedPnl = position.marketValue - (position.quantity * position.avgCost);
        position.unrealizedPnlPercent = (position.unrealizedPnl / (position.quantity * position.avgCost)) * 100;
        position.dayChange = market.change || 0;
        position.dayChangePercent = market.changePercent || 0;
        position.lastUpdate = new Date().toISOString();
        updated = true;
      }
    });

    if (updated) {
      this.recalculatePortfolioTotals();
      this.notifySubscribers();
    }
  }

  // Recalculate portfolio totals
  private recalculatePortfolioTotals() {
    if (!this.portfolio) return;

    const totalPositionValue = this.portfolio.positions.reduce(
      (sum, pos) => sum + pos.marketValue, 0
    );
    const totalUnrealizedPnl = this.portfolio.positions.reduce(
      (sum, pos) => sum + pos.unrealizedPnl, 0
    );
    const totalDayPnl = this.portfolio.positions.reduce(
      (sum, pos) => sum + (pos.quantity * pos.dayChange), 0
    );

    this.portfolio.totalValue = this.portfolio.cash + totalPositionValue;
    this.portfolio.totalPnl = totalUnrealizedPnl;
    this.portfolio.totalPnlPercent = (totalUnrealizedPnl / (this.portfolio.totalValue - totalUnrealizedPnl)) * 100;
    this.portfolio.dayPnl = totalDayPnl;
    this.portfolio.dayPnlPercent = (totalDayPnl / (this.portfolio.totalValue - totalDayPnl)) * 100;
  }

  // Simulate portfolio updates for development
  private simulatePortfolioUpdate() {
    if (!this.portfolio) return;

    // Simulate small random changes
    const changePercent = (Math.random() - 0.5) * 0.02; // ±1% max change
    const newTotalValue = this.portfolio.totalValue * (1 + changePercent);
    const dayPnlChange = newTotalValue - this.portfolio.totalValue;

    this.portfolio.totalValue = newTotalValue;
    this.portfolio.dayPnl += dayPnlChange;
    this.portfolio.dayPnlPercent = (this.portfolio.dayPnl / (this.portfolio.totalValue - this.portfolio.dayPnl)) * 100;

    // Simulate position changes
    this.portfolio.positions.forEach(position => {
      const positionChange = (Math.random() - 0.5) * 0.05; // ±2.5% max change
      position.currentPrice *= (1 + positionChange);
      position.marketValue = position.quantity * position.currentPrice;
      position.unrealizedPnl = position.marketValue - (position.quantity * position.avgCost);
      position.unrealizedPnlPercent = (position.unrealizedPnl / (position.quantity * position.avgCost)) * 100;
      position.lastUpdate = new Date().toISOString();
    });

    this.notifySubscribers();
  }

  // Database operations
  private async getPortfolioFromDatabase(tradingAccountId: string): Promise<Portfolio | null> {
    try {
      // TODO: Implement database retrieval
      console.log('📚 Loading portfolio from database:', tradingAccountId);
      return null; // Return null for now, implement database query
    } catch (error) {
      console.error('Failed to load portfolio from database:', error);
      return null;
    }
  }

  private async savePortfolioToDatabase(portfolio: Portfolio) {
    try {
      // TODO: Implement database save
      console.log('💾 Saving portfolio to database');
      
      // Save positions to database
      // for (const position of portfolio.positions) {
      //   await updatePosition(tradingAccountId, position.symbol, {
      //     quantity: position.quantity,
      //     avgCost: position.avgCost,
      //     marketValue: position.marketValue,
      //     unrealizedPnl: position.unrealizedPnl
      //   });
      // }
    } catch (error) {
      console.error('Failed to save portfolio to database:', error);
    }
  }

  // Subscription management
  public subscribe(callback: (portfolio: Portfolio) => void) {
    this.subscribers.add(callback);
    
    // Send current portfolio immediately
    if (this.portfolio) {
      callback(this.portfolio);
    }

    return () => this.subscribers.delete(callback);
  }

  public subscribeToUpdates(callback: (update: PortfolioUpdate) => void) {
    this.updateSubscribers.add(callback);
    return () => this.updateSubscribers.delete(callback);
  }

  private notifySubscribers() {
    if (this.portfolio) {
      this.subscribers.forEach(callback => {
        try {
          callback(this.portfolio!);
        } catch (error) {
          console.error('Error in portfolio subscriber:', error);
        }
      });
    }
  }

  private notifyUpdateSubscribers(update: PortfolioUpdate) {
    this.updateSubscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in portfolio update subscriber:', error);
      }
    });
  }

  // Public API
  public getCurrentPortfolio(): Portfolio | null {
    return this.portfolio;
  }

  public getLastUpdateTime(): number {
    return this.lastUpdateTime;
  }

  public isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // Position management
  public getPosition(symbol: string): Position | null {
    return this.portfolio?.positions.find(pos => pos.symbol === symbol) || null;
  }

  public getPositions(): Position[] {
    return this.portfolio?.positions || [];
  }

  // Order management
  public getOrders(): Order[] {
    return this.portfolio?.orders || [];
  }

  public getPendingOrders(): Order[] {
    return this.portfolio?.orders.filter(order => 
      ['PENDING', 'SUBMITTED', 'PARTIAL_FILLED'].includes(order.status)
    ) || [];
  }

  // Performance metrics
  public getPerformanceMetrics() {
    if (!this.portfolio) return null;

    return {
      totalReturn: this.portfolio.totalPnl,
      totalReturnPercent: this.portfolio.totalPnlPercent,
      dayReturn: this.portfolio.dayPnl,
      dayReturnPercent: this.portfolio.dayPnlPercent,
      totalValue: this.portfolio.totalValue,
      cash: this.portfolio.cash,
      positionCount: this.portfolio.positions.length,
      activeOrderCount: this.getPendingOrders().length
    };
  }
}

// Export singleton instance
export const portfolioService = new PortfolioService();