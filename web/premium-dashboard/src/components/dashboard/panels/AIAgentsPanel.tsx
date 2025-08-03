'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function AIAgentsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center">
        <Bot className="w-16 h-16 text-neon-pink mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">AI Agents</h2>
        <p className="text-gray-400">Multi-agent system dashboard coming soon...</p>
      </div>
    </motion.div>
  );
}