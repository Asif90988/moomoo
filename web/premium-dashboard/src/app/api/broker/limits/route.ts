// Broker Trading Limits API
// Allows users to set custom trading limits per broker

import { NextRequest, NextResponse } from 'next/server';
import { 
  setUserTradingLimit, 
  getUserTradingLimit, 
  clearUserTradingLimit, 
  validateUserTradingLimit,
  getBrokerConfig,
  getActiveBrokers
} from '@/services/broker-configs';

interface SetLimitRequest {
  brokerId: string;
  limit: number;
  actualBalance: number;
}

interface ClearLimitRequest {
  brokerId: string;
}

// GET - Get current trading limits for all brokers
export async function GET() {
  try {
    const activeBrokers = getActiveBrokers();
    const limits: Record<string, any> = {};
    
    activeBrokers.forEach(broker => {
      const userLimit = getUserTradingLimit(broker.id);
      limits[broker.id] = {
        displayName: broker.displayName,
        currency: broker.currency,
        userDefinedLimit: userLimit,
        brokerMaxLimit: broker.rules.maxPortfolioValue,
        hasUserLimit: userLimit !== undefined
      };
    });
    
    return NextResponse.json({
      success: true,
      limits,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching trading limits:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch trading limits',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Set trading limit for a broker
export async function POST(request: NextRequest) {
  try {
    const body: SetLimitRequest = await request.json();
    const { brokerId, limit, actualBalance } = body;
    
    // Validate request
    if (!brokerId || typeof limit !== 'number' || typeof actualBalance !== 'number') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request - brokerId, limit, and actualBalance are required' 
        },
        { status: 400 }
      );
    }
    
    // Validate broker exists
    try {
      getBrokerConfig(brokerId);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid broker: ${brokerId}` 
        },
        { status: 400 }
      );
    }
    
    // Validate the proposed limit
    const validation = validateUserTradingLimit(brokerId, limit, actualBalance);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid trading limit',
          reason: validation.reason
        },
        { status: 400 }
      );
    }
    
    // Set the limit
    setUserTradingLimit(brokerId, limit);
    
    const config = getBrokerConfig(brokerId);
    
    return NextResponse.json({
      success: true,
      message: `Trading limit set for ${config.displayName}`,
      brokerId,
      limit,
      actualBalance,
      effectiveLimit: Math.min(limit, actualBalance),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error setting trading limit:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to set trading limit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Clear trading limit for a broker
export async function DELETE(request: NextRequest) {
  try {
    const body: ClearLimitRequest = await request.json();
    const { brokerId } = body;
    
    // Validate request
    if (!brokerId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'brokerId is required' 
        },
        { status: 400 }
      );
    }
    
    // Validate broker exists
    try {
      getBrokerConfig(brokerId);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid broker: ${brokerId}` 
        },
        { status: 400 }
      );
    }
    
    // Clear the limit
    clearUserTradingLimit(brokerId);
    
    const config = getBrokerConfig(brokerId);
    
    return NextResponse.json({
      success: true,
      message: `Trading limit cleared for ${config.displayName} - using full account balance`,
      brokerId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error clearing trading limit:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear trading limit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
