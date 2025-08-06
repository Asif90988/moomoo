import { NextRequest, NextResponse } from 'next/server';
import { pdtManager } from '@/services/pdt-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountEquity = searchParams.get('equity') ? parseFloat(searchParams.get('equity')!) : undefined;
    
    const status = pdtManager.getPDTStatus(accountEquity);
    
    return NextResponse.json({
      success: true,
      pdtStatus: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[PDT] Error getting PDT status:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, accountEquity } = body;
    
    switch (action) {
      case 'disable':
        pdtManager.disablePDTProtection();
        break;
        
      case 'enable':
        pdtManager.enablePDTProtection();
        break;
        
      case 'reset':
        pdtManager.resetDayTradeCount();
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: disable, enable, or reset'
        }, { status: 400 });
    }
    
    const status = pdtManager.getPDTStatus(accountEquity);
    
    return NextResponse.json({
      success: true,
      action: action,
      pdtStatus: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[PDT] Error managing PDT protection:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}