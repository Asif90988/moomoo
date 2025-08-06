'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Brain, Activity, Wifi, WifiOff, AlertTriangle, LogOut } from 'lucide-react';
import { useTradingStore, usePortfolioPnL, useConnectionStatus } from '@/stores/trading-store';
import { useHydrationSafe } from '@/hooks/useHydrationSafe';

export function Header() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const connectionStatus = useConnectionStatus();
  const { totalPnl, dayPnl, dayPnlPercent } = usePortfolioPnL();
  const isMounted = useHydrationSafe();

  useEffect(() => {
    if (isMounted) {
      setCurrentTime(new Date());
    }
  }, [isMounted]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-neon-green" />;
      case 'connecting':
        return <Activity className="w-4 h-4 text-neon-blue animate-pulse" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      default:
        return 'Disconnected';
    }
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    // Redirect to login
    router.push('/login');
  };

  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-16 glass border-b border-neural-border px-6 flex items-center justify-between relative z-20"
    >
      {/* Left Section - Logo & Status */}
      <div className="flex items-center space-x-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <Brain className="w-8 h-8 text-neon-blue" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full animate-pulse" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold font-display bg-gradient-to-r from-neon-blue to-neon-green bg-clip-text text-transparent">
              NEURAL CORE ALPHA-7
            </h1>
            <p className="text-xs text-gray-400">Advanced AI Trading System</p>
          </div>
        </div>
        
        {/* System Status Indicators */}
        <div className="flex items-center space-x-4">
          {/* Market Status */}
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/20">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-xs font-medium text-neon-green">Market Open</span>
          </div>
          
          {/* API Connection */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
            connectionStatus === 'connected' 
              ? 'bg-neon-blue/10 border-neon-blue/20' 
              : connectionStatus === 'error'
              ? 'bg-red-400/10 border-red-400/20'
              : 'bg-gray-400/10 border-gray-400/20'
          }`}>
            {getConnectionIcon()}
            <span className={`text-xs font-medium ${
              connectionStatus === 'connected' 
                ? 'text-neon-blue' 
                : connectionStatus === 'error'
                ? 'text-red-400'
                : 'text-gray-400'
            }`}>
              {getConnectionText()}
            </span>
          </div>
          
          {/* AI Engine Status */}
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-neon-purple rounded-full"
            />
            <span className="text-xs font-medium text-neon-purple">AI Active</span>
          </div>
        </div>
      </div>
      
      {/* Right Section - Portfolio & Time */}
      <div className="flex items-center space-x-6">
        {/* Portfolio Summary */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-xs text-gray-400">Day P&L</div>
            <motion.div
              key={dayPnl}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`font-mono font-bold text-sm ${
                dayPnl >= 0 ? 'text-neon-green' : 'text-red-400'
              }`}
            >
              {formatCurrency(dayPnl)}
              {dayPnlPercent !== 0 && (
                <span className="ml-1 text-xs">
                  ({dayPnlPercent >= 0 ? '+' : ''}{dayPnlPercent.toFixed(2)}%)
                </span>
              )}
            </motion.div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400">Total P&L</div>
            <div className={`font-mono font-bold text-sm ${
              totalPnl >= 0 ? 'text-neon-green' : 'text-red-400'
            }`}>
              {formatCurrency(totalPnl)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400">Time</div>
            <div className="font-mono font-bold text-sm text-white">
              {isMounted && currentTime ? formatTime(currentTime) : '--:--:--'}
            </div>
          </div>
        </div>
        
        {/* Account Info */}
        <div className="text-center">
          <div className="text-xs text-gray-400">Account</div>
          <div className="font-mono font-bold text-sm text-neon-blue">71456526</div>
        </div>
        
        {/* User Avatar with Dropdown */}
        <div className="relative user-menu-container">
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 ring-2 ring-transparent hover:ring-neon-blue/30"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Avatar clicked, current state:', showUserMenu);
              setShowUserMenu(prev => {
                const newState = !prev;
                console.log('Setting new state:', newState);
                return newState;
              });
            }}
          >
            <span className="text-white font-bold text-sm">A</span>
          </div>

          {/* Dropdown Menu rendered via Portal to escape stacking context */}
          {showUserMenu && isMounted && createPortal(
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed right-6 top-20 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
              style={{ 
                zIndex: 999999,
                position: 'fixed',
                backgroundColor: 'rgb(17 24 39)',
                border: '1px solid rgb(55 65 81)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Administrator</div>
                    <div className="text-xs text-gray-400">admin@lafzusa.com</div>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Logout clicked');
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-150 group"
                >
                  <LogOut className="w-4 h-4 mr-3 text-gray-400 group-hover:text-red-400 transition-colors" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>,
            document.body
          )}
        </div>
      </div>
    </motion.header>
  );
}
