// src/components/state/VariablesVisualizer.jsx

import React from 'react';
import { motion } from 'framer-motion';
import ArrayVisualizer from './ArrayVisualizer';


const VariablesVisualizer = ({ locals = {}, prevLocals = {}, variableRefs, currentEvent }) => {
  const allEntries = Object.entries(locals).filter(([key, value]) => value && value.type !== 'other');
  if (allEntries.length === 0) {
    return <p className="text-gray-500 text-center p-4">No variables in the current scope.</p>;
  }
  const primitiveVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { type: 'spring', duration: 0.5 } },
    updated: {
      scale: [1, 1.15, 1],
      backgroundColor: ["#facc15aa", "#1f293700"],
      transition: { duration: 0.8 }
    },
  };
  return (
    <div className="p-4 w-full">
      {allEntries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([key, value]) => {
        const prevValue = prevLocals ? prevLocals[key] : undefined;
        if (value.type === 'list') {
          return <ArrayVisualizer key={key} name={key} data={value} prevData={prevValue} currentEvent={currentEvent} />;
        }
        if (value.type === 'primitive') {
          const hasChanged = prevValue && prevValue.value !== value.value;
          const isNew = prevValue === undefined;
          let highlightClass = hasChanged ? 'text-yellow-300' : 'text-green-300';
          if (isNew) highlightClass = 'text-blue-300';
          return (
            <motion.div
              key={key}
              ref={(el) => { if (el && variableRefs) variableRefs.current.set(key, el); }}
              layout
              className="font-mono text-sm mb-2 p-2 rounded-md"
              variants={primitiveVariants}
              initial="initial"
              animate={["animate", hasChanged ? "updated" : ""]}
            >
              <span className="text-gray-400">{key} = </span>
              <span className={`font-bold text-lg transition-colors duration-300 ${highlightClass}`}>
                {String(value.value)}
              </span>
            </motion.div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default VariablesVisualizer;