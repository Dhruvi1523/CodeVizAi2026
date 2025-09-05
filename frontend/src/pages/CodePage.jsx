// CodePage.jsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";

// --- Utility Hooks ---
const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// --- VISUALIZER SUB-COMPONENTS ---

const AssignmentVisualizer = ({ event }) => {
  return (
    <div className="p-4 flex flex-col items-center justify-center gap-4 font-mono h-full">
        <p className="text-lg text-cyan-300">Assigning value to <span className="font-bold">{event.variable}</span></p>
        <div className="flex items-center gap-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.5, x: -100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: 'spring', delay: 0.3 }}
                className="text-3xl font-bold bg-gray-800 p-4 rounded-lg"
            >
                {String(event.value)}
            </motion.div>
            <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.8 }}>
                <svg height="40" width="40"><line x1="0" y1="20" x2="40" y2="20" style={{stroke: '#5eead4', strokeWidth:3}} /></svg>
            </motion.div>
            <motion.div
                key={event.variable}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.1 }}
                transition={{ delay: 1.2, yoyo: Infinity, duration: 0.8 }}
                className="flex flex-col items-center p-2 rounded-lg border-2 border-teal-400 min-w-[80px]"
            >
                <span className="text-sm text-gray-400">{event.variable}</span>
                <span className="text-2xl font-bold">{String(event.value)}</span>
            </motion.div>
        </div>
    </div>
  )
};

const OperationVisualizer = ({ event }) => {
  const operandA = Object.entries(event.operands)[0];
  const operandB = Object.entries(event.operands)[1];

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-gray-900/50 rounded-lg font-mono h-full">
      <p className="text-lg text-cyan-300">Performing Operation</p>
      <div className="flex items-center justify-center space-x-4 h-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
            <span className="text-sm text-gray-400">{operandA[0]}</span>
            <div className="bg-indigo-600 text-white font-bold p-4 rounded-lg text-xl min-w-[60px] text-center">{String(operandA[1])}</div>
        </motion.div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: 'spring' }} className="text-4xl font-bold text-yellow-400">
          {event.operator}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col items-center">
            <span className="text-sm text-gray-400">{operandB[0]}</span>
            <div className="bg-indigo-600 text-white font-bold p-4 rounded-lg text-xl min-w-[60px] text-center">{String(operandB[1])}</div>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{delay: 1.5}} className="flex items-center space-x-2 pt-2">
            <span className="text-2xl text-gray-400">=</span>
            <div className="bg-green-600 text-white font-bold p-3 rounded-lg text-lg min-w-[50px] text-center">{String(event.result_value)}</div>
      </motion.div>
    </div>
  );
};

const ArrayOperationVisualizer = ({ event }) => {
  const formattedArgs = event.args.map(arg => {
    if (typeof arg === 'string' && arg.startsWith("'") && arg.endsWith("'")) {
      return arg.slice(1, -1);
    }
    return String(arg);
  }).join(', ');

  const operationText = event.method === 'assign_at_index' ? '[index] = value' : `.${event.method}(${formattedArgs})`;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-gray-900/50 rounded-lg font-mono h-full">
      <p className="text-lg text-cyan-300">Performing Operation on <span className="font-bold text-yellow-300">{event.variable}</span></p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 items-center bg-gray-800 p-3 rounded-lg"
      >
        {(event.list_snapshot || []).map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-2 rounded-md min-w-[40px] bg-indigo-600 text-white">
            <span className="text-xs text-gray-300">{index}</span>
            <span className="font-bold text-md">{String(item)}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="text-2xl text-yellow-400 font-bold"
      >
        {operationText}
      </motion.div>
    </div>
  );
};

