/* eslint-disable no-irregular-whitespace */
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150 } },
};

// --- Condition Visualizer Component ---
const ConditionVisualizer = ({ event, scale, updateScale }) => {
    // Refs for scaling
    const contentRef = useRef(null); 
    
    useEffect(() => {
        const timeoutId = setTimeout(updateScale, 100); 
        return () => clearTimeout(timeoutId);
    }, [event, updateScale]); 

  const { condition_str, result } = event;
  const resultColor = result ? "text-green-400" : "text-red-400";
  const resultBg = result ? "bg-green-600" : "bg-red-600";
  const activeColor = result ? "text-green-500" : "text-red-500";
  const decisionText = result ? "TRUE" : "FALSE";
  const decisionLabel = result ? "True Path" : "False Path";

  return (
    <div 
        ref={contentRef} 
        className="visualizer-content-wrapper inline-block"
        style={{
            transform: `scale(${scale})`, 
            transformOrigin: 'center',
            transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
        }}
    >
    <div className="flex flex-col items-center justify-center p-4 font-mono w-full h-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center space-y-6 text-center w-full max-w-sm"
      >
        
        {/* 1. Title/Header (Smaller Text Size) */}
        <motion.p variants={itemVariants} className="text-lg text-indigo-300 font-semibold uppercase tracking-wide">
          Conditional Evaluation
        </motion.p>
        
        {/* 2. Condition Expression Box (Compact and Clear) */}
        <motion.div
          variants={itemVariants}
          className="w-full rounded-lg border-2 border-cyan-500 bg-slate-800/90 p-3 shadow-lg shadow-cyan-900/50"
        >
          <p className="text-xl font-bold text-cyan-300 break-words">
            {condition_str}
          </p>
        </motion.div>
        
        {/* 3. Result Line and Pulse Animation */}
        <motion.div variants={itemVariants} className="w-full flex flex-col items-center space-y-3">
            <p className="text-sm text-slate-400 uppercase">
                Result is **{decisionText}**
            </p>
            
            {/* Horizontal Flow Line */}
            <div className="relative h-2 w-full max-w-[300px] rounded-full bg-slate-700/50">
                {/* Highlighted Path */}
                <motion.div
                    className={`absolute h-full rounded-full ${resultBg} shadow-md`}
                    initial={{ scaleX: 0, x: 0 }}
                    animate={{ scaleX: 1, x: result ? '0%' : '0%' }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    style={{ transformOrigin: result ? 'left' : 'right' }}
                />
                
                {/* Flow Packet Animation */}
                <motion.div
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full ${activeColor} shadow-[0_0_12px]`}
                    initial={{ x: '0%', opacity: 0 }}
                    animate={{ x: result ? '85%' : '5%', opacity: [0, 1, 1, 0] }}
                    transition={{
                        duration: 1.2,
                        delay: 0.7,
                        ease: result ? "easeOut" : "easeIn",
                        times: [0, 0.1, 0.9, 1]
                    }}
                />
                
                {/* Path Markers (MODIFIED) */}
                {/* True Marker (Right side) - Only prominently visible if result is TRUE */}
                <span 
                    className={`absolute top-1/2 -translate-y-1/2 text-lg font-extrabold transition-colors duration-300 ${result ? 'text-green-200' : 'text-slate-700'}`} 
                    style={{ right: '0%' }}
                >
                    ✓
                </span>
                {/* False Marker (Left side) - Only prominently visible if result is FALSE */}
                <span 
                    className={`absolute top-1/2 -translate-y-1/2 text-lg font-extrabold transition-colors duration-300 ${!result ? 'text-red-200' : 'text-slate-700'}`} 
                    style={{ left: '0%' }}
                >
                    ✗
                </span>
            </div>
            
            <div className="flex justify-between w-full max-w-[300px] text-sm text-slate-500 pt-2">
                <span className={!result ? activeColor : 'text-slate-500'}>FALSE</span>
                <span className={result ? activeColor : 'text-slate-500'}>TRUE</span>
            </div>
            
        </motion.div>


        {/* 4. Final Outcome (Slightly Smaller Font) */}
        <AnimatePresence mode="wait">
          <motion.p
            key={String(result)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.8 }}
            className={`text-2xl font-extrabold p-2 rounded-md ${resultColor}`}
          >
            Execution continues on the **{decisionLabel}**.
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
    </div>
  );
};

// ... (Pathlabel component removed as its functionality is integrated into the main component for simplicity and compactness) ...

export default ConditionVisualizer;