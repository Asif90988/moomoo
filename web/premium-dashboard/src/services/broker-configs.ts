// Broker Configuration System
// Each broker has its own isolated rules and constraints

export interface BrokerConfig {
  id: string;
  name: string;
  displayName: string;
  market: string;
  currency: string;
  
  // Trading Rules
  rules: {
    maxPortfolioValue: number;
    userDefinedCapital?: number; // User can set custom trading capital (overrides account balance)
    minTradeValue: number;
    maxTradeValue: number;
    maxPositionSize: number;
    maxDailyTrades: number;
    maxPositionsPerSymbol: number;
    allowedOrderTypes: string[];
    tradingHours: {
      start: string;
      end: string;
      timezone: string;
      tradingDays: string[];
    };
  };
  
  // Risk Management
  riskManagement: {
    maxDailyLoss: number;
    maxDrawdown: number;
    positionSizeLimit: number; // % of portfolio
    stopLossRequired: boolean;
    takeProfitRequired: boolean;
    maxLeverage: number;
  };
  
  // Symbols and Markets
  symbols: string[];
  symbolFormat: 'US' | 'HK' | 'CRYPTO' | 'FOREX';
  
  // API Configuration
  api: {
    baseUrl: string;
    endpoints: {
      orders: string;
      portfolio: string;
      positions: string;
      account: string;
    };
    rateLimit: {
      requestsPerSecond: number;
      burstLimit: number;
    };
  };
  
  // Trading Behavior
  behavior: {
    defaultConfidenceThreshold: number;
    tradingInterval: {
      min: number; // milliseconds
      max: number; // milliseconds
    };
    positionSizing: 'fixed' | 'percentage' | 'volatility_adjusted';
    defaultPositionSize: number;
  };
  
  // Simulation vs Live
  mode: 'simulation' | 'live' | 'paper';
  simulationConfig?: {
    initialBalance: number;
    slippageRate: number;
    commissionRate: number;
  };
}

