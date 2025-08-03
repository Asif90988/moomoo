'use client';

import { motion } from 'framer-motion';
import { useTradingStore } from '@/stores/trading-store';
import { TradingPanel } from './panels/TradingPanel';
import { PortfolioPanel } from './panels/PortfolioPanel';
import { AIBrainPanel } from './panels/AIBrainPanel';
import AIBrainDashboard from '../ai/AIBrainDashboard';
import { AIAgentsPanel } from './panels/AIAgentsPanel';
import { RiskPanel } from './panels/RiskPanel';
import { AnalyticsPanel } from './panels/AnalyticsPanel';
import { HistoryPanel } from './panels/HistoryPanel';
import { NewsPanel } from './panels/NewsPanel';
import { SettingsPanel } from './panels/SettingsPanel';
import AIThoughtStream from '../ai/AIThoughtStream';
import EducationalInsights from '../ai/EducationalInsights';
import TrustIndicators from '../ai/TrustIndicators';
import RealisticPerformance from '../ai/RealisticPerformance';

// Import our new ML components
import MLPredictionsDashboard from '../ml/MLPredictionsDashboard';
import EnsembleEngineDashboard from '../ml/EnsembleEngineDashboard';
import PortfolioOptimizerDashboard from '../ml/PortfolioOptimizerDashboard';
import RiskManagementDashboard from '../ml/RiskManagementDashboard';
import AlternativeDataDashboard from '../ml/AlternativeDataDashboard';

interface MainContentProps {
  layout: 'compact' | 'standard' | 'wide';
}

export function MainContent({ layout }: MainContentProps) {
  const { activePanel } = useTradingStore();

  const renderPanel = () => {
    switch (activePanel) {
      case 'trading':
        return <TradingPanel />;
      case 'portfolio':
        return <PortfolioPanel />;
      case 'ai-brain':
        return <AIBrainDashboard />;
      case 'ai-agents':
        return <AIAgentsPanel />;
      case 'ai-thoughts':
        return (
          <div className="space-y-6 h-full overflow-y-auto">
            {/* Prominent Header */}
            <div className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    🚀 AI THOUGHT STREAM - LIVE TRANSPARENCY
                  </h1>
                  <p className="text-gray-300 text-lg">
                    <strong>THIS IS WHAT MAKES US DIFFERENT:</strong> See exactly what our AI is thinking, learning, and planning in real-time
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="bg-green-500/20 border border-green-500/40 rounded px-3 py-1">
                      <span className="text-green-400 text-sm font-medium">✓ 100% Transparent</span>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500/40 rounded px-3 py-1">
                      <span className="text-blue-400 text-sm font-medium">✓ Real-time Updates</span>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500/40 rounded px-3 py-1">
                      <span className="text-purple-400 text-sm font-medium">✓ Educational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AIThoughtStream className="h-full" />
              <EducationalInsights className="h-full" thoughts={[]} />
            </div>
          </div>
        );
      case 'trust-metrics':
        return (
          <div className="space-y-6 h-full overflow-y-auto">
            {/* Trust & Truth Header */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-yellow-500/30 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-green-500 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    🏆 TRUST & TRUTH METRICS
                  </h1>
                  <p className="text-gray-300 text-lg mb-3">
                    <strong>HONEST PERFORMANCE</strong> - Real 2-3% daily returns, $300 max deposit, complete transparency
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                      <div className="text-green-400 font-bold text-lg">✓ NO INFLATED PROMISES</div>
                      <div className="text-sm text-gray-300">Realistic 2-3% daily returns</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <TrustIndicators />
            <RealisticPerformance />
          </div>
        );
      
      // New ML Dashboard Cases
      case 'ml-predictions':
        return <MLPredictionsDashboard />;
      case 'ensemble-engine':
        return <div className="p-6 text-white">Ensemble Engine Dashboard - Coming Soon</div>;
      case 'portfolio-optimizer':
        return <PortfolioOptimizerDashboard />;
      case 'risk-management':
        return <RiskManagementDashboard />;
      case 'alternative-data':
        return <AlternativeDataDashboard />;
      
      // Existing cases
      case 'risk':
        return <RiskPanel />;
      case 'analytics':
        return <AnalyticsPanel />;
      case 'history':
        return <HistoryPanel />;
      case 'news':
        return <NewsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <TradingPanel />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Panel Content */}
      <motion.div
        key={activePanel}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`flex-1 ${
          layout === 'compact' ? 'p-2' : 
          layout === 'wide' ? 'p-6' : 'p-4'
        }`}
      >
        {renderPanel()}
      </motion.div>
    </div>
  );
}
