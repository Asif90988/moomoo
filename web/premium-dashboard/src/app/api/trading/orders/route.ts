// Neural Core Alpha-7 - Trading Orders API Route - REAL MOOMOO INTEGRATION
import { NextRequest, NextResponse } from 'next/server';
import { moomooAPI } from '@/services/moomoo-api';
import type { Order } from '@/types/trading';

interface OrderRequest {
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  quantity: number;
  price?: number;
  aiRecommendation?: boolean;
}

// Cache for recent orders (for display purposes)
let recentOrders: Order[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const status = searchParams.get('status');

    console.log('🔍 [REAL MOOMOO] Fetching orders with filters:', { symbol, status });

    // First try to get orders from MooMoo API
    try {
      const portfolioResponse = await moomooAPI.getPortfolio();
      if (portfolioResponse.success && portfolioResponse.data) {
        const moomooOrders = portfolioResponse.data.orders || [];
        
        // Update our cache with real orders
        recentOrders = moomooOrders;
        
        let filteredOrders = [...moomooOrders].sort((a, b) => 
          new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
        );

        if (symbol) {
          filteredOrders = filteredOrders.filter(order => 
            order.symbol.toLowerCase() === symbol.toLowerCase()
          );
        }

        if (status) {
          filteredOrders = filteredOrders.filter(order => order.status === status);
        }

        return NextResponse.json({
          success: true,
          data: filteredOrders,
          source: 'moomoo_api',
          timestamp: Date.now()
        });
      }
    } catch (moomooError) {
      console.warn('⚠️ MooMoo API unavailable, using cached orders:', moomooError);
    }

    // Fallback to cached orders if MooMoo API is unavailable
    let filteredOrders = [...recentOrders].sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );

    if (symbol) {
      filteredOrders = filteredOrders.filter(order => 
        order.symbol.toLowerCase() === symbol.toLowerCase()
      );
    }

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredOrders,
      source: 'cache',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ Orders API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderRequest: OrderRequest = await request.json();

    console.log('📝 [REAL MOOMOO PAPER TRADING] Placing new order:', orderRequest);
    console.log('🛡️ REAL PAPER TRADING: Using MooMoo paper trading account');

    // Validate order request
    if (!orderRequest.symbol || !orderRequest.type || !orderRequest.quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required order parameters' },
        { status: 400 }
      );
    }

    if (orderRequest.quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    if (orderRequest.orderType === 'limit' && !orderRequest.price) {
      return NextResponse.json(
        { success: false, error: 'Limit orders require a price' },
        { status: 400 }
      );
    }

    // Safety check - maximum order size for AI trading
    const maxOrderSize = 100;
    if (orderRequest.quantity > maxOrderSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Order size cannot exceed ${maxOrderSize} shares for AI safety` 
        },
        { status: 400 }
      );
    }

    // 🚨 LIVE TRADING CHECK: Prevent simulation in live mode
    const isLiveMode = process.env.NEXT_PUBLIC_ALPACA_PAPER_TRADING === 'false';
    
    if (isLiveMode) {
      // For live trading, we MUST have real broker connection - no simulation allowed
      console.log('🚨 LIVE TRADING MODE: Checking real broker connections...');
      
      // Check if we should route to Alpaca instead of MooMoo for live trading
      const alpacaLiveEnabled = process.env.NEXT_PUBLIC_LIVE_TRADING_ENABLED === 'true';
      
      if (alpacaLiveEnabled) {
        // Route to Alpaca API for live trading
        try {
          const alpacaResponse = await fetch('/api/alpaca/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              symbol: orderRequest.symbol,
              side: orderRequest.type,
              type: orderRequest.orderType,
              qty: orderRequest.quantity.toString(),
              time_in_force: 'day'
            })
          });
          
          if (alpacaResponse.ok) {
            const alpacaData = await alpacaResponse.json();
            return NextResponse.json({
              success: true,
              data: alpacaData,
              message: 'Order placed successfully via Alpaca Live Trading',
              source: 'alpaca_live',
              timestamp: Date.now()
            });
          } else {
            throw new Error(`Alpaca live trading API error: ${alpacaResponse.status}`);
          }
        } catch (alpacaError) {
          console.error('❌ LIVE TRADING FAILED:', alpacaError);
          return NextResponse.json(
            { success: false, error: `Live trading order failed: ${alpacaError}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Live trading is disabled. Enable NEXT_PUBLIC_LIVE_TRADING_ENABLED=true for real orders.' },
          { status: 400 }
        );
      }
    }
    
    // Test MooMoo connection for paper trading only
    const isConnected = await moomooAPI.testConnection();
    if (!isConnected) {
      console.warn('⚠️ MooMoo API not connected, falling back to simulation mode (PAPER TRADING ONLY)');
      
      // 🔧 SIMULATION FALLBACK (only allowed for paper trading)
      const simulatedOrder: Order = {
        id: `sim_${Date.now()}`,
        symbol: orderRequest.symbol.toUpperCase(),
        side: orderRequest.type as any,
        type: orderRequest.orderType as any,
        quantity: orderRequest.quantity,
        price: orderRequest.price,
        timeInForce: 'GTC',
        status: 'pending',
        filled: 0,
        remaining: orderRequest.quantity,
        timestamp: Date.now()
      };

      // Add to cache
      recentOrders.unshift(simulatedOrder);

      // Simulate execution after delay (PAPER TRADING ONLY)
      setTimeout(() => {
        const orderIndex = recentOrders.findIndex(o => o.id === simulatedOrder.id);
        if (orderIndex !== -1) {
          const isExecuted = Math.random() > 0.1; // 90% success rate
          
          if (isExecuted) {
            const marketPrice = getSimulatedMarketPrice(simulatedOrder.symbol);
            const executionPrice = simulatedOrder.type === 'market' 
              ? marketPrice + (Math.random() - 0.5) * 0.1
              : simulatedOrder.price || marketPrice;
            
            recentOrders[orderIndex] = {
              ...simulatedOrder,
              status: 'filled',
              filled: simulatedOrder.quantity,
              remaining: 0,
              avgFillPrice: executionPrice,
              executionTime: Date.now()
            };
            
            console.log('🎯 [SIMULATED PAPER TRADING] Order executed:', simulatedOrder.id);
          } else {
            recentOrders[orderIndex] = {
              ...simulatedOrder,
              status: 'cancelled'
            };
            console.log('❌ [SIMULATED PAPER TRADING] Order cancelled:', simulatedOrder.id);
          }
        }
      }, Math.random() * 5000 + 1000);

      return NextResponse.json({
        success: true,
        data: simulatedOrder,
        message: 'Order placed successfully (simulated paper trading - MooMoo not connected)',
        source: 'simulation_paper',
        timestamp: Date.now()
      });
    }

    // Submit real order to MooMoo API
    try {
      const moomooOrder: Partial<Order> = {
        symbol: orderRequest.symbol.toUpperCase(),
        side: orderRequest.type as any,
        type: orderRequest.orderType as any,
        quantity: orderRequest.quantity,
        price: orderRequest.price,
        timeInForce: 'GTC'
      };

      const response = await moomooAPI.submitOrder(moomooOrder);

      if (response.success && response.data) {
        console.log('✅ [REAL MOOMOO] Order placed successfully:', response.data.id);
        
        // Add to cache
        recentOrders.unshift(response.data);

        return NextResponse.json({
          success: true,
          data: response.data,
          message: 'Order placed successfully via MooMoo Paper Trading',
          source: 'moomoo_api',
          timestamp: Date.now()
        });
      } else {
        throw new Error(response.error || 'Failed to submit order to MooMoo');
      }
    } catch (moomooError) {
      console.error('❌ MooMoo order submission failed:', moomooError);
      return NextResponse.json(
        { 
          success: false, 
          error: `MooMoo API error: ${moomooError}`,
          source: 'moomoo_api'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Order placement error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to place order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const action = searchParams.get('action');

    // Special case: clear all orders for reset
    if (action === 'clear_all') {
      console.log('🔄 RESET: Clearing all cached orders');
      recentOrders.length = 0;
      return NextResponse.json({
        success: true,
        message: 'All cached orders cleared successfully',
        timestamp: Date.now()
      });
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ [REAL MOOMOO] Cancelling order:', orderId);

    // Try to cancel via MooMoo API first
    try {
      const response = await moomooAPI.cancelOrder(orderId);
      
      if (response.success) {
        // Update cache
        const orderIndex = recentOrders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          recentOrders[orderIndex] = {
            ...recentOrders[orderIndex],
            status: 'cancelled'
          };
        }

        console.log('✅ [REAL MOOMOO] Order cancelled successfully:', orderId);

        return NextResponse.json({
          success: true,
          data: recentOrders[orderIndex],
          message: 'Order cancelled successfully via MooMoo',
          source: 'moomoo_api',
          timestamp: Date.now()
        });
      } else {
        throw new Error(response.error || 'Failed to cancel order');
      }
    } catch (moomooError) {
      console.warn('⚠️ MooMoo cancel failed, updating cache only:', moomooError);
      
      // Fallback: update cache only
      const orderIndex = recentOrders.findIndex(order => order.id === orderId);
      
      if (orderIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      const order = recentOrders[orderIndex];
      
      if (order.status !== 'pending') {
        return NextResponse.json(
          { success: false, error: 'Only pending orders can be cancelled' },
          { status: 400 }
        );
      }

      recentOrders[orderIndex] = {
        ...order,
        status: 'cancelled'
      };

      return NextResponse.json({
        success: true,
        data: recentOrders[orderIndex],
        message: 'Order cancelled successfully (cache only)',
        source: 'cache',
        timestamp: Date.now()
      });
    }

  } catch (error) {
    console.error('❌ Order cancellation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}

// Helper function to simulate market prices (fallback only)
function getSimulatedMarketPrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    'AAPL': 178.25,
    'GOOGL': 151.80,
    'MSFT': 347.50,
    'TSLA': 238.75,
    'NVDA': 245.30,
    'SPY': 438.20,
    'QQQ': 385.50,
    'AMD': 145.30,
    'META': 485.20,
    'AMZN': 168.50,
    // Hong Kong stocks (HKD)
    '00700': 320.50, // Tencent
    '00941': 65.80,  // China Mobile
    '03690': 180.20, // Meituan
    '00388': 385.60, // HKEX
    '02318': 58.90   // Ping An
  };

  const basePrice = basePrices[symbol] || 100;
  
  // Add some random price movement
  return basePrice + (Math.random() - 0.5) * 10;
}
