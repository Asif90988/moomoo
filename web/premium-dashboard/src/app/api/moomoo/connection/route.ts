// Neural Core Alpha-7 - Moomoo Connection Test API Route
import { NextRequest, NextResponse } from 'next/server';
import { moomooAPI } from '@/services/moomoo-api';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Moomoo OpenD connection...');

    const isConnected = await moomooAPI.testConnection();
    
    if (isConnected) {
      // Test additional endpoints to verify full functionality
      const [marketStatus, accountInfo] = await Promise.allSettled([
        moomooAPI.getMarketStatus(),
        moomooAPI.getAccountInfo()
      ]);

      return NextResponse.json({
        success: true,
        data: {
          connected: true,
          openDStatus: 'CONNECTED',
          marketStatus: marketStatus.status === 'fulfilled' ? marketStatus.value.success : false,
          accountAccess: accountInfo.status === 'fulfilled' ? accountInfo.value.success : false,
          baseUrl: process.env.MOOMOO_BASE_URL || 'http://127.0.0.1:11111',
          paperTrading: process.env.TRADING_MODE !== 'live',
          timestamp: Date.now()
        }
      });
    } else {
      console.warn('⚠️ Moomoo OpenD connection failed - using demo mode');
      
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          openDStatus: 'DISCONNECTED',
          marketStatus: false,
          accountAccess: false,
          baseUrl: process.env.MOOMOO_BASE_URL || 'http://127.0.0.1:11111',
          paperTrading: true,
          demoMode: true,
          message: 'OpenD not available - using demo data',
          timestamp: Date.now()
        }
      });
    }
  } catch (error) {
    console.error('❌ Connection test error:', error);
    
    return NextResponse.json({
      success: false,
      data: {
        connected: false,
        openDStatus: 'ERROR',
        marketStatus: false,
        accountAccess: false,
        baseUrl: process.env.MOOMOO_BASE_URL || 'http://127.0.0.1:11111',
        paperTrading: true,
        demoMode: true,
        error: (error as Error).message,
        timestamp: Date.now()
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { baseUrl, timeout } = await request.json();
    
    console.log('🔧 Testing custom Moomoo connection configuration...');
    
    // Create temporary API instance with custom config
    const testAPI = new (await import('@/services/moomoo-api')).MoomooAPIService({
      baseUrl: baseUrl || 'http://127.0.0.1:11111',
      timeout: timeout || 5000,
      paperTrading: process.env.TRADING_MODE !== 'live'
    });

    const isConnected = await testAPI.testConnection();
    
    return NextResponse.json({
      success: true,
      data: {
        connected: isConnected,
        openDStatus: isConnected ? 'CONNECTED' : 'DISCONNECTED',
        testConfig: {
          baseUrl: baseUrl || 'http://127.0.0.1:11111',
          timeout: timeout || 5000
        },
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('❌ Custom connection test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test custom connection',
      timestamp: Date.now()
    }, { status: 500 });
  }
}