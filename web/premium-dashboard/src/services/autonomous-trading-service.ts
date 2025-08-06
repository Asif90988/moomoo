// Autonomous Trading Service - Persistent AI Trading Engine
// This service runs independently of React component lifecycle
// Enhanced with IPCA ML Factor Model Integration
// UPDATED: Now uses Broker-Aware Trading Engine for rule isolation

import { useTradingStore } from '@/stores/trading-store';
import { brokerTradingEngine } from './broker-trading-engine';

interface AutoTrade {
  id: string;
  timestamp: Date;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  reason: string;
  confidence: number;
  profit?: number;
  broker: 'moomoo' | 'alpaca';
}

interface AIDecision {
  symbol: string;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  reasoning: string;
  targetPrice: number;
  stopLoss: number;
  positionSize: number;
  broker: 'moomoo' | 'alpaca';
}

class AutonomousTradingService {
  private static instance: AutonomousTradingService;

  private constructor() {
    console.log('🚀 Autonomous Trading Service initialized (Broker-Aware Engine)');
    console.log('📊 MooMoo: $300 limit | Alpaca: No limit | Future brokers: Custom rules');
  }

  public static getInstance(): AutonomousTradingService {
    if (!AutonomousTradingService.instance) {
      AutonomousTradingService.instance = new AutonomousTradingService();
    }
    return AutonomousTradingService.instance;
  }


  // Delegate to broker-aware trading engine
  public startMoomooTrading() {
    console.log('🏦 Starting MooMoo AI Trading (with $300 limit rules)');
    brokerTradingEngine.startMoomooTrading();
  }

  public startAlpacaTrading() {
    console.log('🦙 Starting Alpaca AI Trading (with no limit rules)');
    brokerTradingEngine.startAlpacaTrading();
  }

  public stopMoomooTrading() {
    console.log('🏦 Stopping MooMoo AI Trading');
    brokerTradingEngine.stopMoomooTrading();
  }

  public stopAlpacaTrading() {
    console.log('🦙 Stopping Alpaca AI Trading');
    brokerTradingEngine.stopAlpacaTrading();
  }

  // Delegate to broker-aware trading engine
  public getState() {
    return brokerTradingEngine.getState();
  }

  public updateMoomooPortfolio(portfolio: { value: number; trades: number; profit: number }) {
    // Legacy compatibility - broker engine handles this internally
    console.log('📊 MooMoo portfolio update delegated to broker engine');
  }

  public updateAlpacaPortfolio(portfolio: { value: number; trades: number; profit: number }) {
    // Legacy compatibility - broker engine handles this internally
    console.log('📊 Alpaca portfolio update delegated to broker engine');
  }

  public resetAll() {
    console.log('🔄 Resetting all brokers with their specific rules');
    brokerTradingEngine.resetAll();
  }
}

// Export singleton instance
export const autonomousTradingService = AutonomousTradingService.getInstance();
export default autonomousTradingService;
