'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export function RiskPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center">
        <Shield className="w-16 h-16 text-neon-orange mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Risk Management</h2>
        <p className="text-gray-400">Advanced risk analytics coming soon...</p>
      </div>
    </motion.div>
  );
}