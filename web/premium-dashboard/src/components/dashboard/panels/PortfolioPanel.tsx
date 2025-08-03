'use client';

import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

export function PortfolioPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center">
        <Briefcase className="w-16 h-16 text-neon-green mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Portfolio Panel</h2>
        <p className="text-gray-400">Portfolio management features coming soon...</p>
      </div>
    </motion.div>
  );
}