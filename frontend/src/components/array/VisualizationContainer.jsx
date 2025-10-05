import React from 'react';
import { getAlgorithmById } from '../../data/algorithms';
import BarVisualization from './BarVisualization';
import MergeVisualization from './MergeVisualization';
import QuickSortVisualization from './QuickSortVisualization';
import HeapSortVisualization from './HeapSortVisualization';
import CountingSortVisualization from './CountingSortVisualization';
// import { AlgorithmStep } from '../types';

const VisualizationContainer = ({
  algorithmId,
  steps,
  currentStepIndex,
  currentStep,
}) => {
  const algorithm = getAlgorithmById(algorithmId);
  
  if (!algorithm || !currentStep) {
    return (
      <div className="bg-gray-800 rounded-lg h-full flex items-center justify-center">
        <div className="text-gray-400 text-lg">Select an algorithm to begin</div>
      </div>
    );
  }

  

  if (algorithm.visualization === 'tree' && algorithmId === 'merge-sort') {
    return (
      <MergeVisualization 
        steps={steps} 
        currentStepIndex={currentStepIndex} 
      />
    );
  }

  if (algorithmId === 'quick-sort') {
    return <QuickSortVisualization step={currentStep} />;
  }

  if (algorithmId === 'heap-sort') {
    return <HeapSortVisualization step={currentStep} />;
  }

  if (algorithmId === 'counting-sort') {
    return <CountingSortVisualization step={currentStep} />;
  }

  const maxValue = Math.max(...currentStep.array);

  return (
    <BarVisualization 
      step={currentStep} 
      maxValue={maxValue} 
    />
  );
};

export default VisualizationContainer;