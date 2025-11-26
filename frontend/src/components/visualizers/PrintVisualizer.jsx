/* eslint-disable no-irregular-whitespace */
// src/components/visualizers/PrintVisualizer.jsx

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Accept scale and updateScale props
const PrintVisualizer = ({ event, scale, updateScale }) => {
    // Ref to identify the content wrapper for measurement by the parent (TraceLayout)
    const contentRef = useRef(null); 
    
    // Trigger the parent's scale update whenever the event data changes
    useEffect(() => {
        const timeoutId = setTimeout(updateScale, 100); 
        return () => clearTimeout(timeoutId);
    }, [event, updateScale]); 
    
    // Helper function to extract and format values for display
  function getDisplayValue(data) {
    if (data == null) return "";
    if (typeof data === "object" && data !== null) {
      if (data.hasOwnProperty("value")) {
        return getDisplayValue(data.value);
      }
      if (Array.isArray(data)) {
        const displayItems = data.slice(0, 5).map(getDisplayValue);
        const suffix = data.length > 5 ? ", ..." : "";
        return `[${displayItems.join(", ")}${suffix}]`;
      }
      if (
        data.type === "object" ||
        data.type === "dict" ||
        data.type === "list"
      ) {
        if (data.class_name) return `<${data.class_name}>`;
        if (data.type) return `<${data.type}>`;
      }
    }
    return String(data);
  }

  const argumentsList = event.arguments || [];
  const finalOutput = getDisplayValue(event.output);
  const evaluatedArgString =
    argumentsList.length > 0
      ? argumentsList.map((a) => a.str).join(", ")
      : "...";

  // Variants for sequential animation 
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, 
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 }, 
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 20,
      },
    },
  };

  // 🎯 MODIFIED: Tighter spacing and smaller text size for arguments (text-lg)
  // Style for constant string arguments (Plain Cyan Text)
  const staticArgStyle = "text-cyan-300 font-normal px-0 text-lg"; 
  
  // 🎯 MODIFIED: Plain white text for dynamic arguments
  const dynamicArgStyle =
    "font-bold text-white px-0 text-lg"; 

  return (
    // Outer wrapper for content measurement and transformation
    <div 
        ref={contentRef} 
        className="visualizer-content-wrapper inline-block" // Crucial for measurement
        style={{
            transform: `scale(${scale})`, // Apply the scale factor here
            transformOrigin: 'center',
            transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
        }}
    >
        <motion.div
          key={event.step}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col items-center space-y-6 p-4 font-sans text-white w-full max-w-lg"
        >
          
          {/* 1. Function Signature */}
          <motion.p variants={itemVariants} className="text-xl font-bold font-mono tracking-wider mb-2">
            <span className="text-cyan-400">print</span>(
            <span className="text-fuchsia-300">{evaluatedArgString}</span>)
          </motion.p>

          {/* --- 2. ARGUMENT EVALUATION SECTION (Source of data) --- */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center w-full px-2"
          >
            <p className="text-sm text-indigo-300 mb-3 uppercase tracking-wider font-semibold">
              Combined String Arguments
            </p>
            {/* Argument visualization (NOW TIGHTER) */}
            <div className="flex flex-wrap justify-center items-center gap-x-1 gap-y-1 max-w-full">
              {argumentsList.map((arg, index) => (
                <span
                  key={index}
                  className={
                        // Use dynamicArgStyle for variables, staticArgStyle for raw strings like "is:"
                    typeof arg.value.value === "string" &&
                    arg.value.value.startsWith("Factorial")
                      ? staticArgStyle
                      : dynamicArgStyle
                  }
                >
                  {getDisplayValue(arg.value)}
                </span>
              ))}
            </div>
          </motion.div>
          
          {/* --- Simple Down Arrow --- */}
          <motion.div 
            variants={itemVariants} 
            className="text-5xl text-indigo-400 animate-bounce mt-4" // Indigo for structural flow
          >
            ↓
          </motion.div>
          
          {/* --- 3. FINAL COMBINED STRING RESULT (Target Box) --- */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-center p-2 w-full max-w-full"
          >
            <div
              className={`
                    rounded-xl
                    bg-slate-900/70 
                    border-2 border-fuchsia-400 
                    px-5 py-3 text-center font-extrabold text-white 
                    shadow-xl shadow-fuchsia-900/40 
                    text-2xl 
                    font-mono tracking-wide 
                    whitespace-pre-wrap max-w-full break-words
                `}
            >
              <span className="text-fuchsia-300 drop-shadow-md">{finalOutput}</span>
            </div>
          </motion.div>
          
        </motion.div>
    </div>
  );
};

export default PrintVisualizer;