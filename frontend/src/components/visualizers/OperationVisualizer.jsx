/* eslint-disable no-irregular-whitespace */
import React, { useEffect, useRef } from "react"; // ADDED useEffect, useRef
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";

// --- Reusable Helper Components ---
const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
};

// Scaled-down Base Box sizes to prevent initial overflow
const ValueBox = ({ label, value }) => (
  <motion.div variants={itemVariants} className="flex flex-col items-center">
    <div className="text-sm text-gray-400">{label}</div>
    {/* Reduced h/w for better fit, using text-xl max */}
    <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gray-800 text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl">
      {String(value)}
    </div>
  </motion.div>
);

const ResultBox = ({ value }) => (
    <AnimatePresence mode="popLayout">
        <motion.div
            key={value}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            // Reduced h/w for better fit, added shadow and color consistent with final output
            className="flex h-14 w-14 items-center justify-center rounded-md bg-fuchsia-600 font-bold text-white shadow-lg sm:h-16 sm:w-16 sm:text-xl"
        >
            {String(value)}
        </motion.div>
    </AnimatePresence>
);

// --- Main Operation Visualizer Component (Now responsive) ---
const OperationVisualizer = ({ event, scale, updateScale }) => { // ACCEPTED SCALE PROPS
    // Ref and useEffect to notify parent (TraceLayout) when content changes
    const contentRef = useRef(null);
    
    useEffect(() => {
        const timeoutId = setTimeout(updateScale, 100);
        return () => clearTimeout(timeoutId);
    }, [event, updateScale]);
    
  // Use the correct keys from the backend tracer
  const { left_str, right_str, op_str, left_val, right_val, result_val } = event;

  return (
    // 🎯 WRAPPER: Apply the calculated scale transformation to the inner content
    <div 
        ref={contentRef} 
        className="visualizer-content-wrapper inline-block h-full w-full"
        style={{
            transform: `scale(${scale})`, // APPLY SCALE
            transformOrigin: 'center',
            transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
        }}
    >
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-4 font-mono sm:space-y-8">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-base text-cyan-300 sm:text-lg"
      >
        Performing Operation
      </motion.p>

      {/* Expression (a + b) */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-4"
      >
        <ValueBox label={left_str} value={left_val} />
        <motion.div variants={itemVariants} className="text-2xl font-bold text-cyan-400 sm:text-3xl">{op_str}</motion.div>
        <ValueBox label={right_str} value={right_val} />
      </motion.div>

      {/* Arrow pointing down */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }}>
        <FiArrowDown className="text-3xl text-gray-500" />
      </motion.div>
      
      {/* Final Result */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 1 } }}
        className="flex flex-col items-center"
      >
         <div className="text-sm text-gray-400">Result</div>
         <ResultBox value={result_val} />
      </motion.div>
    </div>
    </div>
  );
};

export default OperationVisualizer;