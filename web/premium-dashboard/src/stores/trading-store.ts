// Trading Store - Zustand State Management for Neural Core Alpha-7
import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import type { 
  MarketData, 
  Portfolio, 
  Order, 
  Position, 
  AIInsight, 
  NewsItem, 
  SystemStatus,
  RiskMetrics,
  ChartData
} from '@/types/trading';

interface TradingState {
  // Market Data
  marketData: Map<string, MarketData>;
  watchlist: string[];
  selectedSymbol: string;
  
  // Portfolio & Trading
  portfolio: Portfolio | null;
  orders: Order[];
  positions: Position[];
  
  // AI & Insights
  aiInsights: AIInsight[];
  newsItems: NewsItem[];
  riskMetrics: RiskMetrics | null;
  
  // System Status
  systemStatus: SystemStatus | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  
  // Chart Data
  chartData: ChartData | null;
  selectedTimeframe: string;
  
  // UI State
  isLoading: boolean;
  activePanel: string;
  layout: 'compact' | 'standard' | 'wide';
  
  // Autonomous Trading State
  isAutonomousActive: boolean;
  autoTrades: any[];
  aiDecisions: any[];
  totalProfit: number;
  baselineValue: number; // Track the starting portfolio value
  
  // Actions
  setMarketData: (data: MarketData[]) => void;
  updateMarketData: (symbol: string, data: Partial<MarketData>) => void;
  setPortfolio: (portfolio: Portfolio) => void;
  updatePortfolioValue: (value: number) => void;
  resetPortfolioToBaseline: () => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  addAIInsight: (insight: AIInsight) => void;
  addNewsItem: (news: NewsItem) => void;
  setSystemStatus: (status: SystemStatus) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
  setSelectedSymbol: (symbol: string) => void;
  setChartData: (data: ChartData) => void;
  setSelectedTimeframe: (timeframe: string) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setActivePanel: (panel: string) => void;
  setLayout: (layout: 'compact' | 'standard' | 'wide') => void;
  clearData: () => void;
  
  // Autonomous Trading Actions
  setAutonomousActive: (active: boolean) => void;
  addAutoTrade: (trade: any) => void;
  addAiDecision: (decision: any) => void;
  updateTotalProfit: (profit: number) => void;
  updateTradeProfit: (tradeId: string, profit: number) => void;
  syncPortfolioWithAI: () => void;
  resetAutonomousState: () => void;
  updateBaselineValue: (value: number) => void;
}

