'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  Shield, 
  TrendingUp, 
  Award, 
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Info,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

export interface PaperTradingSession {
  id: string;
  userId: string;
  startingBalance: number;
  currentBalance: number;
  totalPnl: number;
  totalPnlPercent: number;
  tradesCount: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  startTime: string;
  duration: number; // in seconds
  isActive: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  achievements: string[];
}

export interface TradingLesson {
  id: string;
  title: string;
  description: string;
  concept: string;
  example: string;
  tips: string[];
  completed: boolean;
}

export default function PaperTradingMode() {
  const { data: session } = useSession();
  const [currentSession, setCurrentSession] = useState<PaperTradingSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    bestPerformance: 0,
    totalLearningTime: 0,
    completedLessons: 0
  });

  // Trading lessons for education
  const lessons: TradingLesson[] = [
    {
      id: 'basics',
      title: 'Trading Basics',
      description: 'Learn the fundamental concepts of stock trading',
      concept: 'Buy Low, Sell High',
      example: 'If you buy AAPL at $150 and sell at $160, you make $10 profit per share',
      tips: [
        'Start with well-known companies (Blue Chips)',
        'Never invest more than you can afford to lose',
        'Diversify your investments across different sectors'
      ],
      completed: false
    },
    {
      id: 'ai-transparency',
      title: 'AI Decision Making',
      description: 'Understand how Neural Core AI makes trading decisions',
      concept: 'AI Confidence Levels',
      example: 'When AI shows 85% confidence, it means the decision has strong supporting data',
      tips: [
        'Higher confidence doesn\'t guarantee success',
        'Always review AI reasoning before following suggestions',
        'Learn from both AI wins AND losses'
      ],
      completed: false
    },
    {
      id: 'risk-management',
      title: 'Risk Management',
      description: 'Learn to protect your capital and manage losses',
      concept: 'Position Sizing',
      example: 'Never risk more than 2% of your portfolio on a single trade',
      tips: [
        'Set stop-losses to limit downside',
        'Don\'t chase losses with bigger bets',
        'Take profits when targets are reached'
      ],
      completed: false
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Understand technical and fundamental analysis',
      concept: 'Support and Resistance',
      example: 'If a stock bounces off $100 multiple times, $100 is a support level',
      tips: [
        'Combine technical patterns with fundamental data',
        'Watch for volume confirmation',
        'Consider market sentiment and news'
      ],
      completed: false
    }
  ];

  useEffect(() => {
    loadPaperTradingData();
  }, [session]);

  const loadPaperTradingData = async () => {
    // TODO: Load from database in production
    const savedSession = localStorage.getItem('paperTradingSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setCurrentSession(session);
      setIsActive(session.isActive);
    }

    const savedStats = localStorage.getItem('paperTradingStats');
    if (savedStats) {
      setSessionStats(JSON.parse(savedStats));
    }

    const savedAchievements = localStorage.getItem('paperTradingAchievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  };

  const startNewSession = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    const startingBalance = difficulty === 'beginner' ? 10000 : 
                           difficulty === 'intermediate' ? 25000 : 50000;

    const newSession: PaperTradingSession = {
      id: `session_${Date.now()}`,
      userId: session?.user?.id || 'demo',
      startingBalance,
      currentBalance: startingBalance,
      totalPnl: 0,
      totalPnlPercent: 0,
      tradesCount: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      bestTrade: 0,
      worstTrade: 0,
      startTime: new Date().toISOString(),
      duration: 0,
      isActive: true,
      difficulty,
      achievements: []
    };

    setCurrentSession(newSession);
    setIsActive(true);
    
    // Save to localStorage (use database in production)
    localStorage.setItem('paperTradingSession', JSON.stringify(newSession));
    
    console.log(`🎯 Started ${difficulty} paper trading session with $${startingBalance.toLocaleString()}`);
  };

  const pauseSession = () => {
    if (currentSession) {
      const updatedSession = { ...currentSession, isActive: false };
      setCurrentSession(updatedSession);
      setIsActive(false);
      localStorage.setItem('paperTradingSession', JSON.stringify(updatedSession));
    }
  };

  const resumeSession = () => {
    if (currentSession) {
      const updatedSession = { ...currentSession, isActive: true };
      setCurrentSession(updatedSession);
      setIsActive(true);
      localStorage.setItem('paperTradingSession', JSON.stringify(updatedSession));
    }
  };

  const resetSession = () => {
    setCurrentSession(null);
    setIsActive(false);
    localStorage.removeItem('paperTradingSession');
  };

  const completeLesson = (lessonId: string) => {
    setCurrentLesson(prev => Math.min(prev + 1, lessons.length - 1));
    
    // Add achievement
    const newAchievement = `Completed: ${lessons.find(l => l.id === lessonId)?.title}`;
    setAchievements(prev => [...prev, newAchievement]);
    
    // Update stats
    setSessionStats(prev => ({
      ...prev,
      completedLessons: prev.completedLessons + 1
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="mr-3"
          >
            <BookOpen className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Paper Trading Academy
          </h1>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Learn AI-powered trading in a risk-free environment. Master the concepts before risking real money.
        </p>
      </motion.div>

      {/* Current Session or Start Options */}
      {!currentSession ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <Target className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Start Your Learning Journey</h2>
            <p className="text-gray-400">Choose your difficulty level and begin paper trading</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Beginner */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startNewSession('beginner')}
              className="p-6 bg-green-500/5 border border-green-500/20 rounded-xl cursor-pointer hover:border-green-500/40 transition-colors"
            >
              <div className="text-center">
                <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-400 mb-2">Beginner</h3>
                <p className="text-gray-300 text-sm mb-4">Perfect for first-time traders</p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div>• Starting Balance: $10,000</div>
                  <div>• Basic AI guidance</div>
                  <div>• Educational tooltips</div>
                  <div>• Risk-first approach</div>
                </div>
              </div>
            </motion.div>

            {/* Intermediate */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startNewSession('intermediate')}
              className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-xl cursor-pointer hover:border-yellow-500/40 transition-colors"
            >
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Intermediate</h3>
                <p className="text-gray-300 text-sm mb-4">For traders with some experience</p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div>• Starting Balance: $25,000</div>
                  <div>• Advanced AI strategies</div>
                  <div>• Technical analysis tools</div>
                  <div>• Portfolio optimization</div>
                </div>
              </div>
            </motion.div>

            {/* Advanced */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startNewSession('advanced')}
              className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl cursor-pointer hover:border-red-500/40 transition-colors"
            >
              <div className="text-center">
                <Award className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-400 mb-2">Advanced</h3>
                <p className="text-gray-300 text-sm mb-4">For experienced traders</p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div>• Starting Balance: $50,000</div>
                  <div>• Complex AI strategies</div>
                  <div>• Options and derivatives</div>
                  <div>• Risk management focus</div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setShowTutorial(true)}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-colors"
            >
              Start with Tutorial
            </button>
          </div>
        </motion.div>
      ) : (
        /* Active Session Dashboard */
        <div className="space-y-6">
          {/* Session Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`px-3 py-1 rounded-lg border font-semibold text-sm ${getDifficultyColor(currentSession.difficulty)}`}>
                  {currentSession.difficulty.toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-white">Paper Trading Session</h3>
                  <p className="text-sm text-gray-400">Started {new Date(currentSession.startTime).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isActive ? (
                  <button
                    onClick={pauseSession}
                    className="p-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                  >
                    <PauseCircle className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={resumeSession}
                    className="p-2 bg-green-500/20 border border-green-500/40 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
                  >
                    <PlayCircle className="w-5 h-5" />
                  </button>
                )}
                
                <button
                  onClick={resetSession}
                  className="p-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(currentSession.currentBalance)}
                </div>
                <div className="text-sm text-gray-400">Current Balance</div>
              </div>

              <div className={`text-center p-4 rounded-lg border ${
                currentSession.totalPnl >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
              }`}>
                <div className={`text-2xl font-bold ${
                  currentSession.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatPercent(currentSession.totalPnlPercent)}
                </div>
                <div className="text-sm text-gray-400">Total Return</div>
              </div>

              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-400">
                  {currentSession.tradesCount}
                </div>
                <div className="text-sm text-gray-400">Trades Made</div>
              </div>

              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">
                  {currentSession.winningTrades > 0 ? `${((currentSession.winningTrades / currentSession.tradesCount) * 100).toFixed(0)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
            </div>
          </motion.div>

          {/* Recent Achievements */}
          {achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Award className="w-5 h-5 text-yellow-400 mr-2" />
                Recent Achievements
              </h3>
              
              <div className="space-y-2">
                {achievements.slice(-3).map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-yellow-400 mr-3" />
                    <span className="text-gray-300">{achievement}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Trading Tutorial</h2>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Current Lesson */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-400 mr-2" />
                  <h3 className="text-xl font-semibold text-white">
                    Lesson {currentLesson + 1}: {lessons[currentLesson]?.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-300">{lessons[currentLesson]?.description}</p>
                  
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <h4 className="font-semibold text-cyan-400 mb-2">Key Concept</h4>
                    <p className="text-gray-300">{lessons[currentLesson]?.concept}</p>
                  </div>

                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">Example</h4>
                    <p className="text-gray-300">{lessons[currentLesson]?.example}</p>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">Pro Tips</h4>
                    <ul className="space-y-1">
                      {lessons[currentLesson]?.tips.map((tip, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start">
                          <span className="text-green-400 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {currentLesson + 1} of {lessons.length} lessons
                </div>
                
                <div className="flex space-x-2">
                  {currentLesson > 0 && (
                    <button
                      onClick={() => setCurrentLesson(prev => prev - 1)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  
                  {currentLesson < lessons.length - 1 ? (
                    <button
                      onClick={() => completeLesson(lessons[currentLesson].id)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-colors"
                    >
                      Next Lesson
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        completeLesson(lessons[currentLesson].id);
                        setShowTutorial(false);
                        setCurrentLesson(0);
                      }}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      Complete Tutorial
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}