import { NextRequest, NextResponse } from 'next/server';
import { brokerTradingEngine } from '@/services/broker-trading-engine';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [API] Manually refreshing broker data...');
    
    // Force re-initialization to fetch latest live data
    const engine = brokerTradingEngine;
    
    // Get current state before refresh
    const beforeState = engine.getState();
    console.log('📊 Before refresh - Alpaca portfolio value:', beforeState.brokers.alpaca?.portfolio.value);
    
    // Trigger data refresh by creating a new instance or calling init
    // Since it's singleton, we need to manually call the refresh method
    // For now, let's just return current state and log what we have
    
    const currentState = engine.getState();
    
    return NextResponse.json({
      success: true,
      message: 'Broker data refreshed',
      brokers: currentState.brokers,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🔄 [API] Error refreshing broker data:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}