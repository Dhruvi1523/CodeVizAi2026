/* eslint-disable no-irregular-whitespace */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ArrayVisualizer = ({ name, data, prevData }) => {
    // FIX 1: Safely access the nested value array from the serialized Python object
    const currentItems = data?.value || [];
    const prevValues = prevData?.value?.map(item => item.value) || []; 
    
    // 🎯 NEW LOGIC: Determine if we need to switch to compact mode
    const MAX_REGULAR_ELEMENTS = 10;
    const isCompact = currentItems.length > MAX_REGULAR_ELEMENTS;

    // Helper variant for element appearance (kept for general motion)
    const itemMotion = {
        initial: { opacity: 0, scale: 0.5 }, 
        animate: { opacity: 1, scale: 1 }, 
        exit: { opacity: 0, scale: 0.5 },
    };

    // 🎯 Helper function to apply dynamic size classes
    const getSizeClasses = (index) => {
        // Classes for index label visibility (always show up to index 9, hide rest in compact mode)
        const indexVisibility = isCompact && index >= MAX_REGULAR_ELEMENTS ? 'hidden' : 'block';
        
        if (isCompact) {
            // Very small size for large arrays
            return `w-7 h-7 text-[10px] p-0.5 transition-all ${indexVisibility}`;
        } else {
            // Standard size for small arrays
            return `w-10 h-10 text-sm p-1 transition-all`;
        }
    };
    
    // Only show the first 12 elements in compact mode for extreme clarity
    const visibleItems = isCompact ? currentItems.slice(0, 12) : currentItems;

    return (
        <div className="mb-4">
            {/* Title (Variable Name) */}
            <p className="font-mono text-slate-300 mb-2 font-semibold">{name} =</p>
            
            {/* Array Container */}
            <motion.div 
                layout 
                className="flex flex-wrap gap-1 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-inner"
            >
                <AnimatePresence>
                    {visibleItems.map((item, index) => { // Use visibleItems
                        // Check against the full array length if we're not truncated
                        const wasJustChanged = (index < prevValues.length) && (prevValues[index] !== item.value);

                        return (
                            <motion.div
                                layout
                                key={`${item.value}-${index}`}
                                variants={itemMotion}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className={`
                                    relative flex flex-col items-center justify-center 
                                    rounded font-mono font-bold transition-colors duration-300
                                    ${getSizeClasses(index)} 
                                    ${wasJustChanged 
                                        ? 'bg-yellow-500 text-black shadow-lg' 
                                        : 'bg-indigo-600 text-white border border-indigo-700'
                                    }
                                `}
                            >
                                {/* Value Display */}
                                <span className="text-center leading-none">{String(item.value)}</span>
                                
                                {/* Index Label */}
                                <span className={`absolute -bottom-4 text-xs text-slate-500 ${isCompact && index >= 10 ? 'opacity-0' : 'opacity-100'}`}>{index}</span>
                            </motion.div>
                        );
                    })}
                    
                    {/* Truncation Indicator */}
                    {isCompact && currentItems.length > visibleItems.length && (
                        <div className="w-10 h-10 flex items-center justify-center text-slate-500 text-sm">
                            ...
                        </div>
                    )}

                </AnimatePresence>
            </motion.div>
            {isCompact && (
                <p className="text-xs text-slate-500 mt-2">
                    Showing first {visibleItems.length} elements of {currentItems.length}.
                </p>
            )}
        </div>
    );
};

export default ArrayVisualizer;