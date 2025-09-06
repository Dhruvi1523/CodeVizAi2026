// src/components/visualizers/LoopVisualizer.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoopVisualizer = ({ event }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 font-mono h-full">
        <p className="text-lg text-purple-300">Loop Iteration</p>
        <div className="relative w-48 h-32 flex items-center justify-center">
            {/* The box representing the loop body */}
            <motion.div 
              className="absolute w-40 h-24 bg-gray-800 border-2 border-purple-500 rounded-lg flex flex-col items-center justify-center"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.2}}
            >
              <AnimatePresence mode="wait">
                  <motion.div
                      key={event.iteration}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="flex flex-col items-center"
                  >
                      <div className="text-4xl text-purple-400 font-bold">{event.iteration}</div>
                      <p className="text-sm text-gray-400 mt-1">Iteration</p>
                  </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* The animated circle */}
            <motion.div
                className="absolute w-6 h-6 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                    offsetPath: "path('M 8,16 A 60 48 0 1 1 184 16 A 60 48 0 1 1 8 16 Z')" // Adjusted SVG path around the box
                }}
            />
        </div>
        {event.loop_variable && (
          <motion.p 
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.5}}
            className="mt-2 text-md text-cyan-300"
          >
            <span className="font-bold">{event.loop_variable.name}</span> is now <span className="font-bold text-lg">{String(event.loop_variable.value)}</span>
          </motion.p>
        )}
    </div>
  );
};

export default LoopVisualizer;