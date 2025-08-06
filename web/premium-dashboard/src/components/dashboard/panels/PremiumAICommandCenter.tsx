'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with no SSR to prevent hydration errors
const PremiumAICommandCenterClient = dynamic(
  () => import('./PremiumAICommandCenter.client'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Neural Core Alpha-7
          </h2>
          <p className="text-gray-300 text-lg mb-2">🚀 Quantum-Enhanced AI Trading Command Center</p>
          <p className="text-gray-400">Initializing advanced neural networks...</p>
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    )
  }
);

const PremiumAICommandCenter: React.FC = () => {
  console.log('🎨 Premium AI Command Center wrapper loading...');
  return <PremiumAICommandCenterClient />;
};

export default PremiumAICommandCenter;