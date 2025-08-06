#!/usr/bin/env node

// Binance Testnet Connection Test Script
// Tests the Binance API integration and validates credentials

const https = require('https');
const crypto = require('crypto');

// Use your API credentials directly
const API_KEY = 'GFPqnwUHEJJGCUTkZAZx0IFUkPnaf8YFNBEuRVTbtubgoMh4HJU1SzApXPvy0l0u';
const SECRET_KEY = 'xCRwe1iuorw9jv29MTE0bejAfNphwaQ7ZSBQlJnODAHvenhpQnpiE1OrhPMNvSry';
const BASE_URL = 'testnet.binance.vision';

console.log('🚀 Testing Binance Testnet Connection...\n');

// Check if credentials are loaded
if (!API_KEY || !SECRET_KEY) {
  console.error('❌ Missing Binance credentials!');
  console.error('Please check your .env.local file contains:');
  console.error('BINANCE_TESTNET_API_KEY=your_api_key');
  console.error('BINANCE_TESTNET_SECRET_KEY=your_secret_key');
  process.exit(1);
}

console.log('✅ API Key loaded:', API_KEY.substring(0, 8) + '...');
console.log('✅ Secret Key loaded:', SECRET_KEY.substring(0, 8) + '...\n');

// Create HMAC signature
function createSignature(queryString) {
  return crypto.createHmac('sha256', SECRET_KEY).update(queryString).digest('hex');
}

// Make API request
function makeRequest(path, params = {}, requiresAuth = false) {
  return new Promise((resolve, reject) => {
    let queryString = '';
    
    if (requiresAuth) {
      params.timestamp = Date.now();
    }
    
    if (Object.keys(params).length > 0) {
      queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    }
    
    if (requiresAuth && queryString) {
      const signature = createSignature(queryString);
      queryString += `&signature=${signature}`;
    }
    
    const fullPath = queryString ? `${path}?${queryString}` : path;
    
    const options = {
      hostname: BASE_URL,
      path: fullPath,
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };
    
    if (requiresAuth) {
      options.headers['X-MBX-APIKEY'] = API_KEY;
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${jsonData.msg || data}`));
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Running connection tests...\n');
  
  try {
    // Test 1: Server Time (no auth required)
    console.log('1️⃣ Testing server connectivity...');
    const timeResponse = await makeRequest('/api/v3/time');
    const serverTime = new Date(timeResponse.serverTime);
    console.log('✅ Server time:', serverTime.toISOString());
    console.log('   Local time: ', new Date().toISOString());
    console.log('   Time diff:  ', Math.abs(Date.now() - timeResponse.serverTime), 'ms\n');
    
    // Test 2: Exchange Info (no auth required)
    console.log('2️⃣ Testing exchange info...');
    const exchangeInfo = await makeRequest('/api/v3/exchangeInfo');
    console.log('✅ Exchange timezone:', exchangeInfo.timezone);
    console.log('   Available symbols:', exchangeInfo.symbols.length);
    console.log('   Server time:', new Date(exchangeInfo.serverTime).toISOString(), '\n');
    
    // Test 3: Market Data (no auth required)
    console.log('3️⃣ Testing market data...');
    const prices = await makeRequest('/api/v3/ticker/price');
    const btcPrice = prices.find(p => p.symbol === 'BTCUSDT');
    const ethPrice = prices.find(p => p.symbol === 'ETHUSDT');
    console.log('✅ Market data retrieved');
    console.log('   Total symbols:', prices.length);
    console.log('   BTC/USDT:', btcPrice ? `$${parseFloat(btcPrice.price).toLocaleString()}` : 'Not found');
    console.log('   ETH/USDT:', ethPrice ? `$${parseFloat(ethPrice.price).toLocaleString()}` : 'Not found', '\n');
    
    // Test 4: Account Info (requires auth)
    console.log('4️⃣ Testing authenticated requests...');
    const accountInfo = await makeRequest('/api/v3/account', {}, true);
    console.log('✅ Account info retrieved');
    console.log('   Can trade:', accountInfo.canTrade);
    console.log('   Can withdraw:', accountInfo.canWithdraw);
    console.log('   Can deposit:', accountInfo.canDeposit);
    console.log('   Account type:', accountInfo.accountType);
    
    // Show non-zero balances
    const nonZeroBalances = accountInfo.balances.filter(b => 
      parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
    );
    console.log('   Non-zero balances:', nonZeroBalances.length);
    
    if (nonZeroBalances.length > 0) {
      console.log('   Sample balances:');
      nonZeroBalances.slice(0, 5).forEach(balance => {
        const total = parseFloat(balance.free) + parseFloat(balance.locked);
        console.log(`     ${balance.asset}: ${total} (${balance.free} free, ${balance.locked} locked)`);
      });
    }
    console.log('');
    
    // Test 5: 24hr Ticker (no auth required)
    console.log('5️⃣ Testing 24hr ticker data...');
    const btcTicker = await makeRequest('/api/v3/ticker/24hr', { symbol: 'BTCUSDT' });
    console.log('✅ BTC/USDT 24hr stats:');
    console.log('   Price:', `$${parseFloat(btcTicker.lastPrice).toLocaleString()}`);
    console.log('   24h Change:', `${btcTicker.priceChangePercent}%`);
    console.log('   24h Volume:', `${parseFloat(btcTicker.volume).toLocaleString()} BTC`);
    console.log('   24h High:', `$${parseFloat(btcTicker.highPrice).toLocaleString()}`);
    console.log('   24h Low:', `$${parseFloat(btcTicker.lowPrice).toLocaleString()}`, '\n');
    
    console.log('🎉 All tests passed! Binance Testnet integration is working correctly.\n');
    console.log('🚀 Ready to start crypto trading with your AI system!');
    console.log('💡 Next steps:');
    console.log('   1. Start your Next.js development server');
    console.log('   2. Visit /api/binance/test to test via web API');
    console.log('   3. Enable Binance Testnet in your trading dashboard');
    console.log('   4. Watch your AI trade crypto 24/7! 🤖💰');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your API credentials in .env.local');
    console.error('   2. Ensure you have trading permissions enabled');
    console.error('   3. Verify your internet connection');
    console.error('   4. Check Binance Testnet status');
    process.exit(1);
  }
}

// Run the tests
runTests();
