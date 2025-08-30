import React from 'react';
import { motion } from 'framer-motion';
import { AlgorithmStep } from '../types';

interface BarVisualizationProps {
  step: AlgorithmStep;
  maxValue: number;
}

const BarVisualization: React.FC<BarVisualizationProps> = ({ step, maxValue }) => {
  const getBarColor = (index: number): string => {
    if (step.sorted?.includes(index)) return 'bg-green-500';
    if (step.comparing?.includes(index)) return 'bg-red-500';
    if (step.swapped?.includes(index)) return 'bg-yellow-500';
    if (step.current === index) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getBarHeight = (value: number): number => {
    return (value / maxValue) * 300; // Max height of 300px
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 h-96 flex items-end justify-center space-x-1 overflow-hidden">
      {step.array.map((value, index) => (
        <motion.div
          key={`${index}-${value}`}
          className={`${getBarColor(index)} rounded-t-sm flex-1 max-w-12 relative`}
          style={{ height: getBarHeight(value) }}
          initial={{ height: 0 }}
          animate={{ 
            height: getBarHeight(value),
            backgroundColor: getBarColor(index) === 'bg-gray-400' ? '#9CA3AF' : undefined
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-300">
            {value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BarVisualization;