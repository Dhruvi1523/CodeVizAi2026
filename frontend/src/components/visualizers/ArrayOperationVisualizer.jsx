// import React, { useState, useLayoutEffect, useRef } from 'react';
// import { motion } from 'framer-motion';

// // This is the responsive scaling hook, taken from your dictionary visualizer and corrected.
// const useResponsiveScale = (dependencies) => {
//     const containerRef = useRef(null);
//     const contentRef = useRef(null);
//     const [scale, setScale] = useState(1);

//     useLayoutEffect(() => {
//         const calculateScale = () => {
//             if (!containerRef.current || !contentRef.current) return;

//             // Measure the container and subtract padding (p-4 = 1rem = 16px on each side)
//             const containerWidth = containerRef.current.clientWidth - 32;
//             const containerHeight = containerRef.current.clientHeight - 32;
            
//             const contentWidth = contentRef.current.offsetWidth;
//             const contentHeight = contentRef.current.offsetHeight;

//             if (contentWidth === 0 || contentHeight === 0) return;

//             const scaleX = containerWidth / contentWidth;
//             const scaleY = containerHeight / contentHeight;
            
//             const newScale = Math.min(scaleX, scaleY, 1);
//             setScale(newScale);
//         };

//         const resizeObserver = new ResizeObserver(calculateScale);
//         if (containerRef.current) {
//             resizeObserver.observe(containerRef.current);
//         }

//         // Run calculation after a delay to ensure content is rendered
//         const timeoutId = setTimeout(calculateScale, 50);

//         return () => {
//             clearTimeout(timeoutId);
//             if (containerRef.current) {
//                 resizeObserver.unobserve(containerRef.current);
//             }
//         };
//     }, [dependencies]); // The hook now correctly depends on the 'dependencies' passed to it

//     const contentStyle = {
//         transform: `scale(${scale})`,
//         transformOrigin: 'center center',
//     };

//     return { containerRef, contentRef, contentStyle };
// };


// export default function AssignmentVisualizer({ event }) {
//     // Use the responsive hook, passing the event as a dependency
//     const { containerRef, contentRef, contentStyle } = useResponsiveScale(event);

//     const displayValue = String(event.value?.value ?? '');
//     const animationKey = `${event.variable}-${displayValue}-${Math.random()}`;

//     return (
//         // 1. The Container: This div measures the available space.
//         <div ref={containerRef} className="w-full h-full flex items-center justify-center p-4">
            
//             {/* 2. The Scalable Wrapper: This div gets scaled up or down. */}
//             <div ref={contentRef} style={contentStyle}>

//                 {/* 3. Your "Equation View" Animation Content */}
//                 <motion.div
//                     key={animationKey}
//                     className="flex items-center justify-center gap-6 font-mono"
//                     initial="hidden"
//                     animate="visible"
//                     variants={{
//                         hidden: { opacity: 0 },
//                         visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
//                     }}
//                 >
//                     {/* The Variable Box */}
//                     <motion.div
//                         className="flex items-center justify-center p-4 rounded-lg border-4 min-w-[150px] min-h-[80px]"
//                         variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
//                         animate={{ borderColor: ['#475569', '#34d399', '#475569'] }}
//                         transition={{ delay: 0.8, duration: 1.0 }}
//                     >
//                         <span className="text-3xl font-bold text-slate-300">{event.variable}</span>
//                     </motion.div>

//                     {/* The Equals Sign */}
//                     <motion.span className="text-5xl font-bold text-slate-500" variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }}>
//                         =
//                     </motion.span>

//                     {/* The Value Box */}
//                     <motion.div
//                         className="flex items-center justify-center p-4 rounded-lg border-2 border-emerald-400 bg-emerald-500/10 min-w-[150px] min-h-[80px]"
//                         variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
//                         animate={{ boxShadow: ['0 0 0px #34d399', '0 0 25px #34d399', '0 0 0px #34d399'] }}
//                         transition={{ duration: 1.2 }}
//                     >
//                         <span className="text-4xl font-bold text-emerald-300">{displayValue}</span>
//                     </motion.div>
//                 </motion.div>
                
