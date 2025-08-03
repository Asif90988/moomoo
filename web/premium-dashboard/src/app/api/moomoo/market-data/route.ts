// Neural Core Alpha-7 - Moomoo Market Data API Route
import { NextRequest, NextResponse } from 'next/server';
import { moomooAPI } from '@/services/moomoo-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'];

    console.log('🔍 Fetching market data for symbols:', symbols);

    const result = await moomooAPI.getMarketData(symbols);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        timestamp: result.timestamp
      });
    } else {
      console.warn('⚠️ Moomoo market data request failed:', result.error);
      
      // Fallback to demo data if Moomoo API is not available
      const demoData = symbols.map(symbol => ({
        symbol,
        name: symbol,
        price: 100 + Math.random() * 500,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
        high24h: 100 + Math.random() * 520,
        low24h: 80 + Math.random() * 480,
        timestamp: Date.now(),
        exchange: 'NASDAQ'
      }));

      return NextResponse.json({
        success: true,
        data: demoData,
        timestamp: Date.now(),
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('❌ Market data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symbols } = await request.json();

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { success: false, error: 'Invalid symbols array' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching market data for symbols:', symbols);

    const result = await moomooAPI.getMarketData(symbols);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        timestamp: result.timestamp
      });
    } else {
      console.warn('⚠️ Moomoo market data request failed:', result.error);
      
      // Fallback to demo data
      const demoData = symbols.map((symbol: string) => ({
        symbol,
        name: symbol,
        price: 100 + Math.random() * 500,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
        high24h: 100 + Math.random() * 520,
        low24h: 80 + Math.random() * 480,
        timestamp: Date.now(),
        exchange: 'NASDAQ'
      }));

      return NextResponse.json({
        success: true,
        data: demoData,
        timestamp: Date.now(),
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('❌ Market data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process market data request' },
      { status: 500 }
    );
  }
}