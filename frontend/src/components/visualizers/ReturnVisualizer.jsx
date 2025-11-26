/* eslint-disable no-irregular-whitespace */
// src/components/visualizers/ReturnVisualizer.jsx

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Custom Component for the Exit Animation ---
const ExitPulse = ({ duration }) => (
    <motion.div
        className="absolute inset-0 rounded-full border-4 border-emerald-400/0"
        initial={{ scale: 0.8, opacity: 1, borderColor: 'rgba(52, 211, 163, 0.4)' }}
        animate={{ 
            scale: 1.5, 
            opacity: 0,
            borderColor: 'rgba(52, 211, 163, 1)'
        }}
        transition={{ 
            duration: duration, 
            ease: "easeOut", 
            repeat: Infinity, 
            repeatDelay: 0.1 
        }}
    />
);

// Accept scale and updateScale props for responsive layout
const ReturnVisualizer = ({ event, scale, updateScale }) => {
    // Ref to identify the content wrapper for measurement by the parent (TraceLayout)
    const contentRef = useRef(null); 
    
    // Trigger the parent's scale update whenever the event data changes
    useEffect(() => {
        const timeoutId = setTimeout(updateScale, 100); 
        return () => clearTimeout(timeoutId);
    }, [event, updateScale]); 
    
    // Helper to safely get the value string
    const returnValue = event?.value?.value ? String(event.value.value) : 'N/A';
    
    // Variants for the value box and the arrow
    const valueVariants = {
        hidden: { opacity: 0, scale: 0.3 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 150, delay: 0.2 } },
    };

  return (
    // Outer wrapper applies the calculated scale transformation and is the measurable element
    <div 
        ref={contentRef} 
        className="visualizer-content-wrapper inline-block" // CRUCIAL for TraceLayout measurement
        style={{
            transform: `scale(${scale})`, // Apply the dynamic scale factor
            transformOrigin: 'center',
            transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
        }}
    >
    <div className="flex flex-col items-center justify-center p-6 space-y-8 bg-slate-900/50 rounded-xl border border-slate-700 font-mono">
      
        {/* Title indicating data flow */}
      <p className="text-xl font-semibold text-emerald-400 uppercase tracking-wider">
            Returning Value
        </p>

        {/* Animation Container */}
      <div className="flex flex-col items-center justify-center space-y-4">
        
            {/* 1. Value Box (Source of Data) - Now includes the Exit Pulse */}
        <motion.div
          variants={valueVariants}
          initial="hidden"
          animate="visible"
          className="
                relative 
                bg-emerald-600 text-white font-extrabold text-4xl 
                p-6 rounded-full shadow-2xl shadow-emerald-500/40 border-2 border-emerald-300
                overflow-visible w-28 h-28 flex items-center justify-center // Fixed size for pulse origin
            "
        >
            <AnimatePresence>
                <ExitPulse duration={0.8} /> {/* Faster pulse animation */}
            </AnimatePresence>
          {returnValue}
        </motion.div>
        
            {/* 2. Direction Arrow */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-6xl text-emerald-400"
            >
                ↑
            </motion.div>
      </div>
        
        <p className="text-md text-slate-400 max-w-xs text-center">
            Value leaves the function frame and returns to the caller's line.
        </p>
    </div>
    </div>
  );
};

export default ReturnVisualizer;