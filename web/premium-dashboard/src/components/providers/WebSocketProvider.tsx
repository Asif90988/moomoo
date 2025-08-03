'use client';

import { useEffect, ReactNode } from 'react';
import { useTradingStore } from '@/stores/trading-store';
// import { wsService } from '@/services/websocket'; // Disabled for development
import type { 
  MarketData, 
  Portfolio, 
  AIInsight, 
  NewsItem, 
  SystemStatus, 
  Order 
} from '@/types/trading';

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const {
    setMarketData,
    setPortfolio,
    addAIInsight,
    addNewsItem,
    setSystemStatus,
    setConnectionStatus,
    addOrder,
    updateOrder,
    watchlist
  } = useTradingStore();

  useEffect(() => {
    // Mock data for development - simulating a live trading environment
    console.log('🔧 Development Mode: Loading mock trading data...');
    
    // Set initial connection status
    setConnectionStatus('connecting');
    
    // Generate mock market data
    const generateMockMarketData = (): MarketData[] => {
      return watchlist.map(symbol => ({
        symbol,
        name: symbol === 'AAPL' ? 'Apple Inc.' : 
              symbol === 'GOOGL' ? 'Alphabet Inc.' : 
              symbol === 'MSFT' ? 'Microsoft Corp.' : 
              symbol === 'TSLA' ? 'Tesla Inc.' : 
              symbol === 'NVDA' ? 'NVIDIA Corp.' : 
              symbol === 'AMZN' ? 'Amazon.com Inc.' : 
              symbol === 'META' ? 'Meta Platforms Inc.' : `${symbol} Corp.`,
        price: 150 + Math.random() * 200,
        change: -10 + Math.random() * 20,
        changePercent: -5 + Math.random() * 10,
        volume: Math.floor(Math.random() * 10000000),
        exchange: 'NASDAQ',
        timestamp: Date.now()
      }));
    };

    // Generate mock portfolio
    const generateMockPortfolio = (): Portfolio => ({
      totalValue: 125000 + Math.random() * 50000,
      cash: 25000 + Math.random() * 10000,
      buyingPower: 50000 + Math.random() * 20000,
      marginUsed: 5000 + Math.random() * 3000,
      marginAvailable: 45000 + Math.random() * 17000,
      dayPnl: -1000 + Math.random() * 2000,
      dayPnlPercent: -2 + Math.random() * 4,
      totalPnl: 15000 + Math.random() * 10000,
      totalPnlPercent: 12 + Math.random() * 8,
      positions: [
        {
          id: '1',
          symbol: 'AAPL',
          quantity: 100,
          avgCost: 180.50,
          marketValue: 18525,
          pnl: 475,
          pnlPercent: 2.63,
          side: 'long' as const,
          openTime: Date.now() - 86400000,
          lastUpdate: Date.now()
        },
        {
          id: '2',
          symbol: 'TSLA',
          quantity: 50,
          avgCost: 220.00,
          marketValue: 10790,
          pnl: -210,
          pnlPercent: -1.91,
          side: 'long' as const,
          openTime: Date.now() - 172800000,
          lastUpdate: Date.now()
        }
      ],
      orders: []
    });

    // Set up mock data simulation
    const setupMockData = () => {
      setTimeout(() => {
        setConnectionStatus('connected');
        setMarketData(generateMockMarketData());
        setPortfolio(generateMockPortfolio());
        
        // Add mock AI insights
        addAIInsight({
          id: Date.now().toString(),
          type: 'trade_signal',
          symbol: 'AAPL',
          title: 'Bullish Momentum Signal',
          description: 'Strong bullish momentum detected in AAPL - RSI oversold, volume increasing',
          confidence: 0.85,
          impact: 'high',
          timestamp: Date.now(),
          actionable: true,
          tags: ['technical-analysis', 'momentum', 'oversold'],
          suggestedAction: {
            type: 'buy',
            quantity: 100,
            price: 185.25,
            reasoning: 'RSI oversold condition with increasing volume suggests bullish reversal'
          }
        });

        // Add mock news
        addNewsItem({
          id: Date.now().toString(),
          title: 'Market Shows Strong Recovery Signals',
          summary: 'Technical indicators suggest upward momentum building across tech stocks',
          source: 'Neural Trading AI',
          timestamp: Date.now(),
          impact: 'high',
          symbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'],
          sentiment: 'bullish'
        });

        // Add mock system status
        setSystemStatus({
          tradingEngine: 'online',
          marketData: 'connected',
          aiEngine: 'active',
          riskManager: 'monitoring',
          orderExecution: 'ready',
          lastUpdate: Date.now(),
          latency: {
            marketData: 0.8,
            orderExecution: 1.2,
            aiProcessing: 2.5
          }
        });
      }, 1500);

      // Update market data every 2 seconds
      const marketDataInterval = setInterval(() => {
        setMarketData(generateMockMarketData());
      }, 2000);

      // Add periodic AI insights
      const insightInterval = setInterval(() => {
        const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA'];
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        const insights = [
          'Technical breakout pattern forming',
          'Volume spike detected - institutional activity',
          'RSI divergence suggests reversal incoming',
          'Support level holding strong - bullish signal',
          'Options flow indicates smart money positioning'
        ];
        
        addAIInsight({
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'trade_signal' : 'risk_alert',
          symbol: randomSymbol,
          title: `${randomSymbol} Analysis`,
          description: insights[Math.floor(Math.random() * insights.length)],
          confidence: 0.6 + Math.random() * 0.4,
          impact: Math.random() > 0.6 ? 'high' : 'medium',
          timestamp: Date.now(),
          actionable: true,
          tags: ['ai-generated', 'real-time', 'market-analysis'],
          suggestedAction: {
            type: Math.random() > 0.5 ? 'buy' : 'sell',
            reasoning: 'AI analysis suggests this action based on current market conditions'
          }
        });
      }, 8000);

      return () => {
        clearInterval(marketDataInterval);
        clearInterval(insightInterval);
      };
    };

    const cleanup = setupMockData();
    return cleanup;
    // Connection status handler
    const handleConnectionStatus = (status: any) => {
      setConnectionStatus(status.status);
    };

    // Market data handler
    const handleMarketData = (data: MarketData[]) => {
      setMarketData(data);
    };

    // Portfolio update handler
    const handlePortfolioUpdate = (portfolio: Portfolio) => {
      setPortfolio(portfolio);
    };

    // AI insight handler
    const handleAIInsight = (insight: AIInsight) => {
      addAIInsight(insight);
    };

    // News handler
    const handleNews = (news: NewsItem) => {
      addNewsItem(news);
    };

    // System status handler
    const handleSystemStatus = (status: SystemStatus) => {
      setSystemStatus(status);
    };

    // Order update handler
    const handleOrderUpdate = (order: Order) => {
      if (order.id) {
        updateOrder(order.id, order);
      } else {
        addOrder(order);
      }
    };

    // Register event listeners (disabled for development)
    // wsService.on('connection_status', handleConnectionStatus);
    // wsService.on('market_data', handleMarketData);
    // wsService.on('portfolio_update', handlePortfolioUpdate);
    // wsService.on('ai_insight', handleAIInsight);
    // wsService.on('news', handleNews);
    // wsService.on('system_status', handleSystemStatus);
    // wsService.on('order_update', handleOrderUpdate);

    // Subscribe to watchlist symbols (disabled for development)
    // if (watchlist.length > 0) {
    //   wsService.subscribeToMarketData(watchlist);
    // }

    // Cleanup function (disabled for development)
    return () => {
      // wsService.off('connection_status', handleConnectionStatus);
      // wsService.off('market_data', handleMarketData);
      // wsService.off('portfolio_update', handlePortfolioUpdate);
      // wsService.off('ai_insight', handleAIInsight);
      // wsService.off('news', handleNews);
      // wsService.off('system_status', handleSystemStatus);
      // wsService.off('order_update', handleOrderUpdate);
    };
  }, [
    setMarketData,
    setPortfolio,
    addAIInsight,
    addNewsItem,
    setSystemStatus,
    setConnectionStatus,
    addOrder,
    updateOrder,
    watchlist
  ]);

  return <>{children}</>;
}