const ConditionVisualizer = ({ event }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gray-900/50 rounded-lg font-mono h-full">
      <p className="text-lg text-cyan-300">Evaluating Condition</p>
      <div className="flex items-center justify-center space-x-4">
        {/* 'False' Path */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col items-center"
        >
          <span className="text-sm text-gray-400">False Path</span>
          <motion.div
            className="w-16 h-1 bg-red-500/50 rounded-full"
            animate={{ scaleX: event.result ? 0.1 : 1.2, opacity: event.result ? 0.5 : 1 }}
            transition={{ delay: 1.2, type: 'spring' }}
          />
        </motion.div>

        {/* The Condition Diamond */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="bg-gray-800 border-2 border-yellow-400 text-yellow-300 font-bold text-xl px-6 py-10 rounded-lg transform -rotate-45"
        >
          <span className="transform rotate-45 inline-block whitespace-nowrap">{event.condition_str}</span>
        </motion.div>

        {/* 'True' Path */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col items-center"
        >
          <span className="text-sm text-gray-400">True Path</span>
          <motion.div
            className="w-16 h-1 bg-green-500/50 rounded-full"
            animate={{ scaleX: event.result ? 1.2 : 0.1, opacity: event.result ? 1 : 0.5 }}
            transition={{ delay: 1.2, type: 'spring' }}
          />
        </motion.div>
      </div>
      
      {/* Result Text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={String(event.result)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className={`text-2xl font-bold ${event.result ? 'text-green-400' : 'text-red-400'}`}
        >
          Result is {String(event.result)}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

const PointerArrow = ({ x, y, label, id }) => {
    return (
        <motion.div
            key={id}
            className="absolute z-10 flex items-center"
            style={{ top: y, left: 0, y: "-50%" }}
            initial={{ opacity: 0, x: x - 40 }}
            animate={{ opacity: 1, x: x - 10, transition: { type: 'spring', stiffness: 250, damping: 15, delay: 0.1 } }}
            exit={{ opacity: 0, x: x - 50, scale: 0.5, transition: { duration: 0.4 } }}
        >
            {label && <span className="px-2 py-0.5 bg-sky-500 text-white text-xs rounded mr-2 whitespace-nowrap">{label}</span>}
            <span className="text-sky-400 text-2xl font-mono">--&gt;</span>
        </motion.div>
    )
}

// +++ NEW: Redesigned Loop Visualizer +++
const LoopVisualizer = ({ event }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 font-mono h-full">
        <p className="text-lg text-purple-300">Loop Iteration</p>
        <div className="relative w-48 h-32 flex items-center justify-center">
            {/* The box representing the loop body */}
            <motion.div 
              className="absolute w-40 h-24 bg-gray-800 border-2 border-purple-500 rounded-lg flex flex-col items-center justify-center"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.2}}
            >
               <AnimatePresence mode="wait">
                 <motion.div
                     key={event.iteration}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ type: 'spring', duration: 0.5 }}
                     className="flex flex-col items-center"
                 >
                     <div className="text-4xl text-purple-400 font-bold">{event.iteration}</div>
                     <p className="text-sm text-gray-400 mt-1">Iteration</p>
                 </motion.div>
               </AnimatePresence>
            </motion.div>

            {/* The animated circle */}
            <motion.div
                className="absolute w-6 h-6 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                    offsetPath: "path('M 8,16 A 60 48 0 1 1 184 16 A 60 48 0 1 1 8 16 Z')" // Adjusted SVG path around the box
                }}
            />
        </div>
        {event.loop_variable && (
          <motion.p 
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.5}}
            className="mt-2 text-md text-cyan-300"
          >
            <span className="font-bold">{event.loop_variable.name}</span> is now <span className="font-bold text-lg">{String(event.loop_variable.value)}</span>
          </motion.p>
        )}
    </div>
  );
};

// +++ NEW: Return Visualizer +++
const ReturnVisualizer = ({ event }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-gray-900/50 rounded-lg font-mono h-full">
      <p className="text-lg text-green-300">Returning Value</p>
      <div className="flex items-center justify-center space-x-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, delay: 0.2 }}
          className="bg-green-600 text-white font-bold text-3xl p-5 rounded-lg shadow-lg shadow-green-500/30"
        >
          {String(event.value.value)}
        </motion.div>
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
        >
            <svg height="40" width="80" className="text-green-400">
                <path d="M 0 20 L 60 20 L 45 10 M 60 20 L 45 30" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
        </motion.div>
      </div>
    </div>
  );
};

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

