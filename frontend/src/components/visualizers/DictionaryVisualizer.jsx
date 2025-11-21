/* eslint-disable no-irregular-whitespace */
import React, { useEffect, useRef } from 'react'; // Added useEffect, useRef
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// --- Helper Components (Simplified and kept outside the main function) ---

const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

const KeyValuePair = ({ keyName, value, status }) => {
    const statusStyles = {
        default: 'border-slate-600',
        changed: 'border-yellow-400 bg-yellow-500/10 scale-[1.03] shadow-md', // Enhanced contrast/effect
        added: 'border-green-400 bg-green-500/10',
        removed: 'border-red-400 bg-red-500/10',
    };

    return (
        <motion.div
            layout
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={itemVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`flex items-stretch text-sm rounded-lg border-2 overflow-hidden my-1 transition-transform duration-300 ${statusStyles[status]}`}
        >
            <div className="bg-slate-700 px-3 py-2 font-mono font-bold text-slate-200">{String(keyName)}</div>
            <div className="bg-slate-800/50 px-3 py-2 font-mono text-sky-300">{String(value)}</div>
        </motion.div>
    );
};


// --- Main Visualizer Component (Accepts scale props) ---
export default function DictionaryVisualizer({ event, scale, updateScale }) { // ADDED SCALE PROPS
    const {
        variable,
        method,
        dict_snapshot_before: before,
        dict_snapshot_after: after
    } = event;

    // Ref and useEffect to notify parent (TraceLayout) when content changes
    const contentRef = useRef(null); 
    
    useEffect(() => {
        const timeoutId = setTimeout(updateScale, 100); 
        return () => clearTimeout(timeoutId);
    }, [event, updateScale]); 

    const getStatus = (key, value, snapshotType) => {
        const safeBefore = before || {};
        const safeAfter = after || {};

        if (snapshotType === 'after') {
            if (!safeBefore.hasOwnProperty(key)) return 'added';
            // NOTE: We compare primitive values, assuming serialized values match
            if (safeBefore[key]?.value !== value?.value) return 'changed'; 
        }
        if (snapshotType === 'before') {
            if (!safeAfter.hasOwnProperty(key)) return 'removed';
        }
        return 'default';
    };

    return (
        // --- SCALING WRAPPER (Visualizer content) ---
        <div 
            ref={contentRef} 
            className="visualizer-content-wrapper inline-block"
            style={{
                transform: `scale(${scale})`, // APPLY SCALE
                transformOrigin: 'center',
                transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
            }}
        >
            <div className="flex flex-col items-center justify-center p-4">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-sky-300">Dictionary: {variable}</h3>
                    <p className="font-mono text-slate-400">Operation: <span className="font-bold text-yellow-400">{method}</span></p>
                </div>
                
                <div className="flex items-start justify-center w-full">
                    
                    {/* Before Snapshot */}
                    <div className="flex flex-col items-center">
                        <h4 className="font-semibold text-slate-300 mb-2">Before</h4>
                        <div className="p-3 bg-slate-900/50 rounded-lg w-64 min-h-[100px] border border-slate-700">
                            <AnimatePresence>
                                {Object.entries(before || {}).map(([key, value]) => (
                                    <KeyValuePair key={`before-${key}`} keyName={key} value={value.value} status={getStatus(key, value, 'before')} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                    
                    {/* Flow Arrow */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center justify-center h-full mx-6 mt-6"
                    >
                        <ArrowRight size={48} className="text-yellow-500 animate-pulse" />
                    </motion.div>

                    {/* After Snapshot */}
                    <div className="flex flex-col items-center">
                        <h4 className="font-semibold text-slate-300 mb-2">After</h4>
                        <div className="p-3 bg-slate-900/50 rounded-lg w-64 min-h-[100px] border border-slate-700">
                            <AnimatePresence>
                                {Object.entries(after || {}).map(([key, value]) => (
                                    <KeyValuePair key={`after-${key}`} keyName={key} value={value.value} status={getStatus(key, value, 'after')} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}