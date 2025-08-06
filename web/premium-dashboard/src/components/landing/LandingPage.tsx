// Neural Core Alpha-7 - Premium Landing Page
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Brain, Target, Shield, TrendingUp, Database, Cpu, Users, ChevronDown } from 'lucide-react';
import CylindricalMarketDisplay from './CylindricalMarketDisplay';
import { useRouter } from 'next/navigation';

const LandingPage: React.FC = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleEnterPlatform = () => {
    // Since we're already on the main page, we'll redirect to dashboard
    window.location.href = '/dashboard';
  };

  const features = [
    {
      icon: Brain,
      title: 'AI Ensemble Engine',
      description: '7-model AI system with XGBoost, LSTM, Transformers, and more for unparalleled prediction accuracy.',
      color: 'neon-purple'
    },
    {
      icon: Target,
      title: 'Portfolio Optimization',
      description: 'Transaction cost-aware optimization using Almgren-Chriss execution algorithms.',
      color: 'neon-green'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Real-time VaR calculations, stress testing, and circuit breakers for ultimate protection.',
      color: 'neon-red'
    },
    {
      icon: Database,
      title: 'Alternative Data',
      description: 'Multi-source sentiment analysis from social media, news, and market indicators.',
      color: 'neon-blue'
    },
    {
      icon: Zap,
      title: 'Real-time Execution',
      description: 'Lightning-fast order execution with Moomoo integration and live market data.',
      color: 'neon-yellow'
    },
    {
      icon: Cpu,
      title: 'IPCA Factor Models',
      description: 'Advanced conditional factor analysis for sophisticated risk-adjusted returns.',
      color: 'neon-cyan'
    }
  ];

  const stats = [
    { value: '99.2%', label: 'Uptime', color: 'neon-green' },
    { value: '7ms', label: 'Latency', color: 'neon-blue' },
    { value: '91%', label: 'Win Rate', color: 'neon-purple' },
    { value: '$2.4B', label: 'Assets Managed', color: 'neon-yellow' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-neon-blue/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-radial from-neon-purple/3 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Brand Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 rounded-full">
                <Zap className="w-5 h-5 text-neon-yellow" />
                <span className="text-sm font-medium">Neural Core Alpha-7</span>
                <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded-full border border-neon-green/40">LIVE</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green bg-clip-text text-transparent">
                  Revolutionary
                </span>
                <br />
                <span className="text-white">AI Trading</span>
                <br />
                <span className="bg-gradient-to-r from-neon-green via-neon-yellow to-neon-red bg-clip-text text-transparent">
                  Platform
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                Experience institutional-grade AI-powered trading with our breakthrough 7-model ensemble engine, 
                real-time risk management, and sophisticated portfolio optimization.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={handleEnterPlatform}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-blue text-white font-semibold rounded-xl shadow-lg shadow-neon-blue/25 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Enter Platform</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-slate-800/50 border border-slate-600 hover:border-neon-green text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  View Demo
                </motion.button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`text-2xl font-bold text-${stat.color} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Right Content - Cylindrical Display */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 50 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              <CylindricalMarketDisplay />
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-slate-400" />
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="relative py-32 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                Cutting-Edge
              </span>{' '}
              <span className="text-white">Features</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Powered by institutional-grade algorithms and real-time market intelligence
            </p>
          </motion.div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/50 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${feature.color}/20 to-${feature.color}/5 border border-${feature.color}/30 flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-gradient-radial from-neon-purple/10 via-transparent to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-5xl lg:text-6xl font-bold">
              <span className="text-white">Ready to</span>{' '}
              <span className="bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              <span className="text-white">Your Trading?</span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Join the future of algorithmic trading with Neural Core Alpha-7. 
              Experience the power of AI-driven market intelligence.
            </p>
            
            <motion.button
              onClick={handleEnterPlatform}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple hover:from-neon-purple hover:via-neon-blue hover:to-neon-green text-white font-bold text-lg rounded-2xl shadow-2xl shadow-neon-blue/25 transition-all duration-500 flex items-center justify-center space-x-3 mx-auto"
            >
              <span>Launch Neural Core Alpha-7</span>
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;