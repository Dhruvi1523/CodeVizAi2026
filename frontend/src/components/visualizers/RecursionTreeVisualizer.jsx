// // src/components/call-stack/RecursionTreeVisualizer.jsx

// import React, { useRef, useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// const TreeNode = ({ node, nodeRefs, currentStep }) => {
//   const isActive = currentStep >= node.start_step && (node.end_step === -1 || currentStep < node.end_step);
//   const isCompleted = node.end_step !== -1 && currentStep >= node.end_step;
//   let nodeClasses = "border-gray-600 bg-gray-800";
//   if (isActive) nodeClasses = "border-purple-500 bg-purple-900/50 ring-2 ring-purple-500";
//   if (isCompleted) nodeClasses = "border-green-700 bg-green-900/50 opacity-70";
  
//   const nodeVariants = {
//       hidden: { opacity: 0, x: -20 },
//       visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, delayChildren: 0.1 }, },
//   };

//   return (
//     <motion.div layout variants={nodeVariants} className="flex flex-col items-start my-2">
//       <motion.div
//         ref={(el) => { if (el) nodeRefs.current.set(node.id, el); }}
//         className={`p-2 rounded-lg border font-mono text-sm transition-all duration-300 ${nodeClasses}`}
//         whileHover={{ scale: 1.05 }}
//       >
//         <span className="text-purple-300">{node.name}({Object.entries(node.args).map(([k,v]) => `${k}=${v}`).join(', ')})</span>
//         {isCompleted && node.return_value && (
//           <span className="font-bold text-green-300 ml-2">→ {String(node.return_value.value)}</span>
//         )}
//       </motion.div>
//       {node.children.length > 0 && (
//         <motion.div variants={nodeVariants} className="ml-8 mt-2 pl-8 border-l-2 border-gray-700">
//           {node.children.map(child => (
//             <TreeNode key={child.id} node={child} nodeRefs={nodeRefs} currentStep={currentStep} />
//           ))}
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

// const RecursionTreeVisualizer = ({ tree, currentStep, trace }) => {
//     const nodeRefs = useRef(new Map());
//     const containerRef = useRef(null);
//     const [intermediateAnimation, setIntermediateAnimation] = useState(null);
//     const [finalResultAnimation, setFinalResultAnimation] = useState(null);

//     useEffect(() => {
//         if (!tree || !trace[currentStep]) {
//             setIntermediateAnimation(null);
//             setFinalResultAnimation(null);
//             return;
//         }

//         let newIntermediate = null;
//         let newFinal = null;
        
//         const currentEvent = trace[currentStep].event;
//         if (currentEvent && typeof currentEvent === 'object' && containerRef.current) {
//             const containerRect = containerRef.current.getBoundingClientRect();

//             if (currentEvent.type === 'function_return_used') {
//                 const { source_node_id, target_node_id, value } = currentEvent;
//                 const childEl = nodeRefs.current.get(source_node_id);
//                 const parentEl = nodeRefs.current.get(target_node_id);

//                 if (childEl && parentEl) {
//                     const childRect = childEl.getBoundingClientRect();
//                     const parentRect = parentEl.getBoundingClientRect();
//                     newIntermediate = {
//                         id: `${source_node_id}-${target_node_id}-${currentStep}`,
//                         value: value.value,
//                         from: { x: childRect.left - containerRect.left + childRect.width / 2, y: childRect.top - containerRect.top + childRect.height / 2 },
//                         to: { x: parentRect.left - containerRect.left + parentRect.width / 2, y: parentRect.top - containerRect.top + parentRect.height / 2 },
//                     };
//                 }
//             }

//             if (currentEvent.type === 'function_root_return') {
//                 const { source_node_id, value } = currentEvent;
//                 const sourceEl = nodeRefs.current.get(source_node_id);

//                 if (sourceEl) {
//                     const sourceRect = sourceEl.getBoundingClientRect();
//                     newFinal = {
//                         id: `${source_node_id}-final-result-${currentStep}`,
//                         value: value.value,
//                         pos: { 
//                             x: sourceRect.right - containerRect.left + 20, 
//                             y: sourceRect.top - containerRect.top + sourceRect.height / 2 - 20 
//                         },
//                     };
//                 }
//             }
//         }
        
