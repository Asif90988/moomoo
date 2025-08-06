import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This endpoint returns what the portfolio state should be
    const expectedPortfolio = {
      totalValue: 300.00,
      cash: 300.00,
      buyingPower: 300.00,
      marginUsed: 0,
      marginAvailable: 300.00,
      dayPnl: 0.00,
      dayPnlPercent: 0.00,
      totalPnl: 0.00,
      totalPnlPercent: 0.00,
      positions: [],
      orders: []
    };

    return NextResponse.json({ 
      success: true,
      expected: expectedPortfolio,
      message: 'This is what the portfolio should show',
      timestamp: Date.now() 
    });
  } catch (error) {
    console.error('❌ Portfolio status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get portfolio status' },
      { status: 500 }
    );
  }
}