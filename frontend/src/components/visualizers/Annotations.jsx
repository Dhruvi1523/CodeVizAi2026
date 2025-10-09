import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, MoveRight } from 'lucide-react';

// The pointer for loops
export const LoopPointer = ({ position }) => {
    if (!position) return null;

    return (
        <motion.div
            className="absolute z-10"
            initial={{ x: position.x + position.width / 2 - 16, y: position.y - 40, opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="flex flex-col items-center">
                <span className="px-2 py-1 text-xs font-bold text-white bg-indigo-500 rounded-md">ITEM</span>
                <MoveRight size={32} className="text-indigo-400 -rotate-90 mt-1" />
            </div>
        </motion.div>
    );
};

// The bubble for condition checks
export const ConditionBubble = ({ position, event }) => {
    if (!position || !event) return null;

    const { condition_str, result } = event;

    return (
        <motion.div
            className="absolute z-10"
            initial={{ x: position.x + position.width + 10, y: position.y, scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border ${result ? 'bg-green-800/80 border-green-600' : 'bg-red-800/80 border-red-600'}`}>
                <span className="font-mono text-sm text-white">{condition_str}</span>
                {result ? <Check className="text-green-300" /> : <X className="text-red-300" />}
            </div>
        </motion.div>
    );
};
