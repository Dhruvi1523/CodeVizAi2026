// src/components/visualizers/StringVisualizer.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileJson } from 'lucide-react';

// A single animated character box
const CharBox = ({ char, index, isHighlighted }) => {
  return (
    <div className="flex flex-col items-center font-mono">
      <motion.div
        className="w-12 h-12 border-2 rounded-md flex items-center justify-center text-xl font-bold bg-slate-700/50"
        animate={{
          borderColor: isHighlighted ? '#34d399' : '#475569', // Emerald-400 for highlight
          scale: isHighlighted ? 1.15 : 1,
          boxShadow: isHighlighted ? '0 0 15px rgba(52, 211, 153, 0.5)' : 'none',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        {char === ' ' ? '\u00A0' : char} {/* Render space correctly */}
      </motion.div>
      <span className="mt-2 text-xs text-slate-400">{index}</span>
    </div>
  );
};

// The main visualizer component
export default function StringVisualizer({ event }) {
  if (!event) return null;

  // --- RENDERER FOR INDEX ACCESS ---
  if (event.method === 'access_at_index') {
    const { string_snapshot, index, value_at_index } = event;
    const chars = string_snapshot.split('');

    return (
      <div className="flex flex-col items-center justify-center h-full gap-8 p-4">
        <div className="flex flex-wrap justify-center gap-2">
          {chars.map((char, i) => (
            <CharBox key={i} char={char} index={i} isHighlighted={i === index} />
          ))}
        </div>
        <motion.div
          key={index} // Re-trigger animation on index change
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-lg text-slate-300">
            Accessing index <span className="font-bold text-emerald-400">{index}</span>
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            Value: '<span className="text-emerald-300">{value_at_index}</span>'
          </p>
        </motion.div>
      </div>
    );
  }
  
  // --- RENDERER FOR CONCATENATION ---
  if (event.method === 'concatenation') {
     const { operands, result_value } = event;
     const [op1, op2] = Object.values(operands);
     const resultChars = result_value.split('');

     return (
        <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
            {/* Source Strings */}
            <div className='flex items-center gap-4'>
                 <div className="flex gap-1 p-2 border rounded-md border-slate-600 bg-slate-800">
                    {op1.split('').map((c, i) => <CharBox key={`op1-${i}`} char={c} index={i} />)}
                </div>
                <span className='text-3xl font-bold text-cyan-400'>+</span>
                 <div className="flex gap-1 p-2 border rounded-md border-slate-600 bg-slate-800">
                    {op2.split('').map((c, i) => <CharBox key={`op2-${i}`} char={c} index={i} />)}
                </div>
            </div>
           
            {/* Result String */}
             <div className="mt-4 text-center">
                <p className="text-lg text-slate-300 mb-2">Result:</p>
                <div className="flex flex-wrap justify-center gap-2">
                    <AnimatePresence>
                    {resultChars.map((char, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <CharBox char={char} index={i} />
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
     )
  }

  // Fallback for other string methods you might add later
  return (
    <div className="text-slate-400 text-center pt-8 flex items-center justify-center gap-2">
      <FileJson /> String Operation: {event.method}
    </div>
  );
}