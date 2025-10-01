import React from 'react';
import { motion } from 'framer-motion';

const QuickSortVisualization = ({ step }) => {
  // step should include: array, left, right, pivot, partitions, etc.
  if (!step) return null;

  // Show partitioning phase
  if (step.action === 'partition' && step.left && step.right) {
    return (
      <div className="flex flex-col items-center space-y-8 p-8">
        <div className="text-white text-lg font-semibold">Partitioning Phase</div>
        <motion.div
          className="bg-gray-700 p-4 rounded-lg"
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-gray-300 text-sm mb-2">Current Array</div>
          <div className="flex space-x-2">
            {step.array.map((value, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded text-sm font-medium ${index === step.pivotIndex ? 'bg-yellow-400 text-black border-2 border-yellow-600' : 'bg-blue-500 text-white'}`}
              >
                {value}
                {index === step.pivotIndex && (
                  <span className="block text-xs font-bold">(Pivot)</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
        <div className="flex space-x-8">
          <motion.div
            className="bg-gray-700 p-4 rounded-lg"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-gray-300 text-sm mb-2">Left Partition</div>
            <div className="flex space-x-2">
              {step.left.map((value, index) => (
                <div
                  key={index}
                  className="bg-green-500 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  {value}
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="bg-gray-700 p-4 rounded-lg"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-gray-300 text-sm mb-2">Right Partition</div>
            <div className="flex space-x-2">
              {step.right.map((value, index) => (
                <div
                  key={index}
                  className="bg-purple-500 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  {value}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default view
  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="text-white text-lg font-semibold">
        {step.action === 'done' ? 'Sorting Complete!' : 'Processing...'}
      </div>
      <motion.div
        className="bg-gray-700 p-4 rounded-lg"
        animate={{ scale: step.action === 'done' ? 1.05 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-gray-300 text-sm mb-2">Current Array</div>
        <div className="flex space-x-2">
          {step.array.map((value, index) => (
            <div
              key={index}
              className={`bg-gray-500 text-white px-3 py-2 rounded text-sm font-medium`}
            >
              {value}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default QuickSortVisualization;
