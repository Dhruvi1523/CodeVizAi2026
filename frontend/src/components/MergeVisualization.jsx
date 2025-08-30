import React from 'react';
import { motion } from 'framer-motion';
import { AlgorithmStep } from '../types';

interface MergeVisualizationProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
}

const MergeVisualization: React.FC<MergeVisualizationProps> = ({ steps, currentStepIndex }) => {
  const currentStep = steps[currentStepIndex] || steps[0];
  
  if (!currentStep) return null;

  const renderMergeStep = () => {
    if (currentStep.action === 'split' && currentStep.left && currentStep.right) {
      return (
        <div className="flex flex-col items-center space-y-8 p-8">
          <div className="text-white text-lg font-semibold">Splitting Phase</div>
          
          <motion.div
            className="bg-gray-700 p-4 rounded-lg"
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-gray-300 text-sm mb-2">Original Array</div>
            <div className="flex space-x-2">
              {currentStep.array.map((value, index) => (
                <div
                  key={index}
                  className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  {value}
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
              <div className="text-gray-300 text-sm mb-2">Left Subarray</div>
              <div className="flex space-x-2">
                {currentStep.left.map((value, index) => (
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
              <div className="text-gray-300 text-sm mb-2">Right Subarray</div>
              <div className="flex space-x-2">
                {currentStep.right.map((value, index) => (
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

    if (currentStep.action === 'merge-step' && currentStep.merged) {
      return (
        <div className="flex flex-col items-center space-y-8 p-8">
          <div className="text-white text-lg font-semibold">Merging Phase</div>
          
          <motion.div
            className="bg-gray-700 p-4 rounded-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-gray-300 text-sm mb-2">Merged Array</div>
            <div className="flex space-x-2">
              {currentStep.merged.map((value, index) => (
                <motion.div
                  key={`merged-${index}`}
                  className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  {value}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      );
    }

    // Default view for other steps
    return (
      <div className="flex flex-col items-center space-y-8 p-8">
        <div className="text-white text-lg font-semibold">
          {currentStep.action === 'done' ? 'Sorting Complete!' : 'Processing...'}
        </div>
        
        <motion.div
          className="bg-gray-700 p-4 rounded-lg"
          animate={{ scale: currentStep.action === 'done' ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-gray-300 text-sm mb-2">Current Array</div>
          <div className="flex space-x-2">
            {currentStep.array.map((value, index) => (
              <div
                key={index}
                className={`${
                  currentStep.action === 'done' ? 'bg-green-500' : 'bg-gray-500'
                } text-white px-3 py-2 rounded text-sm font-medium`}
              >
                {value}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg h-96 flex items-center justify-center">
      {renderMergeStep()}
    </div>
  );
};

export default MergeVisualization;