//         setIntermediateAnimation(newIntermediate);
//         setFinalResultAnimation(newFinal);

//     }, [tree, currentStep, trace]);

//     if (!tree) return null;

//     return (
//         <div className="p-4 overflow-auto">
//             <h3 className="font-bold text-lg mb-4 text-purple-300">Recursion Call Tree</h3>
//             <div className="relative" ref={containerRef}>
//                 <AnimatePresence>
//                     {intermediateAnimation && (
//                         <motion.div 
//                             key={intermediateAnimation.id} 
//                             className="absolute z-20 bg-cyan-500 text-black font-mono font-bold px-2 py-1 rounded-full text-sm pointer-events-none" 
//                             initial={intermediateAnimation.from} 
//                             animate={{ ...intermediateAnimation.to, opacity: 0, scale: 0.5 }} 
//                             exit={{ opacity: 0 }} 
//                             transition={{ duration: 0.8, ease: "circOut" }}
//                         >
//                             {String(intermediateAnimation.value)}
//                         </motion.div>
//                     )}
//                 </AnimatePresence>
//                 <motion.div className="relative z-10" initial="hidden" animate="visible">
//                     <TreeNode node={tree} nodeRefs={nodeRefs} currentStep={currentStep} />
//                 </motion.div>
//             </div>
//         </div>
//     );
// };

