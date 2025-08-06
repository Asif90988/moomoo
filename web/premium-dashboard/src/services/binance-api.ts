// Binance API Service - Crypto Trading Integration
// Supports both Testnet (paper trading) and Live Binance.US trading

import crypto from 'crypto';

interface BinanceCredentials {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

interface BinanceOrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: string;
  price?: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  newClientOrderId?: string;
}

interface BinanceOrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  fills: Array<{
    price: string;
    qty: string;
    commission: string;
    commissionAsset: string;
  }>;
}

interface BinanceAccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
}

interface BinanceTickerPrice {
  symbol: string;
  price: string;
}

export class BinanceAPI {
  private credentials: BinanceCredentials;
  private isTestnet: boolean;

  constructor(mode: 'testnet' | 'live' = 'testnet') {
    this.isTestnet = mode === 'testnet';
    
    if (this.isTestnet) {
      this.credentials = {
        apiKey: process.env.BINANCE_TESTNET_API_KEY || '',
        secretKey: process.env.BINANCE_TESTNET_SECRET_KEY || '',
        baseUrl: 'https://testnet.binance.vision'
      };
    } else {
      this.credentials = {
        apiKey: process.env.BINANCE_US_API_KEY || '',
        secretKey: process.env.BINANCE_US_SECRET_KEY || '',
        baseUrl: 'https://api.binance.us'
      };
    }

    if (!this.credentials.apiKey || !this.credentials.secretKey) {
      console.warn(`⚠️ Binance ${mode} credentials not found in environment variables`);
    }
  }

  /**
   * Create HMAC SHA256 signature for Binance API
   */
  private createSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.credentials.secretKey)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Make authenticated request to Binance API
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    params: Record<string, any> = {},
    requiresSignature: boolean = true
  ): Promise<any> {
    const timestamp = Date.now();
    const queryParams = { ...params };

    if (requiresSignature) {
      queryParams.timestamp = timestamp;
    }

    // Create query string
    const queryString = Object.keys(queryParams)
      .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
      .join('&');

    let url = `${this.credentials.baseUrl}${endpoint}`;
    let body: string | undefined;

    if (requiresSignature) {
      const signature = this.createSignature(queryString);
      
      if (method === 'GET' || method === 'DELETE') {
        url += `?${queryString}&signature=${signature}`;
      } else {
        body = `${queryString}&signature=${signature}`;
      }
    } else if (queryString) {
      url += `?${queryString}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (requiresSignature) {
      headers['X-MBX-APIKEY'] = this.credentials.apiKey;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: method === 'POST' ? body : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Binance API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Binance API request failed:`, error);
      throw error;
    }
  }

  /**
   * Test connectivity to Binance API
   */
  async testConnection(): Promise<{ success: boolean; message: string; serverTime?: number }> {
    try {
      console.log(`🔗 Testing ${this.isTestnet ? 'Testnet' : 'Live'} Binance connection...`);
      
      // Test server time (no auth required)
      const timeResponse = await this.makeRequest('/api/v3/time', 'GET', {}, false);
      
      // Test account info (requires auth)
      const accountResponse = await this.getAccountInfo();
      
      return {
        success: true,
        message: `✅ ${this.isTestnet ? 'Testnet' : 'Live'} Binance connection successful`,
        serverTime: timeResponse.serverTime
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ ${this.isTestnet ? 'Testnet' : 'Live'} Binance connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<BinanceAccountInfo> {
    return await this.makeRequest('/api/v3/account');
  }

  /**
   * Get current prices for all symbols
   */
  async getAllPrices(): Promise<BinanceTickerPrice[]> {
    return await this.makeRequest('/api/v3/ticker/price', 'GET', {}, false);
  }

  /**
   * Get price for specific symbol
   */
  async getPrice(symbol: string): Promise<number> {
    const response = await this.makeRequest('/api/v3/ticker/price', 'GET', { symbol }, false);
    return parseFloat(response.price);
  }

  /**
   * Get 24hr ticker statistics
   */
  async get24hrTicker(symbol?: string): Promise<any> {
    const params = symbol ? { symbol } : {};
    return await this.makeRequest('/api/v3/ticker/24hr', 'GET', params, false);
  }

  /**
   * Place a new order
   */
  async placeOrder(orderRequest: BinanceOrderRequest): Promise<BinanceOrderResponse> {
    console.log(`📝 Placing ${this.isTestnet ? 'testnet' : 'live'} order:`, orderRequest);
    
    const params: Record<string, any> = {
      symbol: orderRequest.symbol,
      side: orderRequest.side,
      type: orderRequest.type,
      quantity: orderRequest.quantity,
    };

    if (orderRequest.price) {
      params.price = orderRequest.price;
    }

    if (orderRequest.timeInForce) {
      params.timeInForce = orderRequest.timeInForce;
    }

    if (orderRequest.newClientOrderId) {
      params.newClientOrderId = orderRequest.newClientOrderId;
    }

    const response = await this.makeRequest('/api/v3/order', 'POST', params);
    
    console.log(`✅ Order placed successfully:`, response);
    return response;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(symbol: string, orderId?: number, origClientOrderId?: string): Promise<any> {
    const params: Record<string, any> = { symbol };
    
    if (orderId) {
      params.orderId = orderId;
    }
    
    if (origClientOrderId) {
      params.origClientOrderId = origClientOrderId;
    }

    return await this.makeRequest('/api/v3/order', 'DELETE', params);
  }

  /**
   * Get order status
   */
  async getOrder(symbol: string, orderId?: number, origClientOrderId?: string): Promise<any> {
    const params: Record<string, any> = { symbol };
    
    if (orderId) {
      params.orderId = orderId;
    }
    
    if (origClientOrderId) {
      params.origClientOrderId = origClientOrderId;
    }

    return await this.makeRequest('/api/v3/order', 'GET', params);
  }

  /**
   * Get all open orders
   */
  async getOpenOrders(symbol?: string): Promise<any[]> {
    const params = symbol ? { symbol } : {};
    return await this.makeRequest('/api/v3/openOrders', 'GET', params);
  }

  /**
   * Get all orders (filled, cancelled, etc.)
   */
  async getAllOrders(symbol: string, limit: number = 500): Promise<any[]> {
    return await this.makeRequest('/api/v3/allOrders', 'GET', { symbol, limit });
  }

  /**
   * Get trading fees
   */
  async getTradingFees(): Promise<any> {
    return await this.makeRequest('/sapi/v1/asset/tradeFee');
  }

  /**
   * Get exchange info (symbols, filters, etc.)
   */
  async getExchangeInfo(): Promise<any> {
    return await this.makeRequest('/api/v3/exchangeInfo', 'GET', {}, false);
  }

  /**
   * Get kline/candlestick data
   */
  async getKlines(symbol: string, interval: string, limit: number = 500): Promise<any[]> {
    return await this.makeRequest('/api/v3/klines', 'GET', { symbol, interval, limit }, false);
  }

  /**
   * Get order book
   */
  async getOrderBook(symbol: string, limit: number = 100): Promise<any> {
    return await this.makeRequest('/api/v3/depth', 'GET', { symbol, limit }, false);
  }

  /**
   * Get portfolio summary (formatted for our dashboard)
   */
  async getPortfolioSummary(): Promise<{
    totalValue: number;
    availableBalance: number;
    positions: Array<{
      symbol: string;
      quantity: number;
      value: number;
      unrealizedPnl: number;
    }>;
    dayChange: number;
    dayChangePercent: number;
  }> {
    try {
      const accountInfo = await this.getAccountInfo();
      const prices = await this.getAllPrices();
      
      // Create price lookup
      const priceMap = new Map<string, number>();
      prices.forEach(ticker => {
        priceMap.set(ticker.symbol, parseFloat(ticker.price));
      });

      let totalValue = 0;
      let availableBalance = 0;
      const positions: Array<{
        symbol: string;
        quantity: number;
        value: number;
        unrealizedPnl: number;
      }> = [];

      // Process balances
      for (const balance of accountInfo.balances) {
        const free = parseFloat(balance.free);
        const locked = parseFloat(balance.locked);
        const total = free + locked;

        if (total > 0) {
          if (balance.asset === 'USDT' || balance.asset === 'USD') {
            // Base currency
            availableBalance += free;
            totalValue += total;
          } else {
            // Other assets - convert to USDT/USD value
            const symbol = `${balance.asset}USDT`;
            const price = priceMap.get(symbol) || 0;
            const value = total * price;
            
            if (value > 1) { // Only include positions worth more than $1
              positions.push({
                symbol: balance.asset,
                quantity: total,
                value,
                unrealizedPnl: 0 // Would need historical data to calculate
              });
              totalValue += value;
            }
          }
        }
      }

      return {
        totalValue,
        availableBalance,
        positions,
        dayChange: 0, // Would need historical data
        dayChangePercent: 0 // Would need historical data
      };
    } catch (error) {
      console.error('❌ Error getting portfolio summary:', error);
      throw error;
    }
  }

  /**
   * Place market buy order
   */
  async marketBuy(symbol: string, quantity: string, clientOrderId?: string): Promise<BinanceOrderResponse> {
    return await this.placeOrder({
      symbol,
      side: 'BUY',
      type: 'MARKET',
      quantity,
      newClientOrderId: clientOrderId
    });
  }

  /**
   * Place market sell order
   */
  async marketSell(symbol: string, quantity: string, clientOrderId?: string): Promise<BinanceOrderResponse> {
    return await this.placeOrder({
      symbol,
      side: 'SELL',
      type: 'MARKET',
      quantity,
      newClientOrderId: clientOrderId
    });
  }

  /**
   * Place limit buy order
   */
  async limitBuy(symbol: string, quantity: string, price: string, clientOrderId?: string): Promise<BinanceOrderResponse> {
    return await this.placeOrder({
      symbol,
      side: 'BUY',
      type: 'LIMIT',
      quantity,
      price,
      timeInForce: 'GTC',
      newClientOrderId: clientOrderId
    });
  }

  /**
   * Place limit sell order
   */
  async limitSell(symbol: string, quantity: string, price: string, clientOrderId?: string): Promise<BinanceOrderResponse> {
    return await this.placeOrder({
      symbol,
      side: 'SELL',
      type: 'LIMIT',
      quantity,
      price,
      timeInForce: 'GTC',
      newClientOrderId: clientOrderId
    });
  }

  /**
   * Get server time
   */
  async getServerTime(): Promise<number> {
    const response = await this.makeRequest('/api/v3/time', 'GET', {}, false);
    return response.serverTime;
  }

  /**
   * Check if API credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.credentials.apiKey && this.credentials.secretKey);
  }

  /**
   * Get mode (testnet or live)
   */
  getMode(): string {
    return this.isTestnet ? 'testnet' : 'live';
  }
}

// Export singleton instances
export const binanceTestnetAPI = new BinanceAPI('testnet');
export const binanceUSAPI = new BinanceAPI('live');

// Export default as testnet for development
export default binanceTestnetAPI;
