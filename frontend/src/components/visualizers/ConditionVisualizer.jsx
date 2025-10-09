import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants for a smoother, orchestrated sequence
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};


const ConditionVisualizer = ({ event }) => {
  const { condition_str, result } = event;

  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-900/50 p-4 font-mono">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-2xl flex-col items-center justify-center space-y-8 text-center"
      >
        {/* Title */}
        <motion.p variants={itemVariants} className="text-base text-cyan-300 sm:text-lg">
          Evaluating Condition
        </motion.p>

        {/* Main Visualizer Body */}
        <motion.div
          variants={itemVariants}
          className="grid w-full grid-cols-3 items-center gap-2 sm:gap-4"
        >
          {/* 'False' Path */}
          <Pathlabel isSelected={!result} label="False Path" color="bg-red-500" />

          {/* The Condition Diamond */}
          <motion.div
            className="relative flex aspect-square items-center justify-center rounded-lg border-2 border-yellow-400 bg-gray-800 text-yellow-300 transform -rotate-45"
            layout // Smoothly animate size changes
          >
            <span className="inline-block transform rotate-45 whitespace-nowrap text-sm font-bold sm:text-lg md:text-xl">
              {condition_str}
            </span>
          </motion.div>

          {/* 'True' Path */}
          <Pathlabel isSelected={result} label="True Path" color="bg-green-500" />
        </motion.div>

        {/* Result Text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={String(result)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.8 }}
            className={`text-xl font-bold sm:text-2xl ${
              result ? "text-green-400" : "text-red-400"
            }`}
          >
            Result is {String(result)}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// A helper component for the True/False paths to keep the main component clean
const Pathlabel = ({ isSelected, label, color }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <span className="text-xs text-gray-400 sm:text-sm">{label}</span>
      <div className="relative h-1.5 w-full max-w-[150px] rounded-full bg-gray-700">
        <motion.div
          className={`absolute left-0 top-0 h-full w-full rounded-full ${color}`}
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: 1,
            opacity: isSelected ? 1 : 0.3,
          }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        {/* The "pulse" animation that flows down the selected path */}
        {isSelected && (
          <motion.div
            className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full ${color} shadow-[0_0_12px]`}
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: '95%', opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.2,
              delay: 0.7,
              ease: "circOut",
              times: [0, 0.1, 0.9, 1]
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ConditionVisualizer;