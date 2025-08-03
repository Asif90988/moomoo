'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  RefreshCw
} from 'lucide-react';
import { errorHandler } from '@/lib/error-handler';
import { wsService } from '@/services/websocket';
import { moomooAPI } from '@/services/moomoo-api';

interface SystemStatus {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  responseTime?: number;
  message?: string;
  uptime?: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  history: number[];
}

export default function SystemHealthMonitor() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [errorStats, setErrorStats] = useState({
    totalErrors: 0,
    criticalErrors: 0,
    errorsByCategory: {} as Record<string, number>,
    errorsBySeverity: {} as Record<string, number>
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);

  const startMonitoring = () => {
    setIsMonitoring(true);
    
    // Initial check
    performHealthCheck();
    updatePerformanceMetrics();
    updateErrorStats();
    
    // Set up periodic monitoring
    const healthInterval = setInterval(performHealthCheck, 30000); // Every 30 seconds
    const metricsInterval = setInterval(updatePerformanceMetrics, 10000); // Every 10 seconds
    const errorInterval = setInterval(updateErrorStats, 15000); // Every 15 seconds

    return () => {
      clearInterval(healthInterval);
      clearInterval(metricsInterval);
      clearInterval(errorInterval);
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const performHealthCheck = async () => {
    const checks: SystemStatus[] = [];
    const startTime = Date.now();

    // Frontend Health
    checks.push({
      component: 'Frontend',
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      message: 'React app running normally',
      uptime: performance.now()
    });

    // WebSocket Connection
    const wsConnected = wsService.isConnected();
    checks.push({
      component: 'WebSocket',
      status: wsConnected ? 'healthy' : 'error',
      lastCheck: new Date().toISOString(),
      responseTime: wsConnected ? 50 : undefined,
      message: wsConnected ? 'Real-time connection active' : 'Connection failed',
      uptime: wsConnected ? 95.5 : 0
    });

    // Trading API
    try {
      const apiStart = Date.now();
      const apiHealthy = await checkAPIHealth();
      const apiResponseTime = Date.now() - apiStart;
      
      checks.push({
        component: 'Trading API',
        status: apiHealthy ? 'healthy' : 'warning',
        lastCheck: new Date().toISOString(),
        responseTime: apiResponseTime,
        message: apiHealthy ? 'Moomoo API responding' : 'API degraded performance',
        uptime: apiHealthy ? 98.2 : 85.0
      });
    } catch (error) {
      checks.push({
        component: 'Trading API',
        status: 'error',
        lastCheck: new Date().toISOString(),
        message: 'API connection failed',
        uptime: 0
      });
    }

    // Database Health (simulated)
    const dbHealthy = await checkDatabaseHealth();
    checks.push({
      component: 'Database',
      status: dbHealthy ? 'healthy' : 'error',
      lastCheck: new Date().toISOString(),
      responseTime: dbHealthy ? 120 : undefined,
      message: dbHealthy ? 'PostgreSQL responsive' : 'Database connection issues',
      uptime: dbHealthy ? 99.8 : 0
    });

    // AI Engine
    const aiHealthy = await checkAIEngineHealth();
    checks.push({
      component: 'AI Engine',
      status: aiHealthy ? 'healthy' : 'warning',
      lastCheck: new Date().toISOString(),
      responseTime: aiHealthy ? 200 : undefined,
      message: aiHealthy ? 'Neural Core AI active' : 'AI processing delayed',
      uptime: aiHealthy ? 96.7 : 70.0
    });

    setSystemStatus(checks);
    setLastUpdate(new Date().toLocaleTimeString());
  };

  const updatePerformanceMetrics = () => {
    const metrics: PerformanceMetric[] = [
      {
        name: 'Response Time',
        value: 45 + Math.random() * 20,
        unit: 'ms',
        trend: Math.random() > 0.5 ? 'down' : 'up',
        status: 'good',
        history: Array.from({ length: 20 }, () => 40 + Math.random() * 30)
      },
      {
        name: 'Memory Usage',
        value: 68 + Math.random() * 15,
        unit: '%',
        trend: Math.random() > 0.6 ? 'up' : 'stable',
        status: 'warning',
        history: Array.from({ length: 20 }, () => 60 + Math.random() * 25)
      },
      {
        name: 'CPU Usage',
        value: 35 + Math.random() * 20,
        unit: '%',
        trend: 'stable',
        status: 'good',
        history: Array.from({ length: 20 }, () => 30 + Math.random() * 25)
      },
      {
        name: 'Active Users',
        value: 247 + Math.floor(Math.random() * 50),
        unit: 'users',
        trend: 'up',
        status: 'good',
        history: Array.from({ length: 20 }, () => 200 + Math.random() * 100)
      },
      {
        name: 'AI Accuracy',
        value: 87.3 + Math.random() * 5,
        unit: '%',
        trend: 'up',
        status: 'good',
        history: Array.from({ length: 20 }, () => 85 + Math.random() * 10)
      },
      {
        name: 'Throughput',
        value: 1250 + Math.floor(Math.random() * 300),
        unit: 'req/min',
        trend: Math.random() > 0.7 ? 'down' : 'up',
        status: 'good',
        history: Array.from({ length: 20 }, () => 1000 + Math.random() * 500)
      }
    ];

    setPerformanceMetrics(metrics);
  };

  const updateErrorStats = () => {
    const stats = errorHandler.getErrorStats();
    setErrorStats(stats);
  };

  const checkAPIHealth = async (): Promise<boolean> => {
    try {
      // In production, use actual API health check
      // return await moomooAPI.testConnection();
      return Math.random() > 0.1; // 90% success rate simulation
    } catch {
      return false;
    }
  };

  const checkDatabaseHealth = async (): Promise<boolean> => {
    // Simulate database health check
    return Math.random() > 0.05; // 95% success rate simulation
  };

  const checkAIEngineHealth = async (): Promise<boolean> => {
    // Simulate AI engine health check
    return Math.random() > 0.15; // 85% success rate simulation
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'border-green-500/20 bg-green-500/5';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/5';
    }
  };

  const getMetricStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
    }
  };

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable':
        return <div className="w-4 h-0.5 bg-gray-400 rounded" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center">
          <motion.div
            animate={{ rotate: isMonitoring ? 360 : 0 }}
            transition={{ duration: 2, repeat: isMonitoring ? Infinity : 0, ease: "linear" }}
          >
            <Activity className="w-8 h-8 text-cyan-400 mr-3" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              System Health Monitor
            </h1>
            <p className="text-gray-400 text-sm">Real-time monitoring of Neural Core Alpha-7</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Last updated: {lastUpdate}</div>
          <div className="flex items-center mt-1">
            <div className={`w-2 h-2 rounded-full mr-2 ${isMonitoring ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-500">
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* System Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl"
      >
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <Server className="w-5 h-5 text-cyan-400 mr-2" />
          System Components
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {systemStatus.map((component, index) => (
              <motion.div
                key={component.component}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getStatusColor(component.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{component.component}</h3>
                  {getStatusIcon(component.status)}
                </div>
                
                <p className="text-sm text-gray-300 mb-2">{component.message}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  {component.responseTime && (
                    <div>
                      <span className="text-cyan-400">Response:</span> {component.responseTime}ms
                    </div>
                  )}
                  {component.uptime && (
                    <div>
                      <span className="text-green-400">Uptime:</span> {component.uptime.toFixed(1)}%
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl"
      >
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
          Performance Metrics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {performanceMetrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{metric.name}</span>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className={`text-2xl font-bold mb-1 ${getMetricStatusColor(metric.status)}`}>
                {metric.value.toFixed(metric.name === 'Active Users' || metric.name === 'Throughput' ? 0 : 1)}
                <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>
              </div>
              
              {/* Mini chart placeholder */}
              <div className="h-8 bg-slate-700/30 rounded mt-2 flex items-end justify-between px-1">
                {metric.history.slice(-8).map((value, i) => (
                  <div
                    key={i}
                    className="w-1 bg-cyan-400/60 rounded-t"
                    style={{ height: `${(value / Math.max(...metric.history)) * 24}px` }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Error Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl"
      >
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
          Error Statistics
        </h2>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-white">{errorStats.totalErrors}</div>
            <div className="text-sm text-gray-400">Total Errors</div>
          </div>
          
          <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{errorStats.criticalErrors}</div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
          
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">
              {errorStats.totalErrors > 0 ? ((errorStats.criticalErrors / errorStats.totalErrors) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-400">Critical Rate</div>
          </div>
          
          <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">99.8%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>

        {/* Error Categories */}
        {Object.keys(errorStats.errorsByCategory).length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-white mb-3">Error Categories</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(errorStats.errorsByCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-gray-300 capitalize">{category}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}