export const useTradingStore = create<TradingState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial State
      marketData: new Map(),
      watchlist: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META'],
      selectedSymbol: 'AAPL',
      
      portfolio: null,
      orders: [],
      positions: [],
      
      aiInsights: [],
      newsItems: [],
      riskMetrics: null,
      
      systemStatus: null,
      connectionStatus: 'disconnected',
      
      chartData: null,
      selectedTimeframe: '1h',
      
      isLoading: false,
      activePanel: 'unified-ai-trading',
      layout: 'standard',
      
      // Autonomous Trading Initial State
      isAutonomousActive: true, // Enable autonomous trading by default
      autoTrades: [],
      aiDecisions: [],
      totalProfit: 0,
      baselineValue: parseFloat(process.env.NEXT_PUBLIC_INITIAL_DEPOSIT || '1000'), // 🔴 LIVE ACCOUNT VALUE
      
      // Actions
      setMarketData: (data: MarketData[]) => {
        const marketDataMap = new Map();
        data.forEach(item => {
          marketDataMap.set(item.symbol, item);
        });
        
        set({ marketData: marketDataMap });
      },
      
      updateMarketData: (symbol: string, data: Partial<MarketData>) => {
        const { marketData } = get();
        const existing = marketData.get(symbol);
        
        if (existing) {
          const updated = { ...existing, ...data, timestamp: Date.now() };
          const newMarketData = new Map(marketData);
          newMarketData.set(symbol, updated);
          set({ marketData: newMarketData });
        }
      },
      
      setPortfolio: (portfolio: Portfolio) => {
        console.log('🔄 Store: Setting portfolio to:', portfolio.totalValue);
        set({ 
          portfolio,
          positions: portfolio.positions,
          orders: portfolio.orders
        });
      },
      
      updatePortfolioValue: (value: number) => {
        const { portfolio } = get();
        if (portfolio) {
          console.log(`📊 Store: Updating portfolio value: $${portfolio.totalValue.toFixed(2)} → $${value.toFixed(2)}`);
          const updatedPortfolio: Portfolio = {
            ...portfolio,
            totalValue: value,
            cash: value - (portfolio.totalValue - portfolio.cash) // Maintain invested amount
          };
          set({ 
            portfolio: updatedPortfolio,
            positions: updatedPortfolio.positions,
            orders: updatedPortfolio.orders
          });
        }
      },
      
      resetPortfolioToBaseline: () => {
        console.log('🔄 Store: Resetting portfolio to $300 baseline');
        const baselinePortfolio: Portfolio = {
          totalValue: 300.00,
          cash: 300.00,
          buyingPower: 300.00,
          marginUsed: 0,
          marginAvailable: 300.00,
          dayPnl: 0.00,
          dayPnlPercent: 0.00,
          totalPnl: 0.00,
          totalPnlPercent: 0.00,
          positions: [],
          orders: []
        };
        set({ 
          portfolio: baselinePortfolio,
          positions: [],
          orders: []
        });
      },
      
      addOrder: (order: Order) => {
        const { orders } = get();
        set({ orders: [order, ...orders] });
      },
      
      updateOrder: (orderId: string, updates: Partial<Order>) => {
        const { orders } = get();
        const updatedOrders = orders.map(order =>
          order.id === orderId ? { ...order, ...updates } : order
        );
        set({ orders: updatedOrders });
      },
      
      removeOrder: (orderId: string) => {
        const { orders } = get();
        const filteredOrders = orders.filter(order => order.id !== orderId);
        set({ orders: filteredOrders });
      },
      
      addAIInsight: (insight: AIInsight) => {
        const { aiInsights } = get();
        // Keep latest 50 insights
        const newInsights = [insight, ...aiInsights.slice(0, 49)];
        set({ aiInsights: newInsights });
      },
      
      addNewsItem: (news: NewsItem) => {
        const { newsItems } = get();
        // Keep latest 20 news items
        const newNews = [news, ...newsItems.slice(0, 19)];
        set({ newsItems: newNews });
      },
      
      setSystemStatus: (systemStatus: SystemStatus) => {
        set({ systemStatus });
      },
      
      setConnectionStatus: (connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error') => {
        set({ connectionStatus });
      },
      
      setSelectedSymbol: (selectedSymbol: string) => {
        set({ selectedSymbol });
      },
      
      setChartData: (chartData: ChartData) => {
        set({ chartData });
      },
      
      setSelectedTimeframe: (selectedTimeframe: string) => {
        set({ selectedTimeframe });
      },
      
      addToWatchlist: (symbol: string) => {
        const { watchlist } = get();
        if (!watchlist.includes(symbol)) {
          set({ watchlist: [...watchlist, symbol] });
        }
      },
      
      removeFromWatchlist: (symbol: string) => {
        const { watchlist } = get();
        set({ watchlist: watchlist.filter(s => s !== symbol) });
      },
      
      setActivePanel: (activePanel: string) => {
        set({ activePanel });
      },
      
      setLayout: (layout: 'compact' | 'standard' | 'wide') => {
        set({ layout });
      },
      
      // Autonomous Trading Actions
      setAutonomousActive: (isAutonomousActive: boolean) => {
        set({ isAutonomousActive });
      },
      
      addAutoTrade: (trade: any) => {
        const { autoTrades } = get();
        set({ autoTrades: [trade, ...autoTrades.slice(0, 19)] }); // Keep last 20 trades
      },
      
      addAiDecision: (decision: any) => {
        const { aiDecisions } = get();
        set({ aiDecisions: [decision, ...aiDecisions.slice(0, 9)] }); // Keep last 10 decisions
      },
      
      updateTotalProfit: (profit: number) => {
        const { totalProfit } = get();
        set({ totalProfit: totalProfit + profit });
      },
      
      updateTradeProfit: (tradeId: string, profit: number) => {
        const { autoTrades } = get();
        const updatedTrades = autoTrades.map(trade => 
          trade.id === tradeId ? { ...trade, profit } : trade
        );
        set({ autoTrades: updatedTrades });
      },
      
      syncPortfolioWithAI: () => {
        const { baselineValue, totalProfit, portfolio, autoTrades } = get();
        
        // 🔧 FIX P&L CALCULATION - Calculate from actual trades
        const realizedProfit = autoTrades.reduce((sum, trade) => {
          return sum + (trade.profit || 0);
        }, 0);
        
        // Only show P&L if there are actual trades
        const displayPnL = autoTrades.length > 0 ? realizedProfit : 0;
        const correctValue = baselineValue + displayPnL;
        
        if (portfolio && (Math.abs(portfolio.totalValue - correctValue) > 0.01 || portfolio.totalPnl !== displayPnL)) {
          console.log(`🔄 SYNC: Portfolio was $${portfolio.totalValue.toFixed(2)}, correcting to $${correctValue.toFixed(2)} (baseline: $${baselineValue} + realized P&L: $${displayPnL.toFixed(2)} from ${autoTrades.length} trades)`);
          
          const correctedPortfolio = {
            ...portfolio,
            totalValue: correctValue,
            cash: correctValue - (portfolio.totalValue - portfolio.cash), // Maintain invested amount
            dayPnl: displayPnL,
            dayPnlPercent: displayPnL !== 0 ? (displayPnL / baselineValue) * 100 : 0,
            totalPnl: displayPnL,
            totalPnlPercent: displayPnL !== 0 ? (displayPnL / baselineValue) * 100 : 0
          };
          
          set({ 
            portfolio: correctedPortfolio,
            positions: correctedPortfolio.positions,
            orders: correctedPortfolio.orders,
            totalProfit: displayPnL // Keep totalProfit in sync
          });
        }
      },
      
      resetAutonomousState: () => {
        set({
          isAutonomousActive: false,
          autoTrades: [],
          aiDecisions: [],
          totalProfit: 0,
          baselineValue: 300.00
        });
      },
      
      updateBaselineValue: (value: number) => {
        console.log(`📊 Store: Updating baseline value to $${value.toFixed(2)}`);
        set({ baselineValue: value });
      },
      
      clearData: () => {
        set({
          marketData: new Map(),
          portfolio: null,
          orders: [],
          positions: [],
          aiInsights: [],
          newsItems: [],
          chartData: null,
          systemStatus: null,
          // Also clear autonomous state
          isAutonomousActive: false,
          autoTrades: [],
          aiDecisions: [],
          totalProfit: 0
        });
      }
    })),
    { name: 'trading-store' }
  )
);

