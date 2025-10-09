// // src/components/call-stack/CallStack.jsx

// import React, { useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import usePrevious from '../../hooks/usePrevious';

// const CallStack = ({ stackFrames = [] }) => {
//   return (
//     <div className="flex flex-col-reverse h-full p-2 overflow-y-auto">
//       <AnimatePresence>
//         {stackFrames.map((frame, index) => (
//           <motion.div
//             key={`${frame}-${index}`}
//             layout
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
//             transition={{ type: "spring", stiffness: 300, damping: 25 }}
//             className="bg-[#8b5cf6]/20 border border-[#8b5cf6] rounded-md p-2 text-center font-mono font-semibold shadow-lg mt-2 text-sm text-[#f1f5f9]"
//           >
//             {frame}
//           </motion.div>
//         ))}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default CallStack;

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

// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// /**
//  * A component to display the current call stack with animations.
//  * @param {string[]} stackFrames - An array of function names in the stack.
//  */
// export default function CallStack({ stackFrames = [] }) {
//   // To display the stack with the most recent call on top, 
//   // we use flex-col-reverse on the container, so we don't need to reverse the array.
//   return (
//     <div className="flex h-full w-full flex-col p-3 font-mono">
//       <motion.h3
//         className="mb-3 text-sm font-semibold text-cyan-300"
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         Call Stack
//       </motion.h3>

//       <div className="flex w-full flex-grow flex-col-reverse overflow-hidden rounded-md bg-gray-900/50 p-2">
//         <AnimatePresence>
//           {stackFrames.map((frameName, index) => {
//             const isTop = index === stackFrames.length - 1;

//             return (
//               <motion.div
//                 key={`${frameName}-${index}`} // A simple, stable key is best
//                 layout="position" // Animates position changes automatically
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ 
//                   opacity: 1, 
//                   y: 0,
//                   // Use the theme colors to highlight the top of the stack
//                   backgroundColor: isTop ? '#6d28d9' : '#4c1d95', // Violet-700 / Violet-900
//                 }}
//                 exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
//                 transition={{ type: "spring", stiffness: 300, damping: 25 }}
//                 className="mt-2 rounded-md p-2 text-center text-sm font-semibold text-white shadow-lg"
//               >
//                 {frameName}
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CallStack({ stackFrames = [] }) {
  return (
    <div className="flex h-full w-full flex-col p-3 font-mono">
      <motion.h3
        className="mb-3 text-sm font-semibold text-cyan-300"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Call Stack
      </motion.h3>

      <div className="flex w-full flex-grow flex-col-reverse overflow-hidden rounded-md bg-gray-900/50 p-2">
        <AnimatePresence>
          {stackFrames.map((frameName, index) => {
            const isTop = index === stackFrames.length - 1;

            return (
              <motion.div
                key={`${frameName}-${index}`}
                layout="position"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  backgroundColor: isTop ? '#4f46e5' : '#3730a3',
                }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="mt-2 rounded-md p-2 text-center text-sm font-semibold text-white shadow-lg"
              >
                {frameName}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}