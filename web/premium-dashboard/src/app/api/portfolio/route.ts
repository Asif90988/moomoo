// Neural Core Alpha-7 - Portfolio API Route - REAL MOOMOO INTEGRATION
import { NextRequest, NextResponse } from 'next/server';
import { moomooAPI } from '@/services/moomoo-api';
import type { Portfolio } from '@/types/trading';

// Cache for portfolio data (for display purposes)
let cachedPortfolio: Portfolio | null = null;

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [REAL MOOMOO] Fetching portfolio data');

    // First try to get portfolio from MooMoo API
    try {
      const portfolioResponse = await moomooAPI.getPortfolio();
      if (portfolioResponse.success && portfolioResponse.data) {
        console.log('✅ [REAL MOOMOO] Portfolio fetched successfully');
        
        // Update cache with real portfolio data
        cachedPortfolio = portfolioResponse.data;
        
        return NextResponse.json({
          success: true,
          data: portfolioResponse.data,
          source: 'moomoo_api',
          timestamp: Date.now()
        });
      }
    } catch (moomooError) {
      console.warn('⚠️ MooMoo API unavailable, using cached/simulated portfolio:', moomooError);
    }

    // Test MooMoo connection
    const isConnected = await moomooAPI.testConnection();
    if (!isConnected) {
      console.warn('⚠️ MooMoo API not connected, returning simulated portfolio');
      
      // Return simulated portfolio if MooMoo is not available
      const simulatedPortfolio: Portfolio = cachedPortfolio || {
        totalValue: 300.00, // Starting baseline
        totalPnl: 0.00,
        totalPnlPercent: 0.00,
        dayPnl: 0.00,
        dayPnlPercent: 0.00,
        cash: 300.00,
        buyingPower: 300.00,
        marginUsed: 0.00,
        marginAvailable: 300.00,
        positions: [],
        orders: []
      };

      return NextResponse.json({
        success: true,
        data: simulatedPortfolio,
        source: 'simulation',
        message: 'MooMoo not connected - using simulated portfolio',
        timestamp: Date.now()
      });
    }

    // If we reach here, MooMoo is connected but portfolio fetch failed
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolio from MooMoo API',
        source: 'moomoo_api'
      },
      { status: 500 }
    );

  } catch (error) {
    console.error('❌ Portfolio API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const updateData = await request.json();
    console.log('📝 [PORTFOLIO UPDATE] Received update:', updateData);

    // For now, just update the cache
    // In a real implementation, this might sync with MooMoo or update local state
    if (cachedPortfolio && updateData.totalValue !== undefined) {
      cachedPortfolio = {
        ...cachedPortfolio,
        totalValue: updateData.totalValue,
        totalPnl: updateData.totalValue - 300.00, // Assuming $300 baseline
        totalPnlPercent: ((updateData.totalValue - 300.00) / 300.00) * 100,
        dayPnl: updateData.totalValue - 300.00,
        dayPnlPercent: ((updateData.totalValue - 300.00) / 300.00) * 100
      };
    }

    return NextResponse.json({
      success: true,
      data: cachedPortfolio,
      message: 'Portfolio updated successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ Portfolio update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}
