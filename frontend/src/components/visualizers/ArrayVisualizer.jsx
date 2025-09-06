// src/components/state/ArrayVisualizer.jsx

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PointerArrow from './PointerArrow';

const ArrayVisualizer = ({ name, data, prevData, currentEvent }) => {
  const itemRefs = useRef(new Map());
  const containerRef = useRef(null);
  const [pointers, setPointers] = useState([]);

  const prevSnapshot = prevData ? prevData.snapshot : [];
  const currentSnapshot = data ? data.snapshot : [];
  
  const opEvent = (currentEvent?.type === 'array_operation' && currentEvent?.variable === name) ? currentEvent : null;

  useEffect(() => {
    if (!opEvent || !containerRef.current) return;
    
    let targetIndex = -1;
    let label = opEvent.method;

    if (opEvent.method === 'append') {
        targetIndex = prevSnapshot.length;
    } else if (opEvent.method === 'insert') {
        targetIndex = opEvent.args[0];
        label = `insert at ${targetIndex}`;
    } else if (opEvent.method === 'assign_at_index') {
        const changedIdx = currentSnapshot.findIndex((val, i) => val !== prevSnapshot[i]);
        targetIndex = changedIdx >= 0 ? changedIdx : -1;
        if(targetIndex !== -1) label = `update at ${targetIndex}`;
    } else if (opEvent.method === 'pop') {
        targetIndex = prevSnapshot.length - 1;
    }

    if (targetIndex !== -1) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const targetEl = itemRefs.current.get(targetIndex);
        let x = 0;
        let y = 0;
        
        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            x = rect.left - containerRect.left;
            y = rect.top - containerRect.top + rect.height / 2;
        } else if (targetIndex > 0) { // Appending
            const lastEl = itemRefs.current.get(targetIndex - 1);
            if (lastEl) {
                const rect = lastEl.getBoundingClientRect();
                x = rect.right - containerRect.left + 5;
                y = rect.top - containerRect.top + rect.height / 2;
            }
        } else { // Inserting at the beginning
            x = 10;
            y = containerRef.current.offsetHeight / 2;
        }

        const newPointer = { id: Date.now(), x, y, label };
        setPointers([newPointer]);

        const timer = setTimeout(() => setPointers([]), 2000);
        return () => clearTimeout(timer);
    }
  }, [opEvent, prevSnapshot, currentSnapshot]);

  const itemVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1, transition: { type: 'spring' } },
    shuffle: (i) => ({
      opacity: 1, scale: 1, y: [Math.random() * -40 - 20, 0],
      transition: { type: 'spring', stiffness: 300, damping: 20, delay: i * 0.08 }
    }),
    exit: { opacity: 0, scale: 0.5, y: 20 },
    pop: { opacity: 0, scale: 0.3, x: 100, transition: { duration: 0.6 } },
  };
  
  let poppedValue = null;
  if (opEvent?.method === 'pop' && prevSnapshot.length > currentSnapshot.length) {
    poppedValue = prevSnapshot[prevSnapshot.length - 1];
  }

  return (
    <div className="mb-4 relative">
      <p className="font-mono text-gray-400 mb-2">{name} = </p>
      <motion.div
        layout
        ref={containerRef}
        className="flex flex-wrap gap-2 items-center bg-gray-800 p-3 rounded-lg min-h-[60px] relative"
        animate={{ scaleX: opEvent?.method === 'reverse' ? [1, -1, 1] : 1, transition: { duration: 1.2, ease: 'easeInOut' } }}
      >
        <AnimatePresence>
            {pointers.map(p => <PointerArrow {...p} />)}
        </AnimatePresence>
        <AnimatePresence>
          {data.value.map((item, index) => {
            const hasChanged = prevSnapshot[index] !== undefined && prevSnapshot[index] !== item.value;
            let animationType = "animate";
            if (opEvent?.method === 'sort') animationType = "shuffle";
            
            return (
              <motion.div
                ref={(el) => itemRefs.current.set(index, el)}
                key={item.value + '-' + index}
                layout="position"
                variants={itemVariants}
                initial="initial"
                animate={animationType}
                exit={opEvent?.method === 'pop' && index === data.value.length ? "pop" : "exit"}
                custom={index}
              >
                <motion.div
                    className="flex flex-col items-center justify-center p-2 rounded-md shadow-md min-w-[50px] bg-indigo-600"
                    animate={{
                        backgroundColor: hasChanged ? ['#facc15', '#4f46e5'] : '#4f46e5',
                        rotateY: hasChanged ? [0, 180, 0] : 0,
                        scaleX: opEvent?.method === 'reverse' ? [1, -1, 1] : 1,
                        transition: { duration: 1.0 }
                    }}
                >
                    <span className="text-xs text-gray-300 font-mono">{index}</span>
                    <span className="font-bold text-white text-lg font-mono">{item.value}</span>
                </motion.div>
              </motion.div>
            );
          })}
          {poppedValue && (
            <motion.div
              key={`popped-${poppedValue}`}
              className="absolute flex flex-col items-center justify-center p-2 rounded-md shadow-md min-w-[50px] bg-red-600"
              initial={{ opacity: 1, scale: 1, right: '1rem' }}
              animate={{ opacity: 0, scale: 0, x: 100, rotate: 90 }}
              transition={{ duration: 0.5 }}
            >
              <span className="font-bold text-white text-lg font-mono">{poppedValue}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ArrayVisualizer;