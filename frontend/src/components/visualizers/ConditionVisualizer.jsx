// src/components/visualizers/ConditionVisualizer.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ConditionVisualizer = ({ event }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gray-900/50 rounded-lg font-mono h-full">
      <p className="text-lg text-cyan-300">Evaluating Condition</p>
      <div className="flex items-center justify-center space-x-4">
        {/* 'False' Path */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col items-center"
        >
          <span className="text-sm text-gray-400">False Path</span>
          <motion.div
            className="w-16 h-1 bg-red-500/50 rounded-full"
            animate={{ scaleX: event.result ? 0.1 : 1.2, opacity: event.result ? 0.5 : 1 }}
            transition={{ delay: 1.2, type: 'spring' }}
          />
        </motion.div>

        {/* The Condition Diamond */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="bg-gray-800 border-2 border-yellow-400 text-yellow-300 font-bold text-xl px-6 py-10 rounded-lg transform -rotate-45"
        >
          <span className="transform rotate-45 inline-block whitespace-nowrap">{event.condition_str}</span>
        </motion.div>

        {/* 'True' Path */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col items-center"
        >
          <span className="text-sm text-gray-400">True Path</span>
          <motion.div
            className="w-16 h-1 bg-green-500/50 rounded-full"
            animate={{ scaleX: event.result ? 1.2 : 0.1, opacity: event.result ? 1 : 0.5 }}
            transition={{ delay: 1.2, type: 'spring' }}
          />
        </motion.div>
      </div>
      
      {/* Result Text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={String(event.result)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className={`text-2xl font-bold ${event.result ? 'text-green-400' : 'text-red-400'}`}
        >
          Result is {String(event.result)}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default ConditionVisualizer;