//             </div>
//         </div>
//     );
// }


// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useResponsiveScale } from '../../hooks/useResponsiveScale'; // Adjust path if needed

// // --- Reusable Helper Components & Variants (NOW TRULY RESPONSIVE) ---
// const ScalableAnimation = ({ event, children }) => {
//     // The hook will recalculate the scale whenever the 'event' prop changes.
//     const { containerRef, contentRef, scale } = useResponsiveScale([event]);

//     return (
//         // 1. The Container: Measures the available space.
//         <div ref={containerRef} className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
//             {/* 2. The Scalable Wrapper: Applies the calculated scale. */}
//             <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
//                 {/* 3. The Content: Renders at its natural size to be measured. */}
//                 <div ref={contentRef} className="w-max">
  
//                     {children}
//                 </div>
//             </div>
//         </div>
//     );
// };

// const itemVariants = {
//     hidden: { opacity: 0, scale: 0.5 },
//     visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
//     exit: { opacity: 0, scale: 0.5, transition: { duration: 0.3 } },
//     highlightExit: { opacity: 0, y: -50, transition: { duration: 0.5, ease: "backIn" } },
// };

// // const ValueBox = ({ value, className = "" }) => (
// //   <motion.div
// //     initial={{ opacity: 0, scale: 0.8 }}
// //     animate={{ opacity: 1, scale: 1 }}
// //     // ⭐ Responsive sizing and text - now using a more flexible approach
// //     className={`flex items-center justify-center rounded-md bg-emerald-500 font-bold text-white shadow-lg 
// //       p-2 text-lg 
// //       sm:p-3 sm:text-xl 
// //       md:p-4 md:text-2xl 
// //       min-h-[4rem] min-w-[4rem] max-h-[5rem] max-w-[5rem] flex-1
// //       ${className}`}
// //   >
// //     {String(value)}
// //   </motion.div>
// // );

// const ArrayElement = ({ item, index, isHighlight = false }) => (
//     <motion.div
//         layout
//         variants={itemVariants}
//         initial="hidden"
//         animate="visible"
//         exit="exit"
//         className="relative flex flex-col items-center justify-center font-mono"
//     >
//         <div className={`flex items-center justify-center rounded-md font-bold w-16 h-16 text-xl
//             ${isHighlight ? 'border-2 border-fuchsia-400 bg-fuchsia-500/20 text-white' : 'bg-slate-800 text-slate-300'}`
//         }>
//             {String(item)}
//         </div>
//         <span className="absolute -bottom-6 text-sm text-slate-500">{index}</span>
//     </motion.div>
// );

// // --- Animation Sub-components (Updated for Responsiveness) ---

// const UpdateAtIndexAnimation = ({ event }) => {
//     const { variable, index, value, list_snapshot_before = [] } = event;
//     return (
//         <ScalableAnimation event={event}>
//             <div className="flex flex-col items-center justify-center space-y-8 font-mono">
//                 <p className="text-center text-lg text-cyan-300">
//                     <code className="text-fuchsia-300">{variable}</code>[<code className="text-yellow-300">{index}</code>] = <code className="text-emerald-300">{value}</code>
//                 </p>
//                 <div className="flex items-start space-x-4">
//                     <AnimatePresence>
//                         {list_snapshot_before.map((item, i) => {
//                             if (i === index) {
//                                 return (
//                                     <motion.div key={`item-${i}`} layout variants={itemVariants} initial="hidden" animate="visible" exit="highlightExit">
//                                         <ArrayElement item={value} index={i} isHighlight />
//                                     </motion.div>
//                                 );
//                             }
//                             return <ArrayElement key={`item-${i}`} item={item} index={i} />;
//                         })}
//                     </AnimatePresence>
//                 </div>
//             </div>
//         </ScalableAnimation>
//     );
// };

// const AppendAnimation = ({ event }) => {
//     const { variable, args, list_snapshot_before = [] } = event;
//     const appendedValue = args[0];
//     return (
//         <ScalableAnimation event={event}>
//             <div className="flex flex-col items-center justify-center space-y-8 font-mono">
//                 <p className="text-center text-lg text-cyan-300">
//                     <code className="text-fuchsia-300">{variable}</code>.append(<code className="text-emerald-300">{appendedValue}</code>)
//                 </p>
//                 <div className="flex items-start space-x-4">
//                      {list_snapshot_before.map((item, index) => (
//                         <ArrayElement key={`item-before-${index}`} item={item} index={index} />
//                     ))}
//                     {/* The new item animates in */}
//                     <motion.div key="new-item" variants={itemVariants} initial="hidden" animate="visible">
//                         <ArrayElement item={appendedValue} index={list_snapshot_before.length} isHighlight />
//                     </motion.div>
//                 </div>
//             </div>
//         </ScalableAnimation>
//     );
// };
// const InsertAnimation = ({ event }) => {
//     const { variable, args, list_snapshot_before = [] } = event;
//     const index = args[0];
//     const value = args[1];

//     // Create the final state of the array to render it
//     const list_snapshot_after = [...list_snapshot_before];
//     if (index >= 0 && index <= list_snapshot_after.length) {
//         list_snapshot_after.splice(index, 0, value);
//     }

//     return (
//         <ScalableAnimation event={event}>
//             <div className="flex flex-col items-center justify-center space-y-8 font-mono">
//                 <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-lg text-cyan-300">
//                     <code className="text-fuchsia-300">{variable}</code>.insert(<code className="text-yellow-300">{index}</code>, <code className="text-emerald-300">{value}</code>)
//                 </motion.p>
//                 <div className="flex items-start space-x-4">
//                     <AnimatePresence>
//                         {list_snapshot_after.map((item, i) => (
//                             // The key is crucial for AnimatePresence to track elements
//                             <ArrayElement key={`${i}-${item}`} item={item} index={i} isHighlight={i === index} />
//                         ))}
//                     </AnimatePresence>
//                 </div>
//             </div>
//         </ScalableAnimation>
//     );
// };

// const RemoveAnimation = ({ event }) => {
//     const { variable, method, removed_index, removed_value, list_snapshot_before = [] } = event;

//     return (
//         <ScalableAnimation event={event}>
//             <div className="flex flex-col items-center justify-center space-y-8 font-mono">
//                 <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-lg text-cyan-300">
//                     {method === 'remove' && <>Removing value <code className="text-red-400">{removed_value}</code> from <code className="text-fuchsia-300">{variable}</code></>}
//                     {(method === 'pop' || method === 'delete_by_index') && <>Removing from index <code className="text-yellow-300">{removed_index}</code> of <code className="text-fuchsia-300">{variable}</code></>}
//                 </motion.p>
                
//                 <div className="flex items-start space-x-4">
//                     {list_snapshot_before.map((item, i) => (
//                         // We wrap the ArrayElement in a motion.div to control its exit animation individually
//                         <motion.div
//                             key={`item-${i}`}
//                             layout
//                             // Animate the specific element out
//                             animate={{
//                                 opacity: i === removed_index ? 0 : 1,
//                                 y: i === removed_index ? -60 : 0,
//                                 scale: i === removed_index ? 0.5 : 1,
//                             }}
//                             transition={{ duration: 0.5, ease: "backIn" }}
//                         >
//                             <ArrayElement item={item} index={i} isHighlight={i === removed_index} />
//                         </motion.div>
//                     ))}
//                 </div>

//                 {removed_value !== undefined && (
//                     <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: {delay: 0.5} }} className="text-md text-red-300 pt-4">
//                         (Value '{String(removed_value)}' was removed)
//                     </motion.p>
//                 )}
//             </div>
//         </ScalableAnimation>
//     );
// };

// // --- Main Visualizer Component (Router) ---
// export default function ArrayOperationVisualizer({ event }) {
//   if (!event || !event.method) {
//     return <p className="text-slate-400 text-center pt-8">Invalid array operation event.</p>;
//   }

//   switch (event.method) {
//     case 'assign_at_index':
//       return <UpdateAtIndexAnimation event={event} />;
//     case 'append':
//       return <AppendAnimation event={event} />;
//     case 'insert':
//       return <InsertAnimation event={event} />;
//     case 'remove':
//     case 'pop':
//     case 'delete_by_index':
//       return <RemoveAnimation event={event} />;
//     default:
//       return <p className="text-slate-400 text-center pt-8">Unsupported array operation: {event.method}</p>;
//   }
// }




import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable Helper Components & Variants (NOW TRULY RESPONSIVE) ---

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.5, y: -10, transition: { duration: 0.3 } }
};

const ValueBox = ({ value, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    // ⭐ Responsive sizing and text - now using a more flexible approach
    className={`flex items-center justify-center rounded-md bg-emerald-500 font-bold text-white shadow-lg 
      p-2 text-lg 
      sm:p-3 sm:text-xl 
      md:p-4 md:text-2xl 
      min-h-[4rem] min-w-[4rem] max-h-[5rem] max-w-[5rem] flex-1
      ${className}`}
  >
    {String(value)}
  </motion.div>
);

const ArrayElement = ({ item, index, isHighlight = false }) => (
  <motion.div
    layout
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    // ⭐ Responsive sizing and text - using flex-1 with max-w
    className={`relative flex flex-shrink-0 items-center justify-center rounded-md font-bold
      p-2 text-base 
      sm:p-3 sm:text-lg 
      md:p-4 md:text-xl
      min-h-[4rem] min-w-[4rem] max-h-[5rem] max-w-[5rem] flex-1
      ${isHighlight ? 'border-2 border-fuchsia-500 bg-fuchsia-500/20 text-white' : 'bg-gray-800 text-white'}
    `}
  >
    {String(item)}
    <span className="absolute -bottom-5 text-xs text-gray-500">[{index}]</span>
  </motion.div>
);


// --- Animation Sub-components (Updated for Responsiveness) ---

const UpdateAtIndexAnimation = ({ event }) => {
  const { variable, index, value, list_snapshot_before = [] } = event;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-2 sm:p-4 sm:space-y-6 font-mono">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-base sm:text-lg text-cyan-300">
        <code className="text-fuchsia-300">{variable}</code>[<code className="text-yellow-300">{index}</code>] = <code className="text-emerald-300">{value}</code>
      </motion.p>
      <div className="relative flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-900/50 p-4 overflow-x-auto"> {/* Adjusted w-full and added overflow */}
        <div className="flex w-max items-center justify-start space-x-2"> {/* Inner flex to manage actual elements, keeping space-x-2 */}
          {list_snapshot_before.map((item, i) => (
            <div key={`item-${i}`} className={`relative flex items-center justify-center rounded-md 
              p-2 min-h-[4rem] min-w-[4rem] max-h-[5rem] max-w-[5rem] flex-1
              ${index === i ? 'bg-gray-700' : 'bg-gray-800'}`}
            >
              {index === i && (
                <motion.div className="absolute z-10" initial={{ opacity: 0, y: -80 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3, type: 'spring' } }}>
                  <ValueBox value={value} className="bg-fuchsia-600" />
                </motion.div>
              )}
              <motion.span animate={{ opacity: index === i ? 0 : 1, transition: { delay: 0.3 } }} className="font-bold text-white text-base sm:text-lg md:text-xl">
                {String(item)}
              </motion.span>
              <span className="absolute -bottom-5 text-xs text-gray-500">[{i}]</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AppendAnimation = ({ event }) => {
    const { variable, args, list_snapshot_before = [] } = event;
    const appendedValue = args[0];
    return (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-2 sm:p-4 sm:space-y-6 font-mono">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-base sm:text-lg text-cyan-300">
                <code className="text-fuchsia-300">{variable}</code>.append(<code className="text-emerald-300">{appendedValue}</code>)
            </motion.p>
            <div className="w-full max-w-4xl overflow-x-auto rounded-lg bg-gray-900/50 p-4">
                <motion.div layout className="flex w-max items-center justify-start space-x-2">
                    <AnimatePresence>
                        {list_snapshot_before.map((item, index) => (
                            <ArrayElement key={`item-before-${index}`} item={item} index={index} />
                        ))}
                    </AnimatePresence>
                    <ArrayElement key="new-item" item={appendedValue} index={list_snapshot_before.length} isHighlight />
                </motion.div>
            </div>
        </div>
    );
};

const InsertAnimation = ({ event }) => {
  const { variable, args, list_snapshot_before = [] } = event;
  const index = args[0];
  const value = args[1];

  const list_snapshot_after = [...list_snapshot_before];
  if (index >= 0 && index <= list_snapshot_after.length) {
    list_snapshot_after.splice(index, 0, value);
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-2 sm:p-4 sm:space-y-6 font-mono">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-base sm:text-lg text-cyan-300">
        <code className="text-fuchsia-300">{variable}</code>.insert(<code className="text-yellow-300">{index}</code>, <code className="text-emerald-300">{value}</code>)
      </motion.p>
      <div className="w-full max-w-4xl overflow-x-auto rounded-lg bg-gray-900/50 p-4">
        <div className="flex w-max items-center justify-start space-x-2">
          <AnimatePresence>
            {list_snapshot_after.map((item, i) => (
              <ArrayElement key={`${i}-${item}`} item={item} index={i} isHighlight={i === index} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const RemoveAnimation = ({ event }) => {
  const { variable, method, removed_index, removed_value, list_snapshot_before = [] } = event;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-2 sm:p-4 sm:space-y-6 font-mono">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-base sm:text-lg text-cyan-300">
        {method === 'remove' && <>Removing value <code className="text-red-400">{removed_value}</code> from <code className="text-fuchsia-300">{variable}</code></>}
        {(method === 'pop' || method === 'delete_by_index') && <>Removing from index <code className="text-yellow-300">{removed_index}</code> of <code className="text-fuchsia-300">{variable}</code></>}
      </motion.p>
      <div className="w-full max-w-4xl overflow-x-auto rounded-lg bg-gray-900/50 p-4">
        <div className="flex w-max items-center justify-start space-x-2">
          <AnimatePresence>
            {list_snapshot_before.map((item, i) => {
              if (i === removed_index) {
                return <ArrayElement key={`item-removing-${i}`} item={item} index={i} isHighlight />;
              }
              return <ArrayElement key={`item-kept-${i}`} item={item} index={i} />;
            })}
          </AnimatePresence>
        </div>
      </div>
       {removed_value !== undefined && (
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-md text-red-300">
          (Value removed: {String(removed_value)})
        </motion.p>
      )}
    </div>
  );
};


// --- Main Visualizer Component (Router) ---
export default function ArrayOperationVisualizer({ event }) {
  if (!event || !event.method) {
    return <p className="text-slate-400 text-center pt-8">Invalid array operation event.</p>;
  }

  switch (event.method) {
    case 'assign_at_index':
      return <UpdateAtIndexAnimation event={event} />;
    case 'append':
      return <AppendAnimation event={event} />;
    case 'insert':
      return <InsertAnimation event={event} />;
    case 'remove':
    case 'pop':
    case 'delete_by_index':
      return <RemoveAnimation event={event} />;
    default:
      return <p className="text-slate-400 text-center pt-8">Unsupported array operation: {event.method}</p>;
  }
}