// MooMoo Broker Configuration (Hong Kong Market)
export const MOOMOO_CONFIG: BrokerConfig = {
  id: 'moomoo',
  name: 'moomoo',
  displayName: 'MooMoo (Hong Kong)',
  market: 'HKEX',
  currency: 'HKD',
  
  rules: {
    maxPortfolioValue: 300.00, // $300 limit as specified
    minTradeValue: 10.00,
    maxTradeValue: 75.00, // 25% of max portfolio
    maxPositionSize: 10, // shares
    maxDailyTrades: 50,
    maxPositionsPerSymbol: 1,
    allowedOrderTypes: ['market', 'limit'],
    tradingHours: {
      start: '09:30:00',
      end: '16:00:00',
      timezone: 'Asia/Hong_Kong',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  },
  
  riskManagement: {
    maxDailyLoss: 30.00, // 10% of max portfolio
    maxDrawdown: 60.00, // 20% of max portfolio
    positionSizeLimit: 25, // 25% max per position
    stopLossRequired: false,
    takeProfitRequired: false,
    maxLeverage: 1.0 // No leverage
  },
  
  symbols: ['00700', '00941', '03690', '00388', '02318', '01299', '00883', '01024', '02269', '00175'],
  symbolFormat: 'HK',
  
  api: {
    baseUrl: 'http://127.0.0.1:11111',
    endpoints: {
      orders: '/api/moomoo/orders',
      portfolio: '/api/moomoo/portfolio',
      positions: '/api/moomoo/positions',
      account: '/api/moomoo/account'
    },
    rateLimit: {
      requestsPerSecond: 10,
      burstLimit: 20
    }
  },
  
  behavior: {
    defaultConfidenceThreshold: 65,
    tradingInterval: {
      min: 3000, // 3 seconds
      max: 8000  // 8 seconds
    },
    positionSizing: 'fixed',
    defaultPositionSize: 2
  },
  
  mode: 'simulation',
  simulationConfig: {
    initialBalance: 300.00,
    slippageRate: 0.001, // 0.1%
    commissionRate: 0.0025 // 0.25%
  }
};

// Alpaca Broker Configuration (US Market)
export const ALPACA_CONFIG: BrokerConfig = {
  id: 'alpaca',
  name: 'alpaca',
  displayName: 'Alpaca (US Market)',
  market: 'NYSE/NASDAQ',
  currency: 'USD',
  
  rules: {
    maxPortfolioValue: Number.MAX_SAFE_INTEGER, // No limit as specified
    minTradeValue: 1.00,
    maxTradeValue: Number.MAX_SAFE_INTEGER, // No limit
    maxPositionSize: Number.MAX_SAFE_INTEGER, // No limit
    maxDailyTrades: Number.MAX_SAFE_INTEGER, // No limit
    maxPositionsPerSymbol: Number.MAX_SAFE_INTEGER, // No limit
    allowedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    tradingHours: {
      start: '09:30:00',
      end: '16:00:00',
      timezone: 'America/New_York',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  },
  
  riskManagement: {
    maxDailyLoss: parseFloat(process.env.NEXT_PUBLIC_MAX_DAILY_LOSS || '100'), // 🛡️ USER-CONFIGURED DAILY LOSS LIMIT
    maxDrawdown: parseFloat(process.env.NEXT_PUBLIC_MAX_DAILY_LOSS || '100') * 3, // 3x daily loss limit
    positionSizeLimit: parseFloat(process.env.NEXT_PUBLIC_MAX_POSITION_SIZE || '10'), // 🛡️ USER-CONFIGURED POSITION SIZE %
    stopLossRequired: true, // 🛡️ ENFORCE STOP LOSSES IN LIVE TRADING
    takeProfitRequired: false,
    maxLeverage: 1.0 // 🛡️ NO LEVERAGE FOR LIVE TRADING SAFETY
  },
  
  symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC'],
  symbolFormat: 'US',
  
  api: {
    baseUrl: process.env.NEXT_PUBLIC_ALPACA_PAPER_TRADING === 'false' 
      ? 'https://api.alpaca.markets'  // 🔴 LIVE TRADING API
      : 'https://paper-api.alpaca.markets',
    endpoints: {
      orders: '/api/alpaca/orders',
      portfolio: '/api/alpaca/portfolio',
      positions: '/api/alpaca/positions',
      account: '/api/alpaca/account'
    },
    rateLimit: {
      requestsPerSecond: 200,
      burstLimit: 500
    }
  },
  
  behavior: {
    defaultConfidenceThreshold: 25, // Balanced threshold for ML predictions
    tradingInterval: {
      min: 3000, // 3 seconds
      max: 8000  // 8 seconds
    },
    positionSizing: 'percentage',
    defaultPositionSize: 5 // 5% of portfolio per trade
  },
  
  mode: process.env.NEXT_PUBLIC_ALPACA_PAPER_TRADING === 'false' ? 'live' : 'paper' // 🔴 DYNAMIC MODE BASED ON ENV
};

// Binance Testnet Configuration (Paper Trading)
export const BINANCE_TESTNET_CONFIG: BrokerConfig = {
  id: 'binance-testnet',
  name: 'binance-testnet',
  displayName: 'Binance Testnet (Crypto)',
  market: 'CRYPTO',
  currency: 'USDT',
  
  rules: {
    maxPortfolioValue: 2000.00, // Your preferred limit
    minTradeValue: 10.00,       // $10 minimum
    maxTradeValue: 400.00,      // 20% of portfolio max
    maxPositionSize: Number.MAX_SAFE_INTEGER, // No share limits in crypto
    maxDailyTrades: Number.MAX_SAFE_INTEGER,  // No PDT restrictions!
    maxPositionsPerSymbol: Number.MAX_SAFE_INTEGER,
    allowedOrderTypes: ['market', 'limit'],
    tradingHours: {
      start: '00:00:00',
      end: '23:59:59',
      timezone: 'UTC',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
  },
  
  riskManagement: {
    maxDailyLoss: 100.00, // 5% daily loss limit
    maxDrawdown: 200.00,  // 10% max drawdown
    positionSizeLimit: 20, // 20% max per position
    stopLossRequired: false,
    takeProfitRequired: false,
    maxLeverage: 1.0 // No leverage for safety
  },
  
  symbols: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'BNBUSDT'],
  symbolFormat: 'CRYPTO',
  
  api: {
    baseUrl: 'https://testnet.binance.vision',
    endpoints: {
      orders: '/api/binance/orders',
      portfolio: '/api/binance/portfolio',
      positions: '/api/binance/positions',
      account: '/api/binance/account'
    },
    rateLimit: {
      requestsPerSecond: 20,
      burstLimit: 50
    }
  },
  
  behavior: {
    defaultConfidenceThreshold: 75, // Higher for crypto volatility
    tradingInterval: {
      min: 2000, // 2 seconds (crypto is faster)
      max: 6000  // 6 seconds
    },
    positionSizing: 'volatility_adjusted',
    defaultPositionSize: 8 // 8% per trade (higher for crypto)
  },
  
  mode: 'paper' // Testnet mode
};

// Future Binance.US Configuration (Live Trading)
export const BINANCE_US_CONFIG: BrokerConfig = {
  id: 'binance-us',
  name: 'binance-us',
  displayName: 'Binance.US (Live Crypto)',
  market: 'CRYPTO',
  currency: 'USD',
  
  rules: {
    maxPortfolioValue: 2000.00, // Your preferred limit
    minTradeValue: 10.00,
    maxTradeValue: 400.00,
    maxPositionSize: Number.MAX_SAFE_INTEGER,
    maxDailyTrades: Number.MAX_SAFE_INTEGER,
    maxPositionsPerSymbol: Number.MAX_SAFE_INTEGER,
    allowedOrderTypes: ['market', 'limit'],
    tradingHours: {
      start: '00:00:00',
      end: '23:59:59',
      timezone: 'UTC',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
  },
  
  riskManagement: {
    maxDailyLoss: 100.00,
    maxDrawdown: 200.00,
    positionSizeLimit: 20,
    stopLossRequired: false,
    takeProfitRequired: false,
    maxLeverage: 1.0
  },
  
  symbols: ['BTCUSD', 'ETHUSD', 'ADAUSD', 'DOTUSD', 'LINKUSD', 'BNBUSD'],
  symbolFormat: 'CRYPTO',
  
  api: {
    baseUrl: 'https://api.binance.us',
    endpoints: {
      orders: '/api/binance/orders',
      portfolio: '/api/binance/portfolio',
      positions: '/api/binance/positions',
      account: '/api/binance/account'
    },
    rateLimit: {
      requestsPerSecond: 20,
      burstLimit: 50
    }
  },
  
  behavior: {
    defaultConfidenceThreshold: 75,
    tradingInterval: {
      min: 2000,
      max: 6000
    },
    positionSizing: 'volatility_adjusted',
    defaultPositionSize: 8
  },
  
  mode: 'live' // Live trading (when ready)
};

// Broker Registry
export const BROKER_CONFIGS: Record<string, BrokerConfig> = {
  moomoo: MOOMOO_CONFIG,
  alpaca: ALPACA_CONFIG,
  'binance-testnet': BINANCE_TESTNET_CONFIG,
  'binance-us': BINANCE_US_CONFIG
};

// Helper functions
export function getBrokerConfig(brokerId: string): BrokerConfig {
  const config = BROKER_CONFIGS[brokerId];
  if (!config) {
    throw new Error(`Broker configuration not found for: ${brokerId}`);
  }
  return config;
}

export function getActiveBrokers(): BrokerConfig[] {
  return Object.values(BROKER_CONFIGS).filter(config => 
    config.id === 'moomoo' || config.id === 'alpaca' || config.id === 'binance-testnet'
  );
}

export function validateTradeAgainstRules(
  brokerId: string, 
  tradeValue: number, 
  positionSize: number,
  currentPortfolioValue: number,
  dailyTrades: number
): { valid: boolean; reason?: string } {
  const config = getBrokerConfig(brokerId);
  
  // Check portfolio limit
  if (currentPortfolioValue > config.rules.maxPortfolioValue) {
    return { valid: false, reason: `Portfolio value exceeds ${config.displayName} limit of $${config.rules.maxPortfolioValue}` };
  }
  
  // Check trade value limits
  if (tradeValue < config.rules.minTradeValue) {
    return { valid: false, reason: `Trade value below minimum of $${config.rules.minTradeValue}` };
  }
  
  if (tradeValue > config.rules.maxTradeValue) {
    return { valid: false, reason: `Trade value exceeds maximum of $${config.rules.maxTradeValue}` };
  }
  
  // Check position size
  if (positionSize > config.rules.maxPositionSize) {
    return { valid: false, reason: `Position size exceeds maximum of ${config.rules.maxPositionSize} shares` };
  }
  
  // Check daily trades
  if (dailyTrades >= config.rules.maxDailyTrades) {
    return { valid: false, reason: `Daily trade limit of ${config.rules.maxDailyTrades} reached` };
  }
  
  // Check position size as percentage of portfolio
  const positionPercentage = (tradeValue / currentPortfolioValue) * 100;
  if (positionPercentage > config.riskManagement.positionSizeLimit) {
    return { valid: false, reason: `Position size exceeds ${config.riskManagement.positionSizeLimit}% of portfolio limit` };
  }
  
  return { valid: true };
}

export function calculatePositionSize(
  brokerId: string,
  portfolioValue: number,
  stockPrice: number,
  confidence: number
): number {
  const config = getBrokerConfig(brokerId);
  
  // Use user-defined limit if set, otherwise use actual portfolio value
  const effectivePortfolioValue = getEffectiveTradingBalance(brokerId, portfolioValue);
  
  let baseSize: number;
  
  switch (config.behavior.positionSizing) {
    case 'fixed':
      baseSize = config.behavior.defaultPositionSize;
      break;
      
    case 'percentage':
      const percentageSize = (effectivePortfolioValue * config.behavior.defaultPositionSize / 100) / stockPrice;
      baseSize = Math.floor(percentageSize);
      break;
      
    case 'volatility_adjusted':
      // Adjust based on confidence (higher confidence = larger position)
      const confidenceMultiplier = confidence / 100;
      const volatilityAdjustedSize = (effectivePortfolioValue * config.behavior.defaultPositionSize / 100 * confidenceMultiplier) / stockPrice;
      baseSize = Math.floor(volatilityAdjustedSize);
      break;
      
    default:
      baseSize = config.behavior.defaultPositionSize;
  }
  
  // Apply broker-specific limits
  return Math.min(
    baseSize,
    config.rules.maxPositionSize,
    Math.floor(config.rules.maxTradeValue / stockPrice)
  );
}

// User-defined trading capital management
export function setUserTradingCapital(brokerId: string, capital: number): void {
  const config = getBrokerConfig(brokerId);
  config.rules.userDefinedCapital = capital;
  console.log(`💰 ${config.displayName} trading capital set to $${capital}`);
}

export function getUserTradingCapital(brokerId: string): number | undefined {
  const config = getBrokerConfig(brokerId);
  return config.rules.userDefinedCapital;
}

export function clearUserTradingCapital(brokerId: string): void {
  const config = getBrokerConfig(brokerId);
  config.rules.userDefinedCapital = undefined;
  console.log(`🔓 ${config.displayName} trading capital cleared - using account balance`);
}

export function getEffectiveTradingBalance(brokerId: string, actualBalance: number): number {
  const config = getBrokerConfig(brokerId);
  
  // If user has set custom capital, use that as the trading balance (ignore account balance)
  if (config.rules.userDefinedCapital !== undefined) {
    console.log(`📊 ${config.displayName} using user-defined capital: $${config.rules.userDefinedCapital} (account has $${actualBalance})`);
    return config.rules.userDefinedCapital;
  }
  
  // Otherwise use actual balance (subject to broker max limits)
  return Math.min(actualBalance, config.rules.maxPortfolioValue);
}

export function validateUserTradingCapital(brokerId: string, proposedCapital: number): { valid: boolean; reason?: string } {
  const config = getBrokerConfig(brokerId);
  
  // Check if capital is positive
  if (proposedCapital <= 0) {
    return { valid: false, reason: 'Trading capital must be greater than $0' };
  }
  
  // Check if capital exceeds broker maximum (only for brokers with limits like MooMoo)
  if (proposedCapital > config.rules.maxPortfolioValue && config.rules.maxPortfolioValue !== Number.MAX_SAFE_INTEGER) {
    return { valid: false, reason: `Trading capital ($${proposedCapital}) exceeds ${config.displayName} maximum of $${config.rules.maxPortfolioValue}` };
  }
  
  // Check minimum trade value
  if (proposedCapital < config.rules.minTradeValue * 2) {
    return { valid: false, reason: `Trading capital too low - minimum recommended: $${config.rules.minTradeValue * 2}` };
  }
  
  return { valid: true };
}

// Legacy function names for backward compatibility
export function setUserTradingLimit(brokerId: string, limit: number): void {
  setUserTradingCapital(brokerId, limit);
}

export function getUserTradingLimit(brokerId: string): number | undefined {
  return getUserTradingCapital(brokerId);
}

export function clearUserTradingLimit(brokerId: string): void {
  clearUserTradingCapital(brokerId);
}

export function validateUserTradingLimit(brokerId: string, proposedLimit: number, actualBalance: number): { valid: boolean; reason?: string } {
  return validateUserTradingCapital(brokerId, proposedLimit);
}
