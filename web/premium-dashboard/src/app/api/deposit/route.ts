// API route for secure deposit processing
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const { amount } = await req.json();

    // Validate input
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount' },
        { status: 400 }
      );
    }

    // Neural Core Protection: Enforce $300 limit
    const MAX_DEPOSIT = 300;
    const MIN_DEPOSIT = 10;

    if (amount < MIN_DEPOSIT) {
      return NextResponse.json(
        { error: `Minimum deposit is $${MIN_DEPOSIT}` },
        { status: 400 }
      );
    }

    if (amount > MAX_DEPOSIT) {
      return NextResponse.json(
        { error: `Maximum deposit is $${MAX_DEPOSIT} (Neural Core Protection)` },
        { status: 400 }
      );
    }

    // TODO: In production, implement:
    // 1. Load user's current total deposits from database
    // 2. Validate against total deposit limit
    // 3. Process payment via payment processor (Stripe, PayPal, etc.)
    // 4. Update user's account balance in database
    // 5. Log transaction for audit trail

    // Simulated success response
    const response = {
      success: true,
      amount,
      newBalance: 1000 + amount, // Simulated new balance
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: `Successfully deposited $${amount.toFixed(2)}`
    };

    // Log successful deposit
    console.log(`💰 Deposit processed for user ${session.user.email}: $${amount}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Deposit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get deposit limits for authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // TODO: In production, load from database
    const limits = {
      maxSingleDeposit: 300,
      maxTotalDeposit: 300,
      currentTotal: 0, // Load from database
      remainingLimit: 300, // Calculate: maxTotalDeposit - currentTotal
      minDeposit: 10
    };

    return NextResponse.json(limits);

  } catch (error) {
    console.error('Get deposit limits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}