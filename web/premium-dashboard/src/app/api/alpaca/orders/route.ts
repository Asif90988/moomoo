import { NextRequest, NextResponse } from 'next/server';
import { alpacaAPI } from '@/services/alpaca-api';

export async function GET(request: NextRequest) {
  try {
    console.log('🦙 [API] Fetching Alpaca orders...');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    const orders = await alpacaAPI.getOrders(status, limit);
    
    console.log(`🦙 [API] Retrieved ${orders.length} orders from Alpaca`);
    
    return NextResponse.json({
      success: true,
      orders,
      count: orders.length
    });
    
  } catch (error) {
    console.error('🦙 [API] Error fetching Alpaca orders:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      orders: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🦙 [API] Placing Alpaca order...');
    
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.symbol || !orderData.side || !orderData.qty) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: symbol, side, qty'
      }, { status: 400 });
    }
    
    // Set defaults for AI trading
    const alpacaOrder = {
      symbol: orderData.symbol.toUpperCase(),
      qty: parseInt(orderData.qty),
      side: orderData.side,
      type: orderData.type || 'market',
      time_in_force: orderData.time_in_force || 'day',
      extended_hours: orderData.extended_hours || false,
      client_order_id: orderData.client_order_id || `ai_${Date.now()}`
    };
    
    console.log('🦙 [API] Placing order with Alpaca:', alpacaOrder);
    
    // Check if asset is tradable first
    const assetCheck = await alpacaAPI.isAssetTradable(alpacaOrder.symbol);
    if (!assetCheck.tradable) {
      console.error(`🦙 [API] Asset ${alpacaOrder.symbol} is not tradable:`, assetCheck.reasons);
      return NextResponse.json({
        success: false,
        error: `Asset ${alpacaOrder.symbol} is not tradable: ${assetCheck.reasons.join(', ')}`,
        asset_check: assetCheck
      }, { status: 400 });
    }
    
    // Place the order with Alpaca
    const order = await alpacaAPI.placeOrder(alpacaOrder);
    
    console.log('🦙 [API] Order placed successfully:', order.id);
    
    return NextResponse.json({
      success: true,
      order,
      message: `Order placed: ${order.side} ${order.qty} ${order.symbol}`,
      id: order.id
    });
    
  } catch (error) {
    console.error('🦙 [API] Error placing Alpaca order:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🦙 [API] Canceling Alpaca orders...');
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const cancelAll = searchParams.get('all') === 'true';
    
    if (cancelAll) {
      console.log('🦙 [API] Canceling ALL orders...');
      const canceledOrders = await alpacaAPI.cancelAllOrders();
      
      return NextResponse.json({
        success: true,
        message: `Canceled ${canceledOrders.length} orders`,
        canceled_orders: canceledOrders
      });
    } else if (orderId) {
      console.log(`🦙 [API] Canceling order ${orderId}...`);
      await alpacaAPI.cancelOrder(orderId);
      
      return NextResponse.json({
        success: true,
        message: `Order ${orderId} canceled`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Must specify order ID or use ?all=true to cancel all orders'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('🦙 [API] Error canceling Alpaca orders:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
