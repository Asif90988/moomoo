import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // This endpoint can be used to trigger a portfolio reset
    // The actual reset logic is handled client-side via the store
    
    return NextResponse.json({ 
      success: true,
      message: 'Portfolio reset signal sent',
      baseline: 300.00,
      timestamp: Date.now() 
    });
  } catch (error) {
    console.error('❌ Portfolio reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset portfolio' },
      { status: 500 }
    );
  }
}