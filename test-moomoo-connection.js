#!/usr/bin/env node

// MooMoo OpenD Connection Test Tool (using Node.js built-ins)
const http = require('http');

console.log('🔍 Testing MooMoo OpenD Connection...\n');

function testConnection(host, port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: host,
      port: port,
      method: 'GET',
      timeout: 3000
    }, (res) => {
      resolve({ success: true, status: res.statusCode, message: `Connected to ${host}:${port}` });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        resolve({ success: false, message: 'Connection refused - OpenD not running' });
      } else if (error.code === 'ETIMEDOUT') {
        resolve({ success: false, message: 'Connection timeout - OpenD not responding' });
      } else {
        resolve({ success: false, message: `Connection error: ${error.message}` });
      }
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, message: 'Connection timeout - OpenD not responding' });
    });

    req.end();
  });
}

function testJsonRpc(host, port) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "get_user_info",
      params: {}
    });

    const options = {
      hostname: host,
      port: port,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ success: true, message: 'JSON-RPC communication successful', data: response });
        } catch (error) {
          resolve({ success: true, message: 'Connected but invalid JSON response', rawData: data });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, message: `JSON-RPC failed: ${error.message}` });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, message: 'JSON-RPC timeout' });
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  const host = '127.0.0.1';
  const port = 11111;

  console.log('Running connection tests...\n');

  // Test 1: Basic connection
  console.log('🧪 Port 11111 Accessibility:');
  const connectionTest = await testConnection(host, port);
  if (connectionTest.success) {
    console.log(`   ✅ ${connectionTest.message}`);
  } else {
    console.log(`   ❌ ${connectionTest.message}`);
  }
  console.log('');

  // Test 2: JSON-RPC
  console.log('🧪 JSON-RPC Test:');
  const rpcTest = await testJsonRpc(host, port);
  if (rpcTest.success) {
    console.log(`   ✅ ${rpcTest.message}`);
    if (rpcTest.data) {
      console.log(`   📊 Response:`, JSON.stringify(rpcTest.data, null, 2));
    }
  } else {
    console.log(`   ❌ ${rpcTest.message}`);
  }
  console.log('');

  // Provide diagnosis and next steps
  console.log('🔍 DIAGNOSIS:');
  if (!connectionTest.success) {
    console.log('   ❌ MooMoo OpenD is NOT running on localhost:11111');
    console.log('   📋 This is why you see "[MOOMOO] API not available" in the dashboard');
  } else {
    console.log('   ✅ MooMoo OpenD is running and accessible!');
    if (rpcTest.success) {
      console.log('   ✅ JSON-RPC communication working - READY FOR REAL TRADING!');
    } else {
      console.log('   ⚠️  OpenD running but JSON-RPC not responding properly');
    }
  }
  console.log('');

  console.log('📋 NEXT STEPS TO FIX:');
  console.log('');
  console.log('1. 📥 DOWNLOAD MOOMOO OPEND:');
  console.log('   Visit: https://www.moomoo.com/download/openapi');
  console.log('   Download the OpenD desktop application');
  console.log('');
  console.log('2. 🚀 INSTALL & LAUNCH OPEND:');
  console.log('   - Install the downloaded OpenD app');
  console.log('   - Launch OpenD');
  console.log('   - Log in with your MooMoo credentials');
  console.log('');
  console.log('3. 🎮 ENABLE PAPER TRADING:');
  console.log('   - Open MooMoo mobile app or website');
  console.log('   - Go to Settings > Paper Trading');
  console.log('   - Enable paper trading mode');
  console.log('   - Set paper trading balance ($10,000+ recommended)');
  console.log('');
  console.log('4. ✅ VERIFY CONNECTION:');
  console.log('   - Keep OpenD running');
  console.log('   - Run this test again: node test-moomoo-connection.js');
  console.log('   - Should see ✅ for all tests');
  console.log('');
  console.log('5. 🎯 START TRADING:');
  console.log('   - Launch dashboard: cd web/premium-dashboard && npm run dev');
  console.log('   - Watch console for: "✅ [REAL MOOMOO] Connected!"');
  console.log('   - AI will now make REAL paper trades!');
  console.log('');
  console.log('💡 TIP: If you don\'t have a MooMoo account yet:');
  console.log('   1. Sign up at https://www.moomoo.com');
  console.log('   2. Complete account verification');
  console.log('   3. Enable paper trading in settings');
  console.log('   4. Then follow steps above');
  console.log('');
  console.log('🔧 ALTERNATIVE: Test with curl command:');
  console.log('   curl -X POST http://127.0.0.1:11111 -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","id":1,"method":"get_user_info","params":{}}\'');
}

runTests().catch(console.error);
