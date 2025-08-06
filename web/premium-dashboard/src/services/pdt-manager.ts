// Pattern Day Trading (PDT) Rule Protection
// Prevents PDT violations for accounts under $25,000

interface DayTrade {
  id: string;
  symbol: string;
  buyTime: Date;
  sellTime: Date;
  date: string; // YYYY-MM-DD
  buyOrderId?: string;
  sellOrderId?: string;
}

interface PDTConfig {
  enabled: boolean;
  accountEquityThreshold: number; // $25,000
  maxDayTradesPerPeriod: number; // 3 (safe limit)
  lookbackDays: number; // 5 business days
  warningThreshold: number; // 2 (warn when approaching limit)
}

class PDTManager {
  private static instance: PDTManager;
  private dayTrades: DayTrade[] = [];
  private config: PDTConfig;

  private constructor() {
    this.config = {
      enabled: process.env.NEXT_PUBLIC_PDT_PROTECTION_ENABLED !== 'false',
      accountEquityThreshold: 25000,
      maxDayTradesPerPeriod: 3, // Conservative limit
      lookbackDays: 5,
      warningThreshold: 2
    };

    console.log(`🛡️ [PDT] Protection ${this.config.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (this.config.enabled) {
      console.log(`🛡️ [PDT] Max day trades: ${this.config.maxDayTradesPerPeriod} per ${this.config.lookbackDays} business days`);
    }
  }

  public static getInstance(): PDTManager {
    if (!PDTManager.instance) {
      PDTManager.instance = new PDTManager();
    }
    return PDTManager.instance;
  }

  // Check if account is exempt from PDT rule (>= $25,000)
  public isAccountPDTExempt(accountEquity: number): boolean {
    return accountEquity >= this.config.accountEquityThreshold;
  }

  // Check if PDT protection is enabled
  public isPDTProtectionEnabled(): boolean {
    return this.config.enabled;
  }

  // Disable PDT protection (for accounts >= $25K)
  public disablePDTProtection(): void {
    this.config.enabled = false;
    console.log('🔓 [PDT] Protection DISABLED - Account qualifies for day trading');
  }

  // Enable PDT protection
  public enablePDTProtection(): void {
    this.config.enabled = true;
    console.log('🛡️ [PDT] Protection ENABLED - Account under $25,000');
  }

  // Get business days between two dates
  private getBusinessDaysBetween(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let businessDays = 0;
    
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Monday = 1, Friday = 5 (exclude weekends)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        businessDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return businessDays;
  }

  // Get day trades in the last N business days
  private getDayTradesInPeriod(days: number = this.config.lookbackDays): DayTrade[] {
    const now = new Date();
    const periodStart = new Date();
    periodStart.setDate(now.getDate() - (days + 2)); // Add buffer for weekends
    
    return this.dayTrades.filter(trade => {
      const tradeDate = new Date(trade.sellTime);
      const businessDaysAgo = this.getBusinessDaysBetween(tradeDate, now);
      return businessDaysAgo <= days;
    });
  }

  // Count current day trades in 5-business-day window
  public getCurrentDayTradeCount(): number {
    const recentTrades = this.getDayTradesInPeriod();
    console.log(`🛡️ [PDT] Current day trades in last 5 business days: ${recentTrades.length}`);
    return recentTrades.length;
  }

  // Check if we can make another day trade
  public canMakeDayTrade(accountEquity?: number): { 
    allowed: boolean; 
    reason?: string; 
    count: number; 
    limit: number;
    warning?: string;
  } {
    // If account is PDT-exempt, allow all day trades
    if (accountEquity && this.isAccountPDTExempt(accountEquity)) {
      return {
        allowed: true,
        count: 0,
        limit: Infinity,
        warning: '💰 Account is PDT-exempt (>= $25,000)'
      };
    }

    // If PDT protection is disabled, allow (but warn if risky)
    if (!this.config.enabled) {
      const currentCount = this.getCurrentDayTradeCount();
      return {
        allowed: true,
        count: currentCount,
        limit: Infinity,
        warning: currentCount >= 3 ? '⚠️ PDT protection disabled - Risk of PDT violation!' : undefined
      };
    }

    const currentCount = this.getCurrentDayTradeCount();
    const limit = this.config.maxDayTradesPerPeriod;

    if (currentCount >= limit) {
      return {
        allowed: false,
        reason: `PDT Protection: Already used ${currentCount}/${limit} day trades in 5-business-day period`,
        count: currentCount,
        limit: limit
      };
    }

    const warning = currentCount >= this.config.warningThreshold 
      ? `⚠️ Approaching PDT limit: ${currentCount}/${limit} day trades used`
      : undefined;

    return {
      allowed: true,
      count: currentCount,
      limit: limit,
      warning: warning
    };
  }

  // Check if a sell order would create a day trade
  public wouldCreateDayTrade(symbol: string, accountEquity?: number): {
    isDayTrade: boolean;
    buyTime?: Date;
    hoursHeld?: number;
    pdtCheck: { allowed: boolean; count: number; limit: number; warning?: string; reason?: string };
  } {
    const today = new Date().toISOString().split('T')[0];
    
    // Look for buy orders of this symbol today
    const todayBuyOrders = this.getOpenPositions().filter(position => 
      position.symbol === symbol && 
      position.buyDate === today
    );

    if (todayBuyOrders.length === 0) {
      return {
        isDayTrade: false,
        pdtCheck: { allowed: true, count: 0, limit: 0 }
      };
    }

    const buyTime = new Date(todayBuyOrders[0].buyTime);
    const now = new Date();
    const hoursHeld = (now.getTime() - buyTime.getTime()) / (1000 * 60 * 60);

    return {
      isDayTrade: true,
      buyTime,
      hoursHeld,
      pdtCheck: this.canMakeDayTrade(accountEquity)
    };
  }

  // Record a buy order (potential start of day trade)
  public recordBuyOrder(orderId: string, symbol: string): void {
    const now = new Date();
    
    // Store in temporary positions (not day trades yet)
    this.addOpenPosition({
      orderId,
      symbol,
      buyTime: now,
      buyDate: now.toISOString().split('T')[0]
    });

    console.log(`🛡️ [PDT] Recorded BUY: ${symbol} at ${now.toTimeString()}`);
  }

  // Record a sell order (completes day trade if same day)
  public recordSellOrder(orderId: string, symbol: string): void {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Find matching buy order from today
    const buyPosition = this.getOpenPositions().find(pos => 
      pos.symbol === symbol && pos.buyDate === today
    );

    if (buyPosition) {
      // This is a day trade!
      const dayTrade: DayTrade = {
        id: `${buyPosition.orderId}_${orderId}`,
        symbol,
        buyTime: buyPosition.buyTime,
        sellTime: now,
        date: today,
        buyOrderId: buyPosition.orderId,
        sellOrderId: orderId
      };

      this.dayTrades.push(dayTrade);
      this.removeOpenPosition(buyPosition.orderId);

      const hoursHeld = (now.getTime() - buyPosition.buyTime.getTime()) / (1000 * 60 * 60);
      
      console.log(`🚨 [PDT] DAY TRADE EXECUTED: ${symbol}`);
      console.log(`🚨 [PDT] Held for ${hoursHeld.toFixed(1)} hours`);
      console.log(`🚨 [PDT] Total day trades: ${this.getCurrentDayTradeCount()}`);

      // Clean old day trades (older than lookback period)
      this.cleanOldDayTrades();
    } else {
      console.log(`🛡️ [PDT] Regular SELL: ${symbol} (no same-day buy)`);
    }
  }

  // Temporary storage for open positions (potential day trades)
  private openPositions: Array<{
    orderId: string;
    symbol: string;
    buyTime: Date;
    buyDate: string;
  }> = [];

  private addOpenPosition(position: { orderId: string; symbol: string; buyTime: Date; buyDate: string }): void {
    this.openPositions.push(position);
  }

  private removeOpenPosition(orderId: string): void {
    this.openPositions = this.openPositions.filter(pos => pos.orderId !== orderId);
  }

  private getOpenPositions() {
    return this.openPositions;
  }

  // Clean up old day trades outside the lookback period
  private cleanOldDayTrades(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (this.config.lookbackDays + 5)); // Extra buffer
    
    const initialCount = this.dayTrades.length;
    this.dayTrades = this.dayTrades.filter(trade => 
      new Date(trade.sellTime) > cutoffDate
    );
    
    if (this.dayTrades.length < initialCount) {
      console.log(`🛡️ [PDT] Cleaned ${initialCount - this.dayTrades.length} old day trades`);
    }
  }

  // Get PDT status report
  public getPDTStatus(accountEquity?: number): {
    enabled: boolean;
    accountPDTExempt: boolean;
    currentDayTrades: number;
    maxDayTrades: number;
    remainingDayTrades: number;
    warningLevel: 'safe' | 'warning' | 'danger';
    nextResetDate: string;
    recentDayTrades: Array<{
      symbol: string;
      date: string;
      hoursHeld: number;
    }>;
  } {
    const currentCount = this.getCurrentDayTradeCount();
    const isExempt = accountEquity ? this.isAccountPDTExempt(accountEquity) : false;
    const maxTrades = isExempt ? Infinity : this.config.maxDayTradesPerPeriod;
    const remaining = isExempt ? Infinity : Math.max(0, maxTrades - currentCount);
    
    let warningLevel: 'safe' | 'warning' | 'danger' = 'safe';
    if (!isExempt && this.config.enabled) {
      if (currentCount >= maxTrades) warningLevel = 'danger';
      else if (currentCount >= this.config.warningThreshold) warningLevel = 'warning';
    }

    // Calculate next reset (5 business days from oldest day trade)
    const recentTrades = this.getDayTradesInPeriod();
    const nextReset = recentTrades.length > 0 
      ? new Date(recentTrades[0].sellTime) 
      : new Date();
    nextReset.setDate(nextReset.getDate() + this.config.lookbackDays + 1);

    return {
      enabled: this.config.enabled,
      accountPDTExempt: isExempt,
      currentDayTrades: currentCount,
      maxDayTrades: maxTrades,
      remainingDayTrades: remaining,
      warningLevel,
      nextResetDate: nextReset.toISOString().split('T')[0],
      recentDayTrades: recentTrades.map(trade => ({
        symbol: trade.symbol,
        date: trade.date,
        hoursHeld: (trade.sellTime.getTime() - trade.buyTime.getTime()) / (1000 * 60 * 60)
      }))
    };
  }

  // Force reset for testing or emergencies
  public resetDayTradeCount(): void {
    this.dayTrades = [];
    this.openPositions = [];
    console.log('🔄 [PDT] Day trade count manually reset');
  }
}

// Export singleton
export const pdtManager = PDTManager.getInstance();
export default pdtManager;

// Export types
export type { DayTrade, PDTConfig };