'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, DollarSign, AlertTriangle, CheckCircle, Info, Lock } from 'lucide-react';
import { liveTradingService } from '@/services/live-trading-service';

interface DepositLimits {
  maxSingleDeposit: number;
  maxTotalDeposit: number;
  currentTotal: number;
  remainingLimit: number;
}

interface DepositProtectionSystemProps {
  onDepositSuccess?: (newBalance: number) => void;
}

export default function DepositProtectionSystem({ onDepositSuccess }: DepositProtectionSystemProps) {
  const { data: session } = useSession();
  const [depositAmount, setDepositAmount] = useState('');
  const [limits, setLimits] = useState<DepositLimits>({
    maxSingleDeposit: 300,
    maxTotalDeposit: 300,
    currentTotal: 0,
    remainingLimit: 300
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEducation, setShowEducation] = useState(false);

  useEffect(() => {
    loadDepositLimits();
  }, [session]);

  const loadDepositLimits = async () => {
    try {
      const account = liveTradingService.getAccount();
      if (account) {
        setLimits({
          maxSingleDeposit: account.maxDeposit,
          maxTotalDeposit: account.maxDeposit,
          currentTotal: account.totalDeposited,
          remainingLimit: account.maxDeposit - account.totalDeposited
        });
      }
    } catch (error) {
      console.error('Failed to load deposit limits:', error);
    }
  };

  const validateAmount = (amount: string): { valid: boolean; error?: string } => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: 'Please enter a valid amount' };
    }

    if (numAmount > limits.maxSingleDeposit) {
      return { 
        valid: false, 
        error: `Single deposit cannot exceed $${limits.maxSingleDeposit} (Neural Core Protection)` 
      };
    }

    if (limits.currentTotal + numAmount > limits.maxTotalDeposit) {
      return { 
        valid: false, 
        error: `Total deposits cannot exceed $${limits.maxTotalDeposit} (Neural Core Protection)` 
      };
    }

    if (numAmount < 10) {
      return { valid: false, error: 'Minimum deposit is $10' };
    }

    return { valid: true };
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsProcessing(true);

    try {
      const validation = validateAmount(depositAmount);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const amount = parseFloat(depositAmount);
      const result = await liveTradingService.processDeposit(amount);

      if (result.success) {
        setSuccessMessage(`Successfully deposited $${amount.toFixed(2)}`);
        setDepositAmount('');
        await loadDepositLimits(); // Refresh limits
        onDepositSuccess?.(result.newBalance);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(result.error || 'Deposit failed');
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getProgressPercentage = () => {
    return (limits.currentTotal / limits.maxTotalDeposit) * 100;
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Neural Core Protection Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="mr-3"
          >
            <Shield className="w-8 h-8 text-green-400" />
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Neural Core Protection
          </h2>
        </div>
        <p className="text-gray-400 text-sm">
          Maximum $300 deposit limit for your financial safety
        </p>
      </motion.div>

      {/* Deposit Limits Dashboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 mb-6 shadow-2xl"
      >
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Deposit Usage</span>
              <span>{getProgressPercentage().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor()} transition-all duration-500`}
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Limit Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-bold text-green-400">
                ${limits.currentTotal.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">Total Deposited</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-bold text-cyan-400">
                ${limits.remainingLimit.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">Remaining Limit</div>
            </div>
          </div>

          {/* Protection Status */}
          <div className="flex items-center justify-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-400 text-sm font-medium">
              Protection Active - Safe to Trade
            </span>
          </div>
        </div>
      </motion.div>

      {/* Deposit Form */}
      {limits.remainingLimit > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl"
        >
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-300 mb-2">
                Deposit Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="depositAmount"
                  type="number"
                  min="10"
                  max={Math.min(limits.remainingLimit, limits.maxSingleDeposit)}
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                  placeholder={`Min: $10, Max: $${Math.min(limits.remainingLimit, limits.maxSingleDeposit).toFixed(2)}`}
                  required
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, Math.min(limits.remainingLimit, 300)].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setDepositAmount(amount.toString())}
                  disabled={amount > limits.remainingLimit}
                  className="py-2 px-3 text-sm bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 rounded-lg text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Error/Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isProcessing || !depositAmount || limits.remainingLimit <= 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-cyan-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Processing...
                </div>
              ) : (
                'Secure Deposit'
              )}
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* Limit Reached */}
      {limits.remainingLimit <= 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center"
        >
          <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-yellow-400 mb-2">Deposit Limit Reached</h3>
          <p className="text-gray-300 text-sm mb-4">
            You've reached the $300 Neural Core protection limit. This keeps you safe while learning.
          </p>
          <button
            onClick={() => setShowEducation(true)}
            className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-colors"
          >
            Learn Why This Protects You
          </button>
        </motion.div>
      )}

      {/* Educational Modal */}
      <AnimatePresence>
        {showEducation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEducation(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Why $300 Limit?</h3>
                <div className="text-gray-300 text-sm space-y-3 text-left">
                  <div className="flex items-start">
                    <Info className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p><strong>Learning Protection:</strong> Keep losses manageable while you learn AI trading</p>
                  </div>
                  <div className="flex items-start">
                    <Info className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p><strong>Honest Platform:</strong> We prioritize education over profit extraction</p>
                  </div>
                  <div className="flex items-start">
                    <Info className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p><strong>Responsible AI:</strong> Even the best AI can have losing trades</p>
                  </div>
                  <div className="flex items-start">
                    <Info className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p><strong>Proven Strategy:</strong> Start small, learn well, scale gradually</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEducation(false)}
                  className="mt-6 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}