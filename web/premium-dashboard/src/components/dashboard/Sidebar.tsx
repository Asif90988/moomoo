'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Briefcase, 
  Brain, 
  Bot, 
  Shield, 
  Settings, 
  History, 
  BarChart3, 
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Globe,
  Server,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  Database,
  TrendingDown
} from 'lucide-react';
import { useTradingStore } from '@/stores/trading-store';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { activePanel, setActivePanel } = useTradingStore();

  const navigation = [
    { id: 'trading', name: 'Trading', icon: TrendingUp, color: 'neon-blue' },
    { id: 'portfolio', name: 'Portfolio', icon: Briefcase, color: 'neon-green' },
    { id: 'ai-thoughts', name: '🧠 AI Thoughts Live', icon: Brain, color: 'neon-purple' },
    { id: 'trust-metrics', name: '🏆 Trust & Truth', icon: Shield, color: 'neon-pink' },
    { id: 'ai-brain', name: 'AI Brain Process', icon: Brain, color: 'neon-purple' },
    
    // New ML Features
    { id: 'ml-predictions', name: '🤖 ML Predictions', icon: Target, color: 'neon-cyan', badge: 'NEW' },
    { id: 'ensemble-engine', name: '⚡ Ensemble AI', icon: Zap, color: 'neon-yellow', badge: 'PRO' },
    { id: 'portfolio-optimizer', name: '🎯 Portfolio Optimizer', icon: TrendingUp, color: 'neon-green', badge: 'NEW' },
    { id: 'risk-management', name: '🛡️ Risk Manager', icon: AlertTriangle, color: 'neon-red', badge: 'LIVE' },
    { id: 'alternative-data', name: '📊 Alternative Data', icon: Database, color: 'neon-purple', badge: 'BETA' },
    
    // Existing features
    { id: 'ai-agents', name: 'AI Agents', icon: Bot, color: 'neon-pink' },
    { id: 'risk', name: 'Risk Management', icon: Shield, color: 'neon-orange' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'neon-cyan' },
    { id: 'history', name: 'Trade History', icon: History, color: 'neon-yellow' },
    { id: 'news', name: 'News', icon: Newspaper, color: 'neon-green' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'gray-400' },
  ];

  const globalMarkets = [
    { code: 'HKEX', name: 'Hong Kong', permission: 'LV1', isOpen: true },
    { code: 'HKOPT', name: 'HK Options', permission: 'LV1', isOpen: true },
    { code: 'NYSE', name: 'US Stocks', permission: 'No Authority', isOpen: false },
    { code: 'USOPT', name: 'US Options', permission: 'LV1', isOpen: false },
  ];

  return (
    <div className="h-full glass border-r border-neural-border flex flex-col">
      {/* Collapse Toggle */}
      <div className="p-3 border-b border-neural-border">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          return (
            <motion.button
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg border transition-all duration-200 group ${
                isActive
                  ? `bg-gradient-to-r from-${item.color}/20 to-${item.color}/10 border-${item.color}/40 text-${item.color}`
                  : 'hover:bg-white/5 border-transparent text-gray-300 hover:text-white'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? `text-${item.color}` : 'group-hover:scale-110'} transition-transform`} />
              {!collapsed && (
                <>
                  <span className="font-medium text-sm">{item.name}</span>
                  {(item as any).badge && (
                    <span className={`ml-auto px-1.5 py-0.5 text-xs rounded-full font-bold ${
                      (item as any).badge === 'NEW' ? 'bg-neon-green/20 text-neon-green border border-neon-green/40' :
                      (item as any).badge === 'PRO' ? 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/40' :
                      (item as any).badge === 'LIVE' ? 'bg-neon-red/20 text-neon-red border border-neon-red/40' :
                      (item as any).badge === 'BETA' ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {(item as any).badge}
                    </span>
                  )}
                  {isActive && !(item as any).badge && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={`ml-auto w-2 h-2 bg-${item.color} rounded-full`}
                    />
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </nav>

      {!collapsed && (
        <>
          {/* Global Markets Status */}
          <div className="p-3 border-t border-neural-border">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass rounded-lg border border-neon-blue/20 p-3"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Globe className="w-4 h-4 text-neon-blue" />
                <span className="font-semibold text-neon-blue text-sm">Global Markets</span>
              </div>
              <div className="space-y-2">
                {globalMarkets.map((market) => (
                  <div key={market.code} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        market.isOpen ? 'bg-neon-green animate-pulse' : 'bg-red-400'
                      }`} />
                      <span className="text-white font-medium">{market.name}</span>
                    </div>
                    <span className={`text-xs ${
                      market.permission === 'LV1' ? 'text-neon-green' : 
                      market.permission === 'No Authority' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {market.permission}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* AI Status Panel */}
          <div className="p-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass rounded-lg border border-neon-purple/20 p-3"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-4 h-4 text-neon-purple" />
                <span className="font-semibold text-neon-purple text-sm">AI Engine</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Neural Networks</span>
                  <span className="text-neon-green">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pattern Recognition</span>
                  <span className="text-neon-green">Learning</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Analysis</span>
                  <span className="text-neon-blue">Monitoring</span>
                </div>
                
                {/* AI Confidence Bar */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-xs">AI Confidence</span>
                    <span className="text-neon-purple text-xs font-mono">87%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '87%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Moomoo OpenD Status */}
          <div className="p-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass rounded-lg border border-neon-orange/20 p-3"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Server className="w-4 h-4 text-neon-orange" />
                <span className="font-semibold text-neon-orange text-sm">moomoo OpenD</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <span className="text-white font-mono">9.3.5308</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API Server</span>
                  <span className="text-neon-green font-mono">127.0.0.1:11111</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account</span>
                  <span className="text-neon-blue font-mono">71456526</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quote Quota</span>
                  <span className="text-white font-mono">300/300</span>
                </div>
                
                {/* Connection Status */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600/30">
                  <span className="text-gray-400">Status</span>
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-neon-green animate-pulse" />
                    <span className="text-neon-green text-xs">Connected</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
