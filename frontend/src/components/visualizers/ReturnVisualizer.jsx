// src/components/visualizers/ReturnVisualizer.jsx

import React from "react";
import { motion } from "framer-motion";

const ReturnVisualizer = ({ event }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-gray-900/50 rounded-lg font-mono h-full">
      <p className="text-lg text-green-300">Returning Value</p>
      <div className="flex items-center justify-center space-x-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, delay: 0.2 }}
          className="bg-green-600 text-white font-bold text-3xl p-5 rounded-lg shadow-lg shadow-green-500/30"
        >
          {String(event.value.value)}
        </motion.div>
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
        >
            <svg height="40" width="80" className="text-green-400">
                <path d="M 0 20 L 60 20 L 45 10 M 60 20 L 45 30" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default ReturnVisualizer;