const TreeNode = ({ node, nodeRefs, currentStep }) => {
  const isActive = currentStep >= node.start_step && (node.end_step === -1 || currentStep < node.end_step);
  const isCompleted = node.end_step !== -1 && currentStep >= node.end_step;
  let nodeClasses = "border-gray-600 bg-gray-800";
  if (isActive) nodeClasses = "border-purple-500 bg-purple-900/50 ring-2 ring-purple-500";
  if (isCompleted) nodeClasses = "border-green-700 bg-green-900/50 opacity-70";
  const nodeVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, delayChildren: 0.1 }, },
  };
  return (
    <motion.div layout variants={nodeVariants} className="flex flex-col items-start my-2">
      <motion.div
        ref={(el) => { if (el) nodeRefs.current.set(node.id, el); }}
        className={`p-2 rounded-lg border font-mono text-sm transition-all duration-300 ${nodeClasses}`}
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-purple-300">{node.name}({Object.entries(node.args).map(([k,v]) => `${k}=${v}`).join(', ')})</span>
        {isCompleted && node.return_value && (
          <span className="font-bold text-green-300 ml-2">→ {String(node.return_value.value)}</span>
        )}
      </motion.div>
      {node.children.length > 0 && (
        <motion.div variants={nodeVariants} className="ml-8 mt-2 pl-8 border-l-2 border-gray-700">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} nodeRefs={nodeRefs} currentStep={currentStep} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

const RecursionTreeVisualizer = ({ tree, currentStep, trace }) => {
    const nodeRefs = useRef(new Map());
    const containerRef = useRef(null);
    const [intermediateAnimation, setIntermediateAnimation] = useState(null);
    const [finalResultAnimation, setFinalResultAnimation] = useState(null);

    useEffect(() => {
        if (!tree || !trace[currentStep]) {
            setIntermediateAnimation(null);
            setFinalResultAnimation(null);
            return;
        }

        let newIntermediate = null;
        let newFinal = null;
        
        const currentEvent = trace[currentStep].event;
        if (currentEvent && typeof currentEvent === 'object' && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();

            if (currentEvent.type === 'function_return_used') {
                const { source_node_id, target_node_id, value } = currentEvent;
                const childEl = nodeRefs.current.get(source_node_id);
                const parentEl = nodeRefs.current.get(target_node_id);

                if (childEl && parentEl) {
                    const childRect = childEl.getBoundingClientRect();
                    const parentRect = parentEl.getBoundingClientRect();
                    newIntermediate = {
                        id: `${source_node_id}-${target_node_id}-${currentStep}`,
                        value: value.value,
                        from: { x: childRect.left - containerRect.left + childRect.width / 2, y: childRect.top - containerRect.top + childRect.height / 2 },
                        to: { x: parentRect.left - containerRect.left + parentRect.width / 2, y: parentRect.top - containerRect.top + parentRect.height / 2 },
                    };
                }
            }

            if (currentEvent.type === 'function_root_return') {
                const { source_node_id, value } = currentEvent;
                const sourceEl = nodeRefs.current.get(source_node_id);

                if (sourceEl) {
                    const sourceRect = sourceEl.getBoundingClientRect();
                    newFinal = {
                        id: `${source_node_id}-final-result-${currentStep}`,
                        value: value.value,
                        pos: { 
                            x: sourceRect.right - containerRect.left + 20, 
                            y: sourceRect.top - containerRect.top + sourceRect.height / 2 - 20 
                        },
                    };
                }
            }
        }
        
        setIntermediateAnimation(newIntermediate);
        setFinalResultAnimation(newFinal);

    }, [tree, currentStep, trace]);

    if (!tree) return null;

    return (
        <div className="p-4">
            <h3 className="font-bold text-lg mb-4 text-purple-300">Recursion Call Tree</h3>
            <div className="relative" ref={containerRef}>
                <AnimatePresence>
                    {intermediateAnimation && (
                        <motion.div 
                            key={intermediateAnimation.id} 
                            className="absolute z-20 bg-cyan-500 text-black font-mono font-bold px-2 py-1 rounded-full text-sm pointer-events-none" 
                            initial={intermediateAnimation.from} 
                            animate={{ ...intermediateAnimation.to, opacity: 0, scale: 0.5 }} 
                            exit={{ opacity: 0 }} 
                            transition={{ duration: 0.8, ease: "circOut" }}
                        >
                            {String(intermediateAnimation.value)}
                        </motion.div>
                    )}
                    {/* {finalResultAnimation && (
                        <motion.div
                            key={finalResultAnimation.id}
                            className="absolute z-30 bg-green-500 text-white font-mono font-bold px-3 py-1.5 rounded-lg text-md shadow-lg shadow-green-500/50 pointer-events-none"
                            initial={{ opacity: 0, scale: 0.5, ...finalResultAnimation.pos }}
                            animate={{ opacity: [0, 1, 1, 0], scale: 1.1, transition: { duration: 2.5, times: [0, 0.1, 0.8, 1] } }}
                            exit={{ opacity: 0 }}
                        >
                            Final Result: {String(finalResultAnimation.value)}
                        </motion.div>
                    )} */}
                </AnimatePresence>
                <motion.div className="relative z-10" initial="hidden" animate="visible">
                    <TreeNode node={tree} nodeRefs={nodeRefs} currentStep={currentStep} />
                </motion.div>
            </div>
        </div>
    );
};

const CallStack = ({ stackFrames = [], sourceLinePosition }) => {
  const stackRef = useRef(null);
  const prevStackHeight = usePrevious(stackFrames.length);
  return (
    <div ref={stackRef} className="flex flex-col-reverse h-full bg-gray-900/50 rounded-lg p-2 overflow-hidden">
      <AnimatePresence>
        {stackFrames.map((frame, index) => {
          const isNewFrame = index === stackFrames.length - 1 && stackFrames.length > prevStackHeight && sourceLinePosition;
          const stackRect = stackRef.current?.getBoundingClientRect();
          const initialPosition = isNewFrame && stackRect ? { opacity: 0, x: sourceLinePosition.x - stackRect.left, y: sourceLinePosition.y - stackRect.top, scale: 0.2, } : { opacity: 0, y: -40, scale: 1.1 };
          return (
            <motion.div key={`${frame}-${index}`} layout initial={initialPosition} animate={{ opacity: 1, y: 0, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.8, transition: { duration: 0.4 } }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-purple-800/50 border border-purple-600 rounded-md p-3 text-center font-mono font-semibold shadow-lg mt-2">
              {frame}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page Component ---
const CodePage = () => {
  const [code, setCode] = useState(
`# Factorial using recursion
def factorial(n):
    if n == 0 or n == 1:   # base case
        return 1
    else:
        return n * factorial(n - 1)

# Example usage
num = 5
print("Factorial of", num, "is:", factorial(num))

`
  );
  
  const [trace, setTrace] = useState([]);
  const [callTree, setCallTree] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("trace");
  const [mermaidCode, setMermaidCode] = useState("");
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lineTrails, setLineTrails] = useState([]);
  const variableRefs = useRef(new Map());
  const visualizerContainerRef = useRef(null);
  const [dataPackets, setDataPackets] = useState([]);
  const [loopArrow, setLoopArrow] = useState(null);
  const mermaidContainerRef = useRef(null);
  // +++ NEW: State for final output modal +++
  const [finalOutputToShow, setFinalOutputToShow] = useState(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }

  useEffect(() => {
    if (window.mermaid) {
        window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.onload = () => {
      if (window.mermaid) {
        window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
      }
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleRun = async () => {
    setIsLoading(true);
    setError("");
    setTrace([]);
    setOutput("");
    setCallTree(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setActiveTab("trace");
    setLineTrails([]);
    setLoopArrow(null);
    setFinalOutputToShow(null); // Reset output modal
    try {
      const res = await fetch("http://127.0.0.1:8000/trace", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code || "" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({detail: "An unknown error occurred"}));
        throw new Error(data.detail || `HTTP Error: ${res.status}`);
      }
      const data = await res.json();
      setTrace(data.trace || []);
      setOutput(data.output || "");
      setCallTree(data.call_tree || null);
    } catch (err) {
      setError(`Failed to fetch trace: ${err.message}. Is the backend server running?`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFlowchart = useCallback(async () => {
    setIsLoading(true);
    setMermaidCode("");
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/flowchart", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code || "" }),
      });
        if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || `HTTP Error: ${res.status}`);
      }
      const data = await res.json();
      setMermaidCode(data.mermaid || "");
      setActiveTab("flowchart");
    } catch (err) {     setError(`Failed to fetch flowchart: ${err.message}.`);
    } finally {
        setIsLoading(false);
    }
  }, [code]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < trace.length - 1) {
      interval = setInterval(() => setCurrentStep(prev => prev + 1), 1600 - speed);
    }
    // +++ NEW: Check for end of trace to show output +++
    else if (currentStep === trace.length - 1 && trace.length > 0) {
      setIsPlaying(false); // Stop playing at the end
      if(output) {
          setTimeout(() => {
              setFinalOutputToShow(output);
          }, 1000); // Show after a 1-second delay
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, trace.length, speed, output]);
  
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !trace[currentStep]) return;
    const currentTraceStep = trace[currentStep];
    if (currentTraceStep?.line) {
      editorRef.current.revealLineInCenter(currentTraceStep.line, 1);
      const top = editorRef.current.getTopForLineNumber(currentTraceStep.line);
      const newTrail = {
        id: `${currentStep}-${currentTraceStep.line}`,
        top: top,
        height: editorRef.current.getOption(monacoRef.current.editor.EditorOption.lineHeight) || 19,
        isError: !!currentTraceStep.error,
      };
      setLineTrails(prev => [...prev, newTrail].slice(-15));
    }
  }, [currentStep, trace]);

  useEffect(() => {
    if (window.mermaid) {
        window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
    }
    if (mermaidCode && activeTab === "flowchart" && mermaidContainerRef.current) {
        mermaidContainerRef.current.innerHTML = "";
        window.mermaid.render('mermaid-svg-1', mermaidCode).then(({ svg }) => {
            mermaidContainerRef.current.innerHTML = svg;
        });
    }
  }, [mermaidCode, activeTab]);

  useEffect(() => {
    if (activeTab !== 'flowchart' || !mermaidCode || !trace.length) return;
    const svg = mermaidContainerRef.current?.querySelector('svg');
    if (!svg) return;
    svg.querySelectorAll('.node, .edge-path').forEach(el => {
      el.style.stroke = '';
      el.style.strokeWidth = '';
      el.style.fillOpacity = '1';
    });
    const allNodes = svg.querySelectorAll('.node');
    allNodes.forEach(node => node.style.fillOpacity = '0.5');
    const currentLine = trace[currentStep]?.line;
    if (currentLine) {
        const activeNode = svg.querySelector(`[id$="_L${currentLine}"]`);
        if (activeNode) {
            activeNode.style.stroke = '#2dd4bf';
            activeNode.style.strokeWidth = '3px';
            activeNode.style.fillOpacity = '1';
        }
    }
  }, [currentStep, trace, activeTab, mermaidCode]);

  useEffect(() => {
    const currentEvent = trace[currentStep]?.event;
    const prevEvent = trace[currentStep - 1]?.event;

    if (!editorRef.current) return;
    const editorContainer = editorRef.current.getDomNode();
    if (!editorContainer) return;
    const editorRect = editorContainer.getBoundingClientRect();

    if (currentEvent?.type === 'loop_iteration' && prevEvent?.line) {
        const startLine = currentEvent.start_line;
        const startTop = editorRef.current.getTopForLineNumber(startLine);
        const endLine = prevEvent.line;
        const endTop = editorRef.current.getTopForLineNumber(endLine);
        const height = editorRef.current.getOption(monacoRef.current.editor.EditorOption.lineHeight);
        
        if (editorRect) {
            const startY = editorRect.top + startTop + height / 2;
            const endY = editorRect.top + endTop + height / 2;
            setLoopArrow({
                id: `${currentStep}-loop`,
                from: { y: endY, x: editorRect.left + 5 },
                to: { y: startY, x: editorRect.left + 5 },
            });
        }
        
    } else {
        setLoopArrow(null);
    }
    
    if (currentEvent && typeof currentEvent === 'object' && currentEvent.type === 'binary_operation') {
        const newPackets = [];
        const vizRect = visualizerContainerRef.current?.getBoundingClientRect();
        if (!vizRect) return;

        setTimeout(() => { 
            for (const varName of Object.keys(currentEvent.operands)) {
                const varEl = variableRefs.current.get(varName);
                if (varEl) {
                    const startRect = varEl.getBoundingClientRect();
                    newPackets.push({
                        id: `${currentStep}-${varName}`,
                        value: String(currentEvent.operands[varName]),
                        from: { x: startRect.left + startRect.width / 2, y: startRect.top + startRect.height / 2 },
                        to: { x: vizRect.left + vizRect.width / 2, y: vizRect.top + 60 } 
                    });
                }
            }
            setDataPackets(newPackets);
        }, 50);
    }
    
    if (prevEvent && typeof prevEvent === 'object' && prevEvent.type === 'binary_operation') {
        const resultVarName = prevEvent.result_variable;
        const resultVarEl = variableRefs.current.get(resultVarName);
        const vizRect = visualizerContainerRef.current?.getBoundingClientRect();

        if (resultVarEl && vizRect) {
            const endRect = resultVarEl.getBoundingClientRect();
            const resultPacket = {
                id: `${currentStep}-result`,
                value: String(prevEvent.result_value),
                from: { x: vizRect.left + vizRect.width / 2, y: vizRect.top + 120 }, 
                to: { x: endRect.left + endRect.width / 2, y: endRect.top + endRect.height / 2 }
            };
            setTimeout(() => setDataPackets([resultPacket]), 100); 
        }
    }
  }, [currentStep, trace]);

  const prevTraceStep = trace[currentStep - 1];
  const currentTraceStep = trace[currentStep];
  let sourceLinePosition = null;

  if (currentTraceStep && editorRef.current && monacoRef.current) {
      const isNewFrame = currentTraceStep.stack.length > (prevTraceStep?.stack.length || 0);
      if (isNewFrame && prevTraceStep?.line) {
          const editorContainer = editorRef.current.getDomNode();
          if (editorContainer) {
              const editorRect = editorContainer.getBoundingClientRect();
              const top = editorRef.current.getTopForLineNumber(prevTraceStep.line);
              sourceLinePosition = {
                  x: editorRect.left + 40,
                  y: editorRect.top + top,
              };
          }
      }
  }

  const renderCurrentStepVisualizer = () => {
    const currentEvent = trace[currentStep]?.event;
    
    if (callTree) {
        return <RecursionTreeVisualizer tree={callTree} currentStep={currentStep} trace={trace} />;
    }

    const eventTypes = ['binary_operation', 'assignment', 'loop_iteration', 'array_operation', 'condition_check', 'return_value'];

    return (
        <div className="h-full w-full flex flex-col items-center relative">
            <div className="flex-grow flex flex-col justify-center items-center relative min-h-[200px] w-full max-w-xl">
                <AnimatePresence>
                    {currentEvent && typeof currentEvent === 'object' && eventTypes.includes(currentEvent.type) &&
                        <motion.div
                            key={currentStep} 
                            initial={{ opacity: 0, y: -30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 250 } }}
                            exit={{ opacity: 0, y: 30, scale: 0.9, transition: { duration: 0.2 } }}
                            className="w-full"
                        >
                            {currentEvent.type === 'binary_operation' && <OperationVisualizer event={currentEvent} />}
                            {currentEvent.type === 'assignment' && <AssignmentVisualizer event={currentEvent} />}
                            {currentEvent.type === 'loop_iteration' && <LoopVisualizer event={currentEvent} />}
                            {currentEvent.type === 'array_operation' && <ArrayOperationVisualizer event={currentEvent} />}
                            {currentEvent.type === 'condition_check' && <ConditionVisualizer event={currentEvent} />}
                            {currentEvent.type === 'return_value' && <ReturnVisualizer event={currentEvent} />}
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
            
            <div className="w-full flex-shrink-0"> 
                <h3 className="text-xl font-bold text-gray-300 mb-2">Variables</h3>
                <div className="bg-gray-800 rounded-lg p-2 min-h-[100px] overflow-auto">
                    <VariablesVisualizer 
                        locals={trace[currentStep]?.locals || {}} 
                        prevLocals={prevTraceStep?.locals || {}} 
                        variableRefs={variableRefs} 
                        currentEvent={currentEvent} 
                    />
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <div className="w-1/2 flex flex-col p-4 gap-4">
        <div className="flex-grow border border-gray-700 rounded-lg overflow-hidden relative">
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
            }}
          />
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <AnimatePresence>
              {lineTrails.map((trail) => (
                <motion.div
                  key={trail.id}
                  className={`absolute w-full ${trail.isError ? 'bg-red-500/30 border-red-400' : 'bg-blue-500/20 border-blue-400'} border-l-4`}
                  initial={{ opacity: 1, y: trail.top, height: trail.height }}
                  animate={{ opacity: 0, transition: { duration: 2.5, ease: "easeOut" } }}
                  exit={{ opacity: 0 }}
                />
              ))}
            </AnimatePresence>
            <AnimatePresence>
                {loopArrow && (
                    <motion.div
                        key={loopArrow.id}
                        className="fixed z-50 pointer-events-none"
                        initial={{ x: loopArrow.from.x, y: loopArrow.from.y }}
                        animate={{ x: loopArrow.to.x, y: loopArrow.to.y }}
                        transition={{
                            type: 'spring',
                            stiffness: 100,
                            damping: 20,
                            duration: 0.8,
                            delay: 0.1,
                        }}
                    >
                      <svg width="40" height="40" viewBox="0 0 40 40" className="rotate-180 text-yellow-500">
                          <path d="M 5,20 A 15,15 0 0,1 20,5 A 15,15 0 0,1 35,20" stroke="currentColor" strokeWidth="2" fill="none" />
                          <path d="M 35,20 L 30,17 L 35,20 L 30,23 L 35,20 Z" fill="currentColor" />
                      </svg>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex-shrink-0 flex gap-4 items-center">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRun} disabled={isLoading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:bg-gray-500">{isLoading ? 'Running...' : 'Run Code'}</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleFlowchart} disabled={isLoading} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:bg-gray-500">{isLoading ? 'Generating...' : 'Generate Flowchart'}</motion.button>
        </div>
      </div>
      <div className="w-1/2 flex flex-col p-4 gap-4">
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div className="flex border-b border-gray-700">
            <button onClick={() => setActiveTab('trace')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'trace' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Trace</button>
            <button onClick={() => setActiveTab('flowchart')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'flowchart' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Flowchart</button>
            <button onClick={() => setActiveTab('output')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'output' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Output</button>
          </div>
          <div className="flex-grow bg-gray-800 rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="p-4 h-full">
                      {error && <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 whitespace-pre-wrap">{error}</div>}
                      {activeTab === 'trace' && !error && (
                          trace.length === 0
                          ? <p className="text-gray-500 text-center pt-8">Click "Run Code" to start tracing.</p>
                          : <div className="flex flex-col h-full gap-4">
                              <div className="flex items-center justify-center gap-4 p-2 bg-gray-900/50 rounded-lg">
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setIsPlaying(false); setCurrentStep(0); setLineTrails([]); setFinalOutputToShow(null);}} className="px-3 py-1 bg-gray-600 rounded">Reset</motion.button>
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCurrentStep((s) => Math.max(0, s - 1))} disabled={currentStep === 0} className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50">Prev</motion.button>
                                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-2 bg-blue-600 rounded w-24">{isPlaying ? 'Pause' : 'Play'}</motion.button>
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCurrentStep((s) => Math.min(trace.length - 1, s + 1))} disabled={currentStep >= trace.length - 1} className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50">Next</motion.button>
                                  <div className="flex items-center gap-2"><label className="text-sm">Speed</label><input type="range" min="100" max="1500" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-24" /></div>
                              </div>
                              <input type="range" min="0" max={trace.length > 0 ? trace.length - 1 : 0} value={currentStep} onChange={e => setCurrentStep(Number(e.target.value))} className="w-full" />
                              <div className="text-center -mt-2">
                                  <p className="text-sm text-gray-400">Step {currentStep + 1} / {trace.length} (Line: {trace[currentStep]?.line || 'N/A'})</p>
                                  <p className="text-md text-cyan-300 font-mono mt-1 h-6">{typeof currentTraceStep?.event === 'string' ? currentTraceStep?.event : currentTraceStep?.event?.type}</p>
                              </div>
                              <div className="flex-grow flex gap-4 min-h-0">
                                  <div className="w-2/3 overflow-auto p-2 bg-gray-900/50 rounded-lg">
                                      <div ref={visualizerContainerRef} className="h-full relative">
                                          {renderCurrentStepVisualizer()}
                                      </div>
                                  </div>
                                  <div className="w-1/3 flex flex-col">
                                      <h3 className="font-bold text-lg flex-shrink-0 mb-2 text-center">Call Stack</h3>
                                      <div className="flex-grow min-h-0">
                                          <CallStack stackFrames={currentTraceStep?.stack || []} sourceLinePosition={sourceLinePosition} />
                                      </div>
                                  </div>
                              </div>
                            </div>
                      )}
                      {activeTab === 'flowchart' && ( <div ref={mermaidContainerRef} className="p-4 rounded bg-gray-900 min-h-full flex items-center justify-center overflow-auto">{!mermaidCode && !isLoading && <p className="text-gray-500">Click "Generate Flowchart" to see the diagram.</p>} {isLoading && <p className="text-gray-400">Generating...</p>}</div> )}
                      {activeTab === 'output' && ( <pre className="bg-gray-900 p-4 rounded-lg whitespace-pre-wrap h-full">{output || 'No output produced.'}</pre> )}
                  </motion.div>
              </AnimatePresence>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {finalOutputToShow && (
            <motion.div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-800 rounded-xl p-8 border border-teal-500 shadow-2xl w-full max-w-lg"
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 20 }}
              >
                  <h2 className="text-2xl font-bold text-teal-300 mb-4">Execution Complete!</h2>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Final Output:</h3>
                  <pre className="bg-gray-900 p-4 rounded-lg whitespace-pre-wrap text-gray-200">{finalOutputToShow}</pre>
                  <div className="flex justify-end mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFinalOutputToShow(null)}
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold"
                    >
                        Close
                    </motion.button>
                  </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence onExitComplete={() => setDataPackets([])}>
        {dataPackets.map(packet => (
            <motion.div
                key={packet.id}
                className="fixed z-50 bg-yellow-400 text-black font-mono font-bold px-2.5 py-1 rounded-full text-sm shadow-lg pointer-events-none"
                initial={packet.from}
                animate={{
                    ...packet.to,
                    opacity: 0,
                    scale: 0.5,
                    transition: { duration: 0.9, ease: "easeInOut" }
                }}
                exit={{ opacity: 0 }}
            >
                {packet.value}
            </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CodePage;