// src/components/visualizers/OperationVisualizer.jsx

import React from "react";
import { motion } from "framer-motion";

const OperationVisualizer = ({ event }) => (
  <div className="flex flex-col items-center justify-center p-6 space-y-4 font-mono h-full">
    <p className="text-lg text-[#94a3b8]">Performing Operation</p>
    <div className="flex items-center justify-center space-x-4 h-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
        <span className="text-sm text-[#94a3b8]">{Object.keys(event.operands)[0]}</span>
        <div className="bg-[#6366f1] text-[#f1f5f9] font-bold p-4 rounded-lg text-xl min-w-[60px] text-center">{String(Object.values(event.operands)[0])}</div>
      </motion.div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="text-4xl font-bold text-[#f59e0b]">{event.operator}</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
        <span className="text-sm text-[#94a3b8]">{Object.keys(event.operands)[1]}</span>
        <div className="bg-[#6366f1] text-[#f1f5f9] font-bold p-4 rounded-lg text-xl min-w-[60px] text-center">{String(Object.values(event.operands)[1])}</div>
      </motion.div>
    </div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex items-center space-x-2 pt-2">
      <span className="text-2xl text-[#94a3b8]">=</span>
      <div className="bg-[#14b8a6] text-[#0f172a] font-bold p-3 rounded-lg text-lg min-w-[50px] text-center">{String(event.result_value)}</div>
    </motion.div>
  </div>
);


export default OperationVisualizer;