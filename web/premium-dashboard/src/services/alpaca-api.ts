// Alpaca Trading API Integration
// Provides real-time market data and paper trading capabilities

interface AlpacaConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  dataUrl: string;
  paperTrading: boolean;
}

interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
  trade_suspended_by_user: boolean;
  multiplier: string;
  shorting_enabled: boolean;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  sma: string;
  daytrade_count: number;
}

interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  qty: string;
  side: 'long' | 'short';
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

interface AlpacaOrder {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at?: string;
  expired_at?: string;
  canceled_at?: string;
  failed_at?: string;
  replaced_at?: string;
  replaced_by?: string;
  replaces?: string;
  asset_id: string;
  symbol: string;
  asset_class: string;
  notional?: string;
  qty?: string;
  filled_qty: string;
  filled_avg_price?: string;
  order_class: string;
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  side: 'buy' | 'sell';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: string;
  stop_price?: string;
  status: 'new' | 'partially_filled' | 'filled' | 'done_for_day' | 'canceled' | 'expired' | 'replaced' | 'pending_cancel' | 'pending_replace' | 'accepted' | 'pending_new' | 'accepted_for_bidding' | 'stopped' | 'rejected' | 'suspended' | 'calculated';
  extended_hours: boolean;
  legs?: any[];
  trail_percent?: string;
  trail_price?: string;
  hwm?: string;
}

interface AlpacaQuote {
  symbol: string;
  bid: number;
  ask: number;
  bidsize: number;
  asksize: number;
  timestamp: string;
}

interface AlpacaTrade {
  symbol: string;
  price: number;
  size: number;
  timestamp: string;
  conditions: string[];
  exchange: string;
}

interface AlpacaBar {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trade_count: number;
  vwap: number;
}

interface AlpacaAsset {
  id: string;
  class: string;
  exchange: string;
  symbol: string;
  name: string;
  status: string;
  tradable: boolean;
  marginable: boolean;
  shortable: boolean;
  easy_to_borrow: boolean;
  fractionable: boolean;
  min_order_size?: string;
  min_trade_increment?: string;
  price_increment?: string;
}

class AlpacaAPI {
  private config: AlpacaConfig;
  private headers: Record<string, string>;
  private recentRequestIds: Array<{ id: string; endpoint: string; timestamp: Date }> = [];

  constructor() {
    // 🚨 LIVE TRADING MODE - Check for live trading configuration
    const isLiveMode = process.env.NEXT_PUBLIC_ALPACA_PAPER_TRADING === 'false' || 
                      process.env.ALPACA_LIVE_MODE === 'true' || 
                      process.env.NEXT_PUBLIC_LIVE_TRADING_ENABLED === 'true';
                      
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_ALPACA_API_KEY || process.env.ALPACA_API_KEY || '',
      secretKey: process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY || process.env.ALPACA_SECRET_KEY || '',
      baseUrl: isLiveMode 
        ? 'https://api.alpaca.markets'  // 🔴 LIVE TRADING ENDPOINT
        : 'https://paper-api.alpaca.markets',
      dataUrl: 'https://data.alpaca.markets',
      paperTrading: !isLiveMode  // 🚨 LIVE TRADING = NOT PAPER TRADING
    };

    this.headers = {
      'APCA-API-KEY-ID': this.config.apiKey,
      'APCA-API-SECRET-KEY': this.config.secretKey,
      'Content-Type': 'application/json'
    };

    console.log(`🦙 [ALPACA] 🚨 Initializing ${this.config.paperTrading ? 'PAPER' : '🔴 LIVE'} trading mode`);
    console.log(`🦙 [ALPACA] Base URL: ${this.config.baseUrl}`);
    console.log(`🦙 [ALPACA] API Key: ${this.config.apiKey.substring(0, 8)}...`);
    
