'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, ArrowRight, Brain, Target, Shield, Database, Sparkles, Star } from 'lucide-react';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple authentication check
    if (credentials.username === 'admin' && credentials.password === '3123') {
      // Store auth state in localStorage and cookies
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'administrator' }));
      
      // Set cookie for middleware
      document.cookie = 'isAuthenticated=true; path=/; max-age=86400'; // 24 hours
      
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Please check your username and password.');
    }
    
    setIsLoading(false);
  };

  const features = [
    { icon: Brain, title: 'AI Ensemble Engine', description: '7-model AI system with XGBoost, LSTM, Transformers.', color: 'purple-400' },
    { icon: Target, title: 'Portfolio Optimization', description: 'Transaction cost-aware optimization algorithms.', color: 'emerald-400' },
    { icon: Shield, title: 'Risk Management', description: 'Real-time VaR calculations and circuit breakers.', color: 'rose-400' },
    { icon: Database, title: 'Alternative Data', description: 'Multi-source sentiment analysis integration.', color: 'blue-400' }
  ];

  const stats = [
    { value: '99.2%', label: 'Uptime', color: 'emerald-400' },
    { value: '7ms', label: 'Latency', color: 'blue-400' },
    { value: '91%', label: 'Win Rate', color: 'purple-400' },
    { value: '$2.4B', label: 'Assets', color: 'amber-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 flex">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        {mounted && (
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Left Side - Compact Landing Content */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
        <div className="relative z-10 flex flex-col justify-center px-6 xl:px-12 py-6 h-screen overflow-y-auto">
          {/* Brand Badge - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-full mb-6 w-fit backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Neural Core Alpha-7</span>
            <motion.span 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-400/40 font-bold"
            >
              LIVE
            </motion.span>
          </motion.div>
          
          {/* Main Headline - Compact */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl xl:text-4xl font-bold leading-tight mb-4"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Revolutionary
            </span>
            <br />
            <span className="text-white">AI Trading</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Platform
            </span>
          </motion.h1>
          
          {/* Subtitle - Compact */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base text-slate-300 leading-relaxed mb-6 max-w-lg"
          >
            Experience institutional-grade AI-powered trading with our breakthrough 7-model ensemble engine, 
            real-time risk management, and sophisticated portfolio optimization.
          </motion.p>
          
          {/* Stats - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label} 
                className="text-center group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`text-xl font-bold text-${stat.color} mb-1 group-hover:text-white transition-colors`}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Features Grid - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-lg p-3 hover:border-purple-400/30 transition-all duration-300 group"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${feature.color}/20 to-${feature.color}/5 border border-${feature.color}/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-4 h-4 text-${feature.color}`} />
                </div>
                
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 text-xs leading-relaxed group-hover:text-slate-200 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Smart Login Panel */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col h-screen relative">
        {/* Background Effects for Mobile */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        {/* Main Content Container - Smart Layout */}
        <div className="flex-1 flex flex-col justify-center p-6 relative z-10 max-h-screen overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-sm mx-auto"
          >
            {/* Logo Section - Extra Compact */}
            <div className="text-center mb-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg mb-2 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Brain className="w-6 h-6 text-white relative z-10" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-2 border-purple-300/30 rounded-lg"
                />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg font-bold text-white mb-1"
              >
                Neural Core Alpha-7
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-purple-200 text-xs flex items-center justify-center gap-1"
              >
                <Star className="w-3 h-3 text-amber-400" />
                Advanced AI Trading System
                <Star className="w-3 h-3 text-amber-400" />
              </motion.p>
            </div>

            {/* Login Form - Much More Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-slate-800/60 backdrop-blur-xl rounded-lg p-4 shadow-2xl border border-slate-700/50 relative overflow-hidden mb-4"
            >
              {/* Form background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-lg"></div>
              
              <h2 className="text-lg font-semibold text-white mb-4 text-center relative">
                Welcome Back
                <div className="w-10 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto mt-1 rounded-full"></div>
              </h2>

              <form onSubmit={handleLogin} className="space-y-3 relative">
                {/* Username Field */}
                <div>
                  <label className="block text-xs font-medium text-purple-200 mb-1">
                    Username
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4 group-focus-within:text-purple-300 transition-colors" />
                    <input
                      type="text"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm"
                      placeholder="Enter your username"
                      required
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-medium text-purple-200 mb-1">
                    Password (PIN)
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4 group-focus-within:text-purple-300 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm"
                      placeholder="Enter your PIN"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 text-red-200 text-xs backdrop-blur-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Login Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg relative overflow-hidden group text-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Footer Section - Smart & Visible */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="space-y-4"
            >
              {/* Registration Section */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30">
                <div className="text-center">
                  <h3 className="text-base font-semibold text-white mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    New to Neural Core Alpha-7?
                  </h3>
                  <p className="text-sm text-purple-200 mb-3">
                    Join the future of algorithmic trading with institutional-grade AI technology.
                  </p>
                  <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/30">
                    <p className="text-sm text-slate-300 leading-relaxed mb-2">
                      Currently available for registered institutional clients only.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-slate-400">Contact:</span>
                      <a 
                        href="mailto:sales@lafzusa.com" 
                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                      >
                        sales@lafzusa.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Links & Copyright */}
              <div className="text-center space-y-3">
                <div className="flex justify-center space-x-6 text-sm">
                  <a href="#" className="text-slate-400 hover:text-purple-300 transition-colors">Terms</a>
                  <a href="#" className="text-slate-400 hover:text-purple-300 transition-colors">Privacy</a>
                  <a href="#" className="text-slate-400 hover:text-purple-300 transition-colors">Support</a>
                </div>
                
                <div className="text-sm text-slate-300 font-medium">
                  © 2025 LAFZ Corp. All rights reserved.
                </div>
                
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span>Powered by</span>
                  <span className="text-purple-400 font-medium">Neural Core Alpha-7</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
