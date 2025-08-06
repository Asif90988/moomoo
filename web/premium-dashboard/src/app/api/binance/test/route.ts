// Binance Connection Test API
// Tests connectivity to Binance Testnet and validates API credentials

import { NextRequest, NextResponse } from 'next/server';
import { binanceTestnetAPI } from '@/services/binance-api';

export async function GET() {
  console.log('🧪 Testing Binance Testnet connection...');
  
  try {
    // Test the connection
    const connectionResult = await binanceTestnetAPI.testConnection();
    
    if (connectionResult.success) {
      // Get additional info if connection successful
      const accountInfo = await binanceTestnetAPI.getAccountInfo();
      const serverTime = await binanceTestnetAPI.getServerTime();
      
      // Get some sample prices
      const prices = await binanceTestnetAPI.getAllPrices();
      const btcPrice = prices.find(p => p.symbol === 'BTCUSDT');
      const ethPrice = prices.find(p => p.symbol === 'ETHUSDT');
      
      return NextResponse.json({
        success: true,
        message: '✅ Binance Testnet connection successful!',
        data: {
          mode: binanceTestnetAPI.getMode(),
          serverTime: new Date(serverTime).toISOString(),
          serverTimestamp: serverTime,
          account: {
            canTrade: accountInfo.canTrade,
            canWithdraw: accountInfo.canWithdraw,
            canDeposit: accountInfo.canDeposit,
            accountType: accountInfo.accountType,
            balanceCount: accountInfo.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0).length
          },
          samplePrices: {
            BTCUSDT: btcPrice ? parseFloat(btcPrice.price) : null,
            ETHUSDT: ethPrice ? parseFloat(ethPrice.price) : null,
            totalSymbols: prices.length
          },
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: connectionResult.message,
        error: 'Connection test failed',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Binance test connection error:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ Failed to connect to Binance Testnet',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        configured: binanceTestnetAPI.isConfigured(),
        mode: binanceTestnetAPI.getMode()
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST endpoint for more detailed testing
export async function POST(request: NextRequest) {
  console.log('🧪 Running comprehensive Binance Testnet tests...');
  
  try {
    const body = await request.json();
    const { testType = 'basic' } = body;
    
    const results: any = {
      success: true,
      tests: {},
      timestamp: new Date().toISOString()
    };
    
    // Basic connection test
    console.log('1️⃣ Testing basic connection...');
    const connectionTest = await binanceTestnetAPI.testConnection();
    results.tests.connection = connectionTest;
    
    if (!connectionTest.success) {
      results.success = false;
      return NextResponse.json(results, { status: 500 });
    }
    
    // Account info test
    console.log('2️⃣ Testing account info...');
    try {
      const accountInfo = await binanceTestnetAPI.getAccountInfo();
      results.tests.account = {
        success: true,
        canTrade: accountInfo.canTrade,
        balances: accountInfo.balances.length,
        nonZeroBalances: accountInfo.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0).length
      };
    } catch (error) {
      results.tests.account = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.success = false;
    }
    
    // Market data test
    console.log('3️⃣ Testing market data...');
    try {
      const prices = await binanceTestnetAPI.getAllPrices();
      const btc24hr = await binanceTestnetAPI.get24hrTicker('BTCUSDT');
      
      results.tests.marketData = {
        success: true,
        totalSymbols: prices.length,
        btc24hrChange: btc24hr.priceChangePercent,
        samplePrices: prices.slice(0, 5).map(p => ({
          symbol: p.symbol,
          price: parseFloat(p.price)
        }))
      };
    } catch (error) {
      results.tests.marketData = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.success = false;
    }
    
    // Extended tests
    if (testType === 'extended') {
      console.log('4️⃣ Testing exchange info...');
      try {
        const exchangeInfo = await binanceTestnetAPI.getExchangeInfo();
        results.tests.exchangeInfo = {
          success: true,
          symbolCount: exchangeInfo.symbols.length,
          timezone: exchangeInfo.timezone,
          serverTime: exchangeInfo.serverTime
        };
      } catch (error) {
        results.tests.exchangeInfo = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
      
      console.log('5️⃣ Testing order book...');
      try {
        const orderBook = await binanceTestnetAPI.getOrderBook('BTCUSDT', 10);
        results.tests.orderBook = {
          success: true,
          bids: orderBook.bids.length,
          asks: orderBook.asks.length,
          spread: parseFloat(orderBook.asks[0][0]) - parseFloat(orderBook.bids[0][0])
        };
      } catch (error) {
        results.tests.orderBook = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    const statusCode = results.success ? 200 : 500;
    return NextResponse.json(results, { status: statusCode });
    
  } catch (error) {
    console.error('❌ Comprehensive test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Comprehensive test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