// Selectors for optimized re-renders
export const useMarketData = () => useTradingStore(state => state.marketData);
export const useSelectedSymbol = () => useTradingStore(state => state.selectedSymbol);
export const usePortfolio = () => useTradingStore(state => state.portfolio);
export const useOrders = () => useTradingStore(state => state.orders);
export const usePositions = () => useTradingStore(state => state.positions);
export const useAIInsights = () => useTradingStore(state => state.aiInsights);
export const useNewsItems = () => useTradingStore(state => state.newsItems);
export const useSystemStatus = () => useTradingStore(state => state.systemStatus);
export const useConnectionStatus = () => useTradingStore(state => state.connectionStatus);
export const useChartData = () => useTradingStore(state => state.chartData);
export const useWatchlist = () => useTradingStore(state => state.watchlist);
export const useActivePanel = () => useTradingStore(state => state.activePanel);
export const useLayout = () => useTradingStore(state => state.layout);

// Computed selectors
export const useSelectedMarketData = () => {
  return useTradingStore(state => {
    const symbol = state.selectedSymbol;
    return state.marketData.get(symbol) || null;
  });
};

export const useWatchlistData = () => {
  return useTradingStore(state => {
    return state.watchlist.map(symbol => state.marketData.get(symbol)).filter(Boolean);
  });
};

export const usePortfolioValue = () => {
  return useTradingStore(state => state.portfolio?.totalValue || 0);
};

export const usePortfolioPnL = () => {
  return useTradingStore(state => ({
    totalPnl: state.portfolio?.totalPnl || 0,
    totalPnlPercent: state.portfolio?.totalPnlPercent || 0,
    dayPnl: state.portfolio?.dayPnl || 0,
    dayPnlPercent: state.portfolio?.dayPnlPercent || 0
  }));
};

export const useActiveOrders = () => {
  return useTradingStore(state => 
    state.orders.filter(order => 
      order.status === 'pending' || order.status === 'partially_filled'
    )
  );
};

export const useLatestAIInsights = (count: number = 5) => {
  return useTradingStore(state => state.aiInsights.slice(0, count));
};

export const useLatestNews = (count: number = 10) => {
  return useTradingStore(state => state.newsItems.slice(0, count));
};
