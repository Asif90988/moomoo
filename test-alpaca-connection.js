#!/usr/bin/env node

// Alpaca API Connection Test Tool
// Tests both Paper Trading and Live Trading connections

const https = require('https');

console.log('🦙 Testing Alpaca API Connection...\n');

// Configuration - UPDATE THESE WITH YOUR KEYS
const CONFIG = {
  // Paper Trading Keys (RECOMMENDED FIRST)
  paperApiKey: process.env.ALPACA_PAPER_API_KEY || 'PKTEST_your_paper_key_here',
  paperSecretKey: process.env.ALPACA_PAPER_SECRET_KEY || 'your_paper_secret_here',
  
  // Live Trading Keys (USE ONLY WHEN READY)
  liveApiKey: process.env.ALPACA_LIVE_API_KEY || 'AKFZ_your_live_key_here',
  liveSecretKey: process.env.ALPACA_LIVE_SECRET_KEY || 'your_live_secret_here',
  
  // Test mode
  testMode: process.env.TEST_MODE || 'paper' // 'paper' or 'live'
};

function makeRequest(hostname, path, headers) {
  return new Promise((resolve) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: 'GET',
      headers: headers,
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      // Capture Request ID for debugging and support
      const requestId = res.headers['x-request-id'];
      if (requestId) {
        console.log(`   🔍 Request ID: ${requestId}`);
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ 
            success: res.statusCode === 200, 
            status: res.statusCode, 
            data: response,
            requestId: requestId,
            message: res.statusCode === 200 ? 'Success' : `HTTP ${res.statusCode}`
          });
        } catch (error) {
          resolve({ 
            success: false, 
            message: 'Invalid JSON response', 
            requestId: requestId,
            rawData: data 
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ 
        success: false, 
        message: `Connection error: ${error.message}`,
        requestId: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ 
        success: false, 
        message: 'Connection timeout',
        requestId: null
      });
    });

    req.end();
  });
}

async function testPaperTrading() {
  console.log('🧪 TESTING PAPER TRADING API');
  console.log('================================');
  
  const headers = {
    'APCA-API-KEY-ID': CONFIG.paperApiKey,
    'APCA-API-SECRET-KEY': CONFIG.paperSecretKey,
    'Content-Type': 'application/json'
  };

  // Test 1: Account Info
  console.log('📊 Testing Account Access...');
  const accountTest = await makeRequest('paper-api.alpaca.markets', '/v2/account', headers);
  
  if (accountTest.success) {
    console.log('   ✅ Account access successful');
    console.log(`   📈 Portfolio Value: $${parseFloat(accountTest.data.portfolio_value).toLocaleString()}`);
    console.log(`   💰 Buying Power: $${parseFloat(accountTest.data.buying_power).toLocaleString()}`);
    console.log(`   💵 Cash: $${parseFloat(accountTest.data.cash).toLocaleString()}`);
    console.log(`   📋 Account Status: ${accountTest.data.status}`);
    console.log(`   🏦 Account Number: ${accountTest.data.account_number}`);
  } else {
    console.log(`   ❌ Account access failed: ${accountTest.message}`);
    if (accountTest.requestId) {
      console.log(`   🆘 For support, provide Request ID: ${accountTest.requestId}`);
    }
    return false;
  }

  // Test 2: Positions
  console.log('\n📍 Testing Positions Access...');
  const positionsTest = await makeRequest('paper-api.alpaca.markets', '/v2/positions', headers);
  
  if (positionsTest.success) {
    console.log(`   ✅ Positions access successful (${positionsTest.data.length} positions)`);
    if (positionsTest.data.length > 0) {
      positionsTest.data.slice(0, 3).forEach(pos => {
        console.log(`   📊 ${pos.symbol}: ${pos.qty} shares @ $${pos.current_price}`);
      });
    }
  } else {
    console.log(`   ❌ Positions access failed: ${positionsTest.message}`);
  }

  // Test 3: Orders
  console.log('\n📋 Testing Orders Access...');
  const ordersTest = await makeRequest('paper-api.alpaca.markets', '/v2/orders?status=all&limit=5', headers);
  
  if (ordersTest.success) {
    console.log(`   ✅ Orders access successful (${ordersTest.data.length} recent orders)`);
    if (ordersTest.data.length > 0) {
      ordersTest.data.slice(0, 3).forEach(order => {
        console.log(`   📝 ${order.symbol}: ${order.side} ${order.qty} @ ${order.status}`);
      });
    }
  } else {
    console.log(`   ❌ Orders access failed: ${ordersTest.message}`);
  }

  // Test 4: Market Data
  console.log('\n📈 Testing Market Data Access...');
  const marketTest = await makeRequest('data.alpaca.markets', '/v2/stocks/AAPL/quotes/latest', headers);
  
  if (marketTest.success) {
    console.log('   ✅ Market data access successful');
    if (marketTest.data.quote) {
      console.log(`   💹 AAPL Quote: Bid $${marketTest.data.quote.bid} / Ask $${marketTest.data.quote.ask}`);
    }
  } else {
    console.log(`   ❌ Market data access failed: ${marketTest.message}`);
  }

  return accountTest.success;
}

