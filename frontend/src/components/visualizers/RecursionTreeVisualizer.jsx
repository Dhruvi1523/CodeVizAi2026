// src/components/call-stack/RecursionTreeVisualizer.jsx

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="p-4 overflow-auto">
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
                </AnimatePresence>
                <motion.div className="relative z-10" initial="hidden" animate="visible">
                    <TreeNode node={tree} nodeRefs={nodeRefs} currentStep={currentStep} />
                </motion.div>
            </div>
        </div>
    );
};

export default RecursionTreeVisualizer;