// Neural Core Alpha-7 - Moomoo Portfolio API Route
import { NextRequest, NextResponse } from 'next/server';
import { moomooAPI } from '@/services/moomoo-api';
import { demoDataGenerator } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching portfolio data from Moomoo API');

    const result = await moomooAPI.getPortfolio();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        timestamp: result.timestamp,
        source: 'moomoo'
      });
    } else {
      console.warn('⚠️ Moomoo portfolio request failed:', result.error);
      
      // Fallback to demo data if Moomoo API is not available
      const demoPortfolio = demoDataGenerator.getDemoPortfolio();
      const demoPerformance = demoDataGenerator.getDemoPerformance();
      const recentTrades = demoDataGenerator.getRecentTrades(10);

      const portfolioData = {
        totalValue: demoPerformance.totalValue,
        totalPnl: demoPerformance.totalPnL,
        totalPnlPercent: demoPerformance.totalPnLPercent,
        dayPnl: demoPerformance.dayChange,
        dayPnlPercent: demoPerformance.dayChangePercent,
        cash: 25000.00,
        buyingPower: 50000.00,
        marginUsed: 0,
        marginAvailable: 25000.00,
        positions: demoPortfolio.map(holding => ({
          id: `pos_${holding.symbol}_${Date.now()}`,
          symbol: holding.symbol,
          quantity: holding.shares,
          avgCost: holding.avgCost,
          marketValue: holding.marketValue,
          pnl: holding.totalPnL,
          pnlPercent: (holding.totalPnL / (holding.marketValue - holding.totalPnL)) * 100,
          side: 'LONG',
          openTime: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random time in last 30 days
          lastUpdate: Date.now()
        })),
        orders: recentTrades.slice(0, 5).map(trade => ({
          id: trade.id,
          symbol: trade.symbol,
          side: trade.side,
          type: 'MARKET',
          quantity: trade.quantity,
          price: trade.price,
          stopPrice: null,
          timeInForce: 'GTC',
          status: trade.status,
          filled: trade.quantity,
          remaining: 0,
          avgFillPrice: trade.price,
          timestamp: trade.timestamp.getTime(),
          executionTime: trade.timestamp.getTime()
        }))
      };

      return NextResponse.json({
        success: true,
        data: portfolioData,
        timestamp: Date.now(),
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('❌ Portfolio API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}