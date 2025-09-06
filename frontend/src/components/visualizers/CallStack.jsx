// src/components/call-stack/CallStack.jsx

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import usePrevious from '../../hooks/usePrevious';

const CallStack = ({ stackFrames = [] }) => {
  return (
    <div className="flex flex-col-reverse h-full p-2 overflow-y-auto">
      <AnimatePresence>
        {stackFrames.map((frame, index) => (
          <motion.div
            key={`${frame}-${index}`}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#8b5cf6]/20 border border-[#8b5cf6] rounded-md p-2 text-center font-mono font-semibold shadow-lg mt-2 text-sm text-[#f1f5f9]"
          >
            {frame}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CallStack;