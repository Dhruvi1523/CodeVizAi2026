import React from 'react';
import { getAlgorithmById } from '../data/algorithms';
import BarVisualization from './BarVisualization';
import MergeVisualization from './MergeVisualization';
import { AlgorithmStep } from '../types';

interface VisualizationContainerProps {
  algorithmId: string;
  steps: AlgorithmStep[];
  currentStepIndex: number;
  currentStep: AlgorithmStep | null;
}

const VisualizationContainer: React.FC<VisualizationContainerProps> = ({
  algorithmId,
  steps,
  currentStepIndex,
  currentStep,
}) => {
  const algorithm = getAlgorithmById(algorithmId);
  
  if (!algorithm || !currentStep) {
    return (
      <div className="bg-gray-800 rounded-lg h-96 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Select an algorithm to begin</div>
      </div>
    );
  }

  const maxValue = Math.max(...currentStep.array);

  if (algorithm.visualization === 'tree' && algorithmId === 'merge-sort') {
    return (
      <MergeVisualization 
        steps={steps} 
        currentStepIndex={currentStepIndex} 
      />
    );
  }

  return (
    <BarVisualization 
      step={currentStep} 
      maxValue={maxValue} 
    />
  );
};

export default VisualizationContainer;