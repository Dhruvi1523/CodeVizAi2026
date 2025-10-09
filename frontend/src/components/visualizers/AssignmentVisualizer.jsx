
// import React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FiArrowDown } from "react-icons/fi";

// const AssignmentVisualizer = ({ event }) => {
//   if (event.type === "binary_operation") {
//     return <BinaryOperationVisual event={event} />;
//   }
//   if (event.type === "subscript_assign") {
//     return <SubscriptAssignVisual event={event} />;
//   }
//   return <SimpleAssignmentVisual event={event} />;
// };

// // --- Visualizer for Simple Assignments (e.g., x = 10 or numbers = [1,2,3]) ---
// const SimpleAssignmentVisual = ({ event }) => {
//     const { target_var, value } = event;
//     const isList = value?.type === 'list';

//     // A smarter format for the final variable box
//     const finalValueDisplay = () => {
//         if (!isList) return String(value?.value ?? value);
//         // A much cleaner summary for lists
//         return `List (${value.value.length} items)`; 
//     }

//     return (
//         // ⭐ FIX: Added `relative` and `z-10` to prevent animations from overlapping other UI
//         <div className="relative z-10 flex h-full w-full flex-col items-center justify-center space-y-4 p-4 font-mono sm:space-y-6">
//             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-base text-cyan-300 sm:text-lg">
//                 Assigning Value to <code className="text-fuchsia-300">{target_var}</code>
//             </motion.p>
            
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
//             >
//                 {isList ? <ListValue list={value.value} /> : <ValueBox label="Value" value={value.value} />}
//             </motion.div>
            
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }}>
//                 <FiArrowDown className="text-3xl text-gray-500" />
//             </motion.div>

//             <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
//                 className="flex items-center space-x-4 rounded-lg bg-gray-800 p-4 text-lg sm:text-xl"
//             >
//                 <div className="text-fuchsia-300">{target_var}</div>
//                 <span className="text-gray-500">=</span>
//                 <ResultBox value={finalValueDisplay()} isList={isList} />
//             </motion.div>
//         </div>
//     );
// };

// // --- Other Visualizers (No changes needed, but included for completeness) ---

// const BinaryOperationVisual = ({ event }) => {
//   const { target_var, left_str, right_str, op_str, left_val, right_val, result_val } = event;
//   return (
//     <div className="relative z-10 flex h-full w-full flex-col items-center justify-center space-y-4 p-4 font-mono sm:space-y-8">
//       <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-base text-cyan-300 sm:text-lg">
//         Performing Operation & Assigning Result
//       </motion.p>
//       <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.2 } } }} className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
//         <ValueBox label={left_str} value={left_val} />
//         <motion.div variants={itemVariants} className="text-2xl font-bold text-cyan-400 sm:text-3xl">{op_str}</motion.div>
//         <ValueBox label={right_str} value={right_val} />
//       </motion.div>
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }}>
//         <FiArrowDown className="text-3xl text-gray-500" />
//       </motion.div>
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 1 } }} className="flex items-center space-x-4 rounded-lg bg-gray-800 p-4 text-lg sm:text-xl">
//         <div className="text-fuchsia-300">{target_var}</div>
//         <span className="text-gray-500">=</span>
//         <ResultBox value={result_val} />
//       </motion.div>
//     </div>
//   );
// };

// const SubscriptAssignVisual = ({ event }) => {
//   const { target_var, index, value, snapshot_before = [] } = event;
//   return (
//     <div className="relative z-10 flex h-full w-full flex-col items-center justify-center space-y-4 p-4 font-mono sm:space-y-6">
//       <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-base text-cyan-300 sm:text-lg">
//         Updating item in <span className="text-fuchsia-300">{target_var}</span> at index <span className="text-yellow-300">[{index}]</span>
//       </motion.p>
//       <motion.div className="relative flex w-max items-center justify-start space-x-2 rounded-lg bg-gray-900/50 p-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 }}}}>
//         {snapshot_before.map((item, i) => (
//           <motion.div key={`item-${i}`} variants={itemVariants} className={`relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md sm:h-20 sm:w-20 ${index === i ? 'bg-gray-700' : 'bg-gray-800'}`}>
//             {index === i && (
//               <motion.div className="absolute z-10" initial={{ opacity: 0, y: -80, scale: 1.2 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.5, type: 'spring', stiffness: 150 } }}>
//                 <ValueBox value={value.value} />
//               </motion.div>
//             )}
//             <motion.span animate={{ opacity: index === i ? 0 : 1, transition: { delay: 0.5 } }} className="text-lg font-bold text-white sm:text-xl">
//               {String(item)}
//             </motion.span>
//             <span className="absolute -bottom-5 text-xs text-gray-500">[{i}]</span>
//           </motion.div>
//         ))}
//       </motion.div>
//     </div>
//   );
// };

// // --- Helper Components ---
// const ListValue = ({ list = [] }) => (
//     <div className="w-full max-w-sm overflow-x-auto rounded-lg bg-gray-900/50 p-4">
//         <motion.div className="flex w-max items-center space-x-2" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
//             {list.map((item, index) => (
//                 <motion.div key={`list-item-${index}`} variants={itemVariants} className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-gray-800 text-base font-bold text-white sm:h-14 sm:w-14">
//                     {String(item.value)}
//                 </motion.div>
//             ))}
//         </motion.div>
//     </div>
// );

// const itemVariants = { hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } };

// const ValueBox = ({ label, value }) => (
//   <motion.div variants={itemVariants} className="flex flex-col items-center">
//     {label && <div className="text-sm text-gray-400">{label}</div>}
//     <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-800 text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
//       {String(value)}
//     </div>
//   </motion.div>
// );

// const ResultBox = ({ value, isList }) => (
//     <AnimatePresence mode="popLayout">
//         <motion.div key={value} initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className={`flex items-center justify-center rounded-md bg-gray-900 font-bold text-white ${isList ? 'h-12 px-4 text-base' : 'h-12 w-12 text-lg'}`}>
//             {String(value)}
//         </motion.div>
//     </AnimatePresence>
// );

// export default AssignmentVisualizer;

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";

const AssignmentVisualizer = ({ event }) => {
  if (event.type === "binary_operation") {
    return <BinaryOperationVisual event={event} />;
  }
  if (event.type === "subscript_assign") {
    return <SubscriptAssignVisual event={event} />;
  }
  return <SimpleAssignmentVisual event={event} />;
};

const SimpleAssignmentVisual = ({ event }) => {
    const { target_var, value } = event;
    const isList = value?.type === 'list';

    const finalValueDisplay = () => {
        if (!isList) return String(value?.value ?? value);
        return `List (${value.value.length} items)`; 
    }

    return (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center space-y-4 p-4 font-mono sm:space-y-6">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-base text-cyan-300 sm:text-lg">
                Assigning Value to <code className="text-fuchsia-300">{target_var}</code>
            </motion.p>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}>
                {isList ? <ListValue list={value.value} /> : <ValueBox label="Value" value={value.value} />}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }}>
                <FiArrowDown className="text-3xl text-gray-500" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }} className="flex items-center space-x-4 rounded-lg bg-gray-800 p-4 text-lg sm:text-xl">
                <div className="text-fuchsia-300">{target_var}</div>
                <span className="text-gray-500">=</span>
                <ResultBox value={finalValueDisplay()} isList={isList} />
            </motion.div>
        </div>
    );
};

const BinaryOperationVisual = ({ event }) => {
  const { target_var, left_str, right_str, op_str, left_val, right_val, result_val } = event;
  return (
    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center space-y-4 p-4 font-mono sm:space-y-8">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-base text-cyan-300 sm:text-lg">
        Performing Operation & Assigning Result
      </motion.p>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.2 } } }} className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <ValueBox label={left_str} value={left_val} />
        <motion.div variants={itemVariants} className="text-2xl font-bold text-cyan-400 sm:text-3xl">{op_str}</motion.div>
        <ValueBox label={right_str} value={right_val} />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }}>
        <FiArrowDown className="text-3xl text-gray-500" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 1 } }} className="flex items-center space-x-4 rounded-lg bg-gray-800 p-4 text-lg sm:text-xl">
        <div className="text-fuchsia-300">{target_var}</div>
        <span className="text-gray-500">=</span>
        <ResultBox value={result_val} />
      </motion.div>
    </div>
  );
};

const SubscriptAssignVisual = ({ event }) => {
  const { target_var, index, value, snapshot_before = [] } = event;
  return (
    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center space-y-4 p-4 font-mono sm:space-y-6">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-base text-cyan-300 sm:text-lg">
        Updating item in <span className="text-fuchsia-300">{target_var}</span> at index <span className="text-yellow-300">[{index}]</span>
      </motion.p>
      <motion.div className="relative flex w-max items-center justify-start space-x-2 rounded-lg bg-gray-900/50 p-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 }}}}>
        {snapshot_before.map((item, i) => (
          <motion.div key={`item-${i}`} variants={itemVariants} className={`relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md sm:h-20 sm:w-20 ${index === i ? 'bg-gray-700' : 'bg-gray-800'}`}>
            {index === i && (
              <motion.div className="absolute z-10" initial={{ opacity: 0, y: -80, scale: 1.2 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.5, type: 'spring', stiffness: 150 } }}>
                <ValueBox value={value.value} />
              </motion.div>
            )}
            <motion.span animate={{ opacity: index === i ? 0 : 1, transition: { delay: 0.5 } }} className="text-lg font-bold text-white sm:text-xl">
              {String(item)}
            </motion.span>
            <span className="absolute -bottom-5 text-xs text-gray-500">[{i}]</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const ListValue = ({ list = [] }) => (
    <div className="w-full max-w-sm overflow-x-auto rounded-lg bg-gray-900/50 p-4">
        <motion.div className="flex w-max items-center space-x-2" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
            {list.map((item, index) => (
                <motion.div key={`list-item-${index}`} variants={itemVariants} className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-gray-800 text-base font-bold text-white sm:h-14 sm:w-14">
                    {String(item.value)}
                </motion.div>
            ))}
        </motion.div>
    </div>
);

const itemVariants = { hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } };

const ValueBox = ({ label, value }) => (
  <motion.div variants={itemVariants} className="flex flex-col items-center">
    {label && <div className="text-sm text-gray-400">{label}</div>}
    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-800 text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
      {String(value)}
    </div>
  </motion.div>
);

const ResultBox = ({ value, isList }) => (
    <AnimatePresence mode="popLayout">
        <motion.div key={value} initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className={`flex items-center justify-center rounded-md bg-gray-900 font-bold text-white ${isList ? 'h-12 px-4 text-base' : 'h-12 w-12 text-lg'}`}>
            {String(value)}
        </motion.div>
    </AnimatePresence>
);

export default AssignmentVisualizer;