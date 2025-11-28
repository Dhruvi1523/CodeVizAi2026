import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Repeat, ArrowRight, Hash } from 'lucide-react';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 12 } },
};

const LoopVisualizer = ({ event, scale, updateScale }) => {
  const contentRef = useRef(null);

  // --- Scaling Logic ---
  useEffect(() => {
    // 1. Immediate update to catch initial render
    if (updateScale) updateScale();

    // 2. Delayed update to handle fonts/images/layout shifts
    const timeoutId = setTimeout(() => {
      if (updateScale) updateScale();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [event, updateScale]);


  // --- Data Extraction ---
  const {
    loop_variable_name: varName,
    current_value: rawValue,
    iterable_snapshot: snapshot = []
  } = event;

  const currentValue = rawValue?.value ?? rawValue;
  
  // Extract simple values from snapshot objects if necessary
  const arraySnapshot = snapshot.map(item => (typeof item === 'object' && item !== null ? item.value : item));

  // Find index (Note: indexOf finds the first occurrence. 
  // Ideally, backend provides specific index, but this is a solid fallback)
  const currentIndex = arraySnapshot.indexOf(currentValue);

  return (
    <div
      ref={contentRef}
      // CRITICAL: w-fit and h-fit allow the container to measure the TRUE size 
      // of the content before scaling. 
      className="visualizer-content-wrapper inline-flex flex-col items-center justify-center p-8 w-fit h-fit min-w-full min-h-full origin-center"
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)', // Smooth zoom
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-8"
      >
        {/* --- Header --- */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <div className="p-3 bg-fuchsia-500/20 rounded-xl">
            <Repeat size={40} className="text-fuchsia-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold text-slate-100">Loop Iteration</h2>
            <span className="text-slate-400 font-mono text-sm">Processing cycle</span>
          </div>
        </motion.div>

        {/* --- Main Variable Display --- */}
        <motion.div variants={itemVariants} className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8 min-w-[300px] flex flex-col items-center gap-4">
             <span className="text-slate-400 text-lg uppercase tracking-wider font-semibold">Current Variable</span>
             
             <div className="flex items-center gap-6 text-4xl font-mono">
                <span className="text-fuchsia-400 font-bold">{varName}</span>
                <ArrowRight size={32} className="text-slate-600" />
                <span className="text-cyan-300 font-bold bg-slate-800 px-4 py-2 rounded-lg border border-slate-600">
                  {String(currentValue)}
                </span>
             </div>
          </div>
        </motion.div>

        {/* --- Iterable Visualizer (The Tape) --- */}
        {arraySnapshot.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 w-full max-w-4xl">
            <div className="flex items-center gap-2 text-slate-400">
               <Hash size={16} />
               <span className="text-sm font-semibold uppercase tracking-widest">Iteration Context</span>
            </div>

            {/* Container for the array - No overflow-hidden here, we want it to expand so scale works */}
            <div className="flex gap-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-700 shadow-xl">
              {arraySnapshot.map((val, idx) => {
                const isActive = idx === currentIndex;
                
                return (
                  <motion.div
                    key={idx}
                    layout // Helps smooth movement if list changes
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: isActive ? 1.1 : 1, 
                      opacity: isActive ? 1 : 0.5,
                      backgroundColor: isActive ? 'rgb(16, 185, 129)' : 'rgb(30, 41, 59)', // Emerald vs Slate-800
                      borderColor: isActive ? 'rgb(52, 211, 153)' : 'rgb(51, 65, 85)'
                    }}
                    className={`
                      relative min-w-[60px] h-[60px] flex items-center justify-center rounded-lg border-2
                      font-mono text-xl font-bold shadow-lg
                      ${isActive ? 'text-white z-10' : 'text-slate-400'}
                    `}
                  >
                    {/* Index Badge */}
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full border ${isActive ? 'bg-emerald-900 border-emerald-500 text-emerald-200' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                      {idx}
                    </div>
                    
                    {String(val)}
                    
                    {/* Active Indicator Arrow */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeArrow"
                        className="absolute -bottom-6 text-emerald-400"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-emerald-400"></div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* --- Empty State / While Loop Fallback --- */}
        {arraySnapshot.length === 0 && (
           <motion.p variants={itemVariants} className="text-slate-500 italic">
             (Condition-based loop, no iterable snapshot available)
           </motion.p>
        )}

      </motion.div>
    </div>
  );
};

export default LoopVisualizer;