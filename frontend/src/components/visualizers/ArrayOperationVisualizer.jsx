// src/components/visualizers/ArrayOperationVisualizer.jsx

import React from "react";
import { motion } from "framer-motion";

const ArrayOperationVisualizer = ({ event }) => {
  const formattedArgs = event.args.map(arg => {
    if (typeof arg === 'string' && arg.startsWith("'") && arg.endsWith("'")) {
      return arg.slice(1, -1);
    }
    return String(arg);
  }).join(', ');

  const operationText = event.method === 'assign_at_index' ? '[index] = value' : `.${event.method}(${formattedArgs})`;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-gray-900/50 rounded-lg font-mono h-full">
      <p className="text-lg text-cyan-300">Performing Operation on <span className="font-bold text-yellow-300">{event.variable}</span></p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 items-center bg-gray-800 p-3 rounded-lg"
      >
        {(event.list_snapshot || []).map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-2 rounded-md min-w-[40px] bg-indigo-600 text-white">
            <span className="text-xs text-gray-300">{index}</span>
            <span className="font-bold text-md">{String(item)}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="text-2xl text-yellow-400 font-bold"
      >
        {operationText}
      </motion.div>
    </div>
  );
};

export default ArrayOperationVisualizer;