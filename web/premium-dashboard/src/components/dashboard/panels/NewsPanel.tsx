'use client';

import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

export function NewsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center">
        <Newspaper className="w-16 h-16 text-neon-green mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Market News</h2>
        <p className="text-gray-400">Real-time news feed coming soon...</p>
      </div>
    </motion.div>
  );
}