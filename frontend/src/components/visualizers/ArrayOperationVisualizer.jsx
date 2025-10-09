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

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-component for `my_list[i] = value` ---
const UpdateAtIndexAnimation = ({ event }) => {
  const { variable, index, value, list_snapshot_before = [] } = event;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-4 font-mono sm:space-y-6">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-base text-cyan-300 sm:text-lg">
        Updating item in <code className="text-fuchsia-300">{variable}</code> at index <code className="text-yellow-300">[{index}]</code>
      </motion.p>

      {/* Array Visualization */}
      <motion.div 
        className="relative flex w-max items-center justify-start space-x-2 rounded-lg bg-gray-900/50 p-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 }}}}
      >
        {list_snapshot_before.map((item, i) => (
          <motion.div
            key={`item-${i}`}
            variants={itemVariants}
            className={`relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md sm:h-20 sm:w-20 ${index === i ? 'bg-gray-700' : 'bg-gray-800'}`}
          >
            {/* The new value that flies in */}
            {index === i && (
              <motion.div 
                className="absolute z-10"
                initial={{ opacity: 0, y: -80, scale: 1.2 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.5, type: 'spring', stiffness: 150 } }}
              >
                <ValueBox value={value} />
              </motion.div>
            )}
            
            {/* The old value that fades out */}
            <motion.span 
              animate={{ opacity: index === i ? 0 : 1, transition: { delay: 0.5 } }}
              className="text-lg font-bold text-white sm:text-xl"
            >
              {String(item)}
            </motion.span>
            
            <span className="absolute -bottom-5 text-xs text-gray-500">[{i}]</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// --- Sub-component for `my_list.append(value)` ---
const AppendAnimation = ({ event }) => {
    const { variable, args, list_snapshot_before = [] } = event;
    const appendedValue = args[0]; // The value being appended

    return (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-4 font-mono sm:space-y-6">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-base text-cyan-300 sm:text-lg">
                Appending <code>{appendedValue}</code> to list <code className="text-fuchsia-300">{variable}</code>
            </motion.p>
            
            <div className="w-full max-w-4xl overflow-x-auto rounded-lg bg-gray-900/50 p-4">
                <motion.div layout className="flex w-max items-center justify-start space-x-2">
                    {/* Animate existing items */}
                    <AnimatePresence>
                        {list_snapshot_before.map((item, index) => (
                            <motion.div
                                key={`item-before-${index}`}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-gray-800 text-lg font-bold text-white sm:h-20 sm:w-20 sm:text-xl"
                            >
                                {String(item)}
                                <span className="absolute -bottom-5 text-xs text-gray-500">[{index}]</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {/* Animate the new item appending */}
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.5, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0, transition: { delay: 0.5 } }}
                        className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border-2 border-fuchsia-500 bg-fuchsia-500/20 text-lg font-bold text-white sm:h-20 sm:w-20 sm:text-xl"
                    >
                        {appendedValue}
                        <span className="absolute -bottom-5 text-xs text-gray-500">[{list_snapshot_before.length}]</span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

// --- Reusable Helper Components ---
const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
};

const ValueBox = ({ value }) => (
  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-fuchsia-600 text-xl font-bold text-white shadow-lg sm:h-20 sm:w-20 sm:text-2xl">
    {String(value)}
  </div>
);


// --- Main Visualizer Component (Router) ---
export default function ArrayOperationVisualizer({ event }) {
  if (!event || !event.method) {
    return <p className="text-slate-400 text-center pt-8">Invalid array operation event.</p>;
  }

  // Choose which animation to show based on the event's method
  switch (event.method) {
    case 'assign_at_index':
      return <UpdateAtIndexAnimation event={event} />;
    
    case 'append':
      return <AppendAnimation event={event} />;

    default:
      return <p className="text-slate-400 text-center pt-8">Unsupported array operation: {event.method}</p>;
  }
}