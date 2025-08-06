// Neural Core Alpha-7 - Moomoo Market Data API Route
import { NextRequest, NextResponse } from 'next/server';
import { moomooTCP } from '@/services/moomoo-tcp';
import { demoDataGenerator } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'];

    console.log('🔍 Fetching market data for symbols:', symbols);

    // Try to get live data from OpenD if connected
    let result: { success: boolean; data?: any } = { success: false };
    if (moomooTCP.isConnectedStatus()) {
      result = await moomooTCP.getBasicQuote(symbols);
    }

    if (result.success) {
      // Transform OpenD data to our format
      const marketData = result.data?.basicQotList?.map((quote: any) => ({
        symbol: quote.security?.code || 'UNKNOWN',
        name: quote.security?.code || 'UNKNOWN',
        price: quote.curPrice || 0,
        change: quote.priceSpread || 0,
        changePercent: quote.changePer || 0,
        volume: quote.volume || 0,
        marketCap: quote.marketVal || 0,
        high24h: quote.highPrice || 0,
        low24h: quote.lowPrice || 0,
        timestamp: Date.now(),
        exchange: 'MOOMOO_LIVE'
      })) || [];

      return NextResponse.json({
        success: true,
        data: marketData,
        timestamp: Date.now(),
        source: 'moomoo_live'
      });
    } else {
      console.warn('⚠️ OpenD not connected, using demo data');
      
      // Fallback to demo data using our generator
      const demoData = symbols.map(symbol => {
        const price = 100 + Math.random() * 500;
        const change = (Math.random() - 0.5) * 10;
        return {
          symbol,
          name: symbol,
          price: Math.round(price * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
          high24h: 100 + Math.random() * 520,
          low24h: 80 + Math.random() * 480,
          timestamp: Date.now(),
          exchange: 'NASDAQ'
        };
      });

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

    // Try to get live data from OpenD if connected
    let result: { success: boolean; data?: any } = { success: false };
    if (moomooTCP.isConnectedStatus()) {
      result = await moomooTCP.getBasicQuote(symbols);
    }

    if (result.success) {
      // Transform OpenD data to our format
      const marketData = result.data?.basicQotList?.map((quote: any) => ({
        symbol: quote.security?.code || 'UNKNOWN',
        name: quote.security?.code || 'UNKNOWN', 
        price: quote.curPrice || 0,
        change: quote.priceSpread || 0,
        changePercent: quote.changePer || 0,
        volume: quote.volume || 0,
        marketCap: quote.marketVal || 0,
        high24h: quote.highPrice || 0,
        low24h: quote.lowPrice || 0,
        timestamp: Date.now(),
        exchange: 'MOOMOO_LIVE'
      })) || [];

      return NextResponse.json({
        success: true,
        data: marketData,
        timestamp: Date.now(),
        source: 'moomoo_live'
      });
    } else {
      console.warn('⚠️ OpenD not connected, using demo data');
      
      // Fallback to demo data
      const demoData = symbols.map((symbol: string) => {
        const price = 100 + Math.random() * 500;
        const change = (Math.random() - 0.5) * 10;
        return {
          symbol,
          name: symbol,
          price: Math.round(price * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
          high24h: 100 + Math.random() * 520,
          low24h: 80 + Math.random() * 480,
          timestamp: Date.now(),
          exchange: 'NASDAQ'
      }});

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