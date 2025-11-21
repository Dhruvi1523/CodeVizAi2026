import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat } from 'lucide-react'; // Icon for loop

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};


// Main Loop Visualizer Component
const LoopVisualizer = ({ event, scale, updateScale }) => {
    // 1. Setup Responsiveness (Same pattern as Print/Condition Visualizers)
    const contentRef = useRef(null); 
    
    useEffect(() => {
        const timeoutId = setTimeout(updateScale, 100); 
        return () => clearTimeout(timeoutId);
    }, [event, updateScale]); 

    // Extract loop data
    const { 
        loop_variable_name: varName, 
        current_value: rawValue, 
        iterable_snapshot: snapshot = [] 
    } = event;

    // Safely extract the primitive value
    const currentValue = rawValue?.value ?? rawValue;
    const arraySnapshot = snapshot.map(item => item.value);

    // Determine current index based on value search (best guess)
    const currentIndex = arraySnapshot.indexOf(currentValue);

    return (
        <div 
            ref={contentRef} 
            className="visualizer-content-wrapper inline-block h-full w-full"
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center',
                transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
            }}
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center justify-center space-y-8 p-4 font-mono w-full h-full"
            >
                {/* Header and Icon */}
                <motion.div variants={itemVariants} className="flex items-center gap-3 text-2xl text-cyan-400 font-bold">
                    <Repeat size={32} className="text-fuchsia-400" />
                    <h2>Loop Iteration</h2>
                </motion.div>

                {/* Main Variable Status */}
                <motion.div variants={itemVariants} className="text-center">
                    <p className="text-lg text-slate-300 mb-2">Current Value of Loop Variable:</p>
                    <div className="rounded-xl bg-slate-800 border-4 border-fuchsia-400 p-4 shadow-xl">
                        <span className="text-3xl font-extrabold text-white">{varName}</span>
                        <span className="text-4xl text-gray-400 mx-3"> = </span>
                        <span className="text-4xl font-extrabold text-emerald-400">{String(currentValue)}</span>
                    </div>
                </motion.div>

                {/* Iterable Visualization (Showing Current Position) */}
                {arraySnapshot.length > 0 && (
                    <motion.div variants={itemVariants} className="flex flex-col items-center">
                        <p className="text-sm text-slate-400 mb-3">Iterable Snapshot:</p>
                        <div className="flex flex-wrap justify-center gap-2 rounded-lg bg-gray-900/50 p-3 shadow-inner">
                            {arraySnapshot.map((value, i) => (
                                <motion.div
                                    key={i}
                                    className={`flex flex-col items-center justify-center w-12 h-12 rounded-md font-bold text-sm transition-all duration-200 ${i === currentIndex ? 'bg-yellow-500 text-black scale-110 shadow-md' : 'bg-indigo-600 text-white'}`}
                                >
                                    {String(value)}
                                    <span className="text-[10px] text-slate-300 mt-1">{i}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
                
            </motion.div>
        </div>
    );
};

export default LoopVisualizer;