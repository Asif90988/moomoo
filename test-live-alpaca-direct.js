#!/usr/bin/env node

// Direct Live Alpaca API Test
// Tests your specific live trading keys

const https = require('https');

console.log('🦙 DIRECT LIVE ALPACA API TEST');
console.log('==============================');
console.log('⚠️  WARNING: Testing LIVE TRADING API with REAL MONEY keys!');
console.log('');

// Your specific keys
const API_KEY = 'CKBWCD5IWE4PD4W9988N';
const SECRET_KEY = 'cBatN3D9DkXpw8uYDxDJVPDLdXELxxI9gdsVU8mo';

function makeRequest(hostname, path, headers) {
  return new Promise((resolve) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: 'GET',
      headers: headers,
      timeout: 10000
    };

    console.log(`🔗 Testing: https://${hostname}${path}`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log('');

    const req = https.request(options, (res) => {
      let data = '';
      
      // Capture Request ID
      const requestId = res.headers['x-request-id'];
      if (requestId) {
        console.log(`🔍 Request ID: ${requestId}`);
      }
      
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Status Message: ${res.statusMessage}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            resolve({ 
              success: true, 
              status: res.statusCode, 
              data: response,
              requestId: requestId
            });
          } else {
            console.log(`❌ Error Response: ${data}`);
            resolve({ 
              success: false, 
              status: res.statusCode, 
              error: data,
              requestId: requestId
            });
          }
        } catch (error) {
          console.log(`❌ JSON Parse Error: ${error.message}`);
          console.log(`📄 Raw Response: ${data}`);
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
      console.log(`❌ Connection Error: ${error.message}`);
      resolve({ 
        success: false, 
        message: `Connection error: ${error.message}`,
        requestId: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('❌ Request Timeout');
      resolve({ 
        success: false, 
        message: 'Connection timeout',
        requestId: null
      });
    });

    req.end();
  });
}

async function testLiveAccount() {
  console.log('🚨 TESTING LIVE ACCOUNT ACCESS');
  console.log('===============================');
  
  const headers = {
    'APCA-API-KEY-ID': API_KEY,
    'APCA-API-SECRET-KEY': SECRET_KEY,
    'Content-Type': 'application/json',
    'User-Agent': 'AlpacaTest/1.0'
  };

  // Test live account endpoint
  const result = await makeRequest('api.alpaca.markets', '/v2/account', headers);
  
  console.log('');
  console.log('📋 RESULTS:');
  console.log('===========');
  
  if (result.success) {
    console.log('✅ SUCCESS: Live account access working!');
    console.log('');
    console.log('📊 Account Details:');
    console.log(`   💰 Portfolio Value: $${parseFloat(result.data.portfolio_value).toLocaleString()}`);
    console.log(`   💵 Cash: $${parseFloat(result.data.cash).toLocaleString()}`);
    console.log(`   🏦 Account: ${result.data.account_number}`);
    console.log(`   📋 Status: ${result.data.status}`);
    console.log(`   🛡️  Trading Blocked: ${result.data.trading_blocked ? 'YES' : 'NO'}`);
    console.log(`   📈 PDT: ${result.data.pattern_day_trader ? 'YES' : 'NO'}`);
    
    if (result.data.trading_blocked) {
      console.log('');
      console.log('⚠️  WARNING: Trading is currently blocked on this account!');
    }
    
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('   1. Your API keys are working correctly');
    console.log('   2. You can now launch your trading dashboard');
    console.log('   3. Start with small position sizes');
    console.log('   4. Monitor trades closely');
    
  } else {
    console.log('❌ FAILED: Account access not working');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log(`   Status Code: ${result.status}`);
    console.log(`   Error: ${result.error || result.message}`);
    
    if (result.requestId) {
      console.log(`   🆘 Request ID for support: ${result.requestId}`);
    }
    
    console.log('');
    console.log('💡 Possible Issues:');
    console.log('   1. Account not fully verified (KYC incomplete)');
    console.log('   2. Account not approved for trading');
    console.log('   3. API keys disabled or expired');
    console.log('   4. Account suspended or restricted');
    console.log('');
    console.log('📞 Contact Alpaca Support:');
    console.log('   Email: support@alpaca.markets');
    console.log('   Include Request ID and account email');
  }
  
  return result.success;
}

// Run the test
testLiveAccount().catch(console.error);