    if (!this.config.paperTrading) {
      console.log('🚨 ⚠️  LIVE TRADING ENABLED - REAL MONEY AT RISK ⚠️  🚨');
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

      // Capture Request ID for debugging and support
      const requestId = response.headers.get('X-Request-ID');
      if (requestId) {
        console.log(`🦙 [ALPACA] Request ID: ${requestId}`);
        // Store recent request IDs for support purposes
        this.storeRequestId(requestId, endpoint);
      }

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Alpaca API Error: ${response.status} - ${errorText}`;
        if (requestId) {
          console.error(`🦙 [ALPACA] Error Request ID: ${requestId}`);
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`🦙 [ALPACA] API Error:`, error);
      throw error;
    }
  }

  private async makeDataRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.dataUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

      // Capture Request ID for debugging and support
      const requestId = response.headers.get('X-Request-ID');
      if (requestId) {
        console.log(`🦙 [ALPACA] Data Request ID: ${requestId}`);
        this.storeRequestId(requestId, `DATA:${endpoint}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Alpaca Data API Error: ${response.status} - ${errorText}`;
        if (requestId) {
          console.error(`🦙 [ALPACA] Data Error Request ID: ${requestId}`);
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`🦙 [ALPACA] Data API Error:`, error);
      throw error;
    }
  }

  // Account Management
  async getAccount(): Promise<AlpacaAccount> {
    console.log('🦙 [ALPACA] Fetching account information...');
    return await this.makeRequest<AlpacaAccount>('/v2/account');
  }

  async getPositions(): Promise<AlpacaPosition[]> {
    console.log('🦙 [ALPACA] Fetching positions...');
    return await this.makeRequest<AlpacaPosition[]>('/v2/positions');
  }

  async getPosition(symbol: string): Promise<AlpacaPosition> {
    console.log(`🦙 [ALPACA] Fetching position for ${symbol}...`);
    return await this.makeRequest<AlpacaPosition>(`/v2/positions/${symbol}`);
  }

  // Order Management
  async getOrders(status?: string, limit?: number): Promise<AlpacaOrder[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    console.log(`🦙 [ALPACA] Fetching orders${query}...`);
    
    return await this.makeRequest<AlpacaOrder[]>(`/v2/orders${query}`);
  }

  async getOrder(orderId: string): Promise<AlpacaOrder> {
    console.log(`🦙 [ALPACA] Fetching order ${orderId}...`);
    return await this.makeRequest<AlpacaOrder>(`/v2/orders/${orderId}`);
  }

  async placeOrder(orderData: {
    symbol: string;
    qty?: number;
    notional?: number;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
    time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
    limit_price?: number;
    stop_price?: number;
    extended_hours?: boolean;
    client_order_id?: string;
    order_class?: 'simple' | 'bracket' | 'oco' | 'oto';
    take_profit?: { limit_price: number };
    stop_loss?: { stop_price: number; limit_price?: number };
    trail_percent?: number;
    trail_price?: number;
  }): Promise<AlpacaOrder> {
    console.log(`🦙 [ALPACA] ${this.config.paperTrading ? 'PAPER' : 'LIVE'} TRADING: Placing ${orderData.side} order for ${orderData.symbol}`);
    console.log(`🦙 [ALPACA] Order details:`, orderData);
    
    return await this.makeRequest<AlpacaOrder>('/v2/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async cancelOrder(orderId: string): Promise<void> {
    console.log(`🦙 [ALPACA] Canceling order ${orderId}...`);
    await this.makeRequest(`/v2/orders/${orderId}`, {
      method: 'DELETE'
    });
  }

  async cancelAllOrders(): Promise<AlpacaOrder[]> {
    console.log('🦙 [ALPACA] Canceling all orders...');
    return await this.makeRequest<AlpacaOrder[]>('/v2/orders', {
      method: 'DELETE'
    });
  }

  // Market Data
  async getLatestQuote(symbol: string): Promise<AlpacaQuote> {
    console.log(`🦙 [ALPACA] Fetching latest quote for ${symbol}...`);
    const response = await this.makeDataRequest<{ quotes: Record<string, AlpacaQuote> }>(`/v2/stocks/${symbol}/quotes/latest`);
    return response.quotes[symbol];
  }

  async getLatestTrade(symbol: string): Promise<AlpacaTrade> {
    console.log(`🦙 [ALPACA] Fetching latest trade for ${symbol}...`);
    const response = await this.makeDataRequest<{ trades: Record<string, AlpacaTrade> }>(`/v2/stocks/${symbol}/trades/latest`);
    return response.trades[symbol];
  }

  async getBars(symbol: string, timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day', start?: string, end?: string, limit?: number): Promise<AlpacaBar[]> {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (limit) params.append('limit', limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    console.log(`🦙 [ALPACA] Fetching ${timeframe} bars for ${symbol}${query}...`);
    
    const response = await this.makeDataRequest<{ bars: Record<string, AlpacaBar[]> }>(`/v2/stocks/${symbol}/bars${query}`);
    return response.bars[symbol] || [];
  }

  // Portfolio Analytics
  async getPortfolioHistory(period?: string, timeframe?: string, extended_hours?: boolean): Promise<any> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (timeframe) params.append('timeframe', timeframe);
    if (extended_hours !== undefined) params.append('extended_hours', extended_hours.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    console.log(`🦙 [ALPACA] Fetching portfolio history${query}...`);
    
    return await this.makeRequest(`/v2/account/portfolio/history${query}`);
  }

  // Watchlist Management
  async getWatchlists(): Promise<any[]> {
    console.log('🦙 [ALPACA] Fetching watchlists...');
    return await this.makeRequest<any[]>('/v2/watchlists');
  }

  async createWatchlist(name: string, symbols?: string[]): Promise<any> {
    console.log(`🦙 [ALPACA] Creating watchlist: ${name}`);
    return await this.makeRequest('/v2/watchlists', {
      method: 'POST',
      body: JSON.stringify({ name, symbols })
    });
  }

  // Connection Test
  async testConnection(): Promise<{ success: boolean; message: string; account?: AlpacaAccount }> {
    try {
      console.log('🦙 [ALPACA] Testing connection...');
      const account = await this.getAccount();
      
      return {
        success: true,
        message: `Connected to Alpaca ${this.config.paperTrading ? 'Paper Trading' : 'Live Trading'}`,
        account
      };
    } catch (error) {
      console.error('🦙 [ALPACA] Connection test failed:', error);
      return {
        success: false,
        message: `Alpaca connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Portfolio Analytics - Enhanced with daily P&L calculation
  async getAccountAnalytics(): Promise<{
    account: AlpacaAccount;
    dailyPnL: number;
    dailyPnLPercent: number;
    tradingBlocked: boolean;
    buyingPowerUsed: number;
    buyingPowerPercent: number;
  }> {
    console.log('🦙 [ALPACA] Fetching account analytics...');
    const account = await this.getAccount();
    
    // Calculate daily P&L
    const currentEquity = parseFloat(account.equity);
    const lastEquity = parseFloat(account.last_equity);
    const dailyPnL = currentEquity - lastEquity;
    const dailyPnLPercent = lastEquity > 0 ? (dailyPnL / lastEquity) * 100 : 0;
    
    // Calculate buying power usage
    const totalBuyingPower = parseFloat(account.buying_power);
    const cash = parseFloat(account.cash);
    const buyingPowerUsed = totalBuyingPower - cash;
    const buyingPowerPercent = totalBuyingPower > 0 ? (buyingPowerUsed / totalBuyingPower) * 100 : 0;
    
    return {
      account,
      dailyPnL,
      dailyPnLPercent,
      tradingBlocked: account.trading_blocked,
      buyingPowerUsed,
      buyingPowerPercent
    };
  }

  // Check account restrictions and status
  async checkAccountStatus(): Promise<{
    canTrade: boolean;
    restrictions: string[];
    warnings: string[];
    pdtStatus: 'safe' | 'warning' | 'restricted';
    dayTradeCount: number;
  }> {
    console.log('🦙 [ALPACA] Checking account status...');
    const account = await this.getAccount();
    
    const restrictions: string[] = [];
    const warnings: string[] = [];
    
    // Check trading restrictions
    if (account.trading_blocked) {
      restrictions.push('Trading is currently blocked');
    }
    
    if (account.transfers_blocked) {
      restrictions.push('Transfers are currently blocked');
    }
    
    if (account.account_blocked) {
      restrictions.push('Account is currently blocked');
    }
    
    if (account.trade_suspended_by_user) {
      restrictions.push('Trading suspended by user');
    }
    
    // Check PDT status
    let pdtStatus: 'safe' | 'warning' | 'restricted' = 'safe';
    const equity = parseFloat(account.equity);
    const dayTradeCount = account.daytrade_count;
    
    if (account.pattern_day_trader) {
      if (equity < 25000) {
        pdtStatus = 'restricted';
        restrictions.push('Pattern Day Trader with insufficient equity ($25,000 minimum required)');
      } else {
        pdtStatus = 'warning';
        warnings.push('Pattern Day Trader status - monitor day trade count');
      }
    } else if (dayTradeCount >= 3) {
      pdtStatus = 'warning';
      warnings.push(`Day trade count: ${dayTradeCount}/3 - approaching PDT limit`);
    }
    
    // Check buying power
    const buyingPower = parseFloat(account.buying_power);
    if (buyingPower < 1000) {
      warnings.push('Low buying power - consider depositing funds');
    }
    
    return {
      canTrade: restrictions.length === 0,
      restrictions,
      warnings,
      pdtStatus,
      dayTradeCount
    };
  }

  // Utility Methods
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.secretKey);
  }

  isPaperTrading(): boolean {
    return this.config.paperTrading;
  }

  getConfig(): AlpacaConfig {
    return { ...this.config, secretKey: '***HIDDEN***' };
  }

  // Request ID management for debugging and support
  private storeRequestId(requestId: string, endpoint: string): void {
    this.recentRequestIds.push({
      id: requestId,
      endpoint: endpoint,
      timestamp: new Date()
    });

    // Keep only the last 50 request IDs
    if (this.recentRequestIds.length > 50) {
      this.recentRequestIds = this.recentRequestIds.slice(-50);
    }
  }

  getRecentRequestIds(): Array<{ id: string; endpoint: string; timestamp: Date }> {
    return [...this.recentRequestIds];
  }

  getLastRequestId(): string | null {
    return this.recentRequestIds.length > 0 
      ? this.recentRequestIds[this.recentRequestIds.length - 1].id 
      : null;
  }

  // Asset Management - Get tradable assets
  async getAssets(status?: 'active' | 'inactive', asset_class?: 'us_equity' | 'crypto'): Promise<AlpacaAsset[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (asset_class) params.append('asset_class', asset_class);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    console.log(`🦙 [ALPACA] Fetching assets${query}...`);
    
    return await this.makeRequest<AlpacaAsset[]>(`/v2/assets${query}`);
  }

  async getAsset(symbol: string): Promise<AlpacaAsset> {
    console.log(`🦙 [ALPACA] Fetching asset info for ${symbol}...`);
    return await this.makeRequest<AlpacaAsset>(`/v2/assets/${symbol}`);
  }

  // Check if asset is tradable before placing orders
  async isAssetTradable(symbol: string): Promise<{
    tradable: boolean;
    asset: AlpacaAsset;
    reasons: string[];
  }> {
    console.log(`🦙 [ALPACA] Checking if ${symbol} is tradable...`);
    
    try {
      const asset = await this.getAsset(symbol);
      const reasons: string[] = [];
      
      if (!asset.tradable) {
        reasons.push('Asset is not tradable');
      }
      
      if (asset.status !== 'active') {
        reasons.push(`Asset status is ${asset.status}`);
      }
      
      if (asset.class !== 'us_equity') {
        reasons.push(`Asset class ${asset.class} may have restrictions`);
      }
      
      return {
        tradable: asset.tradable && asset.status === 'active',
        asset,
        reasons
      };
    } catch (error) {
      console.error(`🦙 [ALPACA] Error checking asset ${symbol}:`, error);
      return {
        tradable: false,
        asset: {} as AlpacaAsset,
        reasons: [`Error fetching asset: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  // Get popular/recommended assets for trading
  async getPopularAssets(): Promise<AlpacaAsset[]> {
    console.log('🦙 [ALPACA] Fetching popular tradable assets...');
    
    // Get active US equities
    const assets = await this.getAssets('active', 'us_equity');
    
    // Filter for popular, highly liquid stocks
    const popularSymbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
      'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'ARKK', 'TQQQ', 'SQQQ'
    ];
    
    return assets.filter(asset => 
      popularSymbols.includes(asset.symbol) && 
      asset.tradable && 
      asset.status === 'active'
    );
  }

  // Validate multiple symbols before batch trading
  async validateSymbols(symbols: string[]): Promise<{
    valid: string[];
    invalid: Array<{ symbol: string; reason: string }>;
  }> {
    console.log(`🦙 [ALPACA] Validating ${symbols.length} symbols...`);
    
    const valid: string[] = [];
    const invalid: Array<{ symbol: string; reason: string }> = [];
    
    for (const symbol of symbols) {
      try {
        const check = await this.isAssetTradable(symbol);
        if (check.tradable) {
          valid.push(symbol);
        } else {
          invalid.push({
            symbol,
            reason: check.reasons.join(', ')
          });
        }
      } catch (error) {
        invalid.push({
          symbol,
          reason: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    console.log(`🦙 [ALPACA] Validation complete: ${valid.length} valid, ${invalid.length} invalid`);
    return { valid, invalid };
  }
}

// Export singleton instance
export const alpacaAPI = new AlpacaAPI();
export default alpacaAPI;

// Export types
export type {
  AlpacaConfig,
  AlpacaAccount,
  AlpacaPosition,
  AlpacaOrder,
  AlpacaQuote,
  AlpacaTrade,
  AlpacaBar,
  AlpacaAsset
};
