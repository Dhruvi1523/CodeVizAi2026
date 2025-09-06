// src/components/visualizers/AssignmentVisualizer.jsx

import React from "react";
import { motion } from "framer-motion";

const AssignmentVisualizer = ({ event }) => (
  <div className="p-4 flex flex-col items-center justify-center gap-4 font-mono h-full">
    <p className="text-lg text-[#94a3b8]">Assigning to <span className="font-bold text-[#f1f5f9]">{event.variable}</span></p>
    <div className="flex items-center gap-4">
      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }} className="text-3xl font-bold bg-[#0f172a] p-4 rounded-lg">{String(event.value)}</motion.div>
      <svg height="40" width="40"><motion.line x1="0" y1="20" x2="40" y2="20" style={{ stroke: '#14b8a6', strokeWidth: 3 }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} /></svg>
      <motion.div key={event.variable} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="flex flex-col items-center p-2 rounded-lg border-2 border-[#14b8a6] min-w-[80px]">
        <span className="text-sm text-[#94a3b8]">{event.variable}</span>
        <span className="text-2xl font-bold">{String(event.value)}</span>
      </motion.div>
    </div>
  </div>
);

export default AssignmentVisualizer;