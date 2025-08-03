'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export function AnalyticsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center">
        <BarChart3 className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Analytics</h2>
        <p className="text-gray-400">Performance analytics dashboard coming soon...</p>
      </div>
    </motion.div>
  );
}