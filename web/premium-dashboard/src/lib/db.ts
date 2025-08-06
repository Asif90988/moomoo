// Database client for Neural Core Alpha-7
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

// Database helper functions for Neural Core Alpha-7

// User management
export const getUserWithAccounts = async (userId: string) => {
  return await db.user.findUnique({
    where: { id: userId },
    include: {
      tradingAccounts: true,
      deposits: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
};

// Trading account management
export const createTradingAccount = async (userId: string, accountType: 'PAPER' | 'LIVE') => {
  return await db.tradingAccount.create({
    data: {
      userId,
      accountType,
      balance: accountType === 'PAPER' ? 1000.00 : 0.00, // $1000 paper money
      buyingPower: accountType === 'PAPER' ? 1000.00 : 0.00
    }
  });
};

// Deposit management with Neural Core protection
export const validateAndCreateDeposit = async (userId: string, amount: number) => {
  // Get user's current total deposits
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      deposits: {
        where: { status: 'COMPLETED' }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const totalDeposited = user.deposits.reduce((sum: number, deposit: any) => sum + deposit.amount, 0);
  const maxDeposit = user.maxDepositLimit;

  // Neural Core Protection validations
  if (amount <= 0) {
    throw new Error('Deposit amount must be positive');
  }

  if (amount > maxDeposit) {
    throw new Error(`Single deposit cannot exceed $${maxDeposit} (Neural Core Protection)`);
  }

  if (totalDeposited + amount > maxDeposit) {
    throw new Error(`Total deposits cannot exceed $${maxDeposit} (Neural Core Protection)`);
  }

  if (amount < 10) {
    throw new Error('Minimum deposit is $10');
  }

  // Create deposit record
  const deposit = await db.deposit.create({
    data: {
      userId,
      amount,
      status: 'PENDING',
      transactionId: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  });

  return deposit;
};

// Complete deposit and update account balance
export const completeDeposit = async (depositId: string) => {
  return await db.$transaction(async (tx: any) => {
    // Get deposit
    const deposit = await tx.deposit.findUnique({
      where: { id: depositId },
      include: { user: true }
    });

    if (!deposit) {
      throw new Error('Deposit not found');
    }

    if (deposit.status !== 'PENDING') {
      throw new Error('Deposit already processed');
    }

    // Update deposit status
    await tx.deposit.update({
      where: { id: depositId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date()
      }
    });

    // Update user's total deposited amount
    await tx.user.update({
      where: { id: deposit.userId },
      data: {
        totalDeposited: {
          increment: deposit.amount
        }
      }
    });

    // Update trading account balance
    const tradingAccount = await tx.tradingAccount.findFirst({
      where: { userId: deposit.userId, isActive: true }
    });

    if (tradingAccount) {
      await tx.tradingAccount.update({
        where: { id: tradingAccount.id },
        data: {
          balance: {
            increment: deposit.amount
          },
          buyingPower: {
            increment: deposit.amount
          }
        }
      });
    }

    return deposit;
  });
};

// AI interaction logging
export const logAIInteraction = async (data: {
  userId: string;
  interactionType: 'THOUGHT' | 'DECISION' | 'ANALYSIS' | 'LEARNING' | 'RISK_ASSESSMENT' | 'PATTERN_RECOGNITION';
  aiAgent: string;
  thoughtType: string;
  message: string;
  confidence: number;
  reasoning?: string[];
  supportingData?: any;
  symbols?: string[];
  tags?: string[];
  impactLevel?: string;
  educational?: boolean;
}) => {
  return await db.aIInteraction.create({
    data: {
      userId: data.userId,
      interactionType: data.interactionType,
      aiAgent: data.aiAgent,
      thoughtType: data.thoughtType,
      message: data.message,
      confidence: data.confidence,
      reasoning: data.reasoning || [],
      supportingData: data.supportingData,
      symbols: data.symbols || [],
      tags: data.tags || [],
      impactLevel: data.impactLevel || 'Medium',
      educational: data.educational || false
    }
  });
};

// Order management
export const createOrder = async (data: {
  userId: string;
  tradingAccountId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK' | 'DAY';
}) => {
  return await db.order.create({
    data: {
      userId: data.userId,
      tradingAccountId: data.tradingAccountId,
      symbol: data.symbol,
      side: data.side,
      type: data.type,
      quantity: data.quantity,
      price: data.price,
      stopPrice: data.stopPrice,
      timeInForce: data.timeInForce || 'GTC',
      remaining: data.quantity,
      status: 'PENDING'
    }
  });
};

// Portfolio management
export const updatePosition = async (tradingAccountId: string, symbol: string, data: {
  quantity: number;
  avgCost: number;
  marketValue: number;
  unrealizedPnl: number;
}) => {
  return await db.position.upsert({
    where: {
      tradingAccountId_symbol: {
        tradingAccountId,
        symbol
      }
    },
    update: {
      quantity: data.quantity,
      avgCost: data.avgCost,
      marketValue: data.marketValue,
      unrealizedPnl: data.unrealizedPnl,
      lastUpdate: new Date()
    },
    create: {
      tradingAccountId,
      symbol,
      quantity: data.quantity,
      avgCost: data.avgCost,
      marketValue: data.marketValue,
      unrealizedPnl: data.unrealizedPnl
    }
  });
};

// Market data caching
export const updateMarketData = async (symbol: string, data: {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: bigint;
  marketCap?: bigint;
  high24h: number;
  low24h: number;
}) => {
  return await db.marketData.upsert({
    where: { symbol },
    update: {
      ...data,
      lastUpdate: new Date()
    },
    create: {
      id: `market_${symbol}_${Date.now()}`,
      symbol,
      ...data
    }
  });
};

// System configuration
export const getSystemConfig = async (key: string) => {
  const config = await db.systemConfig.findUnique({
    where: { key }
  });
  return config?.value;
};

export const setSystemConfig = async (key: string, value: string, description?: string) => {
  return await db.systemConfig.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description }
  });
};

// Clean up old data
export const cleanupOldData = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Clean up old AI interactions (keep last 30 days)
  await db.aIInteraction.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo
      }
    }
  });

  // Clean up old market data (keep last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await db.marketData.deleteMany({
    where: {
      lastUpdate: {
        lt: sevenDaysAgo
      }
    }
  });
};