import React, { useState, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const useResponsiveScale = () => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const calculateScale = () => {
            if (!containerRef.current || !contentRef.current) return;

            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;
            const contentWidth = contentRef.current.offsetWidth;
            const contentHeight = contentRef.current.offsetHeight;

            // Calculate scale based on the dimension that's overflowing the most
            const scaleX = containerWidth / contentWidth;
            const scaleY = containerHeight / contentHeight;

            // We use Math.min to ensure it fits both width and height.
            // We also cap it at 1 to prevent it from growing larger than its original size.
            const newScale = Math.min(scaleX, scaleY, 1);
            
            setScale(newScale);
        };

        calculateScale();

        // Recalculate scale whenever the container is resized
        const resizeObserver = new ResizeObserver(calculateScale);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, [event]); // Recalculate when the event changes, as content size might change

    const contentStyle = {
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
    };

    return { containerRef, contentRef, contentStyle };
};


// KeyValuePair sub-component remains the same
const KeyValuePair = ({ keyName, value, status }) => {
    // ... (This component code is unchanged)
    const statusStyles = {
        default: 'border-slate-600',
        changed: 'border-yellow-400 bg-yellow-500/10 scale-105',
        added: 'border-green-400 bg-green-500/10',
        removed: 'border-red-400 bg-red-500/10',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`flex items-stretch text-sm rounded-lg border-2 overflow-hidden my-1 transition-transform duration-300 ${statusStyles[status]}`}
        >
            <div className="bg-slate-700 px-3 py-2 font-mono font-bold text-slate-200">{String(keyName)}</div>
            <div className="bg-slate-800/50 px-3 py-2 font-mono text-sky-300">{String(value)}</div>
        </motion.div>
    );
};


export default function DictionaryVisualizer({ event }) {
    const {
        variable,
        method,
        dict_snapshot_before: before,
        dict_snapshot_after: after
    } = event;

    // --- NEW: Use our custom hook ---
    const { containerRef, contentRef, contentStyle } = useResponsiveScale();

    const getStatus = (key, value, snapshotType) => {
        // ... (This function code is unchanged)
        const safeBefore = before || {};
        const safeAfter = after || {};

        if (snapshotType === 'after') {
            if (!safeBefore.hasOwnProperty(key)) return 'added';
            if (safeBefore[key] !== value) return 'changed';
        }
        if (snapshotType === 'before') {
            if (!safeAfter.hasOwnProperty(key)) return 'removed';
        }
        return 'default';
    };

    return (
        // --- MODIFIED: Added containerRef and centered content ---
        <div ref={containerRef} className="w-full h-full flex items-center justify-center p-4">
            {/* --- MODIFIED: Added contentRef and dynamic style --- */}
            <div ref={contentRef} style={contentStyle}>
                <div className="flex flex-col items-center justify-center">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-sky-300">{variable}</h3>
                        <p className="font-mono text-slate-400">Operation: <span className="font-bold text-yellow-400">{method}</span></p>
                    </div>
                    
                    <div className="flex items-center justify-around w-full">
                        <div className="flex flex-col items-center">
                            <h4 className="font-semibold text-slate-300 mb-2">Before</h4>
                            <div className="p-2 bg-slate-900/50 rounded-lg w-64 min-h-[100px]">
                                <AnimatePresence>{Object.entries(before || {}).map(([key, value]) => (<KeyValuePair key={`before-${key}`} keyName={key} value={value} status={getStatus(key, value, 'before')} />))}</AnimatePresence>
                            </div>
                        </div>
                        <ArrowRight size={48} className="text-slate-500 mx-8 flex-shrink-0" />
                        <div className="flex flex-col items-center">
                            <h4 className="font-semibold text-slate-300 mb-2">After</h4>
                            <div className="p-2 bg-slate-900/50 rounded-lg w-64 min-h-[100px]">
                                <AnimatePresence>{Object.entries(after || {}).map(([key, value]) => (<KeyValuePair key={`after-${key}`} keyName={key} value={value} status={getStatus(key, value, 'after')} />))}</AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
