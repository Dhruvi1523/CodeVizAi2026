// // src/components/visualizers/OperationVisualizer.jsx

// import React from "react";
// import { motion } from "framer-motion";

// const OperationVisualizer = ({ event }) => (
//   <div className="flex flex-col items-center justify-center p-6 space-y-4 font-mono h-full">
//     <p className="text-lg text-[#94a3b8]">Performing Operation</p>
//     <div className="flex items-center justify-center space-x-4 h-24">
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
//         <span className="text-sm text-[#94a3b8]">{Object.keys(event.operands)[0]}</span>
//         <div className="bg-[#6366f1] text-[#f1f5f9] font-bold p-4 rounded-lg text-xl min-w-[60px] text-center">{String(Object.values(event.operands)[0])}</div>
//       </motion.div>
//       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="text-4xl font-bold text-[#f59e0b]">{event.operator}</motion.div>
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
//         <span className="text-sm text-[#94a3b8]">{Object.keys(event.operands)[1]}</span>
//         <div className="bg-[#6366f1] text-[#f1f5f9] font-bold p-4 rounded-lg text-xl min-w-[60px] text-center">{String(Object.values(event.operands)[1])}</div>
//       </motion.div>
//     </div>
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex items-center space-x-2 pt-2">
//       <span className="text-2xl text-[#94a3b8]">=</span>
//       <div className="bg-[#14b8a6] text-[#0f172a] font-bold p-3 rounded-lg text-lg min-w-[50px] text-center">{String(event.result_value)}</div>
//     </motion.div>
//   </div>
// );


// export default OperationVisualizer;

// import React from "react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function CallStack({ stackFrames, callStackFrameRefs }) {
//   return (
//     <div className="flex flex-col-reverse justify-start p-2 h-full">
//       <AnimatePresence>
//         {stackFrames.map((frameName, index) => {
//           const isTop = index === stackFrames.length - 1;
//           const frameKey = `${frameName}-${index + 1}`; // Use the same keying logic as in CodePage

//           return (
//             <motion.div
//               ref={(el) => callStackFrameRefs.current.set(frameKey, el)} // Set the ref for animations
//               key={frameKey}
//               layout // This is the magic prop for animating position changes
//               initial={{ opacity: 0, y: 50, scale: 0.8 }}
//               animate={{
//                 opacity: 1,
//                 y: 0,
//                 scale: 1,
//                 backgroundColor: isTop ? "#4338ca" : "#312e81",
//               }}
//               exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
//               transition={{ type: "spring", stiffness: 350, damping: 25 }}
//               className="p-3 mb-2 rounded-lg text-center font-semibold text-white shadow-lg"
//             >
//               {frameName}
//             </motion.div>
//           );
//         })}
//       </AnimatePresence>
//     </div>
//   );
// }

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";

// --- Visualizer for Binary Operations (e.g., c = a + b) ---
const OperationVisualizer = ({ event }) => {
  // Use the correct keys from the backend tracer
  const { left_str, right_str, op_str, left_val, right_val, result_val } = event;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-4 font-mono sm:space-y-8">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-base text-cyan-300 sm:text-lg"
      >
        Performing Operation
      </motion.p>

      {/* Expression (a + b) */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-4"
      >
        <ValueBox label={left_str} value={left_val} />
        <motion.div variants={itemVariants} className="text-2xl font-bold text-cyan-400 sm:text-3xl">{op_str}</motion.div>
        <ValueBox label={right_str} value={right_val} />
      </motion.div>

      {/* Arrow pointing down */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }}>
        <FiArrowDown className="text-3xl text-gray-500" />
      </motion.div>
      
      {/* Final Result */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 1 } }}
        className="flex flex-col items-center"
      >
         <div className="text-sm text-gray-400">Result</div>
         <ResultBox value={result_val} />
      </motion.div>
    </div>
  );
};


// --- Reusable Helper Components ---
const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
};

const ValueBox = ({ label, value }) => (
  <motion.div variants={itemVariants} className="flex flex-col items-center">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-800 text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
      {String(value)}
    </div>
  </motion.div>
);

const ResultBox = ({ value }) => (
    <AnimatePresence mode="popLayout">
        <motion.div
            key={value}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex h-16 w-16 items-center justify-center rounded-md bg-fuchsia-600 font-bold text-white shadow-lg sm:h-20 sm:w-20 sm:text-2xl"
        >
            {String(value)}
        </motion.div>
    </AnimatePresence>
);

export default OperationVisualizer;