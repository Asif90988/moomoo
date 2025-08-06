'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  Wallet,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import { multiBrokerService, BrokerStatus, UnifiedAccount, UnifiedPosition, UnifiedOrder, BrokerType } from '@/services/multi-broker-service';

interface MultiBrokerPanelProps {
  className?: string;
}

export default function MultiBrokerPanel({ className }: MultiBrokerPanelProps) {
  const [brokerStatuses, setBrokerStatuses] = useState<BrokerStatus[]>([]);
  const [accounts, setAccounts] = useState<UnifiedAccount[]>([]);
  const [positions, setPositions] = useState<UnifiedPosition[]>([]);
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [primaryBroker, setPrimaryBroker] = useState<BrokerType>('alpaca');
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'orders' | 'accounts'>('overview');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      
      const [statusesData, accountsData, positionsData, ordersData, summaryData] = await Promise.all([
        multiBrokerService.getAllBrokerStatuses(),
        multiBrokerService.getAllAccounts(),
        multiBrokerService.getAllPositions(),
        multiBrokerService.getAllOrders(),
        multiBrokerService.getPortfolioSummary()
      ]);

      setBrokerStatuses(statusesData);
      setAccounts(accountsData);
      setPositions(positionsData);
      setOrders(ordersData);
      setPortfolioSummary(summaryData);
      setPrimaryBroker(multiBrokerService.getPrimaryBroker());
      
    } catch (error) {
      console.error('Failed to load multi-broker data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSetPrimaryBroker = async (broker: BrokerType) => {
    try {
      multiBrokerService.setPrimaryBroker(broker);
      setPrimaryBroker(broker);
      await loadData();
    } catch (error) {
      console.error('Failed to set primary broker:', error);
    }
  };

  const getBrokerIcon = (broker: BrokerType) => {
    switch (broker) {
      case 'alpaca':
        return '🦙';
      case 'moomoo':
        return '🐄';
      case 'binance-testnet':
        return '₿';
      default:
        return '📊';
    }
  };

  const getBrokerColor = (broker: BrokerType) => {
    switch (broker) {
      case 'alpaca':
        return 'from-neon-yellow to-neon-orange';
      case 'moomoo':
        return 'from-neon-blue to-neon-purple';
      case 'binance-testnet':
        return 'from-neon-orange to-neon-pink';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (connected: boolean, configured: boolean) => {
    if (connected && configured) return <CheckCircle className="h-4 w-4 text-neon-green" />;
    if (configured && !connected) return <AlertCircle className="h-4 w-4 text-neon-yellow" />;
    return <XCircle className="h-4 w-4 text-neon-red" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className={`h-full overflow-y-auto p-4 ${className}`}>
        <div className="glass border border-neural-border/30 rounded-lg p-6">
          <div className="flex items-center justify-center h-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="h-8 w-8 text-neon-blue" />
            </motion.div>
            <span className="ml-3 text-neon-blue font-medium">Loading multi-broker data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto p-4 space-y-6 ${className}`}>
      {/* Header */}
      <div className="glass border border-neural-border/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 flex items-center justify-center"
            >
              <BarChart3 className="w-6 h-6 text-neon-blue" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
                MULTI-BROKER COMMAND CENTER
              </h1>
              <p className="text-sm text-neon-blue font-mono">
                Active Brokers: {brokerStatuses.filter(s => s.connected).length} / {brokerStatuses.length}
              </p>
            </div>
          </div>
          
          <button
            onClick={loadData}
            disabled={refreshing}
            className="glass border border-neural-border/30 rounded-lg px-4 py-2 flex items-center space-x-2 hover:bg-neon-blue/10 transition-all"
          >
            <RefreshCw className={`h-4 w-4 text-neon-blue ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-neon-blue font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass border border-neural-border/30 rounded-lg p-1">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'positions', label: 'Positions', icon: Target },
            { id: 'orders', label: 'Orders', icon: Zap },
            { id: 'accounts', label: 'Accounts', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                  : 'text-gray-400 hover:text-neon-blue hover:bg-neon-blue/10'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Broker Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brokerStatuses.map((status, index) => (
              <motion.div
                key={status.broker}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass border border-neural-border/30 rounded-lg p-4 hover:bg-neon-blue/5 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getBrokerColor(status.broker)}/20 border border-neural-border/30 flex items-center justify-center`}>
                      <span className="text-2xl">{getBrokerIcon(status.broker)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white capitalize">{status.broker}</h3>
                      <p className="text-sm text-gray-400">{status.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status.connected, status.configured)}
                    {primaryBroker === status.broker && (
                      <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded-full border border-neon-green/30">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      status.connected 
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' 
                        : 'bg-neon-red/20 text-neon-red border border-neon-red/30'
                    }`}>
                      {status.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mode:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      status.paperTrading 
                        ? 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30' 
                        : 'bg-neon-red/20 text-neon-red border border-neon-red/30'
                    }`}>
                      {status.paperTrading ? 'Paper Trading' : 'Live Trading'}
                    </span>
                  </div>
                  {status.account && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Portfolio:</span>
                      <span className="font-mono text-neon-green">
                        {formatCurrency(status.account.portfolioValue)}
                      </span>
                    </div>
                  )}
                  {status.connected && status.broker !== primaryBroker && (
                    <button
                      onClick={() => handleSetPrimaryBroker(status.broker)}
                      className="w-full mt-3 glass border border-neural-border/30 rounded-lg px-3 py-2 text-sm text-neon-blue hover:bg-neon-blue/10 transition-all"
                    >
                      Set as Primary
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Portfolio Summary */}
          {portfolioSummary && (
            <div className="glass border border-neural-border/30 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <PieChart className="w-6 h-6 text-neon-purple" />
                <h2 className="text-xl font-bold text-neon-purple">PORTFOLIO SUMMARY</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-green mb-2">
                    {formatCurrency(portfolioSummary.totalValue)}
                  </div>
                  <div className="text-sm text-gray-400">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-blue mb-2">
                    {formatCurrency(portfolioSummary.totalCash)}
                  </div>
                  <div className="text-sm text-gray-400">Cash</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-purple mb-2">
                    {formatCurrency(portfolioSummary.totalEquity)}
                  </div>
                  <div className="text-sm text-gray-400">Equity</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    portfolioSummary.totalUnrealizedPL >= 0 ? 'text-neon-green' : 'text-neon-red'
                  }`}>
                    {formatCurrency(portfolioSummary.totalUnrealizedPL)}
                  </div>
                  <div className="text-sm text-gray-400">Unrealized P&L</div>
                </div>
              </div>
              
              {/* Broker Breakdown */}
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Broker Breakdown</h4>
                <div className="space-y-3">
                  {portfolioSummary.brokerBreakdown.map((broker: any, index: number) => (
                    <motion.div
                      key={broker.broker}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getBrokerColor(broker.broker)}`}></div>
                        <span className="capitalize font-medium text-white">{broker.broker}</span>
                        {broker.paperTrading && (
                          <span className="px-2 py-1 bg-neon-yellow/20 text-neon-yellow text-xs rounded-full border border-neon-yellow/30">
                            Paper
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neon-green">{formatCurrency(broker.value)}</div>
                        <div className="text-sm text-gray-400">
                          Cash: {formatCurrency(broker.cash)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="glass border border-neural-border/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Target className="w-6 h-6 text-neon-green" />
            <h2 className="text-xl font-bold text-neon-green">ALL POSITIONS</h2>
          </div>
          
          {positions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No positions found across all brokers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map((position, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-lg p-4 flex items-center justify-between hover:bg-neon-blue/5 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getBrokerIcon(position.broker)}</span>
                    <div>
                      <div className="font-bold text-white text-lg">{position.symbol}</div>
                      <div className="text-sm text-gray-400">
                        {position.quantity} shares • {position.side} • {position.broker}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-neon-blue text-lg">{formatCurrency(position.marketValue)}</div>
                    <div className={`text-sm font-mono ${
                      position.unrealizedPL >= 0 ? 'text-neon-green' : 'text-neon-red'
                    }`}>
                      {formatCurrency(position.unrealizedPL)} ({formatPercent(position.unrealizedPLPercent)})
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="glass border border-neural-border/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Zap className="w-6 h-6 text-neon-yellow" />
            <h2 className="text-xl font-bold text-neon-yellow">RECENT ORDERS</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No orders found across all brokers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 20).map((order, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-lg p-4 flex items-center justify-between hover:bg-neon-blue/5 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getBrokerIcon(order.broker)}</span>
                    <div>
                      <div className="font-bold text-white text-lg">{order.symbol}</div>
                      <div className="text-sm text-gray-400">
                        {order.side.toUpperCase()} {order.quantity} • {order.type.toUpperCase()} • {order.broker}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'filled' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' :
                      order.status === 'canceled' ? 'bg-neon-red/20 text-neon-red border border-neon-red/30' :
                      'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                    <div className="text-sm text-gray-400 mt-2 font-mono">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {accounts.length === 0 ? (
            <div className="glass border border-neural-border/30 rounded-lg p-12 text-center">
              <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No accounts found</p>
            </div>
          ) : (
            accounts.map((account, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass border border-neural-border/30 rounded-lg p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getBrokerColor(account.broker)}/20 border border-neural-border/30 flex items-center justify-center`}>
                    <span className="text-2xl">{getBrokerIcon(account.broker)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white capitalize">{account.broker} Account</h3>
                    {account.paperTrading && (
                      <span className="px-2 py-1 bg-neon-yellow/20 text-neon-yellow text-xs rounded-full border border-neon-yellow/30">
                        Paper Trading
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Account Number</div>
                    <div className="font-mono text-neon-blue">{account.accountNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Status</div>
                    <div className="font-medium text-neon-green">{account.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Currency</div>
                    <div className="font-medium text-white">{account.currency}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Buying Power</div>
                    <div className="font-mono text-neon-green">{formatCurrency(account.buyingPower)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Cash</div>
                    <div className="font-mono text-neon-blue">{formatCurrency(account.cash)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Portfolio Value</div>
                    <div className="font-mono text-neon-purple">{formatCurrency(account.portfolioValue)}</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
