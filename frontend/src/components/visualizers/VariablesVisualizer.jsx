
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// NEW: A recursive function to display variables of any type (primitive, list, etc.)
const renderValue = (data) => {
    if (!data || data.value === undefined) {
        return String(data); // Fallback for simple values
    }

    switch (data.type) {
        case "primitive":
            return String(data.value);
        case "list":
            // Recursively render each item in the list and join them with commas
            return `[${data.value.map(item => renderValue(item)).join(', ')}]`;
        case "object":
            return `<${data.class_name} object>`;
        default:
            return String(data.value);
    }
};

// A sub-component to handle each variable's animation
const VariableItem = ({ name, value, hasChanged, onHover, onLeave }) => {
    const displayValue = renderValue(value);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (hasChanged) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 600);
            return () => clearTimeout(timer);
        }
    }, [displayValue, hasChanged]);

    const pulseVariants = {
        pulse: { scale: [1, 1.05, 1], backgroundColor: ["#374151", "#4f46e5", "#374151"] },
        idle: { scale: 1, backgroundColor: "#374151" }
    };

    return (
        <div
            className="flex justify-between items-center text-sm mb-2"
            onMouseEnter={() => onHover(name)}
            onMouseLeave={onLeave}
        >
            <span className="font-mono text-indigo-300 mr-2">{name}</span>
            <motion.div
                className="ml-auto px-2.5 py-1 bg-gray-700 rounded-md font-mono text-white text-right"
                variants={pulseVariants}
                animate={pulse ? "pulse" : "idle"}
                transition={{ duration: 0.6 }}
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={displayValue}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {displayValue}
                    </motion.span>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default function VariablesVisualizer({ locals, prevLocals, onVariableHover, onVariableLeave }) {
    // Get all unique variable names from current and previous steps
    const allKeys = [...new Set([...Object.keys(locals), ...Object.keys(prevLocals)])];

    return (
        <div className="p-2">
            <AnimatePresence>
                {allKeys.map((key) => {
                    const currentValue = locals[key];
                    const prevValue = prevLocals[key];

                    // Don't render if the variable has been removed from scope
                    if (currentValue === undefined) return null;

                    const hasChanged = JSON.stringify(currentValue) !== JSON.stringify(prevValue);

                    return (
                        <motion.div
                            key={key}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <VariableItem
                                name={key}
                                value={currentValue}
                                hasChanged={hasChanged}
                                onHover={onVariableHover}
                                onLeave={onVariableLeave}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
