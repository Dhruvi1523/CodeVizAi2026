import React from "react";
import { motion } from "framer-motion";

// Use props directly instead of this.props
function getBarColor(index, step) {
  if (step.sorted && step.sorted.includes(index)) return "bg-green-500";
  if (step.comparing && step.comparing.includes(index)) return "bg-red-500";
  if (step.swapped && step.swapped.includes(index)) return "bg-yellow-500";
  if (step.current === index) return "bg-blue-500";
  return "bg-gray-400";
}

function getBarHeight(value, maxValue) {
  return (value / maxValue) * 300; // Max height of 300px
}

const BarVisualization = ({ step, maxValue }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 h-96 flex items-end justify-center space-x-1 overflow-hidden">
      {step.array.map((value, index) => {
        const barColor = getBarColor(index, step);
        const barHeight = getBarHeight(value, maxValue);

        return (
          <motion.div
            key={`${index}-${value}`}
            className={`${barColor} rounded-t-sm flex-1 max-w-12 relative`}
            style={{ height: barHeight }}
            initial={{ height: 0 }}
            animate={{
              height: barHeight,
              backgroundColor: barColor === "bg-gray-400" ? "#9CA3AF" : undefined,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-300">
              {value}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BarVisualization;
