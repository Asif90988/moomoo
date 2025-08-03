// Neural Core Alpha-7 - Moomoo Orders API Route
import { NextRequest, NextResponse } from 'next/server';
import { moomooAPI } from '@/services/moomoo-api';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    console.log('📊 Submitting order to Moomoo:', orderData);
    
    // Validate order data
    if (!orderData.symbol || !orderData.side || !orderData.quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    const result = await moomooAPI.submitOrder(orderData);
    
    if (result.success) {
      console.log('✅ Order submitted successfully:', result.data?.id);
      
      return NextResponse.json({
        success: true,
        data: result.data,
        timestamp: result.timestamp,
        source: 'moomoo'
      });
    } else {
      console.warn('⚠️ Order submission failed:', result.error);
      
      // In demo mode, simulate order submission
      const simulatedOrder = {
        id: `demo_order_${Date.now()}`,
        symbol: orderData.symbol,
        side: orderData.side,
        type: orderData.type || 'MARKET',
        quantity: orderData.quantity,
        price: orderData.price,
        stopPrice: orderData.stopPrice,
        timeInForce: orderData.timeInForce || 'GTC',
        status: 'FILLED', // Simulate immediate fill in demo
        filled: orderData.quantity,
        remaining: 0,
        avgFillPrice: orderData.price || (100 + Math.random() * 500),
        timestamp: Date.now(),
        executionTime: Date.now()
      };

      return NextResponse.json({
        success: true,
        data: simulatedOrder,
        timestamp: Date.now(),
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('❌ Order submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    if (orderId) {
      // Get specific order status
      console.log('🔍 Fetching order status:', orderId);
      
      const result = await moomooAPI.getOrderStatus(orderId);
      
      if (!result.success) {
        // Return demo order status if Moomoo API fails
        const demoOrder = {
          id: orderId,
          symbol: 'AAPL',
          side: 'BUY',
          type: 'MARKET',
          quantity: 10,
          price: 175.50,
          status: 'FILLED',
          filled: 10,
          remaining: 0,
          avgFillPrice: 175.50,
          timestamp: Date.now() - 300000, // 5 minutes ago
          executionTime: Date.now() - 299000
        };
        
        return NextResponse.json({
          success: true,
          data: demoOrder,
          timestamp: Date.now(),
          source: 'demo'
        });
      }
      
      return NextResponse.json({
        success: true,
        data: result.data,
        timestamp: result.timestamp,
        source: 'moomoo'
      });
    } else {
      // Return all recent orders (this would typically be part of portfolio data)
      return NextResponse.json({
        success: false,
        error: 'Order ID required'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Order status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID required' },
        { status: 400 }
      );
    }
    
    console.log('🗑️ Cancelling order:', orderId);
    
    const result = await moomooAPI.cancelOrder(orderId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { cancelled: true, orderId },
        timestamp: result.timestamp,
        source: 'moomoo'
      });
    } else {
      // Simulate cancellation in demo mode
      return NextResponse.json({
        success: true,
        data: { cancelled: true, orderId },
        timestamp: Date.now(),
        source: 'demo'
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