// export default RecursionTreeVisualizer;

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A single, recursive node in the call tree
const TreeNode = ({ node, nodeRefs, currentStep }) => {
    const isActive = currentStep >= node.start_step && (node.end_step === -1 || currentStep < node.end_step);
    const isCompleted = node.end_step !== -1 && currentStep >= node.end_step;

    // Dynamically set styles based on the node's execution state
    let statusStyles = "border-slate-600 bg-slate-800";
    if (isActive) statusStyles = "border-indigo-500 bg-indigo-900/50 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20";
    if (isCompleted) statusStyles = "border-emerald-600 bg-emerald-900/40 opacity-90";

    const nodeVariants = {
        hidden: { opacity: 0, x: -15 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { type: 'spring', stiffness: 300, damping: 20 }
        },
    };

    const pulseAnimation = {
        scale: [1, 1.03, 1],
        transition: {
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
        }
    };
    
    // Format arguments for display, e.g., "n=5"
    const formattedArgs = Object.entries(node.args)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');

    return (
        <motion.li
            layout
            variants={nodeVariants}
            initial="hidden"
            animate="visible"
            className="relative flex flex-col items-start"
        >
            {/* The main box for the function call */}
            <motion.div
                ref={(el) => { if (el) nodeRefs.current.set(node.id, el); }}
                className={`flex items-baseline gap-2 p-2 px-3 rounded-lg border font-mono text-sm transition-all duration-300 ${statusStyles}`}
                animate={isActive ? pulseAnimation : {}}
                whileHover={{ scale: 1.05 }}
            >
                <span className="text-slate-300">{node.name}({formattedArgs})</span>
                {isCompleted && node.return_value && (
                    <span className="font-bold text-emerald-300 ml-2">➔ {String(node.return_value.value)}</span>
                )}
            </motion.div>

            {/* Render child nodes if they exist and the parent is active */}
            {node.children.length > 0 && (
                <AnimatePresence>
                    {isActive && (
                         <motion.ul
                            className="pl-8 pt-4 relative"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.3, staggerChildren: 0.1 } }}
                            exit={{ opacity: 0 }}
                          >
                            {/* Vertical connecting line */}
                            <div className="absolute top-0 left-4 w-px h-full bg-slate-600" />
                            {node.children.map(child => (
                                <div key={child.id} className="relative pt-4">
                                     {/* Horizontal line connecting to the child */}
                                     <div className="absolute top-8 left-0 w-4 h-px bg-slate-600" />
                                     <TreeNode node={child} nodeRefs={nodeRefs} currentStep={currentStep} />
                                </div>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            )}
        </motion.li>
    );
};

// The main visualizer component
const RecursionTreeVisualizer = ({ tree, currentStep, trace }) => {
    const nodeRefs = useRef(new Map());
    const containerRef = useRef(null); // Ref for the outer container (viewport)
    const treeWrapperRef = useRef(null); // Ref for the content that will be scaled
    const [returnValueAnimation, setReturnValueAnimation] = useState(null);
    const [scale, setScale] = useState(1); // State to hold the scale factor

    // This callback will measure and update the scale
    const updateScale = useCallback(() => {
        const container = containerRef.current;
        const content = treeWrapperRef.current;
        if (!container || !content) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const contentWidth = content.scrollWidth; // Use scrollWidth for accurate size
        const contentHeight = content.scrollHeight; // Use scrollHeight for accurate size
        
        if (contentWidth === 0 || contentHeight === 0) return;

        // Calculate scale to fit both width and height, with a 10% margin
        const widthScale = containerWidth / contentWidth;
        const heightScale = containerHeight / contentHeight;
        const newScale = Math.min(widthScale, heightScale) * 0.90;

        // Don't scale up beyond the original size (100%)
        setScale(Math.min(newScale, 1));
    }, []);

    // Effect to handle resizing and initial scaling
    useEffect(() => {
        const container = containerRef.current;
        const content = treeWrapperRef.current;
        if (!container || !content) return;
        
        // A small delay ensures content is rendered before measuring
        const timeoutId = setTimeout(updateScale, 50);

        const observer = new ResizeObserver(updateScale);
        observer.observe(container);
        observer.observe(content);

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        }
    }, [tree, updateScale]);


    // This effect calculates and triggers animations for return values
    useEffect(() => {
        if (!tree || !trace[currentStep]) {
            setReturnValueAnimation(null);
            return;
        }

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
                    setReturnValueAnimation({
                        id: `${source_node_id}-${target_node_id}`,
                        value: value.value,
                        from: { x: childRect.left - containerRect.left + childRect.width / 2, y: childRect.top - containerRect.top + childRect.height / 2 },
                        to: { x: parentRect.left - containerRect.left + parentRect.width / 2, y: parentRect.top - containerRect.top + parentRect.height / 2 },
                        isFinal: false,
                    });
                }
            }
            else if (currentEvent.type === 'function_root_return') {
                const { source_node_id, value } = currentEvent;
                const sourceEl = nodeRefs.current.get(source_node_id);
                 if (sourceEl) {
                    const sourceRect = sourceEl.getBoundingClientRect();
                    setReturnValueAnimation({
                        id: `${source_node_id}-final`,
                        value: `Final Result: ${value.value}`,
                        from: { x: sourceRect.right - containerRect.left + 10, y: sourceRect.top - containerRect.top + sourceRect.height / 2 },
                        to: { x: sourceRect.right - containerRect.left + 20, y: sourceRect.top - containerRect.top + sourceRect.height / 2 },
                        isFinal: true,
                    });
                 }
            }
        } else {
             setReturnValueAnimation(null);
        }
    }, [tree, currentStep, trace]);

    if (!tree) return null;

    return (
        <div className="p-2 h-full w-full overflow-hidden relative" ref={containerRef}>
             <AnimatePresence>
                {returnValueAnimation && (
                    <motion.div
                        key={returnValueAnimation.id}
                        className={`absolute z-20 font-mono font-bold px-2.5 py-1 rounded-full text-sm pointer-events-none shadow-lg ${
                            returnValueAnimation.isFinal 
                            ? 'bg-emerald-400 text-black shadow-emerald-400/30' 
                            : 'bg-sky-400 text-black shadow-sky-400/30'
                        }`}
                        initial={returnValueAnimation.from}
                        animate={{
                            ...returnValueAnimation.to,
                            opacity: returnValueAnimation.isFinal ? [0, 1] : 0,
                            scale: returnValueAnimation.isFinal ? 1 : 0.5,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 20,
                        }}
                    >
                        {String(returnValueAnimation.value)}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="w-full h-full flex items-center justify-center">
                <div
                    ref={treeWrapperRef}
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'center',
                        transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' // Smoother easing
                    }}
                >
                    <motion.ul initial="hidden" animate="visible" className="inline-block">
                        <TreeNode node={tree} nodeRefs={nodeRefs} currentStep={currentStep} />
                    </motion.ul>
                </div>
            </div>
        </div>
    );
};

export default RecursionTreeVisualizer;

