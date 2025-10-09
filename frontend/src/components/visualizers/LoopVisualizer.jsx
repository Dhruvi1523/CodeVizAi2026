import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-component for 'for' loop visualization ---
const ForLoopAnimation = ({ variableName, iterableSnapshot, currentValue, currentIndex }) => {
    return (
        <motion.div
            key="for-loop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex w-full flex-col items-center justify-center space-y-4"
        >
            <h3 className="text-xl font-bold text-cyan-300">For Loop</h3>
            
            {/* List Visualization */}
            <div className="w-full max-w-4xl overflow-x-auto rounded-lg bg-gray-900/50 p-4">
                <div className="relative flex w-max items-center justify-start space-x-2">
                    {iterableSnapshot.map((item, index) => (
                        <div key={`item-${index}`} className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-gray-800 sm:h-20 sm:w-20">
                            <span className="text-lg font-bold text-white sm:text-xl">{String(item)}</span>
                            <span className="absolute -bottom-5 text-xs text-gray-500">[{index}]</span>
                            
                            {/* ✨ This is the magic highlight that animates automatically using layoutId */}
                            {currentIndex === index && (
                                <motion.div
                                    className="absolute inset-0 rounded-md border-2 border-fuchsia-500 bg-fuchsia-500/10"
                                    layoutId="loop-scanner-highlight"
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ✨ Variable Assignment Box for clarity */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.3 } }}
                className="flex items-center space-x-4 rounded-lg bg-gray-800 p-3 text-lg"
            >
                <div className="text-fuchsia-300">{variableName}</div>
                <span className="text-gray-500">=</span>
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentValue}
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-900 font-bold text-white"
                    >
                        {currentValue !== undefined ? String(currentValue) : "?"}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

// --- Sub-component for 'while' loop visualization ---
const WhileLoopAnimation = ({ condition, result }) => {
    const resultColor = result ? 'text-emerald-400' : 'text-red-400';
    const resultBorder = result ? 'border-emerald-500' : 'border-red-500';
    const resultBg = result ? 'bg-emerald-500/20' : 'bg-red-500/20';
    const resultShadow = result ? '0 0 20px #34d399' : '0 0 20px #ef4444';

    return (
        <motion.div
            key="while-loop"
            variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex w-full flex-col items-center justify-center space-y-6"
        >
            <h3 className="text-xl font-bold text-cyan-300">While Loop</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
                <motion.div variants={itemVariants} className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                    <span className="text-2xl font-semibold text-white">{condition}</span>
                </motion.div>
                
                <motion.div variants={itemVariants} className="text-4xl text-gray-500">➔</motion.div>

                <motion.div
                    variants={itemVariants}
                    key={String(result)}
                    className={`rounded-lg border-2 p-4 ${resultBorder} ${resultBg}`}
                    animate={{ boxShadow: ['0 0 0px rgba(0,0,0,0)', resultShadow, '0 0 0px rgba(0,0,0,0)'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <span className={`text-2xl font-bold ${resultColor}`}>{String(result)}</span>
                </motion.div>
            </div>
        </motion.div>
    );
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150 } },
};

// --- Main Visualizer Component ---
export default function LoopVisualizer({ currentStep, trace }) {
    if (!currentStep || !trace) return null;

    // Find the most recent loop_iteration event to determine the loop's state
    let loopData = null;
    const currentTraceIndex = trace.indexOf(currentStep);
    for (let i = currentTraceIndex; i >= 0; i--) {
        const pastEvent = trace[i].event;
        if (pastEvent.type === 'loop_iteration') {
            loopData = pastEvent;
            break;
        }
    }
    
    // We also need the current event to check for `while` conditions
    const currentEvent = currentStep.event;

    // Determine which type of loop to show
    let loopType = null;
    let props = {};

    if (loopData?.iterable_snapshot) {
        loopType = 'for';
        props = {
            variableName: loopData.loop_variable_name,
            iterableSnapshot: loopData.iterable_snapshot,
            currentValue: loopData.current_value,
            currentIndex: loopData.iterable_snapshot.findIndex(item => item === loopData.current_value),
        };
    } else if (currentEvent?.type === 'condition_check' && currentEvent?.condition_str.startsWith('while')) {
        // This is a rough check, a more robust backend event would be better
        loopType = 'while';
        props = {
            condition: currentEvent.condition_str,
            result: currentEvent.result,
        };
    }

    if (!loopType) {
        // Fallback if we are in a loop context but don't have a specific visual
        return <p className="text-slate-400 text-center pt-8">Executing inside a loop...</p>;
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center p-4 font-mono">
            <AnimatePresence mode="wait">
                {loopType === 'for' && <ForLoopAnimation {...props} />}
                {loopType === 'while' && <WhileLoopAnimation {...props} />}
            </AnimatePresence>
        </div>
    );
}