'use client';

import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export function SettingsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-400">System configuration coming soon...</p>
      </div>
    </motion.div>
  );
}