import { NextRequest, NextResponse } from 'next/server';
import { alpacaAPI } from '@/services/alpaca-api';

export async function GET(request: NextRequest) {
  try {
    console.log('🦙 [ALPACA TEST] Testing connection...');
    
    // Test the connection
    const result = await alpacaAPI.testConnection();
    
    if (result.success && result.account) {
      return NextResponse.json({
        success: true,
        message: 'Alpaca connection successful!',
        data: {
          account_number: result.account.account_number,
          status: result.account.status,
          portfolio_value: result.account.portfolio_value,
          buying_power: result.account.buying_power,
          cash: result.account.cash,
          paper_trading: alpacaAPI.isPaperTrading(),
          configured: alpacaAPI.isConfigured()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        error: 'Connection failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('🦙 [ALPACA TEST] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Alpaca API test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
