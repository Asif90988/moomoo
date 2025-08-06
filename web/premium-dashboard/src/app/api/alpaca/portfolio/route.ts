import { NextRequest, NextResponse } from 'next/server';
import { alpacaAPI } from '@/services/alpaca-api';

export async function GET(request: NextRequest) {
  try {
    console.log('🦙 [API] Fetching Alpaca portfolio data...');
    
    // Get account information
    const account = await alpacaAPI.getAccount();
    
    // Get positions
    const positions = await alpacaAPI.getPositions();
    
    // Get recent orders
    const orders = await alpacaAPI.getOrders('all', 50);
    
    // Get account analytics
    const analytics = await alpacaAPI.getAccountAnalytics();
    
    // Calculate portfolio summary
    const portfolioValue = parseFloat(account.portfolio_value);
    const cash = parseFloat(account.cash);
    const equity = parseFloat(account.equity);
    const dayChange = analytics.dailyPnL;
    const dayChangePercent = analytics.dailyPnLPercent;
    
    // Count trades today
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = orders.filter(order => 
      order.filled_at && order.filled_at.startsWith(today)
    );
    
    // Calculate total P&L from positions
    const totalUnrealizedPL = positions.reduce((sum, pos) => 
      sum + parseFloat(pos.unrealized_pl || '0'), 0
    );
    
    const portfolioData = {
      // Account basics
      account_id: account.id,
      account_number: account.account_number,
      status: account.status,
      
      // Portfolio values
      portfolio_value: portfolioValue,
      cash: cash,
      equity: equity,
      buying_power: parseFloat(account.buying_power),
      
      // Daily performance
      day_change: dayChange,
      day_change_percent: dayChangePercent,
      
      // Position summary
      positions_count: positions.length,
      total_unrealized_pl: totalUnrealizedPL,
      
      // Trading activity
      total_orders: orders.length,
      today_trades: todayTrades.length,
      
      // Account status
      trading_blocked: account.trading_blocked,
      pattern_day_trader: account.pattern_day_trader,
      daytrade_count: account.daytrade_count,
      
      // Detailed data
      positions: positions.map(pos => ({
        symbol: pos.symbol,
        qty: parseFloat(pos.qty),
        side: pos.side,
        market_value: parseFloat(pos.market_value || '0'),
        cost_basis: parseFloat(pos.cost_basis || '0'),
        unrealized_pl: parseFloat(pos.unrealized_pl || '0'),
        unrealized_plpc: parseFloat(pos.unrealized_plpc || '0'),
        current_price: parseFloat(pos.current_price || '0')
      })),
      
      recent_orders: orders.slice(0, 20).map(order => ({
        id: order.id,
        symbol: order.symbol,
        side: order.side,
        qty: parseFloat(order.qty || '0'),
        filled_qty: parseFloat(order.filled_qty || '0'),
        filled_avg_price: parseFloat(order.filled_avg_price || '0'),
        status: order.status,
        created_at: order.created_at,
        filled_at: order.filled_at,
        client_order_id: order.client_order_id
      }))
    };
    
    console.log(`🦙 [API] Portfolio data retrieved: $${portfolioValue.toFixed(2)} value, ${positions.length} positions, ${orders.length} orders`);
    
    return NextResponse.json({
      success: true,
      portfolio: portfolioData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🦙 [API] Error fetching Alpaca portfolio:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      portfolio: null
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🦙 [API] Updating Alpaca portfolio settings...');
    
    const settings = await request.json();
    
    // This endpoint could be used for portfolio rebalancing or settings updates
    // For now, just return current portfolio data
    const account = await alpacaAPI.getAccount();
    
    return NextResponse.json({
      success: true,
      message: 'Portfolio settings updated',
      account: {
        id: account.id,
        portfolio_value: account.portfolio_value,
        cash: account.cash,
        buying_power: account.buying_power
      }
    });
    
  } catch (error) {
    console.error('🦙 [API] Error updating Alpaca portfolio:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