async function testLiveTrading() {
  console.log('\n🚨 TESTING LIVE TRADING API');
  console.log('============================');
  console.log('⚠️  WARNING: This will test REAL MONEY trading API!');
  
  const headers = {
    'APCA-API-KEY-ID': CONFIG.liveApiKey,
    'APCA-API-SECRET-KEY': CONFIG.liveSecretKey,
    'Content-Type': 'application/json'
  };

  // Test 1: Account Info
  console.log('📊 Testing Live Account Access...');
  const accountTest = await makeRequest('api.alpaca.markets', '/v2/account', headers);
  
  if (accountTest.success) {
    console.log('   ✅ Live account access successful');
    console.log(`   📈 Portfolio Value: $${parseFloat(accountTest.data.portfolio_value).toLocaleString()}`);
    console.log(`   💰 Buying Power: $${parseFloat(accountTest.data.buying_power).toLocaleString()}`);
    console.log(`   💵 Cash: $${parseFloat(accountTest.data.cash).toLocaleString()}`);
    console.log(`   📋 Account Status: ${accountTest.data.status}`);
    console.log(`   🏦 Account Number: ${accountTest.data.account_number}`);
    console.log(`   🛡️  PDT Status: ${accountTest.data.pattern_day_trader ? 'Pattern Day Trader' : 'Not PDT'}`);
  } else {
    console.log(`   ❌ Live account access failed: ${accountTest.message}`);
    if (accountTest.requestId) {
      console.log(`   🆘 For support, provide Request ID: ${accountTest.requestId}`);
    }
    return false;
  }

  return accountTest.success;
}

async function runTests() {
  console.log('🔍 ALPACA API CONNECTION TEST');
  console.log('=============================\n');

  // Check configuration
  console.log('⚙️  Configuration Check:');
  console.log(`   Test Mode: ${CONFIG.testMode.toUpperCase()}`);
  console.log(`   Paper API Key: ${CONFIG.paperApiKey.substring(0, 8)}...`);
  console.log(`   Live API Key: ${CONFIG.liveApiKey.substring(0, 8)}...`);
  console.log('');

  let paperSuccess = false;
  let liveSuccess = false;

  // Always test paper trading first
  paperSuccess = await testPaperTrading();

  // Test live trading only if requested and paper trading works
  if (CONFIG.testMode === 'live' && paperSuccess) {
    liveSuccess = await testLiveTrading();
  }

  // Summary
  console.log('\n📋 TEST SUMMARY');
  console.log('================');
  console.log(`Paper Trading: ${paperSuccess ? '✅ READY' : '❌ FAILED'}`);
  
  if (CONFIG.testMode === 'live') {
    console.log(`Live Trading:  ${liveSuccess ? '✅ READY' : '❌ FAILED'}`);
  }

  console.log('\n🎯 NEXT STEPS:');
  
  if (paperSuccess) {
    console.log('✅ Paper trading is ready!');
    console.log('📝 You can now:');
    console.log('   1. Start the dashboard: cd web/premium-dashboard && npm run dev');
    console.log('   2. Navigate to Multi-Broker panel');
    console.log('   3. Verify Alpaca shows as "Connected"');
    console.log('   4. Test with small paper trades first');
    
    if (CONFIG.testMode === 'live' && liveSuccess) {
      console.log('\n🚨 LIVE TRADING READY:');
      console.log('   ⚠️  You can switch to live trading, but:');
      console.log('   1. Test thoroughly with paper trading first');
      console.log('   2. Start with very small position sizes');
      console.log('   3. Monitor closely for the first few trades');
      console.log('   4. Have emergency stop procedures ready');
    }
  } else {
    console.log('❌ Paper trading setup failed');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your API keys are correct');
    console.log('   2. Verify keys are for paper trading (start with PKTEST)');
    console.log('   3. Ensure your Alpaca account is set up');
    console.log('   4. Check internet connection');
  }

  console.log('\n📚 For detailed setup instructions, see: ALPACA_SETUP_GUIDE.md');
  console.log('🆘 For support, visit: https://alpaca.markets/support');
}

// Handle command line arguments
if (process.argv.includes('--live')) {
  CONFIG.testMode = 'live';
  console.log('⚠️  LIVE TRADING MODE ENABLED - Testing real money API!');
}

if (process.argv.includes('--help')) {
  console.log('Alpaca API Connection Test Tool');
  console.log('');
  console.log('Usage:');
  console.log('  node test-alpaca-connection.js           # Test paper trading');
  console.log('  node test-alpaca-connection.js --live    # Test live trading');
  console.log('');
  console.log('Environment Variables:');
  console.log('  ALPACA_PAPER_API_KEY      # Paper trading API key');
  console.log('  ALPACA_PAPER_SECRET_KEY   # Paper trading secret key');
  console.log('  ALPACA_LIVE_API_KEY       # Live trading API key');
  console.log('  ALPACA_LIVE_SECRET_KEY    # Live trading secret key');
  console.log('');
  console.log('Example:');
  console.log('  ALPACA_PAPER_API_KEY=PKTEST123 ALPACA_PAPER_SECRET_KEY=abc123 node test-alpaca-connection.js');
  process.exit(0);
}

runTests().catch(console.error);
