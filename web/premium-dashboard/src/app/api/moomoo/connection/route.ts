// Neural Core Alpha-7 - Moomoo Connection Test API Route
import { NextRequest, NextResponse } from 'next/server';
import { moomooTCP } from '@/services/moomoo-tcp';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Moomoo OpenD connection with TCP protocol...');

    const connection = await moomooTCP.connect();
    
    if (connection.isConnected) {
      return NextResponse.json({
        success: true,
        data: {
          connected: true,
          openDStatus: 'CONNECTED',
          marketStatus: true,
          accountAccess: true,
          accountCount: connection.accountList?.length || 0,
          userID: connection.userInfo?.userID || 'Unknown',
          baseUrl: 'tcp://127.0.0.1:11111',
          paperTrading: true, // Using SIMULATE mode for safety
          protocol: 'TCP Socket',
          sdk: 'Official Moomoo TCP Protocol',
          version: '9.3.5308',
          timestamp: Date.now()
        }
      });
    } else {
      console.warn('⚠️ Moomoo OpenD connection failed:', connection.error);
      
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          openDStatus: 'DISCONNECTED',
          marketStatus: false,
          accountAccess: false,
          baseUrl: 'tcp://127.0.0.1:11111',
          paperTrading: true,
          demoMode: true,
          error: connection.error,
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
        baseUrl: 'tcp://127.0.0.1:11111',
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