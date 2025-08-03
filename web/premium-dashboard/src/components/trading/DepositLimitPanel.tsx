'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DepositInfo {
  currentBalance: number;
  totalDeposited: number;
  maxAllowed: number;
  remainingLimit: number;
  lastDeposit: string | null;
  depositCount: number;
}

interface DepositLimitPanelProps {
  className?: string;
}

const DepositLimitPanel: React.FC<DepositLimitPanelProps> = ({ className = '' }) => {
  const [depositInfo, setDepositInfo] = useState<DepositInfo>({
    currentBalance: 285.45,
    totalDeposited: 300.00,
    maxAllowed: 300.00,
    remainingLimit: 0.00,
    lastDeposit: '2024-01-15T10:30:00Z',
    depositCount: 3
  });

  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (depositInfo.totalDeposited + amount > depositInfo.maxAllowed) {
      alert(`Deposit would exceed $${depositInfo.maxAllowed} limit. This limit helps protect your learning journey.`);
      return;
    }

    // Simulate deposit
    setDepositInfo(prev => ({
      ...prev,
      currentBalance: prev.currentBalance + amount,
      totalDeposited: prev.totalDeposited + amount,
      remainingLimit: prev.maxAllowed - (prev.totalDeposited + amount),
      lastDeposit: new Date().toISOString(),
      depositCount: prev.depositCount + 1
    }));

    setDepositAmount('');
    setShowDepositForm(false);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > depositInfo.currentBalance) {
      alert('Insufficient balance for withdrawal');
      return;
    }

    // Simulate withdrawal
    setDepositInfo(prev => ({
      ...prev,
      currentBalance: prev.currentBalance - amount,
    }));

    setWithdrawAmount('');
    setShowWithdrawForm(false);
  };

  const progressPercentage = (depositInfo.totalDeposited / depositInfo.maxAllowed) * 100;

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              💰 Account Balance & Limits
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              $300 maximum deposit - designed for learning, not loss
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(depositInfo.currentBalance)}
            </div>
            <div className="text-sm text-gray-400">Current Balance</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Deposit Limit Progress */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">Deposit Limit Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              depositInfo.remainingLimit > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {depositInfo.remainingLimit > 0 ? 'Available' : 'Limit Reached'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Total Deposited</span>
              <span>{formatCurrency(depositInfo.totalDeposited)} / {formatCurrency(depositInfo.maxAllowed)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full ${
                  progressPercentage >= 100 ? 'bg-red-500' : 
                  progressPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-700 rounded">
              <div className="text-lg font-bold text-white">
                {formatCurrency(depositInfo.remainingLimit)}
              </div>
              <div className="text-xs text-gray-400">Remaining Limit</div>
            </div>
            <div className="text-center p-3 bg-gray-700 rounded">
              <div className="text-lg font-bold text-white">
                {depositInfo.depositCount}
              </div>
              <div className="text-xs text-gray-400">Total Deposits</div>
            </div>
          </div>

          {depositInfo.lastDeposit && (
            <div className="mt-3 text-xs text-gray-400 text-center">
              Last deposit: {formatDate(depositInfo.lastDeposit)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {/* Deposit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDepositForm(true)}
            disabled={depositInfo.remainingLimit <= 0}
            className={`p-4 rounded-lg border-2 transition-all ${
              depositInfo.remainingLimit > 0
                ? 'border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                : 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="text-2xl mb-2">💳</div>
            <div className="font-medium">Add Funds</div>
            <div className="text-sm opacity-80">
              {depositInfo.remainingLimit > 0 
                ? `Up to ${formatCurrency(depositInfo.remainingLimit)}` 
                : 'Limit reached'
              }
            </div>
          </motion.button>

          {/* Withdraw Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowWithdrawForm(true)}
            disabled={depositInfo.currentBalance <= 0}
            className={`p-4 rounded-lg border-2 transition-all ${
              depositInfo.currentBalance > 0
                ? 'border-blue-500 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                : 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="text-2xl mb-2">💸</div>
            <div className="font-medium">Withdraw</div>
            <div className="text-sm opacity-80">
              {depositInfo.currentBalance > 0 
                ? 'Available anytime' 
                : 'No balance'
              }
            </div>
          </motion.button>
        </div>

        {/* Why $300 Limit? */}
        <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
          <h3 className="font-medium text-blue-300 mb-2 flex items-center">
            🤔 Why the $300 Limit?
          </h3>
          <div className="text-sm text-blue-200 space-y-2">
            <p>
              <strong>Learning-focused:</strong> This isn't about maximizing deposits. 
              We want you to learn AI trading with manageable amounts.
            </p>
            <p>
              <strong>Trust building:</strong> We prove our commitment to education over profit 
              by limiting how much you can deposit.
            </p>
            <p>
              <strong>Risk management:</strong> Even with AI, trading involves risk. 
              Start small, learn the system, understand the process.
            </p>
            <p>
              <strong>Honest approach:</strong> Most platforms want maximum deposits. 
              We want maximum learning and long-term success.
            </p>
          </div>
        </div>

        {/* Deposit Form Modal */}
        {showDepositForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-600 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-bold text-white mb-4">Add Funds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Amount (Max: {formatCurrency(depositInfo.remainingLimit)})
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    max={depositInfo.remainingLimit}
                    min="1"
                    step="0.01"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeposit}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setShowDepositForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Withdraw Form Modal */}
        {showWithdrawForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-600 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-bold text-white mb-4">Withdraw Funds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Amount (Available: {formatCurrency(depositInfo.currentBalance)})
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={depositInfo.currentBalance}
                    min="1"
                    step="0.01"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleWithdraw}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => setShowWithdrawForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositLimitPanel;