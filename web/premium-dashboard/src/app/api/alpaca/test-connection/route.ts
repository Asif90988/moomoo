import { NextRequest, NextResponse } from 'next/server';
import { alpacaAPI } from '@/services/alpaca-api';

export async function GET(request: NextRequest) {
  try {
    console.log('🦙 [API] 🚨 Testing Alpaca LIVE TRADING connection...');
    
    // Test both endpoints to diagnose the issue
    const liveTest = await testEndpoint('https://api.alpaca.markets');
    const paperTest = await testEndpoint('https://paper-api.alpaca.markets');
    
    console.log('🦙 [API] 🔴 LIVE API Result:', liveTest.success ? '✅ SUCCESS' : '❌ FAILED');
    console.log('🦙 [API] 📄 PAPER API Result:', paperTest.success ? '✅ SUCCESS' : '❌ FAILED');
    
    return NextResponse.json({
      liveApi: liveTest,
      paperApi: paperTest,
      recommendation: getRecommendation(liveTest, paperTest),
      config: alpacaAPI.getConfig()
    });
    
  } catch (error) {
    console.error('🦙 [API] Critical error testing Alpaca connection:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: alpacaAPI.getConfig()
    }, { status: 500 });
  }
}

async function testEndpoint(baseUrl: string): Promise<{success: boolean, message: string, account?: any}> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY || process.env.ALPACA_API_KEY || '';
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY || process.env.ALPACA_SECRET_KEY || '';
    
    const response = await fetch(`${baseUrl}/v2/account`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const account = await response.json();
      return {
        success: true,
        message: `Connected to ${baseUrl}`,
        account
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        message: `${baseUrl}: ${response.status} - ${errorText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `${baseUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

function getRecommendation(liveTest: any, paperTest: any): string {
  if (liveTest.success) {
    return '✅ LIVE TRADING READY - Your API keys work with live endpoints!';
  } else if (paperTest.success) {
    return '⚠️  API keys work for PAPER TRADING only. You may need to:\n1. Complete live trading application with Alpaca\n2. Wait for account approval\n3. Fund your live trading account\n4. Generate live trading API keys';
  } else {
    return '❌ API keys invalid for both live and paper trading. Check your credentials.';
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}