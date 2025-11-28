
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

// ⭐ NEW HELPER FUNCTION: Recursively formats the serialized Python object structure
const formatSerializedValue = (serializedObj) => {
    if (!serializedObj || typeof serializedObj !== 'object' || !serializedObj.type) {
        return { display: 'N/A', type: 'UNKNOWN' };
    }
    
    const { type, value, class_name } = serializedObj;

    if (type === 'primitive') {
        // Handle 0 explicitly, otherwise return the string version of the value
        return { display: value === 0 ? '0' : String(value), type: type.toUpperCase() };
    } 
    
    if (type === 'list' && Array.isArray(value)) {
        // Handle lists by mapping and joining the formatted inner content with line breaks (\n)
        const innerContent = value.map(item => formatSerializedValue(item).display).join('\n');
        return { display: innerContent, type: 'LIST' }; 
    }

    if (type === 'dict') {
        return { display: `[${value.length} Keys]`, type: 'DICT' };
    }
    
    if (type === 'object') {
        return { display: `[${class_name || 'Object'}]`, type: 'OBJECT' };
    }
    
    return { display: 'N/A', type: 'UNKNOWN' };
};

// Accept scale and updateScale props for responsive layout
const ReturnVisualizer = ({ event, scale, updateScale }) => {
    const contentRef = useRef(null); 
    
    // Trigger the parent's scale update whenever the event data changes
    useEffect(() => {
        const timeoutId = setTimeout(updateScale, 100); 
        return () => clearTimeout(timeoutId);
    }, [event, updateScale]); 
    
    // ⭐ CRITICAL: Use the new helper function to get the structured display string
    const formattedResult = formatSerializedValue(event?.value);
    const displayValue = formattedResult.display;
    const displayType = formattedResult.type;

    // Variants for the value box and the arrow
    const valueVariants = {
        hidden: { opacity: 0, scale: 0.3 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 150, delay: 0.2 } },
    };
    
    // Dynamic size calculation based on the number of lines (array length)
    const lineCount = displayValue.split('\n').length;
    const dynamicWidth = Math.max(12, lineCount) * 8 + 'px'; // Minimum 12 characters width
    const dynamicHeight = Math.max(8, lineCount) * 16 + 50 + 'px'; // Height based on lines

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
            
            {/* 1. Value Box (Source of Data) - Enhanced Visuals */}
            <motion.div
              variants={valueVariants}
              initial="hidden"
              animate="visible"
              className={`
                    relative 
                    bg-emerald-600 text-white font-extrabold text-lg 
                    p-4 rounded-lg shadow-2xl shadow-emerald-500/40 border-2 border-emerald-300
                    overflow-hidden flex flex-col items-center justify-center 
                `}
                style={{
                    // Apply dynamic sizing to the container
                    width: displayType === 'LIST' ? dynamicWidth : 'auto', 
                    minHeight: displayType === 'LIST' ? dynamicHeight : 'auto',
                    padding: displayType === 'LIST' ? '10px 20px' : '20px 40px'
                }}
            >
                <AnimatePresence>
                    <ExitPulse duration={0.8} />
                </AnimatePresence>
                
                {/* Type Label */}
                <span className="text-xs text-emerald-100/80 mb-1">
                    {displayType}
                </span>

                {/* Array Content (Respects line breaks) */}
                <div className="text-xl font-mono text-center whitespace-pre-wrap leading-tight">
                    {displayValue} 
